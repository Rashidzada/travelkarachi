"""
WSGI config for travelkarachi_backend project.
Ready for PythonAnywhere and Gunicorn deployments.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travelkarachi_backend.settings')

application = get_wsgi_application()
