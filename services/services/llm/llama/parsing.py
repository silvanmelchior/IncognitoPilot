from typing import Optional

from services.llm.base import Message

CODE_BEGIN, CODE_END = "```python\n", "\n```"
CODE_RESULT = "RESULT_PYTHON: "
B_INST, E_INST = "[INST]", "[/INST]"


def msg_to_llama_msg(msg: Message) -> str:
    if msg.role == "user":
        return f"{B_INST} {msg.text} {E_INST}"
    if msg.role == "model":
        return merge_output(msg.text, msg.code)
    if msg.role == "interpreter":
        return f"{B_INST} {format_code_result(msg.code_result)} {E_INST}"
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
    text = text.strip()
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


def merge_output(text: Optional[str], code: Optional[str]) -> str:
    response = text if text else ""
    if code:
        response += f"\n{CODE_BEGIN}{code}{CODE_END}"
    return response


def format_code_result(code_result: str) -> str:
    return f"{CODE_RESULT}{code_result}"
