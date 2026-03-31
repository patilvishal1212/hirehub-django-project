from rest_framework import permissions

class IsEmployer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'EMPLOYER')

class IsSeeker(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'SEEKER')

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `author` or `employer` field.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `author` (for JobPost)
        # or be the job owner (for checking applications - handled in view action)
        return obj.author == request.user if hasattr(obj, 'author') else obj.employer == request.user

class IsApplicant(permissions.BasePermission):
    """
    Only the seeker who applied can view their own application.
    """
    def has_object_permission(self, request, view, obj):
        return obj.applicant == request.user