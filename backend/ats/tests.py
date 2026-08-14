from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from resumes.models import Resume, ResumeVersion, ResumeSection
from unittest.mock import patch

User = get_user_model()

class ATSAnalysisTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        
        self.resume = Resume.objects.create(user=self.user, title="Test Resume")
        self.version = ResumeVersion.objects.create(resume=self.resume, version_name="Base", is_base=True)
        
        ResumeSection.objects.create(version=self.version, section_type='summary', title='Summary', content={"text": "A great software engineer."})
        ResumeSection.objects.create(version=self.version, section_type='experience', title='Experience', content={"items": []})

    @patch('ats.views.analyze_ats_compatibility')
    def test_analyze_resume(self, mock_analyze):
        mock_analyze.return_value = {
            "overall_score": 85,
            "keyword_score": 90,
            "skills_score": 80,
            "experience_score": 80,
            "formatting_score": 90,
            "missing_keywords": ["Docker"],
            "matched_keywords": ["Python", "React"],
            "formatting_risks": [],
            "recommendations": ["Add more metrics."]
        }
        
        url = reverse('ats_analyze')
        data = {
            'resume_version_id': self.version.id,
            'job_description': 'Looking for a Python and React developer.'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['overall_score'], 85)
        self.assertEqual(response.data['missing_keywords'], ["Docker"])
