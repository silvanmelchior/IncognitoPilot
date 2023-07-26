import os
import sys
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from interpreter import IPythonInterpreter

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TIMEOUT_MESSAGE = "ERROR: TIMEOUT REACHED"

try:
    WORKING_DIRECTORY = Path(os.environ["WORKING_DIRECTORY"])
    IPYTHON_PATH = Path(os.environ["IPYTHON_PATH"])
except KeyError:
    print("ERROR: Missing environment variables, exiting...", file=sys.stderr)
    sys.exit(1)


def get_interpreter() -> IPythonInterpreter:
    interpreter = IPythonInterpreter(
        working_dir=WORKING_DIRECTORY,
        ipython_path=IPYTHON_PATH,
        deactivate_venv=True,
        timeout=30
    )
    return interpreter


@app.websocket("/run")
async def run(websocket: WebSocket):
    await websocket.accept()
    interpreter = get_interpreter()

    try:
        while True:
            script = await websocket.receive_text()
            result = interpreter.run_cell(script)
            if result is None:
                result = TIMEOUT_MESSAGE
            await websocket.send_text(result)
    except WebSocketDisconnect:
        pass

    interpreter.stop()
