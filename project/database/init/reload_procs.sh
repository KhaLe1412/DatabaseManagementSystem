#!/bin/sh
# Reload all procedures with utf8mb4_unicode_ci connection collation
# so that procedure parameters/variables get the same collation as tables
for f in /tmp/procedure/*.sql; do
  echo "--> $f"
  mysql -u root -prootpassword \
    --init-command="SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci; SET collation_connection=utf8mb4_unicode_ci;" \
    --default-character-set=utf8mb4 \
    dbms_project < "$f" 2>&1 | grep -i "error" || true
done
echo "Done reloading all procedures with utf8mb4_unicode_ci."
