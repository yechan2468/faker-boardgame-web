$projectDirectory = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pidFile = Join-Path $projectDirectory '.vite-server.pid'
$viteEntry = Join-Path $projectDirectory 'node_modules\vite\bin\vite.js'

if (-not (Test-Path -LiteralPath $pidFile)) {
    Write-Output 'Frontend is not running.'
    exit 0
}

$processRecord = Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json
$serverPid = [int]$processRecord.pid
$serverProcess = Get-Process -Id $serverPid -ErrorAction SilentlyContinue
if ($serverProcess -and $serverProcess.ProcessName -eq 'node' -and
    $serverProcess.StartTime.ToUniversalTime().Ticks -eq [long]$processRecord.startTimeUtcTicks) {
    Write-Output "Frontend is running at http://localhost:5173/ (PID $serverPid)"
} else {
    Remove-Item -LiteralPath $pidFile -Force
    Write-Output 'Frontend is not running.'
}
