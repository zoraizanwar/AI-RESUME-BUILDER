from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # We use email as the primary identifier instead of username for modern apps
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
