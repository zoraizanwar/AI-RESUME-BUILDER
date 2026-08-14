from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Resume, ResumeVersion, ResumeSection
from .serializers import ResumeSerializer, ResumeVersionSerializer, ResumeSectionSerializer
from .permissions import IsOwner

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

class ResumeVersionViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeVersionSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        qs = ResumeVersion.objects.filter(resume__user=self.request.user)
        resume_id = self.request.query_params.get('resume')
        if resume_id:
            qs = qs.filter(resume_id=resume_id)
        return qs

    def destroy(self, request, *args, **kwargs):
        version = self.get_object()
        # Prevent deletion if it's the last version
        if version.resume.versions.count() <= 1:
            return Response({"error": "Cannot delete the only version of a resume."}, status=status.HTTP_400_BAD_REQUEST)
        
        # If deleting the base version, make another version the base
        if version.is_base:
            other_version = version.resume.versions.exclude(id=version.id).first()
            if other_version:
                other_version.is_base = True
                other_version.save()

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        version = self.get_object()
        new_name = request.data.get('version_name', f"{version.version_name} (Copy)")
        new_purpose = request.data.get('purpose', version.purpose)
        
        # Create the new version
        new_version = ResumeVersion.objects.create(
            resume=version.resume,
            version_name=new_name,
            purpose=new_purpose,
            is_base=False
        )

        # Copy all sections
        sections = version.sections.all()
        for section in sections:
            ResumeSection.objects.create(
                version=new_version,
                section_type=section.section_type,
                title=section.title,
                content=section.content,
                order=section.order
            )
            
        serializer = self.get_serializer(new_version)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ResumeSectionViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSectionSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        qs = ResumeSection.objects.filter(version__resume__user=self.request.user)
        version_id = self.request.query_params.get('version')
        if version_id:
            qs = qs.filter(version_id=version_id)
        return qs

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """
        Expects a list of dictionaries with id and order:
        [{"id": 1, "order": 0}, {"id": 2, "order": 1}]
        """
        data = request.data
        if not isinstance(data, list):
            return Response({"error": "Expected a list of objects"}, status=status.HTTP_400_BAD_REQUEST)
        
        updated_sections = []
        for item in data:
            section_id = item.get('id')
            order = item.get('order')
            if section_id is not None and order is not None:
                try:
                    section = ResumeSection.objects.get(
                        id=section_id, 
                        version__resume__user=self.request.user
                    )
                    section.order = order
                    updated_sections.append(section)
                except ResumeSection.DoesNotExist:
                    return Response({"error": f"Section {section_id} not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)
        
        # Bulk update
        if updated_sections:
            ResumeSection.objects.bulk_update(updated_sections, ['order'])
            
        return Response({"status": "reordered"}, status=status.HTTP_200_OK)
