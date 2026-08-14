from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import JobDescription, ResumeJobMatch
from .serializers import JobDescriptionSerializer, ResumeJobMatchSerializer, MatchRequestSerializer
from resumes.models import ResumeVersion
from ai.services.job_analysis import analyze_job_description
from ai.services.matching import calculate_job_match
import json

class JobDescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = JobDescriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobDescription.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Save initially without parsed data
        job = serializer.save(owner=self.request.user)
        
        # Call AI service to analyze the job description
        analysis_result = analyze_job_description(job.description_text)
        
        # Save parsed data
        job.parsed_data = analysis_result.model_dump()
        
        # Optionally override title if the user didn't provide one, or use the extracted one
        if not job.title and analysis_result.job_title:
            job.title = analysis_result.job_title
            
        job.save()

    @action(detail=True, methods=['post'])
    def match(self, request, pk=None):
        job = self.get_object()
        serializer = MatchRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            resume_version_id = serializer.validated_data['resume_version_id']
            
            try:
                resume_version = ResumeVersion.objects.get(
                    id=resume_version_id, 
                    resume__user=request.user
                )
            except ResumeVersion.DoesNotExist:
                return Response({"error": "Resume version not found."}, status=status.HTTP_404_NOT_FOUND)
                
            # Convert resume to string representation
            resume_text = ""
            for section in resume_version.sections.all():
                resume_text += f"{section.title}:\n{json.dumps(section.content)}\n\n"
                
            # Perform deep semantic match
            from ai.exceptions import AIProviderNotConfiguredError
            
            try:
                match_result = calculate_job_match(resume_text, job.description_text)
            except AIProviderNotConfiguredError as e:
                return Response(
                    {"error": "AI_PROVIDER_NOT_CONFIGURED", "message": str(e)},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            def serialize_item(item):
                if hasattr(item, 'model_dump'):
                    return item.model_dump()
                elif hasattr(item, 'dict'):
                    return item.dict()
                return item

            # Save or update match
            match, created = ResumeJobMatch.objects.update_or_create(
                resume_version=resume_version,
                job_description=job,
                defaults={
                    'match_percentage': match_result.match_percentage,
                    'matched_skills': [serialize_item(ms) for ms in match_result.matched_skills],
                    'missing_skills': [serialize_item(ms) for ms in match_result.missing_skills],
                    'partial_matches': [serialize_item(pm) for pm in match_result.partial_matches],
                    'keyword_gaps': match_result.keyword_gaps,
                    'recommendations': match_result.recommendations,
                    'match_details': match_result.match_details
                }
            )
            
            result_serializer = ResumeJobMatchSerializer(match)
            return Response(result_serializer.data, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
