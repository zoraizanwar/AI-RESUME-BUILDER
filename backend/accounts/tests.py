from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.me_url = reverse('current_user')
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='test@example.com').exists())

    def test_duplicate_account_registration(self):
        self.client.post(self.register_url, self.user_data)
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_user_login(self):
        self.client.post(self.register_url, self.user_data)
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'SecurePassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_invalid_login(self):
        response = self.client.post(self.login_url, {
            'email': 'nonexistent@example.com',
            'password': 'WrongPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_endpoint(self):
        # Register and login
        self.client.post(self.register_url, self.user_data)
        login_response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'SecurePassword123!'
        })
        token = login_response.data['access']
        
        # Access protected route
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_unauthorized_endpoint(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_expired_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjIsImlhdCI6MTUxNjIzOTAyMn0.dummy')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

