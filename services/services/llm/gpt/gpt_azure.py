import openai

from services.utils import get_env_var
from .gpt import GPT


class GPTAzure(GPT):
    def __init__(self, engine_name: str):
        openai.api_type = "azure"
        openai.api_base = get_env_var("AZURE_API_BASE")
        openai.api_version = "2023-07-01-preview"
        openai.api_key = get_env_var("AZURE_API_KEY")
        super().__init__({"engine": engine_name})
