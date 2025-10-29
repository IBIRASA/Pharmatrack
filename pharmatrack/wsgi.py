"""
Top-level WSGI shim that ensures the real WSGI app is importable.

This module will add the backend project directory to sys.path (if needed)
and import `pharmatrack_backend.wsgi.application`, exposing it as
`pharmatrack.wsgi.application`.
"""

import importlib
import os
import sys

try:
    # Try direct import first (if backend package already on sys.path)
    from pharmatrack.wsgi import application  # type: ignore
except Exception:
    # Compute the repo-root path and the backend project path relative to it
    here = os.path.dirname(os.path.abspath(__file__))  # .../Pharmatrack/pharmatrack
    repo_root = os.path.abspath(os.path.join(here, '..'))
    candidate = os.path.join(repo_root, 'backend', 'pharmatrack')
    if os.path.isdir(candidate) and candidate not in sys.path:
        sys.path.insert(0, candidate)
    module = importlib.import_module('pharmatrack.wsgi')
    application = getattr(module, 'application')

# `application` is now available as pharmatrack.wsgi.application
