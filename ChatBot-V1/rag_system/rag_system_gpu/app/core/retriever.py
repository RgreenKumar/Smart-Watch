import logging
import uuid
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from config.settings import settings
from app.core.embedder import EmbeddingEngine
from app.core.chunker import Chunk

logger = logging.getLogger(__name__)


class RetrievalResult:
    def __init__(self, text, score, source, chunk_index, metadata):
        self.text = text
        self.score = score
        self.source = source
        self.chunk_index = chunk_index
        self.metadata = metadata

    @property
    def confidence(self):
        if self.score >= 0.80: return "HIGH"
        if self.score >= 0.55: return "MEDIUM"
        if self.score >= 0.35: return "LOW"
        return "VERY_LOW"

    def to_dict(self):
        return {
            "text": self.text,
            "score": round(self.score, 4),
            "confidence": self.confidence,
            "source": self.source,
            "chunk_index": self.chunk_index,
            "metadata": self.metadata,
        }


class VectorStore:
    def __init__(self):
        self.embedder = EmbeddingEngine.get_instance()
        self._client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self._col = self._client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(f"VectorStore ready: '{settings.CHROMA_COLLECTION_NAME}' "
                    f"({self._col.count()} docs)")

    def add_chunks(self, chunks: List[Chunk]) -> int:
        if not chunks:
            return 0
        texts = [c.text for c in chunks]
        embeddings = self.embedder.embed_documents(texts)
        ids = [str(uuid.uuid4()) for _ in chunks]
        metadatas = [
            {"source": c.source, "chunk_index": c.index, "token_count": c.tokens}
            for c in chunks
        ]
        for i in range(0, len(chunks), 500):
            self._col.add(
                ids=ids[i:i+500],
                embeddings=embeddings[i:i+500],
                documents=texts[i:i+500],
                metadatas=metadatas[i:i+500],
            )
        logger.info(f"Indexed {len(chunks)} chunks. Total: {self._col.count()}")
        return len(chunks)

    def query(self, query, top_k=None, similarity_threshold=None,
              filter_source=None) -> List[RetrievalResult]:
        top_k = top_k or settings.TOP_K
        threshold = similarity_threshold if similarity_threshold is not None             else settings.SIMILARITY_THRESHOLD
        qe = self.embedder.embed_query(query)
        where = {"source": filter_source} if filter_source else None
        raw = self._col.query(
            query_embeddings=[qe],
            n_results=min(top_k, self._col.count() or 1),
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        results = []
        if not raw["documents"] or not raw["documents"][0]:
            return results
        for doc, meta, dist in zip(
            raw["documents"][0], raw["metadatas"][0], raw["distances"][0]
        ):
            sim = 1.0 - dist
            logger.debug(f"  {meta.get('source')}[{meta.get('chunk_index')}] "
                         f"score={sim:.4f}")
            if sim < threshold:
                continue
            results.append(RetrievalResult(
                doc, sim,
                meta.get("source", "?"),
                meta.get("chunk_index", -1),
                meta,
            ))
        results.sort(key=lambda r: r.score, reverse=True)
        return results

    def delete_source(self, source: str) -> int:
        ex = self._col.get(where={"source": source})
        ids = ex.get("ids", [])
        if ids:
            self._col.delete(ids=ids)
        return len(ids)

    def count(self) -> int:
        return self._col.count()

    def reset(self):
        self._client.delete_collection(settings.CHROMA_COLLECTION_NAME)
        self._col = self._client.create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        logger.warning("VectorStore reset.")
