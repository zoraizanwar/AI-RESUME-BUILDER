from django.db import models
from django.conf import settings

class Resume(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.title} ({self.user.email})"

class ResumeVersion(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='versions')
    version_name = models.CharField(max_length=255)
    purpose = models.CharField(max_length=500, blank=True, null=True, default='')
    is_base = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['resume']),
        ]

    def __str__(self):
        return f"{self.resume.title} - {self.version_name}"

class ResumeSection(models.Model):
    SECTION_TYPES = [
        ('personal', 'Personal Information'),
        ('experience', 'Experience'),
        ('education', 'Education'),
        ('skills', 'Skills'),
        ('projects', 'Projects'),
        ('summary', 'Summary'),
        ('certifications', 'Certifications'),
        ('awards', 'Awards'),
        ('languages', 'Languages'),
        ('volunteer', 'Volunteer Experience'),
        ('custom', 'Custom'),
    ]

    version = models.ForeignKey(ResumeVersion, on_delete=models.CASCADE, related_name='sections')
    section_type = models.CharField(max_length=50, choices=SECTION_TYPES)
    title = models.CharField(max_length=255)
    content = models.JSONField(default=dict, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        indexes = [
            models.Index(fields=['version']),
        ]

    def __str__(self):
        return f"{self.version.version_name} - {self.title}"
