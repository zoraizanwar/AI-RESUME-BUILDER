from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from .models import Resume, ResumeVersion, ResumeSection

User = get_user_model()

class ResumeAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', email='user1@example.com', password='password123')
        self.user2 = User.objects.create_user(username='user2', email='user2@example.com', password='password123')
        
        self.resume1 = Resume.objects.create(user=self.user1, title='User1 Resume')
        self.version1 = ResumeVersion.objects.create(resume=self.resume1, version_name='V1')
        self.section1 = ResumeSection.objects.create(version=self.version1, section_type='experience', title='Exp', order=0)
        self.section2 = ResumeSection.objects.create(version=self.version1, section_type='education', title='Edu', order=1)
        
        self.resume2 = Resume.objects.create(user=self.user2, title='User2 Resume')

    def authenticate(self, user):
        response = self.client.post('/api/v1/auth/login/', {'email': user.email, 'password': 'password123'})
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])

    def test_list_resumes_permissions(self):
        self.authenticate(self.user1)
        response = self.client.get('/api/v1/resumes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.resume1.id)

    def test_create_resume(self):
        self.authenticate(self.user1)
        response = self.client.post('/api/v1/resumes/', {'title': 'New Resume'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Resume.objects.filter(user=self.user1).count(), 2)

    def test_unauthorized_access(self):
        self.authenticate(self.user2)
        response = self.client.get(f'/api/v1/resumes/{self.resume1.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # or 403

    def test_create_version(self):
        self.authenticate(self.user1)
        response = self.client.post('/api/v1/versions/', {'resume': self.resume1.id, 'version_name': 'V2'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ResumeVersion.objects.filter(resume=self.resume1).count(), 2)
        
    def test_create_section(self):
        self.authenticate(self.user1)
        response = self.client.post('/api/v1/sections/', {
            'version': self.version1.id, 
            'section_type': 'skills', 
            'title': 'My Skills',
            'order': 2
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ResumeSection.objects.filter(version=self.version1).count(), 3)
        
    def test_reorder_sections(self):
        self.authenticate(self.user1)
        # Flip order
        payload = [
            {'id': self.section1.id, 'order': 1},
            {'id': self.section2.id, 'order': 0}
        ]
        response = self.client.post('/api/v1/sections/reorder/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.section1.refresh_from_db()
        self.section2.refresh_from_db()
        self.assertEqual(self.section1.order, 1)
        self.assertEqual(self.section2.order, 0)
        
    def test_reorder_unauthorized(self):
        self.authenticate(self.user2)
        payload = [{'id': self.section1.id, 'order': 5}]
        response = self.client.post('/api/v1/sections/reorder/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_missing_resume_info(self):
        self.authenticate(self.user1)
        response = self.client.post('/api/v1/resumes/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    from unittest.mock import patch
    @patch('resumes.serializers.ResumeSerializer.save')
    def test_database_failure(self, mock_save):
        from django.db import DatabaseError
        mock_save.side_effect = DatabaseError("Database is down")
        self.authenticate(self.user1)
        with self.assertRaises(DatabaseError):
            self.client.post('/api/v1/resumes/', {'title': 'Fail Resume'})

