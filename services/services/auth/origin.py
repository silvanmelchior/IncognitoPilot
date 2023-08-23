from services.utils.env_var import get_env_var

ALLOWED_HOSTS = get_env_var("ALLOWED_HOSTS").split(" ")


def verify_origin(origin: str) -> bool:
    origin_raw = origin.replace("http://", "").replace("https://", "")
    return origin_raw in ALLOWED_HOSTS
