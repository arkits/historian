set -e

DB_NAME="historian"

psql -c "DROP DATABASE IF EXISTS ${DB_NAME};"
psql -c "CREATE DATABASE ${DB_NAME};"
