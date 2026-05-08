#!/bin/bash
# =============================================================
# Database Initialization Script
# Runs SQL files in order: table -> procedure -> seed
# =============================================================

ERRORS=0

# Use a function instead of a string variable to avoid shell quoting issues
run_sql() {
    local f="$1"
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" \
        --default-character-set=utf8mb4 \
        --init-command="SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci" \
        < "$f" 2>&1
}

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
        if ! run_sql "$f"; then
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
