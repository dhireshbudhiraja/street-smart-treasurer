#!/usr/bin/env bash

# Exit immediately if any command fails
set -e

echo "Starting deployment setup..."

# 1. Apply migrations to the database
# The 'collectstatic' command is often better done during the Build process, 
# but migrations MUST happen before the server starts.
sh ./migrate
sh ./train_model
sh ./build_app
sh ./run_app

# 2. Start the Gunicorn web server
# The --bind 0.0.0.0:$PORT is crucial for Render
echo "Starting Gunicorn server..."
exec gunicorn street_smart_treasurer.wsgi:application --bind 0.0.0.0:$PORT