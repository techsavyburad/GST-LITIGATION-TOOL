# GST Litigation Pro Architecture

## System Layers

1. Browser UI layer: `index.html`, `style.css`, `app.js`, `features.js`, and `case-files.js` render the workspace, navigation, forms, and dashboards.
2. Client state layer: `DB` in `app.js` keeps a fast `localStorage` cache and syncs approved changes to the backend.
3. Access layer: `Auth` in `app.js` owns the employee session, JWT storage, login screen, logout, and UI-level permission checks.
4. API layer: `server.js` exposes `/api/*` routes and requires authenticated access for case, client, employee, settings, and init operations.
5. Authorization layer: `server.js` scopes records by employee access level before returning or accepting data.
6. Persistence layer: `case_master_data.xlsx` stores Cases, Clients, Employees, and Settings.

## Employee Access Model

- `Partner` and `Admin`: full system access, Employee Master, Settings writes, all cases, and Client Master.
- `Manager`, `Assistant Manager`, and `Article Assistant`: restricted case access. They can see cases allotted to them or cases they created. Client visibility is limited to clients linked with visible cases.

Employees can be granted login access from Employee Master with username, password, role-derived access scope, and active/inactive status. Passwords are saved as bcrypt hashes in Excel.

## First Login

When no employee login has been configured yet, the system allows a bootstrap login:

- Username: `admin`
- Password: `admin123`

Use that once to create real employee login records, then sign out and use those employee credentials.
