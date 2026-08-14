from unittest.mock import patch, MagicMock
from django.test import TestCase
from ai.services.matching import (
    calculate_job_match,
    StructuredMatchExtraction,
    RoleAnalysis,
    CategoryScore
)

class JobMatcherScoringTests(TestCase):
    
    def _create_mock_extraction(self, role_score, skills_score, exp_score, resp_score, domain_score, edu_score, transfer_score):
        return StructuredMatchExtraction(
            role_analysis=RoleAnalysis(
                candidate_role="Software Engineer",
                candidate_domain="Tech",
                job_role="Software Engineer",
                job_domain="Tech",
                core_responsibilities_match="Good alignment"
            ),
            role_compatibility=CategoryScore(score=role_score, reason="Reason"),
            skills_match=CategoryScore(score=skills_score, reason="Reason"),
            experience_match=CategoryScore(score=exp_score, reason="Reason"),
            responsibility_match=CategoryScore(score=resp_score, reason="Reason"),
            domain_match=CategoryScore(score=domain_score, reason="Reason"),
            education_match=CategoryScore(score=edu_score, reason="Reason"),
            transferable_skills=CategoryScore(score=transfer_score, reason="Reason"),
            matched_skills=[],
            missing_skills=[],
            partial_matches=[],
            irrelevant_skills=[],
            keyword_gaps=[],
            critical_gaps=[],
            recommendations=[]
        )

    @patch('ai.services.matching.get_ai_provider')
    def test_perfect_match(self, mock_get_provider):
        mock_provider = MagicMock()
        mock_get_provider.return_value = mock_provider
        
        mock_provider.generate_structured_json.return_value = self._create_mock_extraction(
            role_score=1.0,
            skills_score=1.0,
            exp_score=1.0,
            resp_score=1.0,
            domain_score=1.0,
            edu_score=1.0,
            transfer_score=1.0
        )
        
        result = calculate_job_match("Perfect Resume", "Perfect Job Description")
        
        self.assertEqual(result.match_percentage, 100)
        self.assertEqual(result.match_details["match_classification"], "Very Strong Match")

    @patch('ai.services.matching.get_ai_provider')
    def test_moderate_match(self, mock_get_provider):
        mock_provider = MagicMock()
        mock_get_provider.return_value = mock_provider
        
        mock_provider.generate_structured_json.return_value = self._create_mock_extraction(
            role_score=0.7,
            skills_score=0.7,
            exp_score=0.7,
            resp_score=0.7,
            domain_score=0.7,
            edu_score=0.7,
            transfer_score=0.7
        )
        
        result = calculate_job_match("Medium Resume", "Medium Job Description")
        
        self.assertEqual(result.match_percentage, 70)
        self.assertEqual(result.match_details["match_classification"], "Strong Match")

    @patch('ai.services.matching.get_ai_provider')
    def test_severe_mismatch_guard_cap_20(self, mock_get_provider):
        mock_provider = MagicMock()
        mock_get_provider.return_value = mock_provider
        
        # Role < 0.25 and Domain < 0.25 -> Capped at 20%
        mock_provider.generate_structured_json.return_value = self._create_mock_extraction(
            role_score=0.10,
            skills_score=0.90,
            exp_score=0.90,
            resp_score=0.90,
            domain_score=0.10,
            edu_score=0.90,
            transfer_score=0.90
        )
        
        result = calculate_job_match("Mismatch Resume", "Mismatch Job Description")
        
        self.assertEqual(result.match_percentage, 20)
        self.assertEqual(result.match_details["match_classification"], "Very Low Match")

    @patch('ai.services.matching.get_ai_provider')
    def test_moderate_mismatch_guard_cap_35(self, mock_get_provider):
        mock_provider = MagicMock()
        mock_get_provider.return_value = mock_provider
        
        # Role < 0.40 -> Capped at 35%
        mock_provider.generate_structured_json.return_value = self._create_mock_extraction(
            role_score=0.30,
            skills_score=0.90,
            exp_score=0.90,
            resp_score=0.90,
            domain_score=0.90,
            edu_score=0.90,
            transfer_score=0.90
        )
        
        result = calculate_job_match("Mismatch Resume", "Mismatch Job Description")
        
        self.assertEqual(result.match_percentage, 35)
        self.assertEqual(result.match_details["match_classification"], "Low Match")

    @patch('ai.services.matching.get_ai_provider')
    def test_weak_mismatch_guard_cap_55(self, mock_get_provider):
        mock_provider = MagicMock()
        mock_get_provider.return_value = mock_provider
        
        # Role < 0.60 -> Capped at 55%
        mock_provider.generate_structured_json.return_value = self._create_mock_extraction(
            role_score=0.50,
            skills_score=0.90,
            exp_score=0.90,
            resp_score=0.90,
            domain_score=0.90,
            edu_score=0.90,
            transfer_score=0.90
        )
        
        result = calculate_job_match("Mismatch Resume", "Mismatch Job Description")
        
        self.assertEqual(result.match_percentage, 55)
        self.assertEqual(result.match_details["match_classification"], "Moderate Match")

    @patch('ai.services.matching.get_ai_provider')
    def test_invalid_score_raises_value_error(self, mock_get_provider):
        mock_provider = MagicMock()
        mock_get_provider.return_value = mock_provider
        
        mock_provider.generate_structured_json.return_value = self._create_mock_extraction(
            role_score=1.5,
            skills_score=1.0,
            exp_score=1.0,
            resp_score=1.0,
            domain_score=1.0,
            edu_score=1.0,
            transfer_score=1.0
        )
        
        with self.assertRaises(ValueError):
            calculate_job_match("Invalid Resume", "Invalid Job Description")
