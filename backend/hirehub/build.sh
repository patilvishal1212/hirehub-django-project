#!/usr/bin/env bash

pip install -r requirments.txt

python manage.py collectstatic --noinput

python manage.py migrate