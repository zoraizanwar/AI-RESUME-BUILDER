from pydantic import BaseModel, Field
from typing import List, Optional
from ..config import get_ai_provider

class InterviewQuestion(BaseModel):
    question: str = Field(..., description="The interview question")
    why_asked: str = Field(..., description="Why the interviewer might ask this question")
    focus_area: str = Field(..., description="What the candidate should focus on in their answer")
    answer_guidance: Optional[str] = Field(None, description="Optional guidance or framework (e.g. STAR method) for answering")
    sample_answer: Optional[str] = Field(None, description="A comprehensive, well-structured sample answer tailored to the candidate's resume and job description.")

class InterviewPrepOutput(BaseModel):
    hr_questions: List[InterviewQuestion] = Field(..., description="General HR and screening questions")
    behavioral_questions: List[InterviewQuestion] = Field(..., description="Behavioral questions (teamwork, conflict, etc.)")
    technical_questions: List[InterviewQuestion] = Field(..., description="Technical questions based on skills in the resume")
    project_questions: List[InterviewQuestion] = Field(..., description="Questions specifically about projects listed in the resume")
    experience_questions: List[InterviewQuestion] = Field(..., description="Questions about past work experience and roles")

def generate_interview_questions(resume_text: str, job_text: Optional[str] = None) -> InterviewPrepOutput:
    """
    Generates targeted interview questions based on the candidate's resume and an optional job description.
    """
    provider = get_ai_provider()
    
    system_prompt = (
        "You are an expert technical recruiter and interview coach. "
        "Your task is to generate highly relevant interview questions for a candidate based on their resume. "
        "If a job description is provided, tailor the questions to how well the candidate's experience aligns with the job. "
        "IMPORTANT RULES:\n"
        "1. ONLY use information present in the resume and job description.\n"
        "2. DO NOT fabricate or assume any experience, skills, or projects not explicitly mentioned.\n"
        "3. Provide realistic, challenging, yet fair questions.\n"
        "4. Output strictly according to the requested JSON schema."
    )
    
    user_prompt = f"RESUME:\n{resume_text}\n"
    if job_text:
        user_prompt += f"\nJOB DESCRIPTION:\n{job_text}\n"
        
    user_prompt += "\nPlease generate the interview preparation guide."

    response = provider.generate_structured_json(
        prompt=user_prompt,
        system_prompt=system_prompt,
        schema=InterviewPrepOutput
    )
    
    return response
