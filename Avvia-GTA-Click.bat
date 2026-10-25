@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Installa Node.js da nodejs.org, poi riprova.
  pause
  exit /b 1
)
echo Apri http://localhost:8080 nel browser.
node scripts\serve.mjs
pause
