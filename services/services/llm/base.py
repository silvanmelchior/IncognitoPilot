from abc import ABC, abstractmethod
from typing import Generator

from services.llm.types import Message, Response


class BaseLLM(ABC):
    @abstractmethod
    def chat(self, history: list[Message]) -> Generator[Response, None, None]:
        """Given a chat history, return a generator which streams the response."""


class LLMException(Exception):
    """If an error occurs in the LLM, raise this exception, will be shown in UI."""
