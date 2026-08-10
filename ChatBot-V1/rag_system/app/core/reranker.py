import logging
from typing import List
from config.settings import settings

logger = logging.getLogger(__name__)


class Reranker:
    _instance = None

    def __init__(self):
        self.model = None
        if not settings.ENABLE_RERANKER:
            return
        from sentence_transformers import CrossEncoder
        logger.info(f"Loading reranker: {settings.RERANKER_MODEL}")
        self.model = CrossEncoder(settings.RERANKER_MODEL, max_length=512)
        logger.info("Reranker loaded.")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def rerank(self, query, results, top_n=None):
        if not settings.ENABLE_RERANKER or not self.model or not results:
            return results
        top_n = top_n or settings.RERANKER_TOP_N
        pairs = [(query, r.text) for r in results]
        scores = self.model.predict(pairs, show_progress_bar=False)
        for r, s in zip(results, scores):
            r.score = float(s)
        results.sort(key=lambda r: r.score, reverse=True)
        return results[:top_n]
