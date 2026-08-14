from django.contrib import admin
from .models import GeneratedDocument

@admin.register(GeneratedDocument)
class GeneratedDocumentAdmin(admin.ModelAdmin):
    list_display = ('resume_version', 'template', 'format', 'created_at')
    list_filter = ('format',)
