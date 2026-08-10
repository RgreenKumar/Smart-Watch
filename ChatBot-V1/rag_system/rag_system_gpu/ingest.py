import logging
import argparse
from pathlib import Path
from app.core.chunker import chunk_text
from app.core.retriever import VectorStore
from app.utils.file_loader import load_file

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)


def ingest_file(file_path: str, store: VectorStore) -> int:
    logger.info(f"Loading: {file_path}")
    text = load_file(file_path)
    if not text:
        logger.error(f"Cannot load {file_path}")
        return 0
    source = Path(file_path).name
    chunks = chunk_text(text=text, source=source)
    logger.info(f"Created {len(chunks)} chunks from '{source}'")
    added = store.add_chunks(chunks)
    logger.info(f"Indexed {added} chunks. Total in store: {store.count()}")
    return added


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", default="./data/rgreenmart_knowledge.txt")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()

    store = VectorStore()
    if args.reset:
        logger.warning("Resetting vector store...")
        store.reset()

    ingest_file(args.file, store)
    logger.info("Ingestion complete.")


if __name__ == "__main__":
    main()
