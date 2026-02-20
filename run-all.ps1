# Start BOTH backend and frontend in separate windows so the site is reachable at http://localhost:5173
# Alternative: from project root run "npm start" for one terminal with both servers.
# Run this once; leave both windows open. Then open http://localhost:5173 in your browser.

$root = $PSScriptRoot
$backendScript = Join-Path $root "start-backend.ps1"
$frontendScript = Join-Path $root "start-frontend.ps1"

# Ensure .cursor exists so start scripts can write debug log
$cursorDir = Join-Path $root ".cursor"
if (-not (Test-Path $cursorDir)) { New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null }

# Start backend in new window with project root as working directory and Bypass execution policy
Write-Host "Starting backend in a new window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$backendScript`"" -WorkingDirectory $root

Start-Sleep -Seconds 2

# Start frontend in new window with project root as working directory and Bypass execution policy
Write-Host "Starting frontend in a new window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$frontendScript`"" -WorkingDirectory $root

Write-Host ""
Write-Host "Both servers are starting. Open http://localhost:5173 in your browser in a few seconds." -ForegroundColor Green
Write-Host "Leave both server windows open while using the app." -ForegroundColor Yellow
