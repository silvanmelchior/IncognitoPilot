from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .env_var import get_env_var


def get_app() -> FastAPI:
    app = FastAPI()
    if get_env_var("ENABLE_CORS", "FALSE") == "TRUE":
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    return app
