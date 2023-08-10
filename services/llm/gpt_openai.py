import re
import json
from typing import Generator

import openai
from openai import OpenAIError

from llm.base import BaseLLM, LLMException
from llm.types import Message, Response
from utils import get_env_var


FUNCTIONS = [
    {
        "name": "run_python_code",
        "description": "Runs arbitrary Python code and returns stdout and stderr. "
        + "The code is executed in an interactive shell, imports and variables are preserved between calls. "
        + "The environment has internet and file system access. "
        + "The current working directory is shared with the user, so files can be exchanged. "
        + "There are many libraries pre-installed, including numpy, pandas, matplotlib, and scikit-learn. "
        + "You cannot show rich outputs like plots or images, but you can store them in the working directory and point the user to them. "
        + "If the code runs too long, there will be a timeout.",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The Python code to run",
                },
            },
            "required": ["code"],
        },
    },
]


def msg_to_gpt_msg(msg: Message) -> dict:
    if msg.role == "user":
        return {"role": "user", "content": msg.text}
    if msg.role == "model":
        response = {
            "role": "assistant",
            "content": msg.text or None,
        }
        if msg.code:
            response["function_call"] = {
                "name": "run_python_code",
                "arguments": json.dumps({"code": msg.code}),
            }
        return response
    if msg.role == "interpreter":
        return {
            "role": "function",
            "name": "run_python_code",
            "content": msg.code_result,
        }
    raise ValueError(f"Invalid message role {msg.role}")


def fill_dict(dst: dict, chunk: dict):
    for key in chunk:
        if chunk[key] is None:
            dst[key] = None
        elif isinstance(chunk[key], dict):
            if key not in dst:
                dst[key] = {}
            fill_dict(dst[key], chunk[key])
        elif isinstance(chunk[key], str):
            if key not in dst:
                dst[key] = ""
            dst[key] += chunk[key]
        else:
            raise ValueError(f"Unsupported type {type(chunk[key])}")


def lazy_parse_args(args_partial):
    args = args_partial
    if not re.sub(r"\s+", "", args).endswith('"}'):
        args += '"}'

    try:
        args = json.loads(args)
        if "code" not in args:
            return None
    except json.JSONDecodeError:
        return None

    return args["code"]


class GPTOpenAI(BaseLLM):
    def __init__(self, model_name: str):
        self._model_name = model_name
        openai.api_key = get_env_var("OPENAI_API_KEY")

    def chat(self, history: list[Message]) -> Generator[Response, None, None]:
        messages = [msg_to_gpt_msg(msg) for msg in history]

        try:
            chunk_generator = openai.ChatCompletion.create(
                model=self._model_name,
                messages=messages,
                temperature=0,
                functions=FUNCTIONS,
                function_call="auto",
                stream=True,
            )
        except OpenAIError as e:
            raise LLMException(str(e))

        response = {}
        previous_code = None
        for chunk_all in chunk_generator:
            chunk = chunk_all["choices"][0]["delta"]
            fill_dict(response, chunk)

            text = None
            if "content" in response:
                text = response["content"]

            code = None
            if "function_call" in response and "arguments" in response["function_call"]:
                args = response["function_call"]["arguments"]
                code = lazy_parse_args(args)
            if code is None:
                code = previous_code
            previous_code = code

            yield Response(text=text, code=code)
