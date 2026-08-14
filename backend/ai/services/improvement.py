from pydantic import BaseModel, Field
from ..config import get_ai_provider

class ContentImprovementSchema(BaseModel):
    improved_text: str = Field(description="The improved and polished text.")
    feedback: str = Field(description="Constructive feedback on what was improved.")

def improve_content(text: str) -> ContentImprovementSchema:
    """
    Service to rewrite and improve specific resume bullet points or summaries.
    """
    provider = get_ai_provider()
    system_prompt = "You are an expert resume reviewer. Improve the provided text to be more impactful and professional."
    return provider.generate_structured_json(text, ContentImprovementSchema, system_prompt)
