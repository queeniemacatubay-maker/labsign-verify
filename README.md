# LabSign Verify — deployable application

This is a full-stack Next.js + Supabase application package, not the earlier browser-only demo. It uses Supabase Auth, a hosted PostgreSQL database, server-side authorization, and Philippine Time (`Asia/Manila`) derived from the database clock.

## Important before clinical use

This application verifies **date authorization only**. It does not establish that a particular patient report is genuine, belongs to the patient, or has not been altered. A shared permanent QR code cannot provide document-level integrity. For that, add a unique report reference and a server-verified cryptographic digest or digital signature.

This package is an implementation starter that must be deployed, configured, tested, and approved by your laboratory/facility before use on actual laboratory results. Do not use it as the sole verification mechanism for patient care or release decisions until your facility has completed security, privacy, operational, and regulatory review.

## What is included

- Administrator login via Supabase Auth (no browser localStorage credentials)
- Pending-by-default accounts; an owner manually promotes the first administrator in SQL
- Daily explicit approval button; no auto-approval on login
- Database-clock date in `Asia/Manila`; duplicate approvals blocked
- Immutable-from-app approval history (no edit/delete UI or direct client write grants)
- Permanent QR destination `/verify`
- Public date check with minimal public information
- Profile/facility settings
- Responsive dashboard and QR download (SVG)

## 1. Create your Supabase account and project

1. Go to https://supabase.com/ and create an account.
2. Create a new project. Save the database password privately.
3. In **Authentication → Providers**, keep Email enabled.
4. In **Authentication → Settings / URL Configuration**, set the Site URL to your eventual Vercel production URL. Disable public sign-ups after you create the administrator account.
5. Open **SQL Editor**, paste and run `supabase/schema.sql`.
6. In **Authentication → Users**, add your administrator email and set a strong password (or use the supported invite flow).
7. Copy the user's UUID from Authentication → Users.
8. In SQL Editor run this, replacing the UUID with your actual Auth user UUID:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = 'PASTE-YOUR-AUTH-USER-UUID-HERE';
   ```

   This manual promotion is intentional. New accounts are pending by default. Never leave public sign-up enabled for a single-admin verification service.

9. From **Project Settings → API**, copy the Project URL and the publishable key (or legacy anon key). Never use or expose the `service_role` key in this app.

## 2. Deploy to Vercel

1. Create a GitHub account at https://github.com/ if you do not already have one.
2. Create a private repository named `labsign-verify`.
3. Upload the contents of this folder to the repository (the files inside this folder, not the outer ZIP folder).
4. Create an account at https://vercel.com/ and choose **Add New → Project**.
5. Import the private GitHub repository. Vercel should detect Next.js.
6. Add these environment variables in Vercel → Project → Settings → Environment Variables:

   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase publishable/anon key
   - `NEXT_PUBLIC_APP_URL` = your final HTTPS Vercel URL, e.g. `https://labsign-verify-yourname.vercel.app`

7. Deploy. If you change `NEXT_PUBLIC_APP_URL`, redeploy so the permanent QR points to the final address.

Official references:
- Supabase SSR authentication: https://supabase.com/docs/guides/auth/server-side
- Supabase Next.js client setup: https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs
- Vercel environment variables: https://vercel.com/docs/environment-variables

## 3. First login and configuration

1. Open `https://YOUR-DEPLOYMENT.vercel.app/login`.
2. Sign in with the administrator account.
3. Open **Profile & facility** and enter your full professional name, designation, and facility/laboratory name.
4. Open **Permanent QR** only after the production URL is set. Download the SVG and test it with a phone.
5. Every working day, sign in and explicitly click **Approve Today's Date**. The approval uses database server time in Philippine Time. Logging in alone does not authorize a date.

## 4. Verification behavior

- The public scanner opens `/verify`.
- The person checks the issuance date printed on the result.
- If that date exists in `date_authorizations`, the page shows AUTHORIZED DATE and the configured signatory/facility details.
- Otherwise, the page shows NOT AUTHORIZED – DATE MISMATCH.
- An approval remains valid for that date when scanned later. Scanning on a later date does not change the issuance date being checked.

## 5. Security and production checklist

Before use with real laboratory results:
- Use a private repository and protect the GitHub/Vercel/Supabase owner accounts with MFA.
- Disable public Auth sign-ups after the admin is provisioned.
- Configure Supabase backups and review retention/recovery options for your plan.
- Add an edge/WAF rate limit to `/api/verify` before public launch.
- Use a custom domain if desired; keep HTTPS enabled.
- Conduct a security review of RLS, RPC permissions, deployment environment, and dependency updates.
- Obtain facility management approval and review applicable Philippine Data Privacy Act, DOH, and professional requirements with the facility's responsible officers.
- Test unauthorized dates, duplicate approval, date rollover at Philippine midnight, expired sessions, database outage, and mobile QR scanning.
- Keep a documented manual fallback if the verification service is unavailable.

## Known scope limits

- Single administrator profile; no multi-facility or multi-signatory workflow.
- No report-specific validation, patient data, report uploads, or document hashes.
- Public verification shows the approver's current profile details. If profile details are changed later, past authorized-date displays will also show the updated profile; use a versioned signatory snapshot feature if historical identity must be frozen.
- No automated external penetration test or independent compliance certification is included.
