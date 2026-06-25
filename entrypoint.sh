#!/bin/sh

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Seeding database with mock data if empty..."
python populate_mock_data.py

echo "Starting Gunicorn server..."
exec gunicorn store_mo.wsgi:application --bind 0.0.0.0:8000
