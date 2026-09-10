@echo off
echo ========================================================
echo        Stopping AlgoFlow Online Judge System
echo ========================================================

echo [1/4] Stopping Node microservices (API Gateway, Worker, WebSockets, Frontend)...
powershell -Command "$ports = @(4000, 4001, 4002, 5173); foreach ($port in $ports) { $pids = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess; if ($pids) { foreach ($p in $pids) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue; Write-Host \"[Service] Terminated process on port $port (PID: $p)\" -ForegroundColor Yellow } } }"

echo [2/4] Stopping Redis Cache Server...
powershell -Command "Get-Process -Name 'redis-server' -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue; Write-Host \"[Cache] Stopped Redis Server (PID: $($_.Id))\" -ForegroundColor Yellow }"

echo [3/4] Stopping MongoDB Database Daemon...
powershell -Command "Get-Process -Name 'mongod' -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue; Write-Host \"[Database] Stopped MongoDB Server (PID: $($_.Id))\" -ForegroundColor Yellow }"

echo [4/4] Cleaning up orphaned Node dev watchers...
taskkill /F /IM node.exe /T >nul 2>&1

echo.
echo ========================================================
echo   All AlgoFlow services have been stopped successfully!
echo ========================================================
echo.
pause
