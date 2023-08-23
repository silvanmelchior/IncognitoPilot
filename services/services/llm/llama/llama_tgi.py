from typing import Generator

from requests import RequestException
from sentencepiece import SentencePieceProcessor
from text_generation import Client
from text_generation.errors import ValidationError

from services.llm.base import BaseLLM, LLMException
from services.llm.types import Message, Response
from services.utils import get_env_var
from .prompt import SYSTEM_PROMPT
from .parsing import msg_to_llama_msg, split_output


B_SYS, E_SYS = "<<SYS>>\n", "\n<</SYS>>\n\n"
B_TURN, E_TURN = "<s>", "</s>"


class LlamaTGI(BaseLLM):
    """Llama, served via text generation inference by huggingface."""

    def __init__(self, client_url: str):
        self._client = Client(client_url)
        self._max_tokens = int(get_env_var("MAX_TOKENS"))
        self._tokenizer = SentencePieceProcessor(
            model_file=get_env_var("TOKENIZER_PATH")
        )

    @staticmethod
    def get_prompt(history: list[Message]) -> str:
        if len(history) == 0 or history[0].role != "user":
            raise ValueError("First message must be user message")

        first_message = Message(
            role="user", text=f"{B_SYS}{SYSTEM_PROMPT}{E_SYS}{history[0].text}"
        )
        system_history = [first_message] + history[1:]

        messages = [msg_to_llama_msg(msg) for msg in system_history]

        if history[-1].role == "model":
            raise ValueError("Last message must be user or interpreter message")

        previous_turns = [
            f"{B_TURN}{messages[idx]} {messages[idx+1]}{E_TURN}"
            for idx in range(len(messages))[0:-1:2]
        ]
        last_turn = f"{B_TURN}{messages[-1]}"

        prompt = "".join(previous_turns + [last_turn])
        return prompt

    def get_max_new_tokens(self, prompt: str) -> int:
        prompt_tokens = len(self._tokenizer.encode(prompt))
        return self._max_tokens - prompt_tokens

    def chat(self, history: list[Message]) -> Generator[Response, None, None]:
        prompt = self.get_prompt(history)
        max_new_tokens = self.get_max_new_tokens(prompt)

        try:
            full_text = ""
            for response in self._client.generate_stream(
                prompt, temperature=0.75, max_new_tokens=max_new_tokens
            ):
                if not response.token.special:
                    full_text += response.token.text

                    text, code, finished = split_output(full_text)
                    if text is not None or code is not None:
                        yield Response(text=text, code=code)

                    if finished:
                        break

        except (RequestException, ValidationError) as e:
            raise LLMException(str(e))
