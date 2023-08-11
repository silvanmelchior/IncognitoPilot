from typing import Literal, Optional

from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["user", "model", "interpreter"]
    text: Optional[str] = None
    code: Optional[str] = None
    code_result: Optional[str] = None


class Response(BaseModel):
    text: Optional[str] = None
    code: Optional[str] = None
