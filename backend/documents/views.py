from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from .models import GeneratedDocument
from resumes.models import ResumeVersion
from templates.models import Template
from .services import generate_docx_for_resume

class GenerateDocumentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        resume_version_id = request.data.get('resume_version_id')
        template_id = request.data.get('template_id')
        resume_data = request.data.get('resume_data')
        
        if not template_id:
            return Response(
                {"error": "template_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            if isinstance(template_id, int) or str(template_id).isdigit():
                template = Template.objects.get(id=int(template_id))
            else:
                template = Template.objects.first()
                if not template:
                    return Response({"error": "No templates available in DB"}, status=status.HTTP_400_BAD_REQUEST)
        except Template.DoesNotExist:
            template = Template.objects.first()
            if not template:
                return Response({"error": "No templates available in DB"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            doc = generate_docx_for_resume(resume_version_id, template.id, resume_data=resume_data, user=request.user)
            return Response({
                "id": doc.id,
                "message": "Document generated successfully",
                "format": doc.format,
                "download_url": f"/api/v1/documents/download/{doc.id}/"
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DownloadDocumentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, doc_id, *args, **kwargs):
        # Verify ownership
        doc = get_object_or_404(GeneratedDocument, id=doc_id)
        
        is_owner = False
        if doc.user == request.user:
            is_owner = True
        elif doc.resume_version and doc.resume_version.resume.user == request.user:
            is_owner = True
            
        if not is_owner:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not doc.file:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            
        response = FileResponse(doc.file.open('rb'), as_attachment=True, filename=doc.file.name.split('/')[-1])
        return response

class UploadPDFDocumentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        resume_version_id = request.data.get('resume_version_id')
        template_id = request.data.get('template_id')
        pdf_file = request.FILES.get('file')
        
        if not resume_version_id or not template_id or not pdf_file:
            return Response(
                {"error": "resume_version_id, template_id, and file are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if pdf_file.size > 5 * 1024 * 1024:
            return Response({"error": "File size exceeds 5MB limit"}, status=status.HTTP_400_BAD_REQUEST)

        if not pdf_file.name.lower().endswith('.pdf'):
            return Response({"error": "Unsupported file format. Please upload a PDF."}, status=status.HTTP_400_BAD_REQUEST)
            
        resume_version = get_object_or_404(ResumeVersion, id=resume_version_id, resume__user=request.user)
        template = get_object_or_404(Template, id=template_id)
        
        try:
            doc = GeneratedDocument.objects.create(
                resume_version=resume_version,
                template=template,
                format='pdf'
            )
            doc.file.save(f"resume_{resume_version.id}_{template.id}.pdf", pdf_file)
            doc.save()
            
            return Response({
                "id": doc.id,
                "message": "PDF uploaded successfully",
                "format": doc.format,
                "download_url": f"/api/v1/documents/download/{doc.id}/"
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
