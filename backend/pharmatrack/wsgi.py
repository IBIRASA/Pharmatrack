"""
Compatibility WSGI module.

Re-exports the WSGI application from the real Django project located at
`pharmatrack_backend.wsgi`. This allows commands like
`gunicorn pharmatrack.wsgi:application` to work even though the actual
project package is `pharmatrack_backend`.

Note: This is a shim for deployment convenience. Prefer updating the Render
service Start Command or `render.yaml` to use
`gunicorn pharmatrack_backend.wsgi:application --log-file -`.
"""

from pharmatrack_backend.wsgi import application  # re-export the real app

# `application` is now available as pharmatrack.wsgi.application
