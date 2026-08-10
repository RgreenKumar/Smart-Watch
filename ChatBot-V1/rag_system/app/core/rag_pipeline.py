"""
app/core/rag_pipeline.py
========================
Orchestrates the full RAG pipeline.
Fix: LLM is pre-loaded at startup, not lazily on first query.
"""

import logging
from typing import Dict, Any, List
import tiktoken
from config.settings import settings
from app.core.retriever import VectorStore, RetrievalResult
from app.core.reranker import Reranker
from app.core.llm import get_llm, BaseLLM

logger = logging.getLogger(__name__)
_TOK = tiktoken.get_encoding("cl100k_base")


def _build_context(chunks: List[RetrievalResult], max_tokens: int) -> str:
    """Assemble context string from retrieval results."""
    parts = []
    total = 0
    for chunk in chunks:
        block = (
            f"[Source: {chunk.source} | "
            f"Score: {chunk.score:.3f}]\n"
            f"{chunk.text}\n"
        )
        bt = len(_TOK.encode(block))
        if total + bt > max_tokens:
            break
        parts.append(block)
        total += bt
    logger.debug(f"Context: {len(parts)} chunks, ~{total} tokens")
    return "\n---\n".join(parts)


class RAGPipeline:
    """
    Full RAG pipeline.
    LLM is loaded EAGERLY at __init__ time so it is
    fully ready before the first query arrives.
    """

    def __init__(self):
        logger.info("Initializing RAG pipeline...")

        # Load vector store
        self.vector_store = VectorStore()
        logger.info("VectorStore ready.")

        # Load reranker
        self.reranker = Reranker.get_instance()
        logger.info("Reranker ready.")

        # ── EAGER LLM LOAD ──────────────────────────────────────
        # Load LLM NOW at startup, not lazily on first query.
        # This prevents wrong answers on the very first question
        # caused by the model not being fully initialized yet.
        logger.info("Loading LLM — please wait...")
        self._llm: BaseLLM = get_llm()
        logger.info("LLM ready. RAG pipeline fully initialized.")

    def query(
        self,
        question: str,
        top_k: int = None,
        similarity_threshold: float = None,
        filter_source: str = None,
    ) -> Dict[str, Any]:
        """
        Run full RAG pipeline for a user question.

        Steps:
          1. Embed query
          2. Retrieve top-k chunks from ChromaDB
          3. Rerank (optional)
          4. Build context string
          5. Generate answer via LLM
        """
        logger.info(f"RAG query: '{question}'")

        # ── Step 1 & 2: Retrieve ───────────────────────────────
        try:
            results = self.vector_store.query(
                query=question,
                top_k=top_k or settings.TOP_K,
                similarity_threshold=similarity_threshold,
                filter_source=filter_source,
            )
        except Exception as e:
            logger.error(f"Retrieval error: {e}", exc_info=True)
            return {
                "error":   str(e),
                "answer":  "Retrieval failed. Please try again.",
                "sources": [],
            }

        # ── No results found ───────────────────────────────────
        if not results:
            logger.warning("No relevant chunks found.")
            # Use a short, clean refusal that _is_no_context() in routes.py
            # will correctly identify via its startswith check.
            # Avoid domain-specific suggestions here — Spring Boot will trigger
            # live-agent escalation and the widget shows the escalation message,
            # not this text.
            return {
                "answer":     "I do not have that information.",
                "sources":    [],
                "retrieval":  [],
                "no_context": True,
            }

        # ── Step 3: Rerank (optional) ──────────────────────────
        if settings.ENABLE_RERANKER:
            try:
                results = self.reranker.rerank(question, results)
                logger.info(f"Reranked to {len(results)} results.")
            except Exception as e:
                logger.warning(f"Reranker failed, using original: {e}")

        # ── Step 4: Build context ──────────────────────────────
        context = _build_context(results, settings.MAX_CONTEXT_TOKENS)

        # ── Step 5: Generate answer ────────────────────────────
        try:
            # _llm is always pre-loaded — no lazy init here
            answer = self._llm.generate(
                context=context,
                question=question,
            )
        except Exception as e:
            err_str = str(e)
            # Friendly message for rate-limit exhaustion so the widget
            # can show it (or trigger live-agent escalation) instead of
            # a raw HTTP error string.
            if "429" in err_str or "Too Many Requests" in err_str:
                logger.warning(f"OpenRouter rate limit exhausted after retries: {e}")
                # no_context=True: the LLM cannot answer right now, so
                # Spring Boot should escalate to a live agent rather than
                # leaving the visitor with a dead-end "unavailable" message.
                return {
                    "answer":     "I am temporarily unavailable due to high traffic. Please try again in a moment.",
                    "sources":    [r.to_dict() for r in results],
                    "no_context": True,
                }
            logger.error(f"LLM generation error: {e}", exc_info=True)
            return {
                "error":   err_str,
                "answer":  "Generation failed. Please try again.",
                "sources": [r.to_dict() for r in results],
            }

        logger.info(f"Answer generated ({len(answer)} chars)")

        # Only include safe scalar fields — never raw metadata from ChromaDB.
        # Complex metadata objects can corrupt the JSON response body and cause
        # Spring Boot to silently lose the answer, making the widget show
        # "Sorry, something went wrong." even though the LLM answered correctly.
        safe_sources = []
        for r in results:
            try:
                safe_sources.append({
                    "source":     str(r.source),
                    "score":      round(float(r.score), 4),
                    "confidence": str(r.confidence),
                })
            except Exception:
                pass

        return {
            "answer":     answer,
            "response":   answer,   # both keys for Spring Boot compatibility
            "sources":    safe_sources,
            "no_context": False,
        }