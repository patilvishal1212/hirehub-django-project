from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Company, JobPost, Application
from .serializers import CompanySerializer, JobPostSerializer, ApplicationSerializer
from .permissions import IsEmployer, IsSeeker, IsOwnerOrReadOnly, IsApplicant


class CompanyViewSet(viewsets.ModelViewSet):
    """
    Employers can manage their company profile.
    Only one company per employer.
    """
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Company.objects.filter(employer=self.request.user)

    def perform_create(self, serializer):
        # Prevent multiple companies per employer
        if Company.objects.filter(employer=self.request.user).exists():
            return Response({"error": "You already have a company profile."}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(employer=self.request.user)


class JobPostViewSet(viewsets.ModelViewSet):
    """
    Publicly viewable active jobs.
    Only Employers with a company can create/manage jobs.
    """
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        if self.action == 'list':
            return JobPost.objects.filter(is_active=True)
        return JobPost.objects.all()

    def perform_create(self, serializer):
        # Logic Audit: Ensure company exists
        if not hasattr(self.request.user, 'company'):
            return Response({"error": "Create a company profile first."}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(author=self.request.user, company=self.request.user.company)

    # Custom action: GET /api/jobs/my_jobs/
    @action(detail=False, methods=['get'], permission_classes=[IsEmployer])
    def my_jobs(self, request):
        if not hasattr(request.user, 'company'):
            return Response({"error": "Create a company profile first."}, status=status.HTTP_400_BAD_REQUEST)

        jobs = JobPost.objects.filter(company=request.user.company).order_by('-created_at')
        serializer = JobPostSerializer(jobs, many=True)
        return Response(serializer.data)

    # Custom action: POST /api/jobs/{id}/apply/
    @action(detail=True, methods=['post'], permission_classes=[IsSeeker])
    def apply(self, request, pk=None):
        job = self.get_object()
        serializer = ApplicationSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            serializer.save(applicant=request.user, job=job)
            return Response({'status': 'Application submitted!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Custom action: GET /api/jobs/{id}/applications/
    @action(detail=True, methods=['get'], permission_classes=[IsEmployer])
    def applications(self, request, pk=None):
        job = self.get_object()
        # Logic Audit: Only job owner can see applications
        if job.company.employer != request.user:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        applications = job.applications.all()
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)


class ApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Seekers see their own applications.
    Employers see applications for their jobs.
    """
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SEEKER':
            return Application.objects.filter(applicant=user)
        elif user.role == 'EMPLOYER' and hasattr(user, 'company'):
            return Application.objects.filter(job__company=user.company)
        return Application.objects.none()