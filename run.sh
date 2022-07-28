#!/bin/bash

#hypercorn dndweb.asgi:application --bind 0.0.0.0:8000
python manage.py runserver 0.0.0.0:8000
