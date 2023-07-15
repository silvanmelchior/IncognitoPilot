from confz import BaseConfig, EnvSource
from pydantic import SecretStr


class APIConfig(BaseConfig):
    openai_api_key: SecretStr
    model: str = "gpt-4-0613"
    temperature: float = 0.0

    CONFIG_SOURCES = EnvSource(allow_all=True)


FUNCTIONS = [
    {
        "name": "run_python_code",
        "description": "Runs arbitrary Python code as script, returns stdout and stderr.",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The Python code to run",
                }
            },
            "required": ["code"]
        }
    }
]
