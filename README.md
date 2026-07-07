# EcoCity Ghana

EcoCity Ghana is a civic technology and smart community reporting platform for Ghanaian communities. Residents can report flooding, blocked drains, poor drainage, illegal dumping, sanitation concerns, unsafe roads, broken streetlights, public infrastructure issues, and community safety risks.

The app uses Next.js App Router, TypeScript, Tailwind CSS, MapLibre/MapTiler, and Supabase.

## Report Submission

Residents submit reports at `/report` with category, community, location detail, description, urgency, danger signal, optional evidence images, optional contact preference, and optional map coordinates. New reports are saved with the `needs_review` workflow status and `under_review` public visibility. Public pages label these reports as awaiting review/submitted for review so they do not appear as official verified reports.

Reports can include browser location, a dropped map pin, typed-location search, manual coordinates, or only a descriptive location. Reports without coordinates are still saved and reviewed. Evidence images are optional and should only be added when it is safe to collect them.

## Supabase Persistence

Run `supabase-schema.sql` in the Supabase SQL editor before using the app with a live database. The schema creates:

- `reports` for submitted community reports.
- `report_evidence` for multiple uploaded evidence image records linked to reports.
- `report_updates` for public civic response timeline entries.
- `public_reports` view for public report reads without private reporter contact fields. This view excludes hidden and rejected reports.
- `public_report_dashboard_summary` view for aggregate moderation counts without exposing report/contact details.
- `report-evidence` Supabase Storage bucket setup for uploaded evidence images.
- RLS policies that allow public report submission and public reads through the safe public view.
- Public evidence/update reads only for reports that are still publicly visible.

Public users are not granted report update permissions. Admin status changes are handled by a server-side API route.

## Evidence Images

Evidence images use the Supabase Storage bucket:

```text
report-evidence
```

For the MVP, the bucket is public so evidence images can be displayed on public report pages. That means uploaded evidence is visible to anyone who can view the report. Evidence is optional and should only be collected when it is safe. Citizens should not upload private, unsafe, or sensitive images.

Supported upload types:

- JPG / JPEG
- PNG
- WebP

Each report can attach up to 5 evidence images. The app limits each evidence image upload to 20MB. The SQL schema also configures the bucket with the same file size limit and MIME type list where Supabase Storage supports those bucket settings.

Setup steps:

- Run the updated `supabase-schema.sql`.
- Confirm the `report-evidence` bucket exists in Supabase Storage.
- Keep the bucket public for this MVP, or configure an equivalent public read policy.
- Confirm anonymous users can upload to `report-evidence/reports/...` through the storage policy.
- Confirm anonymous users can insert linked rows into `public.report_evidence` through the RLS policy.

## Public Reports

`/reports` shows the community report register with filters, status badges, urgency badges, service areas, danger signals, and map-location readiness:

- Mapped
- Approximate location only
- Needs map location

Each report links to `/reports/[id]`, which shows the full report details, all attached evidence images if present, and public update timeline.

Reports with `public_visibility = hidden`, `public_visibility = rejected`, or `status = rejected` are excluded from public report pages. Reporter contact preference, name, phone, and email are never selected by the public report view.

## Map Behavior

`/map` displays publicly visible reports with valid latitude and longitude as pins. Reports without coordinates appear in a separate “Reports without map location” section, so they remain visible even before mapping is complete. Hidden and rejected reports are not shown on the public map.

## Dashboard Analytics

`/dashboard` summarizes total submitted reports, awaiting review, assigned, in-progress, resolved, rejected, and hidden counts. Detailed dashboard lists and breakdowns use only publicly visible reports, while the aggregate summary view can count hidden/rejected reports without exposing their contents. Empty states explain when no reports are publicly visible yet.

## Admin Review Workflow

`/admin` is an MVP review console protected by an admin access screen. Reviewers must enter `ADMIN_REVIEW_CODE` before the submitted report dashboard is loaded. The code is checked server-side through `/api/admin/auth`, then a temporary browser-session admin access state unlocks the console for the current session.

After access is verified, reviewers can filter all reports, select a report, inspect attached evidence, view private reporter contact details, update report status, control public visibility, assign a responsible service area, and add public or private review notes. Review actions go through `/api/admin/reports`, which remains protected server-side and uses the Supabase service role key only server-side.

Workflow statuses:

- `needs_review`
- `verified`
- `assigned`
- `in_progress`
- `resolved`
- `rejected`
- `duplicate`
- `needs_more_information`

Public visibility values:

- `under_review`
- `public`
- `hidden`
- `rejected`

New citizen reports default to `under_review`. Admins can hide or reject a report without deleting it or removing review history. Hidden and rejected reports remain visible in the admin console but are excluded from public pages.

## Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key_here
ADMIN_REVIEW_CODE=your_admin_review_code_here
```

Only `NEXT_PUBLIC_*` values are exposed to the browser. Do not use `NEXT_PUBLIC` for `ADMIN_REVIEW_CODE` or `SUPABASE_SERVICE_ROLE_KEY`.

`.env.local` is ignored by Git and should not be committed.

When deploying, add `ADMIN_REVIEW_CODE` and `SUPABASE_SERVICE_ROLE_KEY` to the production environment variables as server-only values. The admin review console will not unlock without `ADMIN_REVIEW_CODE`.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and verify:

- `/`
- `/report`
- `/reports`
- `/reports/[id]`
- `/map`
- `/dashboard`
- `/about`
- `/admin`
