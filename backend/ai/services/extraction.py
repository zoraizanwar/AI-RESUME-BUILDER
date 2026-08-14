from pydantic import BaseModel, Field
from typing import List, Optional
from ..config import get_ai_provider

class ExtractedPersonalInfo(BaseModel):
    name: Optional[str] = Field(None, description="Full name")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="City, State, or general location")
    linkedin: Optional[str] = Field(None, description="LinkedIn URL")
    website: Optional[str] = Field(None, description="Personal website or portfolio URL")

class ExtractedExperience(BaseModel):
    company: str = Field(description="Company name")
    title: str = Field(description="Job title")
    location: Optional[str] = Field(None, description="Job location")
    start_date: Optional[str] = Field(None, description="Start date (e.g. MM/YYYY)")
    end_date: Optional[str] = Field(None, description="End date (e.g. MM/YYYY or 'Present')")
    current: bool = Field(False, description="True if this is the current job")
    description: str = Field(description="Job description, bullets, and responsibilities")

class ExtractedEducation(BaseModel):
    institution: str = Field(description="School or university name")
    degree: str = Field(description="Degree name (e.g. BS, BA, MSc)")
    field: Optional[str] = Field(None, description="Field of study or major")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date or graduation year")
    current: bool = Field(False, description="True if currently studying")
    description: Optional[str] = Field(None, description="Additional details like GPA, honors, or coursework")

class ExtractedProject(BaseModel):
    name: str = Field(description="Project name")
    description: str = Field(description="Project description and technologies used")
    url: Optional[str] = Field(None, description="Link to the project if available")

class ExtractedCertification(BaseModel):
    name: str = Field(description="Certification name")
    issuer: str = Field(description="Issuing organization")
    date: Optional[str] = Field(None, description="Date issued")

class ExtractedAward(BaseModel):
    name: str = Field(description="Award name")
    issuer: str = Field(description="Issuing organization")
    date: Optional[str] = Field(None, description="Date received")

class ExtractedLanguage(BaseModel):
    name: str = Field(description="Language name")
    proficiency: Optional[str] = Field(None, description="Proficiency level (e.g. Fluent, Native, Beginner)")

class ResumeExtractionSchema(BaseModel):
    personal_info: ExtractedPersonalInfo = Field(description="Personal and contact information")
    summary: Optional[str] = Field(None, description="Professional summary or objective statement")
    experience: List[ExtractedExperience] = Field(default_factory=list, description="Work experience history")
    education: List[ExtractedEducation] = Field(default_factory=list, description="Education history")
    projects: List[ExtractedProject] = Field(default_factory=list, description="Projects")
    skills: List[str] = Field(default_factory=list, description="List of skills")
    certifications: List[ExtractedCertification] = Field(default_factory=list, description="Certifications")
    awards: List[ExtractedAward] = Field(default_factory=list, description="Awards and honors")
    languages: List[ExtractedLanguage] = Field(default_factory=list, description="Languages spoken")
    custom_sections: List[dict] = Field(default_factory=list, description="Any other information that doesn't fit standard sections")

def parse_resume_text_fallback(text: str) -> ResumeExtractionSchema:
    import re
    lines = [line.strip() for line in text.split('\n')]
    non_empty_lines = [l for l in lines if l]
    
    # 1. Personal Info
    name = "Candidate Name"
    # Find first line that looks like a name (not a header)
    for l in non_empty_lines[:4]:
        if not re.search(r'(resume|cv|curriculum vitae|experience|education|skills|summary|contact|email|phone)', l, re.I):
            name = l
            break
            
    emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    email = emails[0] if emails else None
    
    phones = re.findall(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phones[0] if phones else None
    
    # Location: look for city, state patterns
    location = None
    loc_match = re.search(r'\b([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\b', text)
    if loc_match:
        location = loc_match.group(0)
    else:
        for l in non_empty_lines[:8]:
            if '@' not in l and any(char.isdigit() for char in l) and ',' in l:
                location = l
                break
                
    personal_info = ExtractedPersonalInfo(
        name=name,
        email=email,
        phone=phone,
        location=location
    )
    
    # 2. Divide text into sections based on headers
    sections = {
        "summary": [],
        "experience": [],
        "education": [],
        "projects": [],
        "skills": []
    }
    
    current_sec = "summary"
    experience_headers = re.compile(r'\b(experience|employment|work history|professional history|job history)\b', re.I)
    education_headers = re.compile(r'\b(education|academic|university|college|degrees)\b', re.I)
    project_headers = re.compile(r'\b(projects|personal projects|key projects|portfolios)\b', re.I)
    skills_headers = re.compile(r'\b(skills|technical skills|key competencies|expertise|technologies)\b', re.I)
    
    for l in lines:
        if not l:
            continue
        if experience_headers.search(l) and len(l) < 30:
            current_sec = "experience"
            continue
        elif education_headers.search(l) and len(l) < 30:
            current_sec = "education"
            continue
        elif project_headers.search(l) and len(l) < 30:
            current_sec = "projects"
            continue
        elif skills_headers.search(l) and len(l) < 30:
            current_sec = "skills"
            continue
            
        sections[current_sec].append(l)

    summary_text = ""
    experience_list = []
    education_list = []
    skills_list = []
    projects_list = []
    
    # 3. If experience & education & skills are all empty, do not truncate!
    # Put all lines (except personal info header lines) into a single experience block description!
    if not sections["experience"] and not sections["education"] and not sections["skills"]:
        remaining_lines = []
        for l in non_empty_lines:
            if l == name or l == email or l == phone or l == location:
                continue
            remaining_lines.append(l)
            
        experience_list = [ExtractedExperience(
            company="Resume Details",
            title="Professional Background",
            description="\n".join(remaining_lines)
        )]
        skills_list = ["Professional Skills"]
    else:
        summary_text = "\n".join(sections["summary"]).strip()
        
        # Parse experience
        exp_text = "\n".join(sections["experience"]).strip()
        jobs = re.split(r'\n(?=[A-Z][a-zA-Z\s]+(?:\s-\s|\s\b(?:at|for|in)\b|\s\b\d{4}\b))', exp_text)
        
        for job in jobs:
            job = job.strip()
            if not job:
                continue
            job_lines = [jl.strip() for jl in job.split('\n') if jl.strip()]
            if not job_lines:
                continue
                
            first_line = job_lines[0]
            title = first_line
            company = "Company"
            
            separators = [r'\s+at\s+', r'\s+@\s+', r'\s*-\s*', r'\s*,\s*']
            for sep in separators:
                parts = re.split(sep, first_line, maxsplit=1, flags=re.I)
                if len(parts) > 1:
                    title = parts[0].strip()
                    company = parts[1].strip()
                    break
                    
            start_date = None
            end_date = "Present"
            dates = re.findall(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}/\d{2,4}|\d{4})\b', job)
            if len(dates) >= 2:
                start_date = dates[0]
                end_date = dates[1]
            elif len(dates) == 1:
                start_date = dates[0]
                
            desc = "\n".join(job_lines[1:])
            experience_list.append(ExtractedExperience(
                company=company,
                title=title,
                start_date=start_date,
                end_date=end_date,
                description=desc or "Responsibilities and accomplishments."
            ))
            
        if not experience_list and sections["experience"]:
            experience_list.append(ExtractedExperience(
                company="Company",
                title="Professional Experience",
                description="\n".join(sections["experience"])
            ))

        # Parse education
        edu_text = "\n".join(sections["education"]).strip()
        edu_entries = re.split(r'\n(?=[A-Z][a-zA-Z\s]+(?:\s\b(?:university|college|school)\b))', edu_text, flags=re.I)
        for entry in edu_entries:
            entry = entry.strip()
            if not entry:
                continue
            entry_lines = [el.strip() for el in entry.split('\n') if el.strip()]
            inst = entry_lines[0]
            deg = "Degree"
            
            deg_match = re.search(r'\b(BS|BA|MS|MSc|MBA|PhD|Bachelor|Master|Doctor|Associate)\b', entry, re.I)
            if deg_match:
                deg = deg_match.group(0)
                
            education_list.append(ExtractedEducation(
                institution=inst,
                degree=deg,
                start_date="",
                end_date=""
            ))
        if not education_list and sections["education"]:
            education_list.append(ExtractedEducation(
                institution="Educational Institution",
                degree="Academic Credentials",
                description="\n".join(sections["education"])
            ))

        # Parse skills
        for line in sections["skills"]:
            parts = re.split(r'[,|•\-\*]|:', line)
            for p in parts:
                p_clean = p.strip()
                if p_clean and len(p_clean) < 30 and not re.search(r'(technical|soft|skills|proficient)', p_clean, re.I):
                    skills_list.append(p_clean)
                    
        if not skills_list:
            common_keywords = ['python', 'django', 'javascript', 'react', 'node', 'java', 'c++', 'sql', 'aws', 'docker', 'git', 'kubernetes', 'html', 'css', 'excel', 'word', 'management', 'leadership', 'communication']
            text_lower = text.lower()
            for kw in common_keywords:
                if re.search(rf'\b{kw}\b', text_lower):
                    skills_list.append(kw.title())

        # Projects
        if sections["projects"]:
            projects_list.append(ExtractedProject(
                name="Key Projects",
                description="\n".join(sections["projects"])
            ))
        
    return ResumeExtractionSchema(
        personal_info=personal_info,
        summary=summary_text,
        experience=experience_list,
        education=education_list,
        skills=skills_list or ["Professional Skills"],
        projects=projects_list
    )

def extract_resume_data(text: str) -> ResumeExtractionSchema:
    """
    Service to extract structured data from raw resume text.
    """
    provider = get_ai_provider()
    
    # Use rule-based fallback if MockAIProvider is active to extract actual client content
    from ..providers.mock_provider import MockAIProvider
    if isinstance(provider, MockAIProvider):
        return parse_resume_text_fallback(text)

    system_prompt = """You are an expert at extracting structured information from raw resume text.
Extract the data accurately into the specified JSON schema. Do not invent or hallucinate information.
If a piece of information is missing, use null or omit it according to the schema.
Extract descriptions and bullet points exactly as they appear in meaning, but format them cleanly.
"""
    return provider.generate_structured_json(text, ResumeExtractionSchema, system_prompt)
