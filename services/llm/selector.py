from llm.gpt_openai import GPTOpenAI
from llm.base import BaseLLM


def get_llm(llm_setting: str) -> BaseLLM:
    if llm_setting.startswith("gpt-openai:"):
        return GPTOpenAI(llm_setting[11:])

    raise ValueError(f"Unknown LLM setting: {llm_setting}")
