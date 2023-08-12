import json

from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect
from pydantic import BaseModel
from websockets.exceptions import ConnectionClosedError

from llm import LLMException, Message, get_llm
from utils import get_app, get_env_var


app = get_app()

LLM_SETTING = get_env_var("LLM", "gpt-openai:gpt-4")
llm = get_llm(LLM_SETTING)


class Request(BaseModel):
    history: list[Message]


@app.websocket("/api/llm/chat")
async def chat(websocket: WebSocket):
    ws_exceptions = WebSocketDisconnect, ConnectionClosedError

    try:
        await websocket.accept()
        history = await websocket.receive_text()
    except ws_exceptions:
        return

    try:
        history = json.loads(history)
        history = Request(history=history).history
        response_generator = llm.chat(history)
        try:
            for response in response_generator:
                msg = "_success_ " + response.json(exclude_none=True)
                await websocket.send_text(msg)
            await websocket.close()

        except ws_exceptions:
            response_generator.close()
            return

    except Exception as e:
        try:
            if isinstance(e, LLMException):
                error = str(e)
            else:
                print(e, type(e))
                error = "Internal error"
            await websocket.send_text("_error_ " + error)
            await websocket.close()
        except ws_exceptions:
            return
