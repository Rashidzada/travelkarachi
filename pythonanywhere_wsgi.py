"""
PythonAnywhere WSGI Configuration File Template for TravelKarachi (AeroDesk)
----------------------------------------------------------------------------
Copy and paste this into your PythonAnywhere Web tab -> WSGI configuration file
(e.g. /var/www/yourusername_pythonanywhere_com_wsgi.py), replacing 'yourusername'
with your actual PythonAnywhere username.
"""

import os
import sys

# Replace 'yourusername' with your PythonAnywhere username:
path = '/home/yourusername/travelkarachi'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'travelkarachi_backend.settings'
os.environ['DJANGO_DEBUG'] = 'False'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
