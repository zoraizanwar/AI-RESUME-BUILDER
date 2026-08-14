from django.db import models
from resumes.models import ResumeVersion

class ATSAnalysisResult(models.Model):
    resume_version = models.ForeignKey(ResumeVersion, on_delete=models.CASCADE, related_name='ats_results')
    job_description = models.TextField(blank=True, null=True)
    
    overall_score = models.IntegerField(default=0)
    keyword_score = models.IntegerField(default=0)
    skills_score = models.IntegerField(default=0)
    experience_score = models.IntegerField(default=0)
    formatting_score = models.IntegerField(default=0)
    
    missing_keywords = models.JSONField(default=list, blank=True)
    matched_keywords = models.JSONField(default=list, blank=True)
    formatting_risks = models.JSONField(default=list, blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"ATS Result for {self.resume_version.resume.title} - Score: {self.overall_score}"
