from typing import Literal, Optional

from pydantic import BaseModel


# a user sends a text
# a model sends a text, code, or both
# an interpreter sends a code_result
# duplicate definition in frontend
class Message(BaseModel):
    role: Literal["user", "model", "interpreter"]
    text: Optional[str] = None
    code: Optional[str] = None
    code_result: Optional[str] = None


class Response(BaseModel):
    text: Optional[str] = None
    code: Optional[str] = None
