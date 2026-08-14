from django.urls import path
from .views import (
    GenerateResumeView, ExtractResumeView, OptimizeResumeView, 
    GenerateInterviewPrepView, ParseTextView, MatchResumeView, 
    AtsAnalyzerView, AiAssistantView, AtsTransformView
)

urlpatterns = [
    path('generate/', GenerateResumeView.as_view(), name='generate_resume'),
    path('extract/', ExtractResumeView.as_view(), name='extract_resume'),
    path('optimize/', OptimizeResumeView.as_view(), name='optimize_resume'),
    path('interview-prep/', GenerateInterviewPrepView.as_view(), name='interview_prep'),
    path('parse-text/', ParseTextView.as_view(), name='parse_text'),
    path('match/', MatchResumeView.as_view(), name='match_resume'),
    path('ats-analyze/', AtsAnalyzerView.as_view(), name='ats_analyze'),
    path('chat/', AiAssistantView.as_view(), name='ai_assistant_chat'),
    path('ats-transform/', AtsTransformView.as_view(), name='ai_ats_transform'),
]
