"""
app/api/routes.py
=================
All API endpoints for the RGreenMart RAG system.
"""

import logging
from pathlib import Path

from flask import Blueprint, request, jsonify, send_from_directory

from app.core.rag_pipeline import RAGPipeline
from app.core.chunker import chunk_text
from app.utils.file_loader import load_file
from config.settings import settings

logger = logging.getLogger(__name__)
api_bp = Blueprint("api", __name__)

# Global pipeline instance
_pipeline: RAGPipeline | None = None


def get_pipeline() -> RAGPipeline:
    """Return the shared RAGPipeline instance."""
    global _pipeline
    if _pipeline is None:
        _pipeline = RAGPipeline()
    return _pipeline


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


# ── Health ────────────────────────────────────────────────────────────────────

@api_bp.route("/health")
def health():
    return jsonify({
        "status":  "ok",
        "service": "RGreenMart RAG API",
        "llm":     settings.LLM_BACKEND,
        "model":   settings.OPENROUTER_MODEL
                   if settings.LLM_BACKEND == "openrouter"
                   else settings.LOCAL_MODEL_PATH,
    })


# ── /chat  (consumed by chatbot-widget.js) ────────────────────────────────────

@api_bp.route("/chat", methods=["POST"])
def chat():
    """
    Main endpoint for the chatbot widget.
    Request:  { "message": "...", "session_id": "..." }
    Response: { "response": "...", "sources": [...] }
    """
    data = request.get_json(force=True, silent=True)

    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field"}), 400

    message = str(data.get("message", "")).strip()

    if not message:
        return jsonify({
            "response": "Please type a question.",
            "sources":  [],
        }), 200

    logger.info(f"[/chat] '{message}'")

    result = get_pipeline().query(question=message)

    return jsonify({
        "response":   result.get("answer", "No answer found."),
        "sources":    result.get("sources", []),
        "no_context": result.get("no_context", False),
    }), 200


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


# ── /api/ingest ───────────────────────────────────────────────────────────────

@api_bp.route("/api/ingest", methods=["POST"])
def ingest():
    """
    Index a new document into the vector store.
    Request:  { "file_path": "./data/myfile.pdf" }
    Response: { "success": true, "chunks_added": 42 }
    """
    data = request.get_json(force=True, silent=True)

    if not data or "file_path" not in data:
        return jsonify({"error": "Missing 'file_path'"}), 400

    fp = data["file_path"]

    if not Path(fp).exists():
        return jsonify({"error": f"File not found: {fp}"}), 404

    text = load_file(fp)
    if not text:
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
                                if settings.LLM_BACKEND == "openrouter"
                                else settings.LOCAL_MODEL_PATH,
        "reranker_enabled":     settings.ENABLE_RERANKER,
        "top_k":                settings.TOP_K,
        "similarity_threshold": settings.SIMILARITY_THRESHOLD,
    }), 200


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