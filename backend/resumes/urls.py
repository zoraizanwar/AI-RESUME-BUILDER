from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResumeViewSet, ResumeVersionViewSet, ResumeSectionViewSet

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'versions', ResumeVersionViewSet, basename='version')
router.register(r'sections', ResumeSectionViewSet, basename='section')

urlpatterns = [
    path('', include(router.urls)),
]
