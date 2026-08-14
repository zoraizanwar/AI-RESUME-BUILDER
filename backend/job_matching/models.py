from django.db import models
from django.conf import settings
from resumes.models import ResumeVersion

class JobDescription(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    description_text = models.TextField()
    url = models.URLField(blank=True, null=True)
    parsed_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['owner']),
        ]

    def __str__(self):
        return f"{self.title} at {self.company}"

class ResumeJobMatch(models.Model):
    resume_version = models.ForeignKey(ResumeVersion, on_delete=models.CASCADE, related_name='job_matches')
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='resume_matches')
    
    match_percentage = models.IntegerField(default=0)
    matched_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    partial_matches = models.JSONField(default=list, blank=True)
    keyword_gaps = models.JSONField(default=list, blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    match_details = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['resume_version']),
            models.Index(fields=['job_description']),
        ]

    def __str__(self):
        return f"Match: {self.resume_version.version_name} -> {self.job_description.title}"
