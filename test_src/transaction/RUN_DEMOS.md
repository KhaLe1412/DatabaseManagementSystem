# Transaction demo scripts

Install dependencies:

```powershell
python -m pip install -r test_src\transaction\requirements.txt
```

Start MySQL and Redis from the repository root:

```powershell
docker compose up -d
```

Run one demo file at a time:

```powershell
python test_src\transaction\test_mysql_success.py
python test_src\transaction\test_mysql_rollback_fail.py
python test_src\transaction\test_redis_multi_exec_success.py
python test_src\transaction\test_redis_lua_success.py
python test_src\transaction\test_redis_lua_fail.py
python test_src\transaction\test_redis_watch_conflict.py
```

Each script prints:

- BEFORE
- RUN
- AFTER
- RESULT
- CLEANUP

By default, touched demo data is restored at the end so the script can be run repeatedly.
To keep the after-state for manual inspection or screenshots:

```powershell
$env:KEEP_DEMO_DATA="1"
python test_src\transaction\test_mysql_success.py
```

Reset cleanup mode:

```powershell
Remove-Item Env:\KEEP_DEMO_DATA
```

Do not run Redis demos in parallel because they intentionally use the same stock keys as the report examples.
