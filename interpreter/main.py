from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ipython_interpreter import IPythonInterpreter

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO
interpreter = IPythonInterpreter(
    Path("C:/Users/sime/AppData/Local/pypoetry/Cache/virtualenvs/interpreter-R0GDqdSm-py3.11/Scripts/ipython"),
    Path("C:/Users/sime/Desktop/code_interpreter")
)


class RunRequest(BaseModel):
    code: str


class RunResponse(BaseModel):
    result: str


@app.post("/run")
def run(req: RunRequest) -> RunResponse:
    result = interpreter.run_cell(req.code)
    if result is None:
        result = "ERROR: TIMEOUT REACHED"
    return RunResponse(result=result)
