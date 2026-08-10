"""
app/api/routes.py
=================
All API endpoints for the RGreenMart RAG system.
Includes admin panel routes: /api/upload, /api/sources, /api/delete-source, /admin
"""

import os
import re
import json
import logging
from pathlib import Path
from werkzeug.utils import secure_filename

from flask import Blueprint, request, jsonify, send_from_directory

from app.core.rag_pipeline import RAGPipeline
from app.core.chunker import chunk_text
from app.utils.file_loader import load_file
from config.settings import settings

logger = logging.getLogger(__name__)
api_bp = Blueprint("api", __name__)

# Allowed file types for upload
UPLOAD_FOLDER      = "./data"
ALLOWED_EXTENSIONS = {"txt", "pdf", "docx", "csv", "xlsx", "json"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Global pipeline instance
_pipeline: RAGPipeline | None = None


def get_pipeline() -> RAGPipeline:
    """Return the shared RAGPipeline instance."""
    global _pipeline
    if _pipeline is None:
        _pipeline = RAGPipeline()
    return _pipeline




def _is_no_context(answer: str, sources: list | None = None) -> bool:
    """Return True only when the model is clearly saying it has no answer.

    KEY RULES:
    1. If the answer is longer than 120 chars it is a real answer — never
       treat it as no-context, even if a refusal phrase appears somewhere
       inside (e.g. "… I could not find information about X but here is Y").
    2. For short answers we check whether the text STARTS WITH one of the
       refusal phrases (startswith, not substring/contains).  A substring
       check was the original bug: a valid multi-sentence answer that happened
       to mention "I do not know" anywhere would be wrongly discarded, causing
       the widget to show "Sorry, I could not understand that." even though
       the RAG pipeline had produced a correct response.

    NOTE: Sources are intentionally NOT used to short-circuit this check.
    Even when sources exist, the LLM may still respond with a refusal — in
    that case we must still trigger live-agent handoff.
    """
    normalized = " ".join(str(answer or "").lower().split())
    if not normalized:
        return True

    # Rule 1: substantial answers are never "no context"
    if len(normalized) > 120:
        return False

    # Rule 2: short answers — only trigger if the reply STARTS WITH a refusal
    no_context_markers = (
        "i do not have that information",
        "i don't have that information",
        "i do not know",
        "i don't know",
        "no relevant information",
        "no context",
        "unable to find",
        "not enough information",
        "i cannot answer",
        "i can't answer",
        "i am unable to answer",
        "i couldn't find relevant information",
        "i could not find relevant information",
        "sorry, the local model could not answer",
    )

    return any(normalized.startswith(marker) for marker in no_context_markers)

def init_pipeline() -> None:
    """
    Pre-load the pipeline at server startup.
    Called from create_app() so LLM is fully ready
    before the first HTTP request arrives.
    Fixes: wrong answer on first question bug.
    """
    global _pipeline
    logger.info("Pre-loading RAG pipeline at startup...")
    _pipeline = RAGPipeline()
    logger.info("RAG pipeline pre-loaded and ready.")


# ── Static files ──────────────────────────────────────────────────────────────

@api_bp.route("/")
def serve_index():
    return send_from_directory("static", "index.html")


@api_bp.route("/chatbot-widget.js")
def serve_widget():
    return send_from_directory("static", "chatbot-widget.js")


# ── Admin panel ───────────────────────────────────────────────────────────────

@api_bp.route("/admin")
def serve_admin():
    """Serve the admin panel HTML page."""
    return send_from_directory("static", "admin.html")


# ── Health ────────────────────────────────────────────────────────────────────

@api_bp.route("/health")
def health():
    return jsonify({
        "status":  "ok",
        "service": "RGreenMart RAG API",
        "llm":     settings.LLM_BACKEND,
        "backend": settings.LLM_BACKEND,
        "model":   settings.OPENROUTER_MODEL
                   if settings.LLM_BACKEND in ("openrouter", "auto")
                   else settings.LOCAL_MODEL_PATH,
    })


# ── /chat  (consumed by chatbot-widget.js) ────────────────────────────────────

@api_bp.route("/chat", methods=["POST"])
def chat():
    """
    Main endpoint for the chatbot widget.
    Request:  { "message": "...", "session_id": "..." }
    Response: { "response": "...", "sources": [...], "no_context": true|false }

    When no_context is true, the upstream service can trigger agent handoff.
    """
    data = request.get_json(force=True, silent=True)

    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field"}), 400

    message = str(data.get("message", "")).strip()
    session_id = str(data.get("session_id", "unknown"))

    if not message:
        return jsonify({
            "response": "Please type a question.",
            "answer":   "Please type a question.",
            "sources":  [],
            "no_context": False,
        }), 200

    logger.info(f"[/chat] session={session_id} msg='{message[:60]}'")

    try:
        result = get_pipeline().query(question=message)

        # DEBUG: log all keys returned by pipeline so we can see exactly what's there
        logger.info(f"[/chat] pipeline result keys: {list(result.keys())}")

        answer = str(result.get("answer", "")).strip() or "I do not have that information."
        sources = result.get("sources", []) or []

        # Use our corrected _is_no_context (startswith + length guard) as the
        # final arbiter.  We intentionally do NOT blindly OR-in the pipeline's
        # own no_context flag because the pipeline may use the old substring
        # check internally; our fixed function here is more precise.
        no_context = _is_no_context(answer, sources)

        # DEBUG: log exactly what we're sending back so Java-side issues are visible
        logger.info(
            f"[/chat] RESPONSE >> no_context={no_context} "
            f"answer_len={len(answer)} "
            f"answer_preview={answer[:80]!r}"
        )
    except Exception as e:
        logger.exception(f"RAG pipeline error: {e}")
        answer = "I do not have that information."
        sources = []
        no_context = True

    if no_context:
        logger.info(f"[/chat] no_context=True session={session_id} -> handoff will trigger")

    response_payload = {
        "response":   answer,
        "answer":     answer,   # backward/forward compatibility for widgets
        "sources":    sources,
        "no_context": no_context,
    }

    # DEBUG: log the full JSON being sent to Java
    logger.info(f"[/chat] JSON payload: no_context={response_payload['no_context']} type={type(response_payload['no_context']).__name__}")

    return jsonify(response_payload), 200


# ── /api/query  (full metadata response) ─────────────────────────────────────

@api_bp.route("/api/query", methods=["POST"])
def query():
    """
    Full RAG query with metadata.
    Request:  { "question": "...", "top_k": 5, ... }
    Response: { "answer": "...", "sources": [...], "retrieval": [...] }
    """
    data = request.get_json(force=True, silent=True)

    if not data or "question" not in data:
        return jsonify({"error": "Missing 'question' field"}), 400

    result = get_pipeline().query(
        question=data["question"],
        top_k=data.get("top_k"),
        similarity_threshold=data.get("similarity_threshold"),
        filter_source=data.get("filter_source"),
    )
    return jsonify(result), 200


# ── /api/upload — admin panel file upload ────────────────────────────────────

@api_bp.route("/api/upload", methods=["POST"])
def upload_file():
    """
    Receive a file upload from admin panel.
    Saves file to ./data/ folder on the server.
    Response: { "success": true, "file_path": "./data/filename.txt" }
    """
    if "file" not in request.files:
        return jsonify({"error": "No file in request"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": f"File type not allowed. Supported: {ALLOWED_EXTENSIONS}"
        }), 400

    filename  = secure_filename(file.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file.save(save_path)

    logger.info(f"File uploaded and saved: {save_path}")
    return jsonify({
        "success":   True,
        "file_path": save_path,
        "filename":  filename,
    }), 200


# ── /api/ingest ───────────────────────────────────────────────────────────────

@api_bp.route("/api/ingest", methods=["POST"])
def ingest():
    """
    Index a document into the vector store.
    Request:  { "file_path": "./data/myfile.pdf" }
    Response: { "success": true, "chunks_added": 42 }
    """
    data = request.get_json(force=True, silent=True)

    if not data or "file_path" not in data:
        return jsonify({"error": "Missing 'file_path'"}), 400

    fp = data["file_path"]

    if not Path(fp).exists():
        return jsonify({"error": f"File not found: {fp}"}), 404

    text = _normalize_text_content(load_file(fp))
    if not text.strip():
        return jsonify({"error": "Failed to load file"}), 422

    source = Path(fp).name
    chunks = chunk_text(
        text=text,
        source=source,
        chunk_size=data.get("chunk_size"),
        chunk_overlap=data.get("chunk_overlap"),
    )

    if not chunks:
        return jsonify({"error": "No chunks produced from file"}), 422

    added = get_pipeline().vector_store.add_chunks(chunks)

    return jsonify({
        "success":      True,
        "chunks_added": added,
        "source":       source,
        "message":      f"Indexed {added} chunks from '{source}'.",
    }), 200


# ── /api/sources — list all indexed sources ───────────────────────────────────

@api_bp.route("/api/sources", methods=["GET"])
def list_sources():
    """
    Returns all unique source documents in ChromaDB with chunk counts.
    Response: { "sources": [{"source": "file.txt", "count": 42}, ...] }
    """
    try:
        col      = get_pipeline().vector_store._col
        result   = col.get(include=["metadatas"])
        metas    = result.get("metadatas", [])

        counts = {}
        for m in metas:
            src = m.get("source", "unknown")
            counts[src] = counts.get(src, 0) + 1

        sources = [{"source": k, "count": v} for k, v in sorted(counts.items())]
        return jsonify({"sources": sources, "total_sources": len(sources)}), 200

    except Exception as e:
        logger.error(f"Error listing sources: {e}")
        return jsonify({"error": str(e)}), 500


# ── /api/delete-source — delete all chunks from one source ───────────────────

@api_bp.route("/api/delete-source", methods=["DELETE"])
def delete_source():
    """
    Delete all chunks from a specific source document.
    Request:  { "source": "rgreenmart_knowledge.txt" }
    Response: { "success": true, "deleted": 42 }
    """
    data = request.get_json(force=True, silent=True)

    if not data or "source" not in data:
        return jsonify({"error": "Missing 'source' field"}), 400

    source  = data["source"]
    deleted = get_pipeline().vector_store.delete_source(source)

    logger.info(f"Deleted {deleted} chunks from source: {source}")
    return jsonify({
        "success": True,
        "deleted": deleted,
        "source":  source,
    }), 200


# ── /api/stats ────────────────────────────────────────────────────────────────

@api_bp.route("/api/stats")
def stats():
    """Return system statistics."""
    p = get_pipeline()
    return jsonify({
        "total_chunks":         p.vector_store.count(),
        "collection_name":      settings.CHROMA_COLLECTION_NAME,
        "embedding_model":      settings.EMBEDDING_MODEL,
        "llm_backend":          settings.LLM_BACKEND,
        "llm_model":            settings.OPENROUTER_MODEL
                                if settings.LLM_BACKEND in ("openrouter", "auto")
                                else settings.LOCAL_MODEL_PATH,
        "reranker_enabled":     settings.ENABLE_RERANKER,
        "top_k":                settings.TOP_K,
        "similarity_threshold": settings.SIMILARITY_THRESHOLD,
    }), 200





# ── /api/admin/settings ───────────────────────────────────────────────────────

def _env_upsert(content: str, key: str, value: str) -> str:
    """Insert or replace a KEY=VALUE line in a .env file."""
    line = f"{key}={value}"
    pattern = re.compile(rf"^{re.escape(key)}=.*$", re.M)

    if pattern.search(content):
        return pattern.sub(line, content)

    content = content.rstrip("\n")
    return (content + "\n" if content else "") + line + "\n"


def _mask_secret(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 8:
        return "•" * len(value)
    return value[:4] + "•" * (len(value) - 8) + value[-4:]


def _normalize_backend(value: str) -> str:
    backend = (value or "").strip().lower()
    if backend in {"openrouter", "local", "auto"}:
        return backend
    return "openrouter"

def _normalize_text_content(content):
    """Convert loaded file content into plain text for chunking."""
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, (dict, list)):
        return json.dumps(content, indent=2, ensure_ascii=False)
    return str(content)


@api_bp.route("/api/admin/settings", methods=["GET", "POST"])
def admin_settings():
    """
    Read or update admin settings stored in .env.
    POST body: { "llm_backend": "...", "api_key": "...", "model": "..." }
    Empty values keep the current setting.
    """
    env_path = Path(".env")

    if request.method == "GET":
        return jsonify({
            "api_key_set": bool(settings.OPENROUTER_API_KEY),
            "api_key_masked": _mask_secret(settings.OPENROUTER_API_KEY),
            "model": settings.OPENROUTER_MODEL,
            "backend": settings.LLM_BACKEND,
            "llm_backend": settings.LLM_BACKEND,
        }), 200

    data = request.get_json(force=True, silent=True) or {}

    backend = _normalize_backend(data.get("llm_backend") or data.get("backend") or settings.LLM_BACKEND)
    api_key = str(data.get("api_key", "")).strip()
    model = str(data.get("model", "")).strip()

    new_api_key = api_key or settings.OPENROUTER_API_KEY
    new_model = model or settings.OPENROUTER_MODEL

    try:
        env_text = env_path.read_text(encoding="utf-8") if env_path.exists() else ""
        env_text = _env_upsert(env_text, "LLM_BACKEND", backend)
        env_text = _env_upsert(env_text, "OPENROUTER_API_KEY", new_api_key)
        env_text = _env_upsert(env_text, "OPENROUTER_MODEL", new_model)
        env_path.write_text(env_text, encoding="utf-8")

        os.environ["LLM_BACKEND"] = backend
        os.environ["OPENROUTER_API_KEY"] = new_api_key
        os.environ["OPENROUTER_MODEL"] = new_model

        settings.LLM_BACKEND = backend
        settings.OPENROUTER_API_KEY = new_api_key
        settings.OPENROUTER_MODEL = new_model

        global _pipeline
        _pipeline = None
        init_pipeline()

        logger.info("Admin settings updated: backend=%s model=%s", backend, new_model)
        return jsonify({
            "success": True,
            "message": "Settings saved to .env and applied.",
            "backend": backend,
            "model": new_model,
            "api_key_set": bool(new_api_key),
            "api_key_masked": _mask_secret(new_api_key),
        }), 200

    except Exception as e:
        logger.exception("Failed to update admin settings")
        return jsonify({
            "error": f"Saved env file, but failed to apply settings: {e}",
        }), 500

# ── /api/reset ────────────────────────────────────────────────────────────────

@api_bp.route("/api/reset", methods=["DELETE"])
def reset():
    """
    Wipe the vector store.
    Requires: ?confirm=true
    """
    if request.args.get("confirm") != "true":
        return jsonify({
            "error": "Pass ?confirm=true to confirm reset."
        }), 400

    get_pipeline().vector_store.reset()

    return jsonify({
        "success": True,
        "message": "Vector store has been reset.",
    }), 200