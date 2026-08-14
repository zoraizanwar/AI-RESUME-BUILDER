from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Resume, ResumeVersion, ResumeSection

User = get_user_model()

class ResumeModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.resume = Resume.objects.create(user=self.user, title='Software Engineer Resume')
        self.version = ResumeVersion.objects.create(resume=self.resume, version_name='V1', is_base=True)
        self.section = ResumeSection.objects.create(
            version=self.version,
            section_type='experience',
            title='Work Experience',
            content={'jobs': []},
            order=1
        )

    def test_resume_creation(self):
        self.assertEqual(self.resume.user, self.user)
        self.assertEqual(self.resume.title, 'Software Engineer Resume')
        self.assertEqual(str(self.resume), f"Software Engineer Resume ({self.user.email})")

    def test_resume_version_creation(self):
        self.assertEqual(self.version.resume, self.resume)
        self.assertEqual(self.version.version_name, 'V1')
        self.assertTrue(self.version.is_base)
        self.assertEqual(str(self.version), f"{self.resume.title} - V1")

    def test_resume_section_creation(self):
        self.assertEqual(self.section.version, self.version)
        self.assertEqual(self.section.section_type, 'experience')
        self.assertEqual(self.section.order, 1)
        self.assertEqual(str(self.section), f"{self.version.version_name} - Work Experience")
        
    def test_cascade_delete(self):
        self.user.delete()
        self.assertEqual(Resume.objects.count(), 0)
        self.assertEqual(ResumeVersion.objects.count(), 0)
        self.assertEqual(ResumeSection.objects.count(), 0)
