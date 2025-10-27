"""Top-level compatibility package so `import pharmatrack.wsgi` works from repo root.

This package delegates to the real Django project under
`backend/pharmatrack_backend`. It's a small shim created to make deployments
that expect `pharmatrack.wsgi:application` succeed regardless of the service's
working directory or PYTHONPATH.

Remove this shim once the service is updated to use
`pharmatrack_backend.wsgi:application` directly.
"""
