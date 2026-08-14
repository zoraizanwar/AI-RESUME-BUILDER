from django.contrib import admin
from .models import JobDescription, ResumeJobMatch

@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'owner', 'created_at')
    search_fields = ('title', 'company')

@admin.register(ResumeJobMatch)
class ResumeJobMatchAdmin(admin.ModelAdmin):
    list_display = ('resume_version', 'job_description', 'match_percentage', 'created_at')
