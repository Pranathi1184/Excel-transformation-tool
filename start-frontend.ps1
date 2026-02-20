# Start the Vite frontend
Set-Location $PSScriptRoot\frontend
if (-not (Test-Path node_modules)) {
    Write-Host "Installing dependencies..."
    npm install
}
Write-Host "Starting frontend at http://localhost:5173" -ForegroundColor Green
npm run dev
