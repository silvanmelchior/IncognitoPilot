import subprocess

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    code: str


class RunResponse(BaseModel):
    stdout: str
    stderr: str


@app.post("/run")
def run(req: RunRequest) -> RunResponse:
    process = subprocess.run(
        ["C:/Users/sime/AppData/Local/pypoetry/Cache/virtualenvs/interpreter-R0GDqdSm-py3.11/Scripts/python", "-c", req.code],  # TODO
        capture_output=True,
        text=True,
        cwd="C:/Users/sime/Desktop/code_interpreter"  # TODO
    )
    return RunResponse(stdout=process.stdout, stderr=process.stderr)
