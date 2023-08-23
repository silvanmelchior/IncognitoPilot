from pathlib import Path

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websockets.exceptions import ConnectionClosedError

from services.interpreter import IPythonInterpreter
from services.utils import get_env_var, verify_origin

interpreter_router = APIRouter()

WORKING_DIRECTORY = Path(get_env_var("WORKING_DIRECTORY"))
IPYTHON_PATH = Path(get_env_var("IPYTHON_PATH"))
TIMEOUT = int(get_env_var("INTERPRETER_TIMEOUT", "30"))
TIMEOUT_MESSAGE = "ERROR: TIMEOUT REACHED"


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
    if not verify_origin(websocket.headers["origin"]):
        return

    ws_exceptions = WebSocketDisconnect, ConnectionClosedError

    try:
        await websocket.accept()
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
