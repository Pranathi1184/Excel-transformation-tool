# Start the FastAPI backend
Set-Location $PSScriptRoot\backend
if (-not (Test-Path venv)) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}
.\venv\Scripts\Activate.ps1
Write-Host "Starting backend at http://localhost:8000" -ForegroundColor Green
uvicorn app.main:app --reload --port 8000
