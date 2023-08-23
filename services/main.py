from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.interpreter import interpreter_router
from services.llm.service import llm_router
from services.utils import get_env_var


app = FastAPI()
if get_env_var("ENABLE_CORS", "FALSE") == "TRUE":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(interpreter_router, prefix="/api/interpreter")
app.include_router(llm_router, prefix="/api/llm")
