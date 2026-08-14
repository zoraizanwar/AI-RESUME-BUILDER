from django.contrib import admin
from django.urls import path, include
from .views import health_check, readiness_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('ready/', readiness_check, name='readiness_check'),
    path('api/health/', health_check, name='api_health_check'),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/', include('resumes.urls')),
    path('api/v1/templates/', include('templates.urls')),
    path('api/v1/ai/', include('ai.urls')),
    path('api/v1/documents/', include('documents.urls')),
    path('api/v1/ats/', include('ats.urls')),
    path('api/v1/', include('job_matching.urls')),
]
