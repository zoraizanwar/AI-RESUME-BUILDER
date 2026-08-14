from pydantic import BaseModel, Field
from typing import List
from ..config import get_ai_provider

class JobAnalysisSchema(BaseModel):
    job_title: str = Field(description="The exact or inferred job title.")
    required_skills: List[str] = Field(description="Specific hard skills and mandatory qualifications.")
    preferred_skills: List[str] = Field(description="Nice-to-have skills and preferred qualifications.")
    qualifications: List[str] = Field(description="Educational or experiential requirements (e.g., B.S. in CS, 5+ years experience).")
    responsibilities: List[str] = Field(description="Key day-to-day responsibilities of the role.")
    important_keywords: List[str] = Field(description="General keywords representing the core domain or tech stack.")

def analyze_job_description(text: str) -> JobAnalysisSchema:
    """
    Service to analyze a job description and extract key elements.
    """
    provider = get_ai_provider()
    system_prompt = "You are an expert HR analyst. Extract the job title, required skills, preferred skills, qualifications, responsibilities, and important keywords from the job description."
    return provider.generate_structured_json(text, JobAnalysisSchema, system_prompt)
