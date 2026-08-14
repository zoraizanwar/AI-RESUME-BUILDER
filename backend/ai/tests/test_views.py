import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock

User = get_user_model()

class GenerateResumeViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        self.url = reverse('generate_resume')
        
    @patch('ai.views.generate_resume_content')
    def test_generate_resume_success(self, mock_generate):
        mock_response = MagicMock()
        mock_response.model_dump.return_value = {
            "professional_summary": "Expert dev",
            "improved_experience": [],
            "improved_projects": [],
            "organized_skills": ["Python", "Django"],
            "missing_information": []
        }
        mock_generate.return_value = mock_response

        data = {
            "resume_data": {"test": "data"},
            "template_info": {"id": 1}
        }
        response = self.client.post(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["professional_summary"], "Expert dev")
        self.assertEqual(len(response.data["organized_skills"]), 2)
        mock_generate.assert_called_once_with({"test": "data"}, {"id": 1})

    def test_generate_resume_no_data(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("resume_data is required", response.data["error"])

    @patch('ai.views.generate_resume_content')
    def test_generate_resume_validation_error(self, mock_generate):
        from ai.providers.openai_provider import AIProviderValidationException
        mock_generate.side_effect = AIProviderValidationException("Bad response")

        data = {"resume_data": {"test": "data"}}
        response = self.client.post(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("AI response failed validation", response.data["error"])

    @patch('ai.views.generate_resume_content')
    def test_generate_resume_provider_failure(self, mock_generate):
        mock_generate.side_effect = Exception("OpenAI API is down")

        data = {"resume_data": {"test": "data"}}
        response = self.client.post(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("An error occurred during AI generation", response.data.get("error", str(response.data)))


from django.core.files.uploadedfile import SimpleUploadedFile
from ai.services.extraction import ResumeExtractionSchema, ExtractedPersonalInfo

class ExtractResumeViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testextract', email='test2@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        self.url = reverse('extract_resume')

    def test_extract_no_file(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("No file uploaded", response.data["error"])

    def test_extract_unsupported_format(self):
        file = SimpleUploadedFile("test.txt", b"file_content", content_type="text/plain")
        response = self.client.post(self.url, {"file": file})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Unsupported file format", response.data["error"])

    @patch('ai.views.extract_resume_data')
    @patch('ai.views.extract_text_from_pdf')
    def test_extract_success(self, mock_pdf_parse, mock_extract):
        mock_pdf_parse.return_value = "raw text from pdf"
        mock_response = MagicMock()
        mock_response.model_dump.return_value = {
            "personal_info": {"name": "Alice"},
            "skills": ["Java"]
        }
        mock_extract.return_value = mock_response

        file = SimpleUploadedFile("resume.pdf", b"fake pdf bytes", content_type="application/pdf")
        response = self.client.post(self.url, {"file": file})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["personal_info"]["name"], "Alice")
        mock_pdf_parse.assert_called_once()
        mock_extract.assert_called_once_with("raw text from pdf")
