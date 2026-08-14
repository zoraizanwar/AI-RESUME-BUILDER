from django.contrib import admin
from .models import Resume, ResumeVersion, ResumeSection

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at', 'updated_at')
    search_fields = ('title', 'user__email')

@admin.register(ResumeVersion)
class ResumeVersionAdmin(admin.ModelAdmin):
    list_display = ('version_name', 'resume', 'is_base', 'created_at')
    list_filter = ('is_base',)

@admin.register(ResumeSection)
class ResumeSectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'version', 'section_type', 'order')
    list_filter = ('section_type',)
