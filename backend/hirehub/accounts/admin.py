# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Add our custom fields to the admin panel
    list_display = ['username', 'email', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['username', 'email']

    # Add role/bio to the edit form
    fieldsets = UserAdmin.fieldsets + (
        ('HireHub Fields', {'fields': ('role', 'avatar', 'bio', 'phone')}),
    )
