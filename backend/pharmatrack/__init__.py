"""
Compatibility package to satisfy older/incorrect start commands.

Some Render services or old Procfiles may reference `pharmatrack.wsgi:application`.
This package re-exports the real WSGI application from the `pharmatrack_backend`
project so that `gunicorn pharmatrack.wsgi:application` works without changing
Render settings.

This is a low-risk shim and can be removed once the Render service is updated
to use the correct start command (`gunicorn pharmatrack_backend.wsgi:application`).
"""
