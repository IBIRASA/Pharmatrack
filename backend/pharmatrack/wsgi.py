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

"""Import fallback that ensures the real Django package is importable.

Render may check out the repository with different working directories. The
real Django package `pharmatrack_backend` lives at
`backend/pharmatrack_backend/pharmatrack_backend` in the repository. If Python's
import machinery can't find `pharmatrack_backend`, try adding the parent
directory (`backend/pharmatrack_backend`) to sys.path and import again.

This keeps deployments resilient whether Render runs from the repo root or
from the `backend` subdirectory.
"""


import os
import sys
from django.core.wsgi import get_wsgi_application

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pharmatrack.settings')

application = get_wsgi_application()


