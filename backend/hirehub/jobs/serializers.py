from rest_framework import serializers
from .models import Company, JobPost, Application


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ('employer',)


class JobPostSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')

    class Meta:
        model = JobPost
        fields = '__all__'
        read_only_fields = ('author', 'company', 'is_active', 'created_at')

    def validate(self, attrs):
        user = self.context['request'].user
        if not hasattr(user, 'company'):
            raise serializers.ValidationError("You must create a company profile before posting a job.")
        return attrs


class ApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.ReadOnlyField(source='applicant.get_full_name')
    job_title = serializers.ReadOnlyField(source='job.title')

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('applicant', 'status', 'applied_at')

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            return attrs

        user = request.user
        job = attrs.get('job')

        # Logic Audit Fixes:
        if user.role != 'SEEKER':
            raise serializers.ValidationError("Only job seekers can apply for jobs.")

        if job.company.employer == user:
            raise serializers.ValidationError("You cannot apply to your own job post.")

        if Application.objects.filter(job=job, applicant=user).exists():
            raise serializers.ValidationError("You have already applied for this job.")

        return attrs