from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .token import AUTH_TOKEN

auth_router = APIRouter()


class TokenRequest(BaseModel):
    token: str


@auth_router.post("/verify")
def verify(request: TokenRequest):
    if request.token == AUTH_TOKEN:
        return {"status": "success"}
    raise HTTPException(status_code=401, detail="Invalid token")
