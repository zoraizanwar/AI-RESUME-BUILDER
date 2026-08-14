import os
import logging
from .interfaces import BaseAIProvider
from .providers.openai_provider import OpenAIProvider

logger = logging.getLogger(__name__)

def get_ai_provider() -> BaseAIProvider:
    """
    Factory function to get the configured AI provider.
    Reads from the AI_PROVIDER environment variable.
    Defaults to 'openai'.
    """
    provider_name = os.environ.get("AI_PROVIDER", "openai").lower()
    
    # OpenAI provider (existing behavior)
    if provider_name == "openai":
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY not found. Using MockAIProvider for local development.")
            from .providers.mock_provider import MockAIProvider
            return MockAIProvider()
        return OpenAIProvider()
    
    # Groq provider – requires GROQ_API_KEY
    if provider_name == "groq":
        groq_key = os.environ.get("GROQ_API_KEY")
        if not groq_key:
            logger.error("GROQ_API_KEY not found. AI provider not configured.")
            # Raise an authentication exception to signal missing configuration
            from .interfaces import AIProviderAuthenticationException
            raise AIProviderAuthenticationException("GROQ_API_KEY missing. Configure the environment variable.")
        from .providers.groq_provider import GroqProvider
        return GroqProvider()
    
    # Can extend with other providers here (e.g. gemini, anthropic)
    
    logger.warning(f"Unknown AI provider '{provider_name}', falling back to 'openai'.")
    return OpenAIProvider()
