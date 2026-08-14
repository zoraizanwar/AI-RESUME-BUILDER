from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from ..config import get_ai_provider
import json

class ExtractedExperience(BaseModel):
    id: str = Field(description="The original ID of the experience if provided, to map back")
    company: str = Field(description="Company name")
    position: str = Field(description="Job title/position")
    improved_bullets: List[str] = Field(description="Improved and refined experience bullets. Do NOT invent metrics or responsibilities.")

class ExtractedProject(BaseModel):
    id: str = Field(description="The original ID of the project if provided, to map back")
    name: str = Field(description="Project name")
    improved_description: str = Field(description="Improved project description. Do NOT invent features or technologies.")

class ResumeGenerationSchema(BaseModel):
    professional_summary: str = Field(description="A professional summary generated for the resume based on the provided data")
    improved_experience: List[ExtractedExperience] = Field(description="Improved experience sections", default_factory=list)
    improved_projects: List[ExtractedProject] = Field(description="Improved project sections", default_factory=list)
    organized_skills: List[str] = Field(description="A list of organized skills extracted from the input data", default_factory=list)
    missing_information: List[str] = Field(description="A list of critical missing information (e.g., 'Missing dates for Company X', 'No skills provided')", default_factory=list)

def generate_resume_content(resume_data: Dict[str, Any], template_info: Optional[Dict[str, Any]] = None) -> ResumeGenerationSchema:
    """
    Service to generate and improve resume content using strictly factual information.
    """
    provider = get_ai_provider()
    
    system_prompt = """You are an expert, professional resume writer.
Your task is to take the user's raw resume data and improve the phrasing, tone, and organization.

STRICT RULES:
- Preserve factual information exactly as provided.
- NEVER invent achievements.
- NEVER invent metrics.
- NEVER invent companies.
- NEVER invent dates.
- NEVER invent qualifications.
- NEVER invent technologies.
- NEVER invent responsibilities.
- If information is sparse, simply improve the phrasing of what exists. Do not pad with fake details.
- If required information (like dates, descriptions, or core skills) is missing, list it in 'missing_information'.
"""

    prompt = f"User Resume Data:\n{json.dumps(resume_data, indent=2)}\n"
    if template_info:
        prompt += f"\nTarget Template Constraints:\n{json.dumps(template_info, indent=2)}"

    return provider.generate_structured_json(prompt, ResumeGenerationSchema, system_prompt)
