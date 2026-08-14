from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from ..config import get_ai_provider
import json

class ChangeLog(BaseModel):
    section: str = Field(description="The section that was changed (e.g., 'Summary', 'Experience').")
    change_type: str = Field(description="Type of change: 'added', 'modified', 'reordered', 'removed'.")
    original: str = Field(description="The original text (if applicable).")
    new: str = Field(description="The new text (if applicable).")
    reason: str = Field(description="The reason for this change based on the job description.")

class TailoredSection(BaseModel):
    section_type: str = Field(description="Type of section: 'summary', 'experience', 'skills', etc.")
    title: str = Field(description="Title of the section.")
    content: Dict[str, Any] = Field(description="The structured content for this section, keeping the same schema as the input.")

class JobTailoringSchema(BaseModel):
    tailored_sections: List[TailoredSection] = Field(description="The complete list of optimized resume sections.")
    changelog: List[ChangeLog] = Field(description="List of major changes made to optimize the resume.")

def tailor_resume_for_job(resume_data: str, job_description: str) -> JobTailoringSchema:
    """
    Service to generate a job-optimized resume without inventing facts.
    """
    provider = get_ai_provider()
    
    system_prompt = """You are an expert technical recruiter and resume writer.
Your task is to take a candidate's existing resume data and a target job description, and output an optimized version of the resume.

STRICT RULES:
1. You may rewrite the summary to highlight relevant experience.
2. You may reorder skills or bullet points to prioritize relevance to the job description.
3. You may tweak the phrasing of bullet points to better match the terminology in the job description.
4. You MUST NOT invent any experience, skills, achievements, metrics, companies, dates, or qualifications.
5. Do not hallucinate. If the candidate lacks a required skill, do not add it.
6. Return the FULL set of optimized sections (even those that weren't changed) so they can be saved as a new complete resume version.
7. Return a detailed changelog explaining the major edits you made and why.
"""

    prompt = f"Existing Resume Data:\n{resume_data}\n\nTarget Job Description:\n{job_description}"
    
    return provider.generate_structured_json(prompt, JobTailoringSchema, system_prompt)
