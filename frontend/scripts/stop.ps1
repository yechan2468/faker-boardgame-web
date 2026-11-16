$ErrorActionPreference = 'Stop'
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
if (-not $serverProcess -or $serverProcess.ProcessName -ne 'node' -or
    $serverProcess.StartTime.ToUniversalTime().Ticks -ne [long]$processRecord.startTimeUtcTicks) {
    Remove-Item -LiteralPath $pidFile -Force
    Write-Output 'Frontend is not running.'
    exit 0
}

Stop-Process -Id $serverPid -Force
Remove-Item -LiteralPath $pidFile -Force
Write-Output 'Frontend stopped.'
