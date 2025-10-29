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

import importlib
import os
import sys

try:
	# Preferred import when package is already on sys.path
	from pharmatrack.wsgi import application  # type: ignore
except ModuleNotFoundError:
	# Compute candidate path: <repo-root>/backend/pharmatrack_backend
	this_dir = os.path.dirname(os.path.abspath(__file__))  # .../backend/pharmatrack
	candidate = os.path.abspath(os.path.join(this_dir, '..', 'pharmatrack_backend'))
	if os.path.isdir(candidate) and candidate not in sys.path:
		sys.path.insert(0, candidate)
	# Try importing the module by name now that sys.path may include the package
	module = importlib.import_module('pharmatrack.wsgi')
	application = getattr(module, 'application')

# `application` is now available as pharmatrack.wsgi.application
