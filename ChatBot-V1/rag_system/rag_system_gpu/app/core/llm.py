"""
app/core/llm.py  (GPU version)
================================
GPU Change Log vs CPU version:
  - n_gpu_layers=0  →  n_gpu_layers=-1   (offload ALL layers to CUDA GPU)
  - n_threads=4     →  n_threads=2       (GPU does heavy work)
  - n_batch=256     →  n_batch=512       (larger batch = better GPU throughput)
  - Added gpu_info() helper printed at startup
  - LOCAL_N_GPU_LAYERS in .env controls override (default -1)
"""

import logging
import requests
from abc import ABC, abstractmethod
from typing import List
from config.settings import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are RGreenMart assistant. "
    "Answer using ONLY the context below. "
    "Do not ask questions back. "
    "Do not repeat the context. "
    "Do NOT mention prices of products not in the context. "
    "If the answer is not in the context say: "
    "I do not have that information."
)


def gpu_info() -> str:
    try:
        import torch
        if torch.cuda.is_available():
            name  = torch.cuda.get_device_name(0)
            total = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            return f"CUDA GPU: {name}  |  VRAM: {total:.1f} GB"
        return "CUDA not available – running on CPU"
    except ImportError:
        return "torch not installed – GPU check skipped"


class BaseLLM(ABC):
    @abstractmethod
    def generate(self, context: str, question: str) -> str: ...


class OpenRouterLLM(BaseLLM):
    def generate(self, context: str, question: str) -> str:
        if not settings.OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY not set in .env")
        resp = requests.post(
            settings.OPENROUTER_BASE_URL,
            json={
                "model": settings.OPENROUTER_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",
                     "content": f"Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"},
                ],
                "temperature": settings.TEMPERATURE,
                "max_tokens":  settings.MAX_TOKENS,
            },
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type":  "application/json",
            },
            timeout=60,
        )
        resp.raise_for_status()
        answer = resp.json()["choices"][0]["message"]["content"].strip()
        logger.info(f"OpenRouter answer: {answer[:100]}")
        return answer


def _build_prompt(template: str, context: str, question: str) -> str:
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
            f"<|user|>\nContext:\n{context}\n\nQuestion: {question}</s>\n"
            f"<|assistant|>\n"
        )
    elif template == "phi3":
        return (
            f"<|system|>\n"
            f"You are RGreenMart assistant. Answer using only the context. "
            f"Give a short direct answer only.</s>\n"
            f"<|user|>\nContext:\n{context}\n\nQuestion: {question}</s>\n"
            f"<|assistant|>\n"
        )
    elif template == "phi2":
        return f"Instruct: {instruction}\nOutput:"
    elif template == "mistral":
        return f"[INST] {instruction} [/INST]"
    elif template == "llama2":
        return (
            f"<s>[INST] <<SYS>>\n"
            f"You are RGreenMart assistant. Answer using only the context. "
            f"Give a short direct answer only.\n<</SYS>>\n\n"
            f"Context:\n{context}\n\nQuestion: {question} [/INST]"
        )
    elif template == "llama3":
        return (
            f"<|start_header_id|>system<|end_header_id|>\n\n"
            f"You are a helpful assistant for RGreenMart online store. "
            f"Answer using ONLY the context provided. "
            f"Never guess prices."
            f"Give a clear, friendly, complete answer in 2-3 sentences. "
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
            f"<start_of_turn>user\nContext:\n{context}\n\n"
            f"Question: {question}<end_of_turn>\n<start_of_turn>model\n"
        )
    else:
        return f"### Instruction:\n{instruction}\n\n### Response:\n"


def _get_stop_tokens(template: str) -> List[str]:
    base = ["\n\nQuestion:", "\n\nContext:", "\n\n\n\n"]
    stops = {
        "tinyllama": ["</s>", "<|user|>", "<|system|>", "<|assistant|>"] + base,
        "phi3":      ["</s>", "<|user|>", "<|system|>", "<|end|>"] + base,
        "phi2":      ["Instruct:", "Output:", "\n\n"] + base,
        "mistral":   ["[INST]", "</s>"] + base,
        "llama2":    ["[INST]", "</s>", "<<SYS>>"] + base,
        "llama3":    ["<|eot_id|>", "<|end_of_text|>", "<|start_header_id|>"] + base,
        "gemma":     ["<end_of_turn>", "<start_of_turn>"] + base,
        "default":   ["### Instruction:", "### Response:", "Human:", "Assistant:"] + base,
    }
    return stops.get(template, stops["default"])


def _detect_template(model_name: str) -> str:
    n = model_name.lower()
    if "tinyllama" in n: return "tinyllama"
    if "phi-3" in n or "phi3" in n or "phi-3.5" in n: return "phi3"
    if "phi-2" in n or "phi2" in n: return "phi2"
    if "llama-3" in n or "llama3" in n or "llama-3.1" in n or "llama-3.2" in n: return "llama3"
    if "llama" in n or "llama-2" in n: return "llama2"
    if "mistral" in n or "mixtral" in n: return "mistral"
    if "gemma" in n: return "gemma"
    return "default"


def _clean_output(text: str) -> str:
    artifacts = [
        "<|system|>", "<|user|>", "<|assistant|>", "<|end|>",
        "<s>", "</s>", "<<SYS>>", "<</SYS>>", "[INST]", "[/INST]",
        "<|begin_of_text|>", "<|end_of_text|>", "<|eot_id|>",
        "<|start_header_id|>system<|end_header_id|>",
        "<|start_header_id|>user<|end_header_id|>",
        "<|start_header_id|>assistant<|end_header_id|>",
        "<start_of_turn>", "<end_of_turn>",
        "### Response:", "### Instruction:",
        "### Assistant:", "### User:", "### System:",
        "Output:", "Answer:",
    ]
    result = text
    for token in artifacts:
        result = result.replace(token, "")
    return " ".join(result.split()).strip()


def _is_garbage(text: str) -> bool:
    if not text or len(text.strip()) < 5: return True
    words = text.split()
    if len(words) < 2: return True
    question_backs = [
        "can you provide me with", "could you provide", "please provide",
        "what is the context", "i need more context", "i need the context",
    ]
    lower = text.lower()
    for qb in question_backs:
        if qb in lower:
            logger.warning(f"Model asked back: '{text[:80]}'")
            return True
    if len(words) > 10:
        most_common = max(set(words), key=words.count)
        if words.count(most_common) / len(words) > 0.5:
            logger.warning(f"Repeated token '{most_common}'")
            return True
    if len([w for w in words if len(w) == 1]) > 15: return True
    if "=====" in text and "RGREENMART" in text.upper(): return True
    return False


# ── Local GGUF — GPU enabled ──────────────────────────────────────────────────
class LocalLLM(BaseLLM):

    def __init__(self):
        import os
        from llama_cpp import Llama

        model_path = settings.LOCAL_MODEL_PATH

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model not found: {model_path}\n"
                f"Place .gguf file in rag_system/models/"
            )

        size_gb = os.path.getsize(model_path) / (1024 ** 3)
        self._model_name = os.path.basename(model_path).lower()
        self._template   = _detect_template(self._model_name)

        # -1 = offload ALL transformer layers to GPU (fastest)
        # Set LOCAL_N_GPU_LAYERS=0 in .env to force CPU-only
        n_gpu_layers = int(getattr(settings, "LOCAL_N_GPU_LAYERS", -1))

        logger.info("=" * 60)
        logger.info(gpu_info())
        logger.info(f"Model   : {self._model_name} ({size_gb:.1f} GB)")
        logger.info(f"Template: {self._template}")
        logger.info(f"GPU layers: {n_gpu_layers}  (-1 = all layers on GPU)")
        logger.info("=" * 60)

        self._llm = Llama(
            model_path   = model_path,
            n_ctx        = int(getattr(settings, "LOCAL_N_CTX", 2048)),
            n_gpu_layers = n_gpu_layers,   # ← KEY CHANGE: 0 → -1 (full GPU)
            n_threads    = 2,              # ← was 4; GPU handles compute
            n_batch      = 512,            # ← was 256; larger = faster on GPU
            verbose      = False,
        )
        logger.info("Local model ready (GPU offloaded).")

    def generate(self, context: str, question: str) -> str:
        if len(context) > 900:
            context = context[:900] + "\n...[truncated]"

        prompt = _build_prompt(self._template, context, question)
        logger.info(f"Generating | template={self._template} | prompt={len(prompt)} chars")

        output = self._llm(
            prompt,
            max_tokens     = 200,
            temperature    = 0.1,
            top_p          = 0.9,
            repeat_penalty = 1.2,
            stop           = _get_stop_tokens(self._template),
        )

        raw    = output["choices"][0]["text"].strip()
        logger.info(f"Raw:     '{raw[:150]}'")
        answer = _clean_output(raw)
        logger.info(f"Cleaned: '{answer[:150]}'")

        if _is_garbage(answer):
            logger.warning("Garbage output — returning fallback.")
            return (
                "Sorry, the local model could not answer this. "
                "For better results set LLM_BACKEND=openrouter in .env"
            )
        return answer


# ── Factory ───────────────────────────────────────────────────────────────────
def get_llm() -> BaseLLM:
    backend = settings.LLM_BACKEND.lower()

    if backend == "openrouter":
        logger.info("LLM: OpenRouter")
        return OpenRouterLLM()

    if backend == "local":
        logger.info("LLM: Local GGUF (GPU)")
        return LocalLLM()

    if backend == "auto":
        import os
        try:
            import llama_cpp  # noqa
            if os.path.exists(settings.LOCAL_MODEL_PATH):
                logger.info("LLM: AUTO → trying local GPU...")
                llm = LocalLLM()
                logger.info("LLM: AUTO → local GPU ready.")
                return llm
            logger.warning("LLM: AUTO → model file missing.")
        except ImportError:
            logger.warning("LLM: AUTO → llama_cpp not installed.")
        except Exception as e:
            logger.warning(f"LLM: AUTO → local failed: {e}")

        if not settings.OPENROUTER_API_KEY:
            raise ValueError("AUTO mode failed: no local model + no OPENROUTER_API_KEY")
        logger.info("LLM: AUTO → using OpenRouter.")
        return OpenRouterLLM()

    raise ValueError(f"Unknown LLM_BACKEND='{backend}'. Use: openrouter | local | auto")
