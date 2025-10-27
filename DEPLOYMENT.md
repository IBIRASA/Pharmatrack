Render deployment - Django backend

This repository contains a Django backend in the `backend/` folder and a Vite React frontend in `frontend/`.

This document describes how to deploy the Django backend to Render (https://render.com).

1. Create a new Web Service on Render
   - In Render, click New -> Web Service.
   - Connect your GitHub account and choose the `IBIRASA/Pharmatrack` repository.
   - For "Root Directory", set: `backend` (important — this makes Render run from the backend folder).
   - Branch: select the branch you want to deploy (e.g. `feature` or `main`).

2. Build and Start Commands
   - Build Command:

     ```bash
     pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
     ```

     (Render will use the `runtime.txt` to determine the Python version, or you can set the environment's Python version manually.)

   - Start Command (or use the existing Procfile):
     ```bash
     gunicorn pharmatrack_backend.wsgi:application --log-file -
     ```
     (Procfile in `backend/` already contains this command.)

3. Environment variables (set these in the Render dashboard -> Environment)
   - `SECRET_KEY` (set to a strong random value)
   - `DEBUG` = `False` (for production)
   - `DATABASE_URL` = Render Postgres connection string (if you add a managed DB) OR your DB connection
   - `ALLOWED_HOSTS` = comma-separated hostnames (e.g. `your-service.onrender.com`)
   - Optional production overrides:
     - `SECURE_SSL_REDIRECT` (default True)
     - `SECURE_HSTS_SECONDS` (default 60)
     - `SECURE_HSTS_INCLUDE_SUBDOMAINS` (True/False)
     - `SECURE_HSTS_PRELOAD` (True/False)
   - Other variables used by your project (e.g. `MONGODB_URI`, `MONGODB_DB`, email creds, `VITE_API_URL` for frontend integration).

4. Database notes
   - The repo defaults to SQLite locally. For production use Render's managed Postgres and set `DATABASE_URL` to the provided connection URL; settings already support `DATABASE_URL` via `dj-database-url`.
   - Ensure `psycopg2-binary` is listed in `requirements.txt` (it is).

5. Static files
   - `STATIC_ROOT` is configured (`staticfiles`) and `WhiteNoise` is enabled in middleware and storage uses `CompressedManifestStaticFilesStorage`.
   - The build command above runs `collectstatic` so static files are ready.

6. Postdeploy tasks (optional)
   - After the first deploy, you may want to run database migrations again from Render's shell if needed.

7. Helpful Render settings
   - Health check path: `/` or a lightweight endpoint.
   - Instance type: start with a small instance for testing, then scale.
   - Auto-deploy for the branch (enable if you want automatic deploys on push).

8. Troubleshooting tips
   - If you get template/static find errors, verify `collectstatic` ran and `STATIC_ROOT` exists on the instance.
   - If you see `ALLOWED_HOSTS` errors, make sure the Render service URL is listed in `ALLOWED_HOSTS` env var.
   - For SSL redirect issues when developing, temporarily set `SECURE_SSL_REDIRECT` to `False` (not recommended in production).

9. Summary of required files in this repo
   - `backend/requirements.txt` — lists dependencies (Django, gunicorn, dj-database-url, whitenoise, etc.)
   - `backend/Procfile` — start command for gunicorn
   - `backend/runtime.txt` — Python runtime
   - `backend/pharmatrack_backend/settings.py` — supports env-based configuration and whitenoise

If you want, I can also:

- add a `render.yaml` template to the repo to declare the service for Render's PR/preview environments,
- create a small script to run migrations and collectstatic during build, or
- connect the Render Postgres add-on and add example environment variable values.

Tell me which of those you'd like next and I'll implement it.
