"""
accounts/models.py
──────────────────
Custom User Model for HireHub.

WHY extend AbstractUser?
  Django's default User has username, email, password, first_name, last_name.
  We need ONE extra field: `role` (SEEKER or EMPLOYER).
  Extending AbstractUser lets us keep all of Django's built-in auth
  machinery (admin, permissions, password hashing) while adding our field.

CRITICAL RULE:
  AUTH_USER_MODEL must be set in settings.py BEFORE the first migration.
  Changing it later is extremely painful. We set it correctly from the start.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    HireHub's custom user.

    Inherits from AbstractUser which already provides:
      - username, email, password (hashed)
      - first_name, last_name
      - is_active, is_staff, is_superuser
      - date_joined, last_login
      - All authentication machinery

    We add:
      - role: whether this user is a SEEKER or EMPLOYER
      - avatar: optional profile picture
    """

    class Role(models.TextChoices):
        SEEKER = "SEEKER", "Job Seeker"
        EMPLOYER = "EMPLOYER", "Employer"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        # No default — role MUST be explicitly set during registration.
        # This prevents accidentally creating users with no role.
    )

    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True,
        help_text="Optional profile picture",
    )

    # Make email required and unique — we use email for login
    email = models.EmailField(unique=True)

    # We keep username for Django compatibility but email is the primary identifier
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "role"]  # Required when using createsuperuser

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_employer(self):
        return self.role == self.Role.EMPLOYER

    @property
    def is_seeker(self):
        return self.role == self.Role.SEEKER