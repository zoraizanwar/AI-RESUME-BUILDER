from django.http import JsonResponse
from django.db import connection
from django.db.utils import OperationalError

def health_check(request):
    """
    Basic health check endpoint.
    Returns 200 OK if the application is running.
    """
    return JsonResponse({'status': 'ok'})

def readiness_check(request):
    """
    Readiness check endpoint.
    Returns 200 OK if the application is running AND can connect to the database.
    """
    try:
        connection.ensure_connection()
        return JsonResponse({'status': 'ready'})
    except OperationalError:
        return JsonResponse({'status': 'unready', 'error': 'Database unavailable'}, status=503)
