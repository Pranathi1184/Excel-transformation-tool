# Start backend and frontend in separate windows, then open the app in the default browser.
# Run from project root: .\scripts\run-browser.ps1

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$venvPython = Join-Path $backendDir "venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
  Write-Host "Backend venv not found. Run: cd backend; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt"
  exit 1
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; & '$venvPython' -m uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"

Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"
Write-Host "Backend and frontend started in new windows. Browser opened to http://localhost:5173"
