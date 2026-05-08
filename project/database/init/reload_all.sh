#!/bin/bash
# =============================================================
# Full Reload Script
# Dùng khi volume đã tồn tại và cần nạp lại toàn bộ SQL
# Chạy bên trong container:
#   docker exec dbms_mysql bash /docker-entrypoint-initdb.d/reload_all.sh
# =============================================================

PASS="${MYSQL_ROOT_PASSWORD:-rootpassword}"
ERRORS=0

run_sql() {
    local f="$1"
    mysql -u root -p"${PASS}" \
        --default-character-set=utf8mb4 \
        --init-command="SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci" \
        dbms_project < "$f" 2>&1
}

run_folder() {
    local LABEL="$1"
    local FOLDER="$2"
    local FILES
    FILES=$(ls "$FOLDER"/*.sql 2>/dev/null | sort || true)

    if [ -z "$FILES" ]; then
        echo "  [SKIP] No .sql files found in $FOLDER"
        return
    fi

    echo ""
    echo "[$LABEL] Loading from $FOLDER ..."
    for f in $FILES; do
        echo "  --> $f"
        OUTPUT=$(run_sql "$f" 2>&1)
        # Show only real errors, skip warnings and expected FK drop errors
        REAL_ERRORS=$(echo "$OUTPUT" | grep -i "error" | grep -iv "warning" || true)
        if [ -n "$REAL_ERRORS" ]; then
            echo "  [WARN] $REAL_ERRORS"
            ERRORS=$((ERRORS + 1))
        fi
    done
}

echo ""
echo "============================================="
echo " Full Reload: dbms_project"
echo "============================================="

run_folder "1/3 Tables"     /var/database/table
run_folder "2/3 Procedures" /var/database/procedure
run_folder "3/3 Seeds"      /var/database/seed

echo ""
echo "============================================="
if [ "$ERRORS" -gt 0 ]; then
    echo " Done with $ERRORS warning(s)"
else
    echo " Reload complete — no errors!"
fi
echo "============================================="
echo ""
