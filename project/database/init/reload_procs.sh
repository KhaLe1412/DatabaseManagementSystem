#!/bin/sh
# Reload all procedures with utf8mb4_unicode_ci connection collation
# so that procedure parameters/variables get the same collation as tables
PROC_DIR="${1:-/var/database/procedure}"
for f in "$PROC_DIR"/*.sql; do
  [ -f "$f" ] || continue
  echo "--> $f"
  mysql -u root -p"${MYSQL_ROOT_PASSWORD:-rootpassword}" \
    --init-command="SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci; SET collation_connection=utf8mb4_unicode_ci;" \
    --default-character-set=utf8mb4 \
    dbms_project < "$f" 2>&1 | grep -i "error" || true
done
echo "Done reloading all procedures with utf8mb4_unicode_ci."
