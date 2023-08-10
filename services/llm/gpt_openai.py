import time

import openai

from llm.base import BaseLLM, LLMException
from llm.types import Response
from utils import get_env_var


class GPTOpenAI(BaseLLM):
    def __init__(self, model_name: str):
        self._model_name = model_name
        openai.api_key = get_env_var("OPENAI_API_KEY")

    def chat(self, history):
        print(history, type(history))

        text = "I will print hello world"
        for i in range(len(text)):
            yield Response(text=text[: i + 1])
            time.sleep(0.1)

        # raise LLMException("This is an error")

        code = "print('hello world')"
        for i in range(len(code)):
            yield Response(text=text, code=code[: i + 1])
            time.sleep(0.1)
