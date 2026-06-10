# Railway Deployment

This deploys the current Express app while the Supabase SaaS backend is prepared.

## Required Variables

Set these in Railway:

```text
HOST=0.0.0.0
PORT=8058
JWT_SECRET=<strong random 48+ byte value>
ALLOW_PUBLIC_ACCESS=true
ALLOWED_ORIGINS=https://your-app-domain.com
JSON_BODY_LIMIT=25mb
MAX_EXCEL_BACKUPS=20
```

## Important

The current Excel backend is suitable for office/LAN or private beta only. For a public SaaS launch, migrate to the Supabase schema in `supabase/migrations` before onboarding external customers.

## Deployment Steps

1. Push this folder to GitHub.
2. Create a Railway project from the GitHub repo.
3. Add the environment variables above.
4. Attach a persistent volume if you temporarily keep `case_master_data.xlsx` on Railway.
5. Move production data to Supabase Postgres before public launch.
