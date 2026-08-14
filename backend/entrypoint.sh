#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
# A simpler way in python to check DB readiness:
python << END
import sys
import os
import time
import psycopg2

db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("POSTGRES_USER")
db_pass = os.getenv("POSTGRES_PASSWORD")
db_host = os.getenv("POSTGRES_HOST", "db")
db_port = os.getenv("POSTGRES_PORT", "5432")

max_retries = 30
for i in range(max_retries):
    try:
        if db_name and db_user and db_pass:
            conn = psycopg2.connect(
                dbname=db_name,
                user=db_user,
                password=db_pass,
                host=db_host,
                port=db_port
            )
            conn.close()
            print("PostgreSQL is ready!")
            sys.exit(0)
        else:
            print("PostgreSQL environment variables missing. Proceeding (assuming SQLite).")
            sys.exit(0)
    except psycopg2.OperationalError:
        print(f"Waiting for PostgreSQL... ({i+1}/{max_retries})")
        time.sleep(1)

print("Error: PostgreSQL not available after 30 seconds.")
sys.exit(1)
END

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting server..."
exec "$@"
