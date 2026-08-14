from django.db import models
from django.conf import settings
from resumes.models import ResumeVersion
from templates.models import Template

class GeneratedDocument(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    resume_version = models.ForeignKey(ResumeVersion, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    template = models.ForeignKey(Template, on_delete=models.SET_NULL, null=True, related_name='documents')
    file = models.FileField(upload_to='generated_documents/')
    format = models.CharField(max_length=10) # e.g., 'pdf', 'docx'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['resume_version']),
        ]

    def __str__(self):
        return f"{self.resume_version.version_name} ({self.format})"
