#!/usr/bin/env bash
set -euo pipefail

echo "Installing requirements..."
pip install -r requirements.txt

echo "Making migrations..."
python manage.py makemigrations

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build completed successfully!"