from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from resumes.models import Resume, ResumeVersion
from job_matching.models import JobDescription, ResumeJobMatch
from unittest.mock import patch

User = get_user_model()

class JobMatchingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        
        self.resume = Resume.objects.create(user=self.user, title="Test Resume")
        self.version = ResumeVersion.objects.create(resume=self.resume, version_name="Base", is_base=True)

    @patch('job_matching.views.analyze_job_description')
    def test_create_job_description(self, mock_analyze):
        class MockAnalysis:
            job_title = "Software Engineer"
            def model_dump(self):
                return {
                    "job_title": "Software Engineer",
                    "required_skills": ["Python", "React"],
                    "preferred_skills": ["Docker"],
                    "qualifications": ["B.S. in CS"],
                    "responsibilities": ["Write code"],
                    "important_keywords": ["fast-paced"]
                }
        mock_analyze.return_value = MockAnalysis()
        
        url = reverse('job-list')
        data = {
            'company': 'Tech Corp',
            'description_text': 'We need a Software Engineer who knows Python.'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Software Engineer')
        self.assertEqual(response.data['parsed_data']['required_skills'], ["Python", "React"])

    @patch('job_matching.views.calculate_job_match')
    def test_match_resume(self, mock_match):
        class MockMatch:
            match_percentage = 85
            matched_skills = ["Python"]
            missing_skills = ["React"]
            partial_matches = []
            keyword_gaps = []
            recommendations = ["Learn React"]
            critical_gaps = []
            irrelevant_skills = []
            match_details = {"match_classification": "Very Strong Match"}
            domain_match = None
            
        mock_match.return_value = MockMatch()
        
        job = JobDescription.objects.create(
            owner=self.user,
            title="Software Engineer",
            company="Tech Corp",
            description_text="We need a Software Engineer."
        )
        
        url = reverse('job-match', kwargs={'pk': job.pk})
        data = {
            'resume_version_id': self.version.id
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['match_percentage'], 85)
