from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('pharmacist', 'Pharmacist'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    fullname = models.CharField(max_length=255)

    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        Group,
        related_name='accounts_users',   # Custom related name
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='accounts_users_permissions',  # Custom related name
        blank=True
    )

    def __str__(self):
        return self.username
