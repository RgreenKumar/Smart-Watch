import os
from dotenv import load_dotenv
load_dotenv()

class Settings:
    # Embedding — BAAI/bge-large-en-v1.5 chosen for:
    # Top-3 MTEB English retrieval, 1024-dim, L2-normalised, BGE query prefix support
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-large-en-v1.5")
    EMBEDDING_DIM: int = int(os.getenv("EMBEDDING_DIM", "1024"))
    NORMALIZE_EMBEDDINGS: bool = os.getenv("NORMALIZE_EMBEDDINGS", "true").lower() == "true"
    BGE_QUERY_PREFIX: str = "Represent this sentence for searching relevant passages: "

    # ChromaDB
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_store")
    CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "rgreenmart")

    # Chunking
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "512"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "128"))
    MIN_CHUNK_SIZE: int = int(os.getenv("MIN_CHUNK_SIZE", "50"))

    # Retrieval
    TOP_K: int = int(os.getenv("TOP_K", "5"))
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.35"))
    MAX_CONTEXT_TOKENS: int = int(os.getenv("MAX_CONTEXT_TOKENS", "3000"))

    # Reranker
    ENABLE_RERANKER: bool = os.getenv("ENABLE_RERANKER", "false").lower() == "true"
    RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "BAAI/bge-reranker-large")
    RERANKER_TOP_N: int = int(os.getenv("RERANKER_TOP_N", "3"))

    # LLM
    LLM_BACKEND: str = os.getenv("LLM_BACKEND", "openrouter")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "mistralai/mixtral-8x7b-instruct")
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    LOCAL_MODEL_PATH: str = os.getenv("LOCAL_MODEL_PATH", "./models/mistral-7b.gguf")
    LOCAL_N_CTX: int = int(os.getenv("LOCAL_N_CTX", "4096"))
    LOCAL_N_GPU_LAYERS: int = int(os.getenv("LOCAL_N_GPU_LAYERS", "0"))

    # Generation
    TEMPERATURE: float = 0.1
    MAX_TOKENS: int = int(os.getenv("MAX_TOKENS", "512"))

    # Flask
    FLASK_HOST: str = os.getenv("FLASK_HOST", "0.0.0.0")
    FLASK_PORT: int = int(os.getenv("FLASK_PORT", "5000"))
    FLASK_DEBUG: bool = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")

settings = Settings()
