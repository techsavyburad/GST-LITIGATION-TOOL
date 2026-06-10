@echo off
cd /d "%~dp0"
set HOST=0.0.0.0
set PORT=8058
echo Starting GST Litigation office server...
echo.
node server.js
echo.
echo Server stopped. Press any key to close this window.
pause >nul
