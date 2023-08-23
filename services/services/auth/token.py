import secrets

from services.utils import get_env_var

AUTH_TOKEN = get_env_var("AUTH_TOKEN", secrets.token_urlsafe(32))
