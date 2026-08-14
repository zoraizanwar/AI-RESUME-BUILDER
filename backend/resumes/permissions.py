from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'resume'):
            return obj.resume.user == request.user
        elif hasattr(obj, 'version'):
            return obj.version.resume.user == request.user
        return False
