from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from resumes.models import Resume, ResumeVersion, ResumeSection
from job_matching.models import JobDescription
from unittest.mock import patch
from rest_framework import status
import json

User = get_user_model()

class JobTailoringTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password')
        self.client.force_authenticate(user=self.user)
        
        self.resume = Resume.objects.create(user=self.user, title="My Resume")
        self.resume_version = ResumeVersion.objects.create(resume=self.resume, version_name="Base", is_base=True)
        
        ResumeSection.objects.create(
            version=self.resume_version,
            section_type='summary',
            title='Professional Summary',
            content={'text': 'A great summary.'},
            order=0
        )
        
        self.job = JobDescription.objects.create(
            owner=self.user,
            title="Software Engineer",
            company="Tech Corp",
            description_text="We need someone with React and Python skills."
        )

    @patch('ai.views.tailor_resume_for_job')
    def test_optimize_resume(self, mock_tailor):
        # Mock the AI response
        class MockOptimizedData:
            def model_dump(self):
                return {
                    "tailored_sections": [
                        {"section_type": "summary", "title": "Summary", "content": {"text": "A tailored summary."}}
                    ],
                    "changelog": [
                        {"section": "Summary", "change_type": "modified", "original": "A great summary.", "new": "A tailored summary.", "reason": "Match job"}
                    ]
                }
        mock_tailor.return_value = MockOptimizedData()

        url = '/api/v1/ai/optimize/'
        data = {
            'resume_version_id': str(self.resume_version.id),
            'job_description_id': str(self.job.id)
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        response_data = response.json()
        self.assertIn('tailored_sections', response_data)
        self.assertIn('changelog', response_data)
        self.assertEqual(len(response_data['changelog']), 1)
        self.assertEqual(response_data['changelog'][0]['reason'], 'Match job')
