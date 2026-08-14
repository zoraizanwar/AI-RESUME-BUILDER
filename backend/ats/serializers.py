from rest_framework import serializers
from .models import ATSAnalysisResult

class ATSAnalysisRequestSerializer(serializers.Serializer):
    resume_version_id = serializers.IntegerField(required=True)
    job_description = serializers.CharField(required=False, allow_blank=True)

class ATSAnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ATSAnalysisResult
        fields = [
            'id', 'resume_version', 'job_description',
            'overall_score', 'keyword_score', 'skills_score', 
            'experience_score', 'formatting_score',
            'missing_keywords', 'matched_keywords', 
            'formatting_risks', 'recommendations',
            'created_at'
        ]
