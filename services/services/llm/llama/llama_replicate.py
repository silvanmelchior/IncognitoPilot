from typing import Generator

import replicate
from replicate.exceptions import ReplicateException

from services.llm.base import BaseLLM, LLMException
from services.llm.types import Message, Response
from services.utils import get_env_var
from .prompt import SYSTEM_PROMPT
from .parsing import msg_to_llama_msg, split_output


class LlamaReplicate(BaseLLM):
    def __init__(self, model_name: str):
        self._model_name = model_name
        self._client = replicate.Client(api_token=get_env_var("REPLICATE_API_KEY"))

    def chat(self, history: list[Message]) -> Generator[Response, None, None]:
        messages = [msg_to_llama_msg(msg) for msg in history]
        try:
            output = self._client.run(
                self._model_name,
                input={
                    "prompt": " ".join(messages),
                    "system_prompt": SYSTEM_PROMPT,
                    "temperature": 0.01,
                },
            )

            full_text = ""
            for item in output:
                full_text += item

                text, code, finished = split_output(full_text)
                if text is not None or code is not None:
                    yield Response(text=text, code=code)

                if finished:
                    break

        except ReplicateException as e:
            raise LLMException(str(e))
