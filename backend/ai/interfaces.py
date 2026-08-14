from abc import ABC, abstractmethod
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class AIProviderException(Exception):
    """Base exception for AI provider errors."""
    pass

class AIProviderTimeoutException(AIProviderException):
    """Raised when an AI provider times out."""
    pass

class AIProviderAuthenticationException(AIProviderException):
    """Raised when there is an authentication issue with the AI provider."""
    pass

class AIProviderValidationException(AIProviderException):
    """Raised when the AI response fails schema validation."""
    pass

class BaseAIProvider(ABC):
    """
    Abstract Base Class for AI Providers.
    All providers (OpenAI, Gemini, etc.) must implement this interface.
    """
    
    @abstractmethod
    def generate_structured_json(self, prompt: str, schema: BaseModel, system_prompt: str = None) -> BaseModel:
        """
        Generates a structured JSON response matching the provided Pydantic schema.
        
        Args:
            prompt (str): The main user prompt or content to process.
            schema (BaseModel): The Pydantic model class defining the expected output structure.
            system_prompt (str, optional): The system prompt defining the AI's role and behavior.
            
        Returns:
            BaseModel: An instance of the provided Pydantic schema containing the structured response.
            
        Raises:
            AIProviderException: On general provider errors.
            AIProviderTimeoutException: On timeout.
            AIProviderValidationException: On invalid schema format returned by the AI.
        """
        pass
