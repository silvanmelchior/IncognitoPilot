import subprocess

import openai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import APIConfig, FUNCTIONS


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
openai.api_key = APIConfig().openai_api_key.get_secret_value()


@app.post("/chat")
def chat(messages: list[dict]):
    result = openai.ChatCompletion.create(
        model=APIConfig().model,
        temperature=APIConfig().temperature,
        messages=messages,
        functions=FUNCTIONS,
        function_call="auto"
    )
    return result["choices"][0]["message"]


class RunRequest(BaseModel):
    code: str


class RunResponse(BaseModel):
    stdout: str
    stderr: str


@app.post("/run")
def run(req: RunRequest) -> RunResponse:
    process = subprocess.run(
        ["python", "-c", req.code],
        capture_output=True,
        text=True
    )
    return RunResponse(stdout=process.stdout, stderr=process.stderr)
