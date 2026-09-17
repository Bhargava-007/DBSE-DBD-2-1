@echo off
set "PATH=%APPDATA%\npm;C:\Program Files\Docker\Docker\resources\bin;%PATH%"
echo ========================================================
echo        Starting AlgoFlow Online Judge System
echo ========================================================

:: 1. Ensure MongoDB is running
powershell -Command "if (-not (Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -InformationLevel Quiet)) { Start-Process 'C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe' -ArgumentList '--dbpath \"$env:LOCALAPPDATA\MongoDB\data\" --port 27017' -WindowStyle Hidden; Write-Host '[Database] MongoDB started on port 27017.' -ForegroundColor Green } else { Write-Host '[Database] MongoDB is active on port 27017.' -ForegroundColor Cyan }"

:: 2. Ensure Redis is running
powershell -Command "if (-not (Test-NetConnection -ComputerName 127.0.0.1 -Port 6379 -InformationLevel Quiet)) { Write-Host '[Cache/Queue] Port 6379 inactive. Starting Redis container...' -ForegroundColor Yellow; docker compose up -d redis; Start-Sleep -Seconds 3; if (Test-NetConnection -ComputerName 127.0.0.1 -Port 6379 -InformationLevel Quiet) { Write-Host '[Cache/Queue] Redis container started on port 6379.' -ForegroundColor Green } else { Write-Host '[Cache/Queue] Warning: Redis port 6379 could not be verified. Ensure Docker Desktop is running.' -ForegroundColor Red } } else { Write-Host '[Cache/Queue] Redis is active on port 6379.' -ForegroundColor Cyan }"

timeout /t 2 >nul

echo [1/5] Starting API Gateway on port 4000...
start "API Gateway" cmd /k "cd backend\api-gateway && npm run dev"
timeout /t 3

echo [2/5] Starting Contest Service on port 4001...
start "Contest Service" cmd /k "cd backend\contest-service && npm run dev"
timeout /t 3

echo [3/5] Starting Judge Worker...
start "Judge Worker" cmd /k "cd backend\judge-worker && npm run dev"
timeout /t 3

echo [4/5] Starting Plagiarism Service on port 4002...
start "Plagiarism Service" cmd /k "cd backend\plagiarism-service && npm run dev"
timeout /t 3

echo [5/5] Starting React Frontend on port 5173...
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================================
echo   All services launched! 
echo   Access UI at: http://localhost:5173
echo   API Gateway : http://localhost:4000/api
echo   WebSocket   : http://localhost:4001
echo ========================================================
echo.
pause
