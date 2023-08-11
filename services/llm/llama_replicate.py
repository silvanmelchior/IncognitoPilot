from typing import Generator, Optional

import replicate
from replicate.exceptions import ReplicateException

from llm.base import BaseLLM, LLMException
from llm.types import Message, Response
from utils import get_env_var


SYSTEM_PROMPT = """\
You are a helpful AI assistant.

You have access to a python code interpreter, which supports you in your tasks.
The code is executed in an interactive shell, imports and variables are preserved between calls.
The environment has internet and file system access.
The current working directory is shared with the user, so files can be exchanged.
There are many libraries pre-installed, including numpy, pandas, matplotlib, and scikit-learn.
You cannot show rich outputs like plots or images, but you can store them in the working directory and point the user to them.
If the code runs too long, there will be a timeout.

To access the interpreter, use the following format:
```python
<your code>
```
If you want to call Python and still say something, do only output text above the code block, NOT below.
Only provide at most one code block per message.
The code will be executed automatically and the result will be sent back to you."""

CODE_BEGIN = "```python\n"
CODE_END = "\n```"


def msg_to_llama_msg(msg: Message) -> str:
    if msg.role == "user":
        return f"[INST] {msg.text} [/INST]"
    if msg.role == "model":
        response = msg.text if msg.text else ""
        if msg.code:
            response += f"\n{CODE_BEGIN}{msg.code}{CODE_END}"
        return response
    if msg.role == "interpreter":
        return f"[INST] RESULT_PYTHON: {msg.code_result} [/INST]"
    raise ValueError(f"Invalid message role {msg.role}")


def split_output(text: str) -> tuple[Optional[str], Optional[str], bool]:
    """Assumes that there is at most one code block, which is at the end.
    Last value in tuple is true if full code block was found. This allows to
    enforce this policy by stopping generation as soon as it becomes true."""

    finished = False

    # split text and code if possible
    if CODE_BEGIN in text:
        text, code = text.split(CODE_BEGIN)
    else:
        text, code = text, None

    # if couldn't split, might need to remove partially generated CODE_BEGIN
    if code is None:
        for i in range(len(CODE_BEGIN) - 1, 0, -1):
            if text.endswith(CODE_BEGIN[:i]):
                text = text[:-i]
                break

    # clean text
    if text.startswith(" "):
        text = text[1:]
    if text.endswith("\n"):
        text = text[:-1]
    if text == "":
        text = None

    # if have code, might need to remove partially generated CODE_END
    if code is not None:
        if CODE_END in code:
            code = code.split(CODE_END)[0]
            finished = True
        else:
            for i in range(len(CODE_END) - 1, 0, -1):
                if code.endswith(CODE_END[:i]):
                    code = code[:-i]
                    break

    if code == "":
        code = None

    return text, code, finished


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
