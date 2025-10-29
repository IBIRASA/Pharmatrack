#!/usr/bin/env bash
set -euo pipefail

# Build helper for Render (or local use)
# Usage (from `backend/`): ./build_release.sh

echo "Installing requirements..."
pip install -r requirements.txt

echo "Running migrations..."
cd pharmatrack_backend
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build helper finished."
