from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostViewSet, CompanyViewSet, ApplicationViewSet

router = DefaultRouter()
router.register(r'jobs', JobPostViewSet, basename='job')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
]