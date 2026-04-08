#!/bin/bash
# =============================================================
# Database Initialization Script
# Runs SQL files in order: table -> procedure -> seed
# =============================================================
set -e

MYSQL_CMD="mysql -u root -p${MYSQL_ROOT_PASSWORD}"
ERRORS=0

run_folder() {
    local LABEL=$1
    local FOLDER=$2
    local FILES
    FILES=$(ls "$FOLDER"/*.sql 2>/dev/null | sort || true)

    if [ -z "$FILES" ]; then
        echo "  [SKIP] No .sql files found in $FOLDER"
        return
    fi

    for f in $FILES; do
        echo "  --> $f"
        if ! $MYSQL_CMD < "$f"; then
            echo "  [WARN] $f returned an error (continuing)"
            ERRORS=$((ERRORS + 1))
        fi
    done
}

echo ""
echo "============================================="
echo " Initializing database: dbms_project"
echo "============================================="

echo ""
echo "[1/3] Creating tables..."
run_folder "table" /var/database/table

echo ""
echo "[2/3] Creating stored procedures..."
run_folder "procedure" /var/database/procedure

echo ""
echo "[3/3] Seeding data..."
run_folder "seed" /var/database/seed

echo ""
echo "============================================="
if [ "$ERRORS" -gt 0 ]; then
    echo " Initialization done with $ERRORS warning(s)"
else
    echo " Database initialization complete!"
fi
echo "============================================="
echo ""
