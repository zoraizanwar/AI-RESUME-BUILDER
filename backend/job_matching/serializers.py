from rest_framework import serializers
from .models import JobDescription, ResumeJobMatch

class JobDescriptionSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = JobDescription
        fields = ['id', 'title', 'company', 'description_text', 'url', 'parsed_data', 'created_at']
        read_only_fields = ['id', 'parsed_data', 'created_at']

class ResumeJobMatchSerializer(serializers.ModelSerializer):
    job_description = JobDescriptionSerializer(read_only=True)
    
    class Meta:
        model = ResumeJobMatch
        fields = [
            'id', 'resume_version', 'job_description', 
            'match_percentage', 'matched_skills', 'missing_skills', 
            'partial_matches', 'keyword_gaps', 'recommendations', 
            'match_details', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class MatchRequestSerializer(serializers.Serializer):
    resume_version_id = serializers.IntegerField(required=True)
