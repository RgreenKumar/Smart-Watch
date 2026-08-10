"""
app/core/llm.py
===============
LLM backends:
  - OpenRouterLLM : cloud API via openrouter.ai
  - LocalLLM      : local GGUF model via llama-cpp-python
  - get_llm()     : factory, reads LLM_BACKEND from .env
"""

import logging
import time
import requests
from abc import ABC, abstractmethod
from typing import List
from config.settings import settings

logger = logging.getLogger(__name__)

# ── System prompt ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = (
    "You are RGreenMart assistant. "
    "Answer using ONLY the context below. "
    #"Give a short direct answer. "
    "Do not ask questions back. "
    "Do not repeat the context. "
    "Do NOT mention prices of products not in the context. "
    "If the answer is not in the context say: "
    "I do not have that information."
)


# ── Base ──────────────────────────────────────────────────────────────────────
class BaseLLM(ABC):
    @abstractmethod
    def generate(self, context: str, question: str) -> str: ...


# ── OpenRouter ────────────────────────────────────────────────────────────────
class OpenRouterLLM(BaseLLM):

    # Retry settings for 429 Too Many Requests
    _MAX_RETRIES  = 4          # total attempts (1 initial + 3 retries)
    _BASE_DELAY   = 5.0        # seconds before first retry
    _BACKOFF_MULT = 2.0        # double the wait on each retry

    def generate(self, context: str, question: str) -> str:
        if not settings.OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY not set in .env")

        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",
                 "content": f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"},
            ],
            "temperature": settings.TEMPERATURE,
            "max_tokens":  settings.MAX_TOKENS,
        }
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type":  "application/json",
        }

        delay = self._BASE_DELAY
        last_exc = None

        for attempt in range(1, self._MAX_RETRIES + 1):
            try:
                resp = requests.post(
                    settings.OPENROUTER_BASE_URL,
                    json=payload,
                    headers=headers,
                    timeout=60,
                )

                # If rate-limited, wait and retry
                if resp.status_code == 429:
                    # Honour Retry-After header if present
                    retry_after = resp.headers.get("Retry-After")
                    wait = float(retry_after) if retry_after else delay

                    if attempt < self._MAX_RETRIES:
                        logger.warning(
                            f"OpenRouter 429 rate limit (attempt {attempt}/{self._MAX_RETRIES}). "
                            f"Retrying in {wait:.1f}s..."
                        )
                        time.sleep(wait)
                        delay *= self._BACKOFF_MULT
                        continue
                    else:
                        # All retries exhausted — raise so caller gets the error
                        resp.raise_for_status()

                resp.raise_for_status()
                answer = resp.json()["choices"][0]["message"]["content"].strip()
                logger.info(f"OpenRouter answer: {answer[:100]}")
                return answer

            except requests.exceptions.HTTPError as e:
                last_exc = e
                if attempt < self._MAX_RETRIES and resp.status_code == 429:
                    continue   # already handled above
                raise

            except requests.exceptions.RequestException as e:
                # Network error — do NOT retry, fail fast
                last_exc = e
                raise

        # Should never reach here, but just in case
        raise last_exc


# ── Prompt builders (defined BEFORE LocalLLM) ─────────────────────────────────

def _build_prompt(template: str, context: str, question: str) -> str:
    """
    Build the raw prompt string for the local model.
    Each model family needs a specific format or it
    echoes back the prompt / asks questions instead of answering.
    """

    # Short focused instruction — small models need simple prompts
    instruction = (
        f"You are RGreenMart assistant. "
        f"Answer this question using only the context. "
        f"Give a short direct answer only.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}\n\n"
        f"Answer:"
    )

    if template == "tinyllama":
        return (
            f"<|system|>\n"
            f"You are RGreenMart assistant. Answer using only the context. "
            f"Give a short direct answer only. Do not ask questions.</s>\n"
            f"<|user|>\n"
            f"Context:\n{context}\n\n"
            f"Question: {question}</s>\n"
            f"<|assistant|>\n"
        )

    elif template == "phi3":
        return (
            f"<|system|>\n"
            f"You are RGreenMart assistant. Answer using only the context. "
            f"Give a short direct answer only.</s>\n"
            f"<|user|>\n"
            f"Context:\n{context}\n\n"
            f"Question: {question}</s>\n"
            f"<|assistant|>\n"
        )

    elif template == "phi2":
        return (
            f"Instruct: {instruction}\n"
            f"Output:"
        )

    elif template == "mistral":
        return (
            f"[INST] {instruction} [/INST]"
        )

    elif template == "llama2":
        return (
            f"<s>[INST] <<SYS>>\n"
            f"You are RGreenMart assistant. Answer using only the "
            f"context. Give a short direct answer only.\n"
            f"<</SYS>>\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {question} [/INST]"
        )

    elif template == "llama3":
         return (
        f"<|start_header_id|>system<|end_header_id|>\n\n"
        f"You are a helpful assistant for RGreenMart online store. "
        f"Answer using ONLY the context provided. "
        f"Give a clear, friendly, complete answer in 2-3 sentences. "
        f"Never guess prices."
        f"Include the product name, price, discount if available. "
        f"Do not make up information not in the context."
        f"<|eot_id|>"
        f"<|start_header_id|>user<|end_header_id|>\n\n"
        f"Context:\n{context}\n\nQuestion: {question}"
        f"<|eot_id|>"
        f"<|start_header_id|>assistant<|end_header_id|>\n\n"
    )

    elif template == "gemma":
        return (
            f"<start_of_turn>user\n"
            f"Context:\n{context}\n\n"
            f"Question: {question}<end_of_turn>\n"
            f"<start_of_turn>model\n"
        )

    else:
        # Generic — works for unknown models
        return (
            f"### Instruction:\n{instruction}\n\n"
            f"### Response:\n"
        )


def _get_stop_tokens(template: str) -> List[str]:
    """Stop tokens prevent model from generating beyond the answer."""
    base = ["\n\nQuestion:", "\n\nContext:", "\n\n\n\n"]
    stops = {
        "tinyllama": ["</s>", "<|user|>", "<|system|>",
                      "<|assistant|>"] + base,
        "phi3":      ["</s>", "<|user|>", "<|system|>",
                      "<|end|>"] + base,
        "phi2":      ["Instruct:", "Output:", "\n\n"] + base,
        "mistral":   ["[INST]", "</s>"] + base,
        "llama2":    ["[INST]", "</s>", "<<SYS>>"] + base,
        "llama3":    ["<|eot_id|>", "<|end_of_text|>",
                      "<|start_header_id|>"] + base,
        "gemma":     ["<end_of_turn>", "<start_of_turn>"] + base,
        "default":   ["### Instruction:", "### Response:",
                      "Human:", "Assistant:"] + base,
    }
    return stops.get(template, stops["default"])


def _detect_template(model_name: str) -> str:
    """Detect model family from filename."""
    n = model_name.lower()

    if "tinyllama" in n:
        return "tinyllama"
    if "phi-3" in n or "phi3" in n or "phi-3.5" in n:
        return "phi3"
    if "phi-2" in n or "phi2" in n:
        return "phi2"
    if "llama-3" in n or "llama3" in n or "llama-3.1" in n or "llama-3.2" in n:
        return "llama3"
    if "llama" in n or "llama-2" in n:
        return "llama2"
    if "mistral" in n or "mixtral" in n:
        return "mistral"
    if "gemma" in n:
        return "gemma"

    return "default"


def _clean_output(text: str) -> str:
    """Strip template artifacts from model output."""
    # All known template tokens
    artifacts = [
        # TinyLlama / Phi-3
        "<|system|>", "<|user|>", "<|assistant|>", "<|end|>",
        # Llama
        "<s>", "</s>", "<<SYS>>", "<</SYS>>",
        "[INST]", "[/INST]",
        # Llama 3
        "<|begin_of_text|>", "<|end_of_text|>", "<|eot_id|>",
        "<|start_header_id|>system<|end_header_id|>",
        "<|start_header_id|>user<|end_header_id|>",
        "<|start_header_id|>assistant<|end_header_id|>",
        # Gemma
        "<start_of_turn>", "<end_of_turn>",
        # Generic
        "### Response:", "### Instruction:",
        "### Assistant:", "### User:", "### System:",
        "Output:", "Answer:",
    ]

    result = text
    for token in artifacts:
        result = result.replace(token, "")

    # Collapse extra whitespace
    result = " ".join(result.split()).strip()

    return result


def _is_garbage(text: str) -> bool:
    """
    Detect invalid output.
    Kept intentionally lenient — only catches clear failures.
    """
    if not text or len(text.strip()) < 5:
        return True

    words = text.split()

    # Empty or single word
    if len(words) < 2:
        return True

    # Model asked a question back instead of answering
    question_backs = [
        "can you provide me with",
        "could you provide",
        "please provide",
        "what is the context",
        "i need more context",
        "i need the context",
    ]
    lower = text.lower()
    for qb in question_backs:
        if qb in lower:
            logger.warning(f"Model asked back: '{text[:80]}'")
            return True

    # Repeated single token spam (R R R R)
    if len(words) > 10:
        most_common = max(set(words), key=words.count)
        ratio = words.count(most_common) / len(words)
        if ratio > 0.5:          # raised from 0.35 → 0.5 (less aggressive)
            logger.warning(f"Repeated token '{most_common}': {ratio:.0%}")
            return True

    # Single char spam
    single_chars = [w for w in words if len(w) == 1]
    if len(single_chars) > 15:
        return True

    # Raw context dump echoed back
    if "=====" in text and "RGREENMART" in text.upper():
        return True

    return False


# ── Local GGUF ────────────────────────────────────────────────────────────────
class LocalLLM(BaseLLM):

    def __init__(self):
        import os
        from llama_cpp import Llama

        model_path = settings.LOCAL_MODEL_PATH

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model not found: {model_path}\n"
                f"Place .gguf file in rag_system\\models\\"
            )

        size_gb = os.path.getsize(model_path) / (1024 ** 3)
        self._model_name = os.path.basename(model_path).lower()
        self._template   = _detect_template(self._model_name)

        logger.info(
            f"Loading: {self._model_name} "
            f"({size_gb:.1f}GB) | template={self._template}"
        )

        self._llm = Llama(
            model_path=model_path,
            n_ctx=2048,
            n_gpu_layers=0,
            n_threads=4,
            n_batch=256,
            verbose=False,
        )
        logger.info("Local model loaded OK.")

    def generate(self, context: str, question: str) -> str:
        # Truncate context — small models overflow easily
        if len(context) > 900:
            context = context[:900] + "\n...[truncated]"

        prompt = _build_prompt(self._template, context, question)

        logger.info(
            f"Generating | template={self._template} | "
            f"prompt={len(prompt)} chars"
        )

        output = self._llm(
            prompt,
            max_tokens=200,
            temperature=0.1,
            top_p=0.9,
            repeat_penalty=1.2,
            stop=_get_stop_tokens(self._template),
        )

        raw    = output["choices"][0]["text"].strip()
        logger.info(f"Raw output: '{raw[:150]}'")

        answer = _clean_output(raw)
        logger.info(f"Cleaned:    '{answer[:150]}'")

        if _is_garbage(answer):
            logger.warning("Garbage detected — returning fallback.")
            return (
                "Sorry, the local model could not answer this. "
                "For better results set LLM_BACKEND=openrouter in .env"
            )

        return answer


# ── Factory ───────────────────────────────────────────────────────────────────
def get_llm() -> BaseLLM:
    """
    Returns configured LLM.
    Controlled by LLM_BACKEND in .env:
      openrouter → cloud
      local      → local GGUF
      auto       → local first, cloud fallback
    """
    backend = settings.LLM_BACKEND.lower()

    if backend == "openrouter":
        logger.info("LLM: OpenRouter")
        return OpenRouterLLM()

    if backend == "local":
        logger.info("LLM: Local GGUF")
        return LocalLLM()

    if backend == "auto":
        import os
        try:
            import llama_cpp  # noqa
            if os.path.exists(settings.LOCAL_MODEL_PATH):
                logger.info("LLM: AUTO → trying local...")
                llm = LocalLLM()
                logger.info("LLM: AUTO → local ready.")
                return llm
            logger.warning("LLM: AUTO → model file missing.")
        except ImportError:
            logger.warning("LLM: AUTO → llama_cpp not installed.")
        except Exception as e:
            logger.warning(f"LLM: AUTO → local failed: {e}")

        if not settings.OPENROUTER_API_KEY:
            raise ValueError(
                "AUTO mode failed: no local model + no OPENROUTER_API_KEY"
            )
        logger.info("LLM: AUTO → using OpenRouter.")
        return OpenRouterLLM()

    raise ValueError(
        f"Unknown LLM_BACKEND='{backend}'. "
        f"Use: openrouter | local | auto"
    )