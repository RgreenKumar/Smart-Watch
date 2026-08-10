import re
import logging
from typing import List
from dataclasses import dataclass
import tiktoken
from config.settings import settings

logger = logging.getLogger(__name__)
_TOK = tiktoken.get_encoding("cl100k_base")


@dataclass
class Chunk:
    text: str
    tokens: int
    index: int
    source: str


def count_tokens(text: str) -> int:
    return len(_TOK.encode(text))


def _split_sentences(text: str) -> List[str]:
    paragraphs = re.split(r"\n{2,}", text.strip())
    sentences = []
    for para in paragraphs:
        parts = re.split(r"(?<=[.!?])\s+", para.strip())
        sentences.extend([s.strip() for s in parts if s.strip()])
    return sentences


def chunk_text(text, source="unknown", chunk_size=None,
               chunk_overlap=None, min_chunk_size=None) -> List[Chunk]:
    cs = chunk_size or settings.CHUNK_SIZE
    co = chunk_overlap or settings.CHUNK_OVERLAP
    mc = min_chunk_size or settings.MIN_CHUNK_SIZE

    sentences = _split_sentences(text)
    if not sentences:
        return []

    chunks: List[Chunk] = []
    current: List[str] = []
    current_tokens = 0
    overlap: List[str] = []

    current = list(overlap)
    current_tokens = sum(count_tokens(s) for s in current)

    for sentence in sentences:
        st = count_tokens(sentence)

        if st > cs:
            if current:
                _flush(current, source, len(chunks), mc, chunks)
            words = sentence.split()
            wbuf: List[str] = []
            wtok = 0
            idx = len(chunks)
            for w in words:
                wt = count_tokens(w)
                if wtok + wt > cs and wbuf:
                    t = " ".join(wbuf)
                    chunks.append(Chunk(t, count_tokens(t), idx, source))
                    idx += 1
                    wbuf = []
                    wtok = 0
                wbuf.append(w)
                wtok += wt
            if wbuf:
                t = " ".join(wbuf)
                chunks.append(Chunk(t, count_tokens(t), idx, source))
            current = []
            current_tokens = 0
            overlap = []
            continue

        if current_tokens + st > cs:
            if current:
                _flush(current, source, len(chunks), mc, chunks)
            overlap = _build_overlap(current, co)
            current = list(overlap)
            current_tokens = sum(count_tokens(s) for s in current)

        current.append(sentence)
        current_tokens += st

    if current:
        _flush(current, source, len(chunks), mc, chunks)

    logger.info(f"Chunked '{source}': {len(chunks)} chunks "
                f"(size={cs}, overlap={co})")
    return chunks


def _flush(sentences, source, index, mc, out):
    text = " ".join(sentences).strip()
    tokens = count_tokens(text)
    if tokens >= mc:
        out.append(Chunk(text=text, tokens=tokens, index=index, source=source))


def _build_overlap(sentences, target):
    overlap = []
    acc = 0
    for s in reversed(sentences):
        t = count_tokens(s)
        if acc + t > target:
            break
        overlap.insert(0, s)
        acc += t
    return overlap
