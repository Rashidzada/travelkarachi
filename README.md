# ✈️ AeroDesk — TravelKarachi (React + Django Full-Stack System)

A complete enterprise **B2B Airline & Travel Agency Management System** featuring the **AeroDesk** React + Tailwind CSS frontend powered by a real **Python Django REST Framework** backend (`travelkarachi_backend` & `api`).

Pre-built (`dist/` included) and pre-configured for **1-minute deployment on PythonAnywhere**, Render, Railway, or any WSGI hosting platform.

---

## 🚀 Quick Start (Local Windows / Mac / Linux)

### Option A: One-Click Local Start (Windows)
Double-click **`start_local.bat`** or run:
```powershell
.\start_local.bat
```
It will automatically run migrations, seed the database, and open **http://127.0.0.1:8000**.

### Option B: Manual Commands (Single Full-Stack Server)
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py collectstatic --noinput
python manage.py runserver 8000
```
- **Full-Stack Web App:** `http://127.0.0.1:8000/`
- **Django Admin Panel:** `http://127.0.0.1:8000/admin/`
- **REST API Root:** `http://127.0.0.1:8000/api/dashboard/`

### Option C: Run Frontend (Vite) & Backend (Django) Separately for Development
```bash
# Terminal 1 — Django Backend (Port 8000)
python manage.py runserver 8000

# Terminal 2 — React Vite Dev Server (Port 5173)
npm install
npm run dev
```
- **Vite Frontend:** `http://127.0.0.1:5173/` (proxies `/api` to `http://127.0.0.1:8000`)

---

## 🔐 Default Login Credentials

| Portal | Email / Username | Password | Role |
| :--- | :--- | :--- | :--- |
| **AeroDesk Web App** | `admin@aerodesk.io` | `adminpassword123` | Super Admin |
| **Django Admin (`/admin/`)** | `admin` | `adminpassword123` | Superuser |

---

## ☁️ Easy Deployment on PythonAnywhere (Step-by-Step)

Because the compiled React frontend (`dist/`) is already included in the repository and served by Django + WhiteNoise, you do **not** need Node.js on PythonAnywhere!

### Step 1: Clone the Repo in a PythonAnywhere Bash Console
Open a **Bash console** on PythonAnywhere and run:
```bash
git clone https://github.com/Rashidzada/travelkarachi.git
cd travelkarachi
mkvirtualenv --python=/usr/bin/python3.10 travelkarachi-venv
bash deploy_pythonanywhere.sh
```
*(Or run `pip install -r requirements.txt && python manage.py migrate && python manage.py seed_data && python manage.py collectstatic --noinput`)*

### Step 2: Configure the PythonAnywhere Web Tab
1. Go to the **Web** tab on PythonAnywhere → **Add a new web app**.
2. Choose **Manual configuration** (not the "Django" wizard) → select **Python 3.10** (or match your virtualenv).
3. Set the paths (replace `yourusername` with your PythonAnywhere username):
   - **Source code:** `/home/yourusername/travelkarachi`
   - **Working directory:** `/home/yourusername/travelkarachi`
   - **Virtualenv:** `/home/yourusername/.virtualenvs/travelkarachi-venv`
4. Click the **WSGI configuration file** link and replace its entire content with the code inside **`pythonanywhere_wsgi.py`**:
   ```python
   import os
   import sys

   path = '/home/yourusername/travelkarachi'
   if path not in sys.path:
       sys.path.insert(0, path)

   os.environ['DJANGO_SETTINGS_MODULE'] = 'travelkarachi_backend.settings'
   os.environ['DJANGO_DEBUG'] = 'False'

   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```
5. Scroll down to **Static files** on the Web tab and add two mappings:
   - **URL:** `/assets/` → **Directory:** `/home/yourusername/travelkarachi/staticfiles`
   - **URL:** `/media/` → **Directory:** `/home/yourusername/travelkarachi/media`
6. Scroll to the top and click the green **Reload** button!

---

## 📂 Project Structure

```text
travelkarachi/
├── manage.py                     # Django CLI entry point
├── requirements.txt              # Python dependencies (Django, DRF, WhiteNoise, CORS)
├── deploy_pythonanywhere.sh      # 1-step PythonAnywhere setup script
├── pythonanywhere_wsgi.py        # Ready-to-copy WSGI config for PythonAnywhere
├── start_local.bat               # 1-click Windows local runner
├── travelkarachi_backend/        # Django project configuration (settings, urls, wsgi)
├── api/                          # Django REST API app (models, views, serializers, seed)
├── src/                          # React + TypeScript + Tailwind CSS frontend source
│   └── app/
│       ├── api.ts                # Frontend REST API client connected to Django
│       ├── App.tsx               # Main application shell & navigation
│       └── components/           # Dashboard, FlightPOS, FlightBookings, Segments, Agents
└── dist/                         # Production build of the React frontend served by Django
```

---

## 🔗 REST API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login/` | Authenticate user & return token |
| `POST` | `/api/auth/logout/` | Invalidate user token |
| `GET` | `/api/dashboard/?period=1Y` | Live KPIs, charts, recent approvals & top agents |
| `GET / POST` | `/api/bookings/` | List all bookings (with filters) or create a new booking |
| `POST` | `/api/bookings/<ref>/update_status/` | Approve, Reject, Issue, or Void a booking |
| `GET` | `/api/bookings/export_csv/` | Download filtered bookings as CSV |
| `GET` | `/api/pos/search/?from=KHI&to=DXB` | Search flights in Flight POS |
| `POST` | `/api/pos/promo/` | Validate promo codes (`AERO20`, `KARACHI50`, `WELCOME10`) |
| `GET / POST` | `/api/segments/` | List or create flight segments |
| `POST` | `/api/segments/<id>/duplicate/` | Duplicate an existing flight segment |
| `GET / POST` | `/api/agents/` | List or create sub-agents |
| `GET` | `/api/reports/` | Revenue by airline & status breakdown |
| `GET / PATCH` | `/api/settings/` | Read or update agency platform settings |
