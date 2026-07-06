# EcoCity Ghana

EcoCity Ghana is a civic technology and smart community reporting platform for Ghanaian communities. Residents can report flooding, blocked drains, poor drainage, illegal dumping, sanitation concerns, unsafe roads, broken streetlights, public infrastructure issues, and community safety risks.

The app uses Next.js App Router, TypeScript, Tailwind CSS, MapLibre/MapTiler, and Supabase.

## Report Submission

Residents submit reports at `/report` with category, community, location detail, description, urgency, danger signal, optional evidence images, optional contact preference, and optional map coordinates. New reports are saved with the `needs_review` workflow status.

Reports can include browser location, a dropped map pin, typed-location search, manual coordinates, or only a descriptive location. Reports without coordinates are still saved and reviewed. Evidence images are optional and should only be added when it is safe to collect them.

## Supabase Persistence

Run `supabase-schema.sql` in the Supabase SQL editor before using the app with a live database. The schema creates:

- `reports` for submitted community reports.
- `report_evidence` for multiple uploaded evidence image records linked to reports.
- `report_updates` for public civic response timeline entries.
- `report-evidence` Supabase Storage bucket setup for uploaded evidence images.
- RLS policies that allow public report submission and public reads.
- Public `report_updates` reads only where `is_public = true`.

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

## Map Behavior

`/map` displays reports with valid latitude and longitude as pins. Reports without coordinates appear in a separate “Reports without map location” section, so they remain visible even before mapping is complete.

## Dashboard Analytics

`/dashboard` summarizes total reports, workflow status counts, danger signals, evidence image coverage, high/emergency reports, responsible service areas, and reports needing map location. Empty states explain when no reports have been assigned, resolved, or submitted yet.

## Admin Review Workflow

`/admin` is an MVP review console. Reviewers can filter reports, select a report, inspect attached evidence, update its status, assign a responsible service area, and add a public update note. Saves go through `/api/admin/reports`, which checks `ADMIN_REVIEW_CODE` on the server and uses the Supabase service role key only server-side.

Workflow statuses:

- `needs_review`
- `verified`
- `assigned`
- `in_progress`
- `resolved`
- `rejected`
- `duplicate`
- `needs_more_information`

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
