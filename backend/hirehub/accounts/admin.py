from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Extends Django's built-in UserAdmin to show our custom fields.
    """
    list_display = ["email", "username", "role", "is_active", "date_joined"]
    list_filter = ["role", "is_active", "is_staff"]
    search_fields = ["email", "username", "first_name", "last_name"]
    ordering = ["-date_joined"]

    # Add 'role' to the detail view fieldsets
    fieldsets = UserAdmin.fieldsets + (
        ("HireHub", {"fields": ("role", "avatar")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("HireHub", {"fields": ("role",)}),
    )