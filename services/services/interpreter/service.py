from pathlib import Path

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websockets.exceptions import ConnectionClosedError

from services.interpreter import IPythonInterpreter
from services.utils import get_env_var
from services.auth import verify_websocket


WORKING_DIRECTORY = Path(get_env_var("WORKING_DIRECTORY"))
IPYTHON_PATH = Path(get_env_var("IPYTHON_PATH"))
TIMEOUT = int(get_env_var("INTERPRETER_TIMEOUT", "30"))
TIMEOUT_MESSAGE = "ERROR: TIMEOUT REACHED"


interpreter_router = APIRouter()


def get_interpreter() -> IPythonInterpreter:
    interpreter = IPythonInterpreter(
        working_dir=WORKING_DIRECTORY,
        ipython_path=IPYTHON_PATH,
        deactivate_venv=True,
        timeout=TIMEOUT,
    )
    return interpreter


@interpreter_router.websocket("/run")
async def run(websocket: WebSocket):
    ws_exceptions = WebSocketDisconnect, ConnectionClosedError

    await websocket.accept()
    try:
        if not await verify_websocket(websocket):
            return
    except ws_exceptions:
        return

    try:
        interpreter = get_interpreter()
    except Exception as e:
        try:
            await websocket.send_text(str(e))
        except ws_exceptions:
            return
        return

    try:
        await websocket.send_text("_ready_")
    except ws_exceptions:
        interpreter.stop()
        return

    try:
        while True:
            script = await websocket.receive_text()
            try:
                result = interpreter.run_cell(script)
                if result is None:
                    result = TIMEOUT_MESSAGE
                response = f"_success_ {result}"
            except Exception as e:
                response = f"_error_ {e}"
            await websocket.send_text(response)
    except ws_exceptions:
        pass

    interpreter.stop()
