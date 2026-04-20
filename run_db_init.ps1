$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$composeFile = Join-Path $scriptDir "project\docker-compose.yml"

if (-not (Test-Path $composeFile)) {
    throw "Cannot find docker-compose file at: $composeFile"
}

Write-Host "Recreating Docker services for dbms_project..."
docker compose -f $composeFile down -v
docker compose -f $composeFile up -d

Write-Host "Waiting for MySQL to become healthy..."
$deadline = (Get-Date).AddMinutes(3)
$status = ""

while ((Get-Date) -lt $deadline) {
    try {
        $status = (docker inspect dbms_mysql --format "{{.State.Health.Status}}" 2>$null).Trim()
    } catch {
        $status = ""
    }

    if ($status -eq "healthy") {
        break
    }

    Start-Sleep -Seconds 3
}

if ($status -ne "healthy") {
    Write-Host ""
    Write-Host "MySQL failed to become healthy. Showing recent logs:"
    docker logs dbms_mysql --tail 300
    throw "dbms_mysql did not become healthy."
}

Write-Host ""
Write-Host "MySQL is healthy. Current tables in dbms_project:"
docker exec dbms_mysql mysql -uroot -prootpassword -e "USE dbms_project; SHOW TABLES;"

Write-Host ""
Write-Host "Database initialization completed."
