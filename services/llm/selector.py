from llm.llama_replicate import LlamaReplicate
from llm.gpt_openai import GPTOpenAI
from llm.base import BaseLLM


MAP_LLM = {
    "gpt-openai": GPTOpenAI,
    "llama-replicate": LlamaReplicate,
}


def get_llm(llm_setting: str) -> BaseLLM:
    for prefix, llm_class in MAP_LLM.items():
        if llm_setting.startswith(prefix):
            return llm_class(llm_setting[len(prefix) + 1 :])

    raise ValueError(f"Unknown LLM setting: {llm_setting}")
