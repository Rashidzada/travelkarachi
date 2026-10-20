"""
PythonAnywhere WSGI Configuration File for TravelKarachi (AeroDesk)
Account: travelkarachi (https://travelkarachi.pythonanywhere.com)
"""

import os
import sys

path = '/home/travelkarachi/travelkarachi'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'travelkarachi_backend.settings'
os.environ['DJANGO_DEBUG'] = 'False'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
