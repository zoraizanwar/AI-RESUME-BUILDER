import os
import pytest
from pydantic import BaseModel

from backend.ai.providers.groq_provider import GroqProvider


class GroqTestResponse(BaseModel):
    status: str
    message: str


@pytest.mark.integration
def test_real_groq_connection():
    if not os.getenv("GROQ_API_KEY"):
        pytest.skip("GROQ_API_KEY is not configured")

    provider = GroqProvider()

    response = provider.generate_structured_json(
        """
        Return a JSON object.

        The object MUST contain:
        status: "success"
        message: a short greeting

        Return ONLY the JSON object.
        """,
        GroqTestResponse,
    )

    assert response.status == "success"
    assert isinstance(response.message, str)
    assert len(response.message) > 0