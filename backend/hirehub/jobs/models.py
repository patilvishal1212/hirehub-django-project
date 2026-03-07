# jobs/models.py
from django.db import models
from django.conf import settings


class Company(models.Model):
    """A company that posts jobs."""

    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='company'
    )
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=200)
    about = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Companies'


class JobPost(models.Model):
    """A job listing posted by an Employer."""

    class JobType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full Time'
        PART_TIME = 'PART_TIME', 'Part Time'
        CONTRACT = 'CONTRACT', 'Contract'
        INTERNSHIP = 'INTERNSHIP', 'Internship'
        REMOTE = 'REMOTE', 'Remote'

    class ExperienceLevel(models.TextChoices):
        ENTRY = 'ENTRY', 'Entry Level'
        MID = 'MID', 'Mid Level'
        SENIOR = 'SENIOR', 'Senior Level'

    # Who posted it
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_posts'
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='jobs'
    )

    # Job details
    title = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField()
    skills_required = models.CharField(max_length=500, help_text="Comma separated: Python, Django, React")
    location = models.CharField(max_length=200)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    experience_level = models.CharField(max_length=10, choices=ExperienceLevel.choices, default=ExperienceLevel.ENTRY)

    # Salary (optional — many companies hide it)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)

    # Status
    is_active = models.BooleanField(default=True)
    deadline = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} @ {self.company or self.posted_by.username}"

    class Meta:
        ordering = ['-created_at']  # Newest jobs first!


class Application(models.Model):
    """A job seeker applies to a job."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        REVIEWED = 'REVIEWED', 'Reviewed'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'

    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')

    resume = models.FileField(upload_to='resumes/')
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.applicant.username} → {self.job.title}"

    class Meta:
        ordering = ['-applied_at']
        # One person can only apply to same job ONCE
        unique_together = ['job', 'applicant']
