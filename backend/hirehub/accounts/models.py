# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User Model.
    We extend Django's built-in User to add:
    - role (EMPLOYER or SEEKER)
    - avatar
    - bio
    """

    class Role(models.TextChoices):
        EMPLOYER = 'EMPLOYER', 'Employer'
        SEEKER = 'SEEKER',   'Job Seeker'

    role = models.CharField(
                max_length=10,
                choices=Role.choices,
                default=Role.SEEKER
             )
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_employer(self):
        return self.role == self.Role.EMPLOYER

    @property
    def is_seeker(self):
        return self.role == self.Role.SEEKER


