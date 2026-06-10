# Office LAN Deployment

This version is designed for one central office computer to run the server, while employees use the tool from their browsers on the same office network.

## Recommended Setup

1. Choose one office computer as the server.
2. Keep this project folder on that computer. It may be inside that computer's OneDrive folder for backup, but employees should not run separate synced copies.
3. Start the server by double-clicking `start-office-server.bat` or running:

   ```powershell
   npm run office
   ```

4. Employees should open:

   ```text
   http://SERVER-COMPUTER-NAME:8058/CompanyLogin.aspx
   ```

   This computer:

   ```text
   http://DESKTOP-K84P7C4:8058/CompanyLogin.aspx
   ```

   If the computer name does not resolve from another employee computer, use:

   ```text
   http://192.168.1.14:8058/CompanyLogin.aspx
   ```

## Important Rules

- Only the server computer should write to `case_master_data.xlsx`.
- Employees should use the browser, not their own OneDrive copies of the app.
- Do not keep `case_master_data.xlsx` open in Excel during active use, because Excel can lock the workbook.
- OneDrive should be treated as backup/version history, not as the multi-user database engine.

## Windows Firewall

If employees cannot open the URL, allow TCP port `8058` on the server computer's Windows Firewall for the private office network.

Run PowerShell as Administrator:

```powershell
New-NetFirewallRule -DisplayName "GST Litigation Office Server 8058" -Direction Inbound -Protocol TCP -LocalPort 8058 -Action Allow -Profile Private
```

Or right-click `allow-office-firewall-admin.bat` and choose **Run as administrator**.

## Security

The server blocks non-office-network clients by default. It allows localhost and private LAN IP ranges only.

Do not expose this server directly to the internet. For outside-office employees, use VPN or a proper cloud deployment with HTTPS and a database backend.
