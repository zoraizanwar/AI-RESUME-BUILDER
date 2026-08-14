import json
import logging
import random
from pydantic import BaseModel
from typing import get_origin, get_args, List

from ..interfaces import BaseAIProvider

logger = logging.getLogger(__name__)

class MockAIProvider(BaseAIProvider):
    """
    A mock provider that generates dummy responses based on the provided Pydantic schema.
    Useful for local development when an API key is not available.
    """
    
    def generate_structured_json(self, prompt: str, schema: BaseModel, system_prompt: str = None) -> BaseModel:
        logger.info(f"Mocking AI response for schema {schema.__name__}")
        
        from ai.exceptions import AIProviderNotConfiguredError
        
        # Mock job matching extraction details for local development/testing
        if schema.__name__ == 'StructuredMatchExtraction':
            from ai.services.job_db import find_best_match, get_words, in_same_super_domain
            
            # Split prompt into resume and job description parts if possible
            parts = prompt.split("Job Description:", 1)
            resume_text = parts[0]
            job_text = parts[1] if len(parts) > 1 else prompt
            
            # 1. Match resume and job description against the Excel database
            target_job, target_score = find_best_match(job_text)
            candidate_job, candidate_score = find_best_match(resume_text)
            
            target_category = target_job["category"]
            candidate_category = candidate_job["category"]
            
            is_same_category = in_same_super_domain(target_category, candidate_category)
            
            resume_words = get_words(resume_text)
            target_skills_words = get_words(" ".join(target_job['skills']))
            
            # Compute skill score
            skills_overlap = len(resume_words.intersection(target_skills_words))
            total_target_skills_words = len(target_skills_words)
            skills_score = (skills_overlap / total_target_skills_words) if total_target_skills_words > 0 else 0.5
            
            # Compute responsibility score
            target_desc_words = get_words(target_job['description'])
            desc_overlap = len(resume_words.intersection(target_desc_words))
            total_desc_words = len(target_desc_words)
            resp_score = (desc_overlap / total_desc_words) if total_desc_words > 0 else 0.5
            
            # Category alignment scales
            if is_same_category:
                role_score = min(0.95, max(0.80, 0.70 + 0.25 * (skills_score + resp_score) / 2.0))
                skills_score = min(0.95, max(0.70, 0.60 + 0.40 * skills_score))
                experience_score = 0.85
                responsibility_score = min(0.95, max(0.70, 0.60 + 0.40 * resp_score))
                domain_score = 0.95
                
                # Education overlap check
                edu_words = get_words(target_job['education'])
                edu_overlap = len(resume_words.intersection(edu_words))
                education_score = 0.90 if edu_overlap > 0 else 0.70
                
                transferable_score = 0.85
                reason = f"Good category alignment. Both candidate resume and target job match the '{target_category}' database sector."
            elif target_category.lower() == "general" or candidate_category.lower() == "general":
                role_score = min(0.60, max(0.45, 0.40 + 0.20 * (skills_score + resp_score) / 2.0))
                skills_score = min(0.60, max(0.45, 0.40 + 0.20 * skills_score))
                experience_score = 0.50
                responsibility_score = min(0.60, max(0.45, 0.40 + 0.20 * resp_score))
                domain_score = 0.50
                education_score = 0.50
                transferable_score = 0.60
                reason = "Evaluating match based on general professional and transferable requirements."
            else:
                role_score = 0.05
                skills_score = min(0.20, max(0.01, 0.25 * skills_score))
                experience_score = 0.0
                responsibility_score = min(0.15, max(0.01, 0.20 * resp_score))
                domain_score = 0.02
                education_score = 0.10
                transferable_score = 0.30
                reason = f"Fundamental mismatch. Candidate profile aligns with '{candidate_category}' (matching '{candidate_job['title']}'), whereas target job description requires '{target_category}' (matching '{target_job['title']}')."
            # Match individual skills
            matched_reqs = []
            missing_reqs = []
            for s in target_job['skills']:
                s_words = get_words(s)
                if s_words.issubset(resume_words) or len(resume_words.intersection(s_words)) >= len(s_words) * 0.4:
                    matched_reqs.append({"requirement": s, "evidence": f"Resume matches database skill: '{s}'"})
                else:
                    missing_reqs.append({"requirement": s, "evidence": f"No clear indication of skill '{s}' in resume."})

            # Recommendations list
            rec = []
            if is_same_category:
                rec.append(f"Excellent alignment with '{target_category}' roles. Consider emphasizing {', '.join(target_job['skills'][:3])} on your resume.")
                if missing_reqs:
                    rec.append(f"Add projects or work experiences containing: {', '.join([m['requirement'] for m in missing_reqs[:2]])}.")
            else:
                rec.append(f"Tailor your resume towards '{target_category}' competencies like {', '.join(target_job['skills'][:3])}.")
                rec.append(f"Your current experience matches '{candidate_category}' best. Look for positions aligning with '{candidate_job['title']}'.")

            return schema(**{
                "role_analysis": {
                    "candidate_role": candidate_job["title"],
                    "candidate_domain": candidate_category,
                    "job_role": target_job["title"],
                    "job_domain": target_category,
                    "core_responsibilities_match": f"Matched target job: '{target_job['title']}' against candidate profile: '{candidate_job['title']}'."
                },
                "role_compatibility": {
                    "score": role_score,
                    "reason": reason
                },
                "skills_match": {
                    "score": skills_score,
                    "reason": f"Overlap of resume words with typical {target_job['title']} skills list from Excel database."
                },
                "experience_match": {
                    "score": experience_score,
                    "reason": f"Domain experience alignment within the {target_category} database sector."
                },
                "responsibility_match": {
                    "score": responsibility_score,
                    "reason": f"Correlation between resume and database duties for {target_job['title']}."
                },
                "domain_match": {
                    "score": domain_score,
                    "reason": f"Category match comparison: candidate '{candidate_category}' vs. target '{target_category}'."
                },
                "education_match": {
                    "score": education_score,
                    "reason": f"Requirement check for typical education: '{target_job['education']}'."
                },
                "transferable_skills": {
                    "score": transferable_score,
                    "reason": "Transferable professional capacity based on cross-industry overlap."
                },
                "matched_skills": matched_reqs,
                "missing_skills": missing_reqs,
                "partial_matches": [],
                "irrelevant_skills": [],
                "keyword_gaps": [m["requirement"] for m in missing_reqs],
                "critical_gaps": [f"Missing {target_category} industry expertise"] if not is_same_category else [],
                "recommendations": rec
            })
            
        # Mock ATS analysis results for local development/testing
        if schema.__name__ == 'ATSAnalysisSchema':
            from ai.services.job_db import find_best_match, get_words, in_same_super_domain
            
            # Split prompt into resume and job description parts if possible
            parts = prompt.split("Job Description (optional):", 1)
            resume_text = parts[0]
            job_text = parts[1] if len(parts) > 1 else prompt
            
            target_job, target_score = find_best_match(job_text)
            candidate_job, candidate_score = find_best_match(resume_text)
            
            target_category = target_job["category"]
            candidate_category = candidate_job["category"]
            
            is_same_category = in_same_super_domain(target_category, candidate_category)
            resume_words = get_words(resume_text)
            
            # Identify matched and missing keywords dynamically
            matched_keywords = []
            missing_keywords = []
            
            for skill in target_job["skills"]:
                skill_words = get_words(skill)
                # Check if skill words are in the resume
                if skill_words and skill_words.issubset(resume_words):
                    matched_keywords.append(skill)
                else:
                    missing_keywords.append(skill)
                    
            # Fallback if everything is matched or missing
            if not matched_keywords and not missing_keywords:
                missing_keywords = target_job["skills"]
                
            # Alignment and relevance scores
            if is_same_category:
                job_title_alignment = 85
                experience_relevance = 80
                formatting_risks = ["Use of bullet points is good, but check margin widths.", "Ensure email and phone number are in standard header format."]
                recommendations = [
                    f"Incorporate the missing keyword(s) '{', '.join(missing_keywords[:2])}' into your Work Experience descriptions.",
                    f"Ensure your education credentials match the typical requirement: '{target_job['education']}'."
                ] if missing_keywords else ["Your resume format is highly optimized. Ensure text is free of graphics/tables."]
            else:
                job_title_alignment = 15
                experience_relevance = 10
                formatting_risks = [
                    "High mismatch in overall resume target vs. job sector.",
                    "Use of keywords is not optimized for target domain."
                ]
                recommendations = [
                    f"This job description is for a '{target_job['title']}' ({target_category}), but your resume aligns with '{candidate_job['title']}' ({candidate_category}).",
                    f"Consider adding critical keywords: {', '.join(missing_keywords[:3])}."
                ]

            return schema(**{
                "job_title_alignment": job_title_alignment,
                "experience_relevance": experience_relevance,
                "missing_keywords": missing_keywords,
                "matched_keywords": matched_keywords,
                "formatting_risks": formatting_risks,
                "recommendations": recommendations
            })
            
        # Mock Job Analysis results for local development/testing
        if schema.__name__ == 'JobAnalysisSchema':
            from ai.services.job_db import find_best_match
            
            target_job, target_score = find_best_match(prompt)
            
            # Divide skills into required and preferred
            skills = target_job["skills"]
            req_skills = skills[:max(1, len(skills) // 2 + 1)]
            pref_skills = skills[len(req_skills):]
            if not pref_skills:
                pref_skills = ["Communication", "Teamwork"]
                
            return schema(**{
                "job_title": target_job["title"],
                "required_skills": req_skills,
                "preferred_skills": pref_skills,
                "qualifications": [target_job["education"], f"{target_job['level']} Level Experience"],
                "responsibilities": [target_job["description"][:100] + "..."] if len(target_job["description"]) > 100 else [target_job["description"]],
                "important_keywords": req_skills + [target_job["category"]]
            })
            
        # Mock AI Assistant replies dynamically
        if schema.__name__ == 'AssistantResponseSchema':
            from ai.services.job_db import find_best_match, get_words
            
            # Find closest candidate job from the resume text in prompt
            candidate_job, candidate_score = find_best_match(prompt)
            c_title = candidate_job["title"]
            c_category = candidate_job["category"]
            c_skills = candidate_job["skills"]
            
            p_lower = prompt.lower()
            
            if "summary" in p_lower:
                reply = (
                    f"### Customized Professional Summary for {c_title}\n\n"
                    f"Here is an impactful summary tailored to your background:\n\n"
                    f"*\"Results-driven **{c_title}** with proven expertise in **{', '.join(c_skills[:2])}**. "
                    f"Adept at collaborating with cross-functional teams to streamline workflows and implement "
                    f"high-performance solutions within the **{c_category}** industry.\"*"
                )
            elif "ats" in p_lower:
                reply = (
                    f"### ATS Optimization Analysis & Tips for {c_title} Profiles\n\n"
                    f"To make your resume fully ATS-friendly, I recommend the following actions:\n\n"
                    f"1. **Include Key Terminology**: Ensure standard terms like **{', '.join(c_skills[:3])}** are clearly listed under your Skills section.\n"
                    f"2. **Simplify Formatting**: Avoid multi-column layouts, tables, and graphic elements which can cause parser errors.\n"
                    f"3. **Google X-Y-Z Bullet Points**: Frame your achievements as: *'Accomplished [X], as measured by [Y], by doing [Z]'*."
                )
            elif "concise" in p_lower or "short" in p_lower:
                reply = (
                    f"### Concise Work Experience Bullet Points\n\n"
                    f"Here is a streamlined, high-impact version of your experience:\n\n"
                    f"- Spearheaded optimization of core **{c_title}** workflows, increasing operational efficiency by 15%.\n"
                    f"- Managed key projects utilizing **{c_skills[0]}**, delivering all milestones on schedule."
                )
            else:
                reply = (
                    f"### AI Assistant Support\n\n"
                    f"As your career assistant, I've reviewed your question in the context of your background as a **{c_title}**.\n\n"
                    f"Here is my professional advice:\n"
                    f"- Emphasize your key strengths: **{', '.join(c_skills[:2])}**.\n"
                    f"- Format your response to match standard industry expectations for **{c_category}** roles.\n\n"
                    f"What specific area or experience bullet points would you like to edit next?"
                )
                
            return schema(reply=reply)

        # Mock ATS friendly description rewrite
        if schema.__name__ == 'AtsFriendlyTextSchema':
            from ai.services.job_db import find_best_match
            candidate_job, candidate_score = find_best_match(prompt)
            c_skills = candidate_job["skills"] if candidate_job["skills"] else ["Core Methodologies"]
            
            friendly_text = (
                f"• Spearheaded design and integration of high-performance processes utilizing **{c_skills[0]}**.\n"
                f"• Collaborated with cross-functional teams to optimize system reliability and streamline workflows.\n"
                f"• Maintained rigorous quality standards, increasing operational output by 20%."
            )
            return schema(ats_friendly_description=friendly_text)
            
        # specific hardcoded mock for InterviewPrepOutput for better realism
        if schema.__name__ == 'InterviewPrepOutput':
            from ai.services.job_db import find_best_match
            
            # Split prompt into resume and job description parts if possible
            parts = prompt.split("JOB DESCRIPTION:", 1)
            resume_text = parts[0]
            job_text = parts[1] if len(parts) > 1 else prompt
            
            target_job, target_score = find_best_match(job_text)
            candidate_job, candidate_score = find_best_match(resume_text)
            
            t_title = target_job["title"]
            c_title = candidate_job["title"]
            
            t_skills = target_job["skills"] if target_job["skills"] else ["Core Competencies"]
            c_skills = candidate_job["skills"] if candidate_job["skills"] else ["Core Capabilities"]
            
            t_skill_1 = t_skills[0]
            t_skill_2 = t_skills[1] if len(t_skills) > 1 else "essential industry methodologies"
            t_skill_3 = t_skills[2] if len(t_skills) > 2 else "operational workflows"
            
            c_skill_1 = c_skills[0]
            
            return schema(**{
                "hr_questions": [
                    {
                        "question": f"How does your background as a {c_title} prepare you for this {t_title} role?",
                        "why_asked": f"To assess your transition readiness and how your past skills translate to this {t_title} position.",
                        "focus_area": f"Focus on transferable skills and your motivation for joining the '{target_job['category']}' sector.",
                        "answer_guidance": "Connect your past achievements directly to the key requirements of the target role.",
                        "sample_answer": f"As a {c_title}, I developed strong expertise in {c_skill_1}. These skills directly translate to the responsibilities of a {t_title}, where I can apply my problem-solving ability to help your team succeed."
                    }
                ],
                "behavioral_questions": [
                    {
                        "question": f"Tell me about a time you had to deliver a project using '{t_skill_1}' under a tight deadline.",
                        "why_asked": "To evaluate your resilience, project management, and execution capabilities under pressure.",
                        "focus_area": "Explain the specific actions you took to manage time and solve roadblocks.",
                        "answer_guidance": "Use the STAR method (Situation, Task, Action, Result).",
                        "sample_answer": f"While working on a project requiring '{t_skill_1}', we faced a short delivery window. I prioritized tasks, coordinated with stakeholders, and successfully shipped the feature on time."
                    }
                ],
                "technical_questions": [
                    {
                        "question": f"Can you explain how you would design or optimize a workflow that leverages '{t_skill_2}' to achieve high performance?",
                        "why_asked": f"To verify your technical understanding of '{t_skill_2}' and system efficiency.",
                        "focus_area": f"Discuss architectural design, trade-offs, or optimization strategies.",
                        "answer_guidance": "Explain step-by-step how you structure the technical logic or systems.",
                        "sample_answer": f"To optimize a workflow utilizing '{t_skill_2}', I would focus on identifying bottlenecks early, refining process parameters, and implementing standard best practices to ensure peak throughput."
                    }
                ],
                "project_questions": [
                    {
                        "question": f"I see you worked on projects involving '{c_skill_1}'. What was the most challenging decision you made during execution?",
                        "why_asked": f"To evaluate your technical decision-making framework and depth in '{c_skill_1}'.",
                        "focus_area": "Focus on the trade-offs of the chosen solution versus alternatives.",
                        "answer_guidance": "Compare two approaches and explain why you chose one.",
                        "sample_answer": f"We had to decide on the scalability strategy for our pipeline using '{c_skill_1}'. I chose the structured modular path because it offered better maintainability and long-term cost benefits."
                    }
                ],
                "experience_questions": [
                    {
                        "question": f"In your previous role as a {c_title}, how did you handle responsibilities related to '{t_skill_3}'?",
                        "why_asked": f"To see if you have hands-on experience with typical {t_title} tasks.",
                        "focus_area": "Highlight quantitative achievements or specific tasks you performed.",
                        "answer_guidance": "Use metrics where possible.",
                        "sample_answer": f"In my role as a {c_title}, I was responsible for task areas overlapping with '{t_skill_3}', which helped streamline our deployment pipeline and improved efficiency by 25%."
                    }
                ]
            })
            
        def _generate_mock_value(field_type, field_name):
            origin = get_origin(field_type)
            
            if origin is list or origin is List:
                args = get_args(field_type)
                item_type = args[0] if args else str
                return [_generate_mock_value(item_type, field_name)] * 2
                
            from typing import Union
            if origin is Union:
                args = get_args(field_type)
                return _generate_mock_value(args[0], field_name)
                
            if origin is dict or field_type is dict:
                return {"mock_key": "mock_value"}
                
            if isinstance(field_type, type) and issubclass(field_type, BaseModel):
                return self.generate_structured_json(prompt, field_type, system_prompt).model_dump()
                
            # Do not invent fake data or scores
            if field_type is int:
                return 0
                
            if field_type is float:
                return 0.0
                
            if field_type is bool:
                return False
                
            return f"Mock {field_name.replace('_', ' ').title()}"
            
        mock_data = {}
        for field_name, field_info in schema.model_fields.items():
            mock_data[field_name] = _generate_mock_value(field_info.annotation, field_name)
            
        return schema(**mock_data)
