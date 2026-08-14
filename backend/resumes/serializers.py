from rest_framework import serializers
from .models import Resume, ResumeVersion, ResumeSection

class ResumeSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeSection
        fields = ['id', 'version', 'section_type', 'title', 'content', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ResumeVersionSerializer(serializers.ModelSerializer):
    sections = ResumeSectionSerializer(many=True, read_only=True)

    class Meta:
        model = ResumeVersion
        fields = ['id', 'resume', 'version_name', 'purpose', 'is_base', 'sections', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ResumeSerializer(serializers.ModelSerializer):
    versions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = ['id', 'user', 'title', 'versions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'versions', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
