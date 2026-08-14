from pydantic import BaseModel, Field
from typing import List
from ..config import get_ai_provider
from .constants import (
    ROLE_WEIGHT, SKILLS_WEIGHT, EXPERIENCE_WEIGHT, 
    RESPONSIBILITY_WEIGHT, DOMAIN_WEIGHT, EDUCATION_WEIGHT, TRANSFERABLE_WEIGHT
)

class PartialMatch(BaseModel):
    resume_skill: str = Field(description="The skill present in the resume.")
    job_skill: str = Field(description="The conceptually similar skill required by the job.")
    explanation: str = Field(description="Why this is considered a partial match.")

class EvidenceMatch(BaseModel):
    requirement: str = Field(description="The specific job requirement.")
    evidence: str = Field(description="The exact corresponding evidence found in the resume. If missing, explicitly state 'No evidence found.'")

class RoleAnalysis(BaseModel):
    candidate_role: str = Field(description="The primary professional role of the candidate (e.g., 'AI/ML Developer').")
    candidate_domain: str = Field(description="The professional domain of the candidate (e.g., 'Software Engineering').")
    job_role: str = Field(description="The primary role of the job description (e.g., 'Call Support Representative').")
    job_domain: str = Field(description="The professional domain of the job (e.g., 'Customer Service').")
    core_responsibilities_match: str = Field(description="A brief description of how the core responsibilities align or misalign.")

class CategoryScore(BaseModel):
    score: float = Field(description="Score from 0.0 to 1.0 for this specific category.")
    reason: str = Field(description="Detailed explanation with explicit evidence from the resume (or lack thereof) justifying the score.")

class StructuredMatchExtraction(BaseModel):
    role_analysis: RoleAnalysis = Field(description="Deep analysis of the primary roles and domains.")
    
    role_compatibility: CategoryScore = Field(description="How well the candidate's core occupation/role title matches the job's target role. A major mismatch here MUST yield a low score (<40).")
    skills_match: CategoryScore = Field(description="Overlap of hard/technical skills required by the job vs what the candidate possesses.")
    experience_match: CategoryScore = Field(description="Alignment of years of experience and specific domain experience required.")
    responsibility_match: CategoryScore = Field(description="Alignment of actual tasks and responsibilities (e.g. building APIs vs taking calls).")
    domain_match: CategoryScore = Field(description="How well the candidate's professional domain/industry experience matches the job's target domain/industry.")
    education_match: CategoryScore = Field(description="Alignment of educational requirements or certifications.")
    transferable_skills: CategoryScore = Field(description="Generic skills like communication, teamwork, leadership. Do not inflate this if core skills are missing.")
    
    matched_skills: List[EvidenceMatch] = Field(description="Skills that the resume FULLY and DIRECTLY satisfies from the job description. Do NOT hallucinate skills.")
    missing_skills: List[EvidenceMatch] = Field(description="Required or preferred skills completely missing from the resume. Explicitly state the missing evidence.")
    partial_matches: List[PartialMatch] = Field(description="Skills that are conceptually similar or transferrable (e.g., teamwork, communication).")
    irrelevant_skills: List[str] = Field(description="Skills present on the resume that are completely irrelevant to the job description (e.g., Python for a Call Support role).")
    keyword_gaps: List[str] = Field(description="Important domain keywords present in the JD but missing in the resume.")
    critical_gaps: List[str] = Field(description="Major missing requirements that severely impact the candidate's viability for this role.")
    recommendations: List[str] = Field(description="Specific suggestions to improve the resume for this job.")

class MatchingSchema(BaseModel):
    role_analysis: RoleAnalysis = Field(description="Deep analysis of the primary roles and domains.")
    role_compatibility: CategoryScore = Field(description="How well the candidate's core occupation/role title matches the job's target role.")
    skills_match: CategoryScore = Field(description="Overlap of hard/technical skills required by the job vs what the candidate possesses.")
    experience_match: CategoryScore = Field(description="Alignment of years of experience and specific domain experience required.")
    responsibility_match: CategoryScore = Field(description="Alignment of actual tasks and responsibilities.")
    domain_match: CategoryScore = Field(description="How well the candidate's professional domain/industry experience matches the job's target domain/industry.")
    education_match: CategoryScore = Field(description="Alignment of educational requirements or certifications.")
    transferable_skills: CategoryScore = Field(description="Generic skills like communication, teamwork, leadership. Do not inflate this if core skills are missing.")
    match_percentage: int = Field(description="A percentage score (0-100) indicating how well the resume matches the job semantically.")
    match_details: dict = Field(default=dict, description="Complete score details including classifications and category breakdowns.")
    matched_skills: List[EvidenceMatch] = Field(description="Skills that the resume FULLY and DIRECTLY satisfies from the job description. Do NOT hallucinate skills.")
    missing_skills: List[EvidenceMatch] = Field(description="Required or preferred skills completely missing from the resume. Explicitly state the missing evidence.")
    partial_matches: List[PartialMatch] = Field(description="Skills that are conceptually similar or transferrable (e.g., teamwork, communication).")
    irrelevant_skills: List[str] = Field(description="Skills present on the resume that are completely irrelevant to the job description (e.g., Python for a Call Support role).")
    keyword_gaps: List[str] = Field(description="Important domain keywords present in the JD but missing in the resume.")
    critical_gaps: List[str] = Field(description="Major missing requirements that severely impact the candidate's viability for this role.")
    recommendations: List[str] = Field(description="Specific suggestions to improve the resume for this job.")

def calculate_job_match(resume_text: str, job_description: str) -> MatchingSchema:
    """
    Service to compare a resume to a job description and return deep semantic analysis.
    """
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume content cannot be empty.")
    if not job_description or not job_description.strip():
        raise ValueError("Job description cannot be empty.")
        
    provider = get_ai_provider()
    system_prompt = (
        "You are an objective recruitment matching system. "
        "Perform a strict, deep semantic comparison of the candidate's resume against the provided job description. "
        "CRITICAL RULES: "
        "1. You must NOT be overly positive, inflate scores, invent experience, or invent skills. "
        "2. Do NOT assume transferable skills (e.g., communication) are direct matches for core requirements. "
        "3. Do NOT assume a degree makes someone qualified or treat generic professional skills as job-specific skills. "
        "4. You must explicitly evaluate: Candidate primary role, Job primary role, Domain compatibility, Required skills, Preferred skills, Relevant experience, Responsibilities, Education, Certifications, Transferable skills, Missing requirements, and Critical gaps. "
        "5. You must provide EVIDENCE for every claimed match by identifying the exact corresponding resume evidence. "
        "6. For every missing requirement, explicitly identify that it is missing (e.g., 'Job requirement: X. Resume evidence: No X experience found.'). Do not convert this into a positive match. "
        "7. Distinguish clearly between DIRECT MATCH, PARTIAL/TRANSFERABLE MATCH, IRRELEVANT, and MISSING. "
        "8. If there is a major role/domain mismatch (e.g., AI/ML Developer vs Farmer/Call Support Representative), clearly identify it and score role, responsibility, domain, and skills compatibility extremely low."
    )
    prompt = f"Resume:\n{resume_text}\n\nJob Description:\n{job_description}"
    
    # Extract detailed structured evaluation from the LLM
    extraction = provider.generate_structured_json(prompt, StructuredMatchExtraction, system_prompt)
    
    # Validate component scores are within [0.0, 1.0]
    for comp in [extraction.role_compatibility, extraction.skills_match, extraction.experience_match, extraction.responsibility_match, extraction.domain_match, extraction.education_match, extraction.transferable_skills]:
        if not (0.0 <= comp.score <= 1.0):
            raise ValueError("Component scores must be between 0.0 and 1.0")

    # Weighted Score Calculation
    raw_score = (
        extraction.role_compatibility.score * ROLE_WEIGHT +
        extraction.skills_match.score * SKILLS_WEIGHT +
        extraction.experience_match.score * EXPERIENCE_WEIGHT +
        extraction.responsibility_match.score * RESPONSIBILITY_WEIGHT +
        extraction.domain_match.score * DOMAIN_WEIGHT +
        extraction.education_match.score * EDUCATION_WEIGHT +
        extraction.transferable_skills.score * TRANSFERABLE_WEIGHT
    )
    # Convert to percentage (0-100)
    final_score = int(round(raw_score * 100))

    # Apply clamp constraints for mismatch guards
    # Severe Mismatch (Role < 0.25 AND Domain < 0.25)
    if extraction.role_compatibility.score < 0.25 and extraction.domain_match.score < 0.25:
        final_score = min(final_score, 20)
    # Moderate Mismatch (Role < 0.40 OR Domain < 0.40)
    elif extraction.role_compatibility.score < 0.40 or extraction.domain_match.score < 0.40:
        final_score = min(final_score, 35)
    # Weak Mismatch (Role < 0.60 OR Domain < 0.60)
    elif extraction.role_compatibility.score < 0.60 or extraction.domain_match.score < 0.60:
        final_score = min(final_score, 55)

    final_score = max(0, min(100, final_score))

    # Match quality classification
    if final_score <= 20:
        classification = "Very Low Match"
    elif final_score <= 40:
        classification = "Low Match"
    elif final_score <= 60:
        classification = "Moderate Match"
    elif final_score <= 80:
        classification = "Strong Match"
    else:
        classification = "Very Strong Match"

    match_details = {
        "match_classification": classification,
        "role_compatibility": {
            "score": int(round(extraction.role_compatibility.score * 100)),
            "reason": extraction.role_compatibility.reason
        },
        "skills_match": {
            "score": int(round(extraction.skills_match.score * 100)),
            "reason": extraction.skills_match.reason
        },
        "responsibility_match": {
            "score": int(round(extraction.responsibility_match.score * 100)),
            "reason": extraction.responsibility_match.reason
        },
        "domain_match": {
            "score": int(round(extraction.domain_match.score * 100)),
            "reason": extraction.domain_match.reason
        },
        "experience_match": {
            "score": int(round(extraction.experience_match.score * 100)),
            "reason": extraction.experience_match.reason
        },
        "education_match": {
            "score": int(round(extraction.education_match.score * 100)),
            "reason": extraction.education_match.reason
        },
        "transferable_skills": {
            "score": int(round(extraction.transferable_skills.score * 100)),
            "reason": extraction.transferable_skills.reason
        }
    }

    return MatchingSchema(
        role_analysis=extraction.role_analysis,
        role_compatibility=extraction.role_compatibility,
        skills_match=extraction.skills_match,
        experience_match=extraction.experience_match,
        responsibility_match=extraction.responsibility_match,
        domain_match=extraction.domain_match,
        education_match=extraction.education_match,
        transferable_skills=extraction.transferable_skills,
        match_percentage=final_score,
        match_details=match_details,
        matched_skills=extraction.matched_skills,
        missing_skills=extraction.missing_skills,
        partial_matches=extraction.partial_matches,
        irrelevant_skills=extraction.irrelevant_skills,
        keyword_gaps=extraction.keyword_gaps,
        critical_gaps=extraction.critical_gaps,
        recommendations=extraction.recommendations,
    )
