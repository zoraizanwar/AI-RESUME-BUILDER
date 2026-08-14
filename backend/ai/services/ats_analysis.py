from pydantic import BaseModel, Field
from typing import List
import json
from ..config import get_ai_provider

class ATSAnalysisSchema(BaseModel):
    job_title_alignment: int = Field(description="Score 0-100 for how well the resume aligns with the target job title (if provided) or implied role.")
    experience_relevance: int = Field(description="Score 0-100 for how relevant the experience is.")
    missing_keywords: List[str] = Field(description="Important keywords missing from the resume based on standard ATS checks or job description.")
    matched_keywords: List[str] = Field(description="Important keywords found in the resume matching the target role.")
    formatting_risks: List[str] = Field(description="Potential formatting issues that could trip up an ATS.")
    recommendations: List[str] = Field(description="Actionable recommendations to improve ATS parsing and overall score.")

def analyze_ats_compatibility(resume_data: dict, job_description: str = "") -> dict:
    """
    Service to evaluate how well a resume will parse in a standard ATS.
    Mixes deterministic scoring and AI semantic analysis.
    """
    provider = get_ai_provider()
    
    # Deterministic checks
    # Support both backend DB structure (with 'sections' list) and frontend state structure
    section_types = []
    if 'sections' in resume_data:
        section_types = [s.get('section_type') for s in resume_data.get('sections', [])]
    else:
        # Frontend layout maps directly to top level keys
        section_types = list(resume_data.keys())
        if 'personalInfo' in resume_data and resume_data['personalInfo'].get('summary'):
            section_types.append('summary')
    
    completeness_score = 100
    missing_critical_sections = []
    
    if 'summary' not in section_types:
        completeness_score -= 10
        missing_critical_sections.append('Summary')
    if 'experience' not in section_types:
        completeness_score -= 30
        missing_critical_sections.append('Experience')
    if 'education' not in section_types:
        completeness_score -= 20
        missing_critical_sections.append('Education')
    if 'skills' not in section_types:
        completeness_score -= 20
        missing_critical_sections.append('Skills')
        
    formatting_score = completeness_score
        
    # AI Semantic Analysis
    system_prompt = "You are an ATS (Applicant Tracking System) simulator. Analyze the resume text for compatibility, keywords, and relevance to the job description if provided."
    resume_text_representation = json.dumps(resume_data, indent=2)
    prompt = f"Resume Data:\n{resume_text_representation}\n\nJob Description (optional):\n{job_description}"
    
    ai_result = provider.generate_structured_json(prompt, ATSAnalysisSchema, system_prompt)
    
    # Calculate aggregated scores
    keyword_score = min(100, len(ai_result.matched_keywords) * 10) if job_description else 80
    if not job_description and len(ai_result.matched_keywords) == 0:
        keyword_score = 50
        
    skills_score = ai_result.job_title_alignment
    experience_score = ai_result.experience_relevance
    
    overall_score = int((keyword_score + skills_score + experience_score + formatting_score) / 4)
    
    # Combine formatting risks
    all_formatting_risks = ai_result.formatting_risks
    if missing_critical_sections:
        all_formatting_risks.insert(0, f"Missing critical sections: {', '.join(missing_critical_sections)}")
        
    return {
        "overall_score": overall_score,
        "keyword_score": keyword_score,
        "skills_score": skills_score,
        "experience_score": experience_score,
        "formatting_score": formatting_score,
        "missing_keywords": ai_result.missing_keywords,
        "matched_keywords": ai_result.matched_keywords,
        "formatting_risks": all_formatting_risks,
        "recommendations": ai_result.recommendations
    }
