import os
import sys
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from ipython_interpreter import IPythonInterpreter

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/run")
async def run(websocket: WebSocket):
    await websocket.accept()
    interpreter = IPythonInterpreter(
        Path(sys.executable).parent / 'ipython.exe',
        Path(os.environ["WORKING_DIRECTORY"])
    )

    try:
        while True:
            script = await websocket.receive_text()
            result = interpreter.run_cell(script)
            if result is None:
                result = "ERROR: TIMEOUT REACHED"
            await websocket.send_text(result)
    except WebSocketDisconnect:
        pass

    interpreter.stop()
