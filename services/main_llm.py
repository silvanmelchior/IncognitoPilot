from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect
from pydantic import TypeAdapter
from websockets.exceptions import ConnectionClosedError

from llm import LLMException, Message, get_llm
from utils import get_app, get_env_var


app = get_app()

LLM_SETTING = get_env_var("LLM", "gpt-openai:gpt-4")
llm = get_llm(LLM_SETTING)

Request = TypeAdapter(list[Message])


@app.websocket("/chat")
async def chat(websocket: WebSocket):
    ws_exceptions = WebSocketDisconnect, ConnectionClosedError

    try:
        await websocket.accept()
        history = await websocket.receive_text()
    except ws_exceptions:
        return

    history = Request.validate_json(history)

    try:
        response_generator = llm.chat(history)
        try:
            for response in response_generator:
                msg = "_success_ " + response.model_dump_json(exclude_none=True)
                await websocket.send_text(msg)
            await websocket.close()

        except ws_exceptions:
            response_generator.close()
            return

    except LLMException as e:
        try:
            await websocket.send_text("_error_ " + str(e))
            await websocket.close()
        except ws_exceptions:
            return
