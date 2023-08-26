import re
import json

from services.llm.types import Message


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
