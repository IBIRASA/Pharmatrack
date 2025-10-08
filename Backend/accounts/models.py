from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('pharmacist', 'Pharmacist'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    fullname = models.CharField(max_length=255)

    groups = models.ManyToManyField(
        Group,
        related_name='accounts_users', 
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='accounts_users_permissions',  
        blank=True
    )

    def __str__(self):
        return self.username
