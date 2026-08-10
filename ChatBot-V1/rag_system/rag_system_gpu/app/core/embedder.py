import logging
from typing import List
from sentence_transformers import SentenceTransformer
from config.settings import settings

logger = logging.getLogger(__name__)


class EmbeddingEngine:
    _instance = None

    def __init__(self):
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        try:
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
        except Exception:
            device = "cpu"
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL, device=device)
        self.model_name = settings.EMBEDDING_MODEL
        self.dim = settings.EMBEDDING_DIM
        logger.info(f"Embedding model ready. dim={self.dim}, device={device}")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        return self.model.encode(
            texts,
            batch_size=64,
            show_progress_bar=len(texts) > 100,
            normalize_embeddings=settings.NORMALIZE_EMBEDDINGS,
            convert_to_numpy=True,
        ).tolist()

    def embed_query(self, query: str) -> List[float]:
        if "bge" in self.model_name.lower():
            query = settings.BGE_QUERY_PREFIX + query
        return self.model.encode(
            [query],
            normalize_embeddings=settings.NORMALIZE_EMBEDDINGS,
            convert_to_numpy=True,
        )[0].tolist()
