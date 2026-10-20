#!/usr/bin/env bash
# One-step setup script for PythonAnywhere Bash Console
set -e

echo "=== Setting up TravelKarachi (AeroDesk) on PythonAnywhere ==="
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py collectstatic --noinput

echo "=== Setup Complete! Now reload your Web App in the PythonAnywhere Web tab. ==="
