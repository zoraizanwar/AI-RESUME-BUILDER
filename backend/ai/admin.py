from django.contrib import admin
from .models import AIAnalysis

@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ('resume_version', 'analysis_type', 'created_at')
    list_filter = ('analysis_type',)
