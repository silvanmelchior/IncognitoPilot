import os
import sys


def get_env_var(key: str, default: str = None) -> str:
    if key in os.environ:
        return os.environ[key]

    if default is not None:
        return default

    print(f"ERROR: Missing environment variables {key}, exiting...", file=sys.stderr)
    sys.exit(1)
