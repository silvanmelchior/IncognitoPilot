from contextlib import asynccontextmanager

from fastapi import FastAPI

from .websocket import ALLOWED_HOSTS
from .token import AUTH_TOKEN


@asynccontextmanager
async def welcome_lifespan(app: FastAPI):
    print("***")
    print("Welcome to Incognito Pilot")
    if len(ALLOWED_HOSTS) == 1:
        print("To start, open the following URL:")
    else:
        print("To start, open one of the the following URLs:")
    for host in ALLOWED_HOSTS:
        print(f"  http://{host}#token={AUTH_TOKEN}")
    print("***")
    yield
