# jobs/admin.py
from django.contrib import admin
from .models import Company, JobPost, Application


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'location', 'created_at']
    search_fields = ['name']


@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'job_type', 'experience_level', 'is_active', 'created_at']
    list_filter = ['job_type', 'experience_level', 'is_active']
    search_fields = ['title', 'skills_required']


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'job', 'status', 'applied_at']
    list_filter = ['status']
