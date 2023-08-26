import openai

from services.utils import get_env_var
from .gpt import GPT


class GPTOpenAI(GPT):
    def __init__(self, model_name: str):
        openai.api_key = get_env_var("OPENAI_API_KEY")
        super().__init__({"model": model_name})
