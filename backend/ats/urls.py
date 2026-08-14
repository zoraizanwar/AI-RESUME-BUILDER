from django.urls import path
from .views import ATSAnalysisView

urlpatterns = [
    path('analyze/', ATSAnalysisView.as_view(), name='ats_analyze'),
]
