from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ATSAnalysisResult
from .serializers import ATSAnalysisRequestSerializer, ATSAnalysisResultSerializer
from resumes.models import ResumeVersion
from ai.services.ats_analysis import analyze_ats_compatibility

class ATSAnalysisView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ATSAnalysisRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        version_id = serializer.validated_data['resume_version_id']
        job_description = serializer.validated_data.get('job_description', '')

        try:
            version = ResumeVersion.objects.get(id=version_id, resume__user=request.user)
        except ResumeVersion.DoesNotExist:
            return Response({"error": "Resume version not found."}, status=status.HTTP_404_NOT_FOUND)

        # Build resume data payload
        resume_data = {
            "title": version.resume.title,
            "version": version.version_name,
            "sections": []
        }
        for section in version.sections.all():
            resume_data["sections"].append({
                "section_type": section.section_type,
                "title": section.title,
                "content": section.content
            })

        # Run AI analysis
        try:
            analysis_dict = analyze_ats_compatibility(resume_data, job_description)
        except Exception as e:
            return Response({"error": f"AI Analysis failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save result
        result = ATSAnalysisResult.objects.create(
            resume_version=version,
            job_description=job_description,
            overall_score=analysis_dict['overall_score'],
            keyword_score=analysis_dict['keyword_score'],
            skills_score=analysis_dict['skills_score'],
            experience_score=analysis_dict['experience_score'],
            formatting_score=analysis_dict['formatting_score'],
            missing_keywords=analysis_dict['missing_keywords'],
            matched_keywords=analysis_dict['matched_keywords'],
            formatting_risks=analysis_dict['formatting_risks'],
            recommendations=analysis_dict['recommendations']
        )

        return Response(ATSAnalysisResultSerializer(result).data, status=status.HTTP_201_CREATED)
