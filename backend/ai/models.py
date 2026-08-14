from django.db import models
from resumes.models import ResumeVersion

class AIAnalysis(models.Model):
    resume_version = models.ForeignKey(ResumeVersion, on_delete=models.CASCADE, related_name='ai_analyses')
    analysis_type = models.CharField(max_length=50)
    raw_response = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['resume_version']),
        ]

    def __str__(self):
        return f"{self.analysis_type} for {self.resume_version.version_name}"
