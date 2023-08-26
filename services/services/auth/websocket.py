import logging

from fastapi import WebSocket

from services.auth import AUTH_TOKEN
from services.utils.env_var import get_env_var

ALLOWED_HOSTS = get_env_var("ALLOWED_HOSTS").split(" ")


def _verify_origin(origin: str) -> bool:
    origin_raw = origin.replace("http://", "").replace("https://", "")
    return origin_raw in ALLOWED_HOSTS


async def verify_websocket(websocket: WebSocket):
    if not _verify_origin(websocket.headers["origin"]):
        logging.warning("Websocket with invalid origin")
        return False

    token = await websocket.receive_text()
    if token != AUTH_TOKEN:
        logging.warning("Websocket with invalid token")
        return False

    return True
