@echo off
echo === Starting TravelKarachi (AeroDesk) Full-Stack Server ===
python manage.py migrate
python manage.py seed_data
start "" http://127.0.0.1:8000
python manage.py runserver 127.0.0.1:8000
