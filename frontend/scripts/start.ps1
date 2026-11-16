$ErrorActionPreference = 'Stop'
$projectDirectory = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pidFile = Join-Path $projectDirectory '.vite-server.pid'
$viteEntry = Join-Path $projectDirectory 'node_modules\vite\bin\vite.js'

if (Test-Path -LiteralPath $pidFile) {
    $previous = Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json
    $previousProcess = Get-Process -Id ([int]$previous.pid) -ErrorAction SilentlyContinue
    if ($previousProcess -and $previousProcess.ProcessName -eq 'node' -and
        $previousProcess.StartTime.ToUniversalTime().Ticks -eq [long]$previous.startTimeUtcTicks) {
        Write-Output "Frontend is already running at http://localhost:5173/ (PID $($previous.pid))"
        exit 0
    }
    Remove-Item -LiteralPath $pidFile -Force
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { 'C:\Program Files\nodejs\node.exe' }
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Node.js was not found. Add its installation directory to PATH and reopen the terminal.' }
if (-not (Test-Path -LiteralPath $viteEntry)) { throw 'Vite is not installed. Run pnpm install in the frontend directory first.' }

$stdoutLog = Join-Path $projectDirectory 'vite-server.log'
$stderrLog = Join-Path $projectDirectory 'vite-server-error.log'
$serverProcess = Start-Process -FilePath $nodePath `
    -ArgumentList @("`"$viteEntry`"", '--host', '0.0.0.0') `
    -WorkingDirectory $projectDirectory `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog `
    -PassThru

Start-Sleep -Milliseconds 100
$serverProcess = Get-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue
if (-not $serverProcess) {
    throw "Vite exited during startup. Check $stderrLog for details."
}
$processRecord = @{ pid = $serverProcess.Id; startTimeUtcTicks = $serverProcess.StartTime.ToUniversalTime().Ticks }
Set-Content -LiteralPath $pidFile -Value ($processRecord | ConvertTo-Json -Compress) -NoNewline
Start-Sleep -Milliseconds 500
$runningProcess = Get-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue
if (-not $runningProcess -or $runningProcess.ProcessName -ne 'node' -or
    $runningProcess.StartTime.ToUniversalTime().Ticks -ne [long]$processRecord.startTimeUtcTicks) {
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
    throw "Vite exited during startup. Check $stderrLog for details."
}

Write-Output 'Frontend started at http://localhost:5173/'
Write-Output 'Stop it with: pnpm stop'
