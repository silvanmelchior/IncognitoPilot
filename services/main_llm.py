import os
import sys
import time
from typing import Literal, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, TypeAdapter

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    LLM_SETTING = os.environ["LLM"]
except KeyError:
    print("ERROR: Missing environment variables, exiting...", file=sys.stderr)
    sys.exit(1)


class Message(BaseModel):
    role: Literal["user", "model", "interpreter"]
    text: Optional[str] = None
    code: Optional[str] = None
    code_result: Optional[str] = None


Request = TypeAdapter(list[Message])


class Response(BaseModel):
    text: Optional[str] = None
    code: Optional[str] = None


@app.websocket("/chat")
async def chat(websocket: WebSocket):
    await websocket.accept()

    history = await websocket.receive_text()
    history = Request.validate_json(history)
    print(history, type(history))

    text = "I will print hello world"
    for i in range(len(text)):
        response = Response(text=text[: i + 1])
        await websocket.send_text(response.model_dump_json(exclude_none=True))
        time.sleep(0.1)

    code = "print('hello world')"
    for i in range(len(code)):
        response = Response(text=text, code=code[: i + 1])
        await websocket.send_text(response.model_dump_json(exclude_none=True))
        time.sleep(0.1)

    await websocket.close()

    # TODO: handle disconnect (stop generator)
    # try:
    #     ...
    # except WebSocketDisconnect:
    #     pass
    # TODO: error handling as in main_interpreter.py
