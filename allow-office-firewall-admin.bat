@echo off
echo Adding Windows Firewall rule for GST Litigation Office Server...
echo This must be run as Administrator.
echo.
netsh advfirewall firewall add rule name="GST Litigation Office Server 8058" dir=in action=allow protocol=TCP localport=8058 remoteip=localsubnet profile=any
echo.
echo Done. Press any key to close.
pause >nul
