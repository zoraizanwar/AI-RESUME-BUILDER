import json
from unittest import mock
from django.test import TestCase

from ai.services.generation import generate_resume_content, ResumeGenerationSchema
from ai.services.job_analysis import analyze_job_description, JobAnalysisSchema

class AIServicesTests(TestCase):

    @mock.patch.dict('os.environ', {'OPENAI_API_KEY': 'test_key'})
    @mock.patch('ai.providers.openai_provider.OpenAIProvider.generate_structured_json')
    def test_generation_service(self, mock_generate):
        # Mock the provider's response
        mock_generate.return_value = ResumeGenerationSchema(
            professional_summary="A great summary",
            improved_experience=[],
            improved_projects=[],
            organized_skills=["Skill1"],
            missing_information=[]
        )
        
        result = generate_resume_content({"name": "Test"}, {"id": 1})
        self.assertEqual(result.professional_summary, "A great summary")
        
    @mock.patch.dict('os.environ', {'OPENAI_API_KEY': 'test_key'})
    @mock.patch('ai.providers.openai_provider.OpenAIProvider.generate_structured_json')
    def test_job_analysis_service(self, mock_generate):
        mock_generate.return_value = JobAnalysisSchema(
            job_title="Software Engineer",
            required_skills=["Python"],
            preferred_skills=["Docker"],
            qualifications=["BSc"],
            responsibilities=["Coding"],
            important_keywords=["Python"]
        )
        
        result = analyze_job_description("We need Python devs")
        self.assertIn("Python", result.required_skills)
