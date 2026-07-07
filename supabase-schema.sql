create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in (
      'Flooding',
      'Blocked Drain',
      'Poor Drainage',
      'Illegal Dumping',
      'Sanitation Concern',
      'Polluted Water',
      'Unsafe Road',
      'Broken Streetlight',
      'Public Infrastructure',
      'Community Safety'
    )
  ),
  title text not null check (char_length(title) between 3 and 160),
  community text not null check (char_length(community) between 2 and 120),
  location_detail text not null default '',
  description text not null check (char_length(description) >= 20),
  urgency text not null check (urgency in ('Low', 'Medium', 'High', 'Emergency')),
  status text not null default 'needs_review' check (
    status in (
      'needs_review',
      'verified',
      'assigned',
      'in_progress',
      'resolved',
      'rejected',
      'duplicate',
      'needs_more_information'
    )
  ),
  public_visibility text not null default 'under_review' check (
    public_visibility in ('under_review', 'public', 'hidden', 'rejected')
  ),
  service_area text not null,
  danger_noted boolean not null default false,
  evidence_label text,
  evidence_file_name text,
  evidence_file_path text,
  evidence_public_url text,
  evidence_mime_type text,
  evidence_size_bytes integer,
  contact_preference text,
  reporter_name text,
  reporter_contact text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_urgency_idx on public.reports (urgency);
create index if not exists reports_category_idx on public.reports (category);
create index if not exists reports_community_idx on public.reports (community);

alter table public.reports add column if not exists evidence_file_name text;
alter table public.reports add column if not exists evidence_file_path text;
alter table public.reports add column if not exists evidence_public_url text;
alter table public.reports add column if not exists evidence_mime_type text;
alter table public.reports add column if not exists evidence_size_bytes integer;
alter table public.reports add column if not exists contact_preference text;
alter table public.reports add column if not exists reporter_name text;
alter table public.reports add column if not exists reporter_contact text;
alter table public.reports add column if not exists public_visibility text;

alter table public.reports alter column status set default 'needs_review';
alter table public.reports drop constraint if exists reports_status_check;

update public.reports
set status = case status
  when 'Logged' then 'needs_review'
  when 'Needs review' then 'needs_review'
  when 'In review' then 'verified'
  when 'Open' then 'assigned'
  when 'Resolved' then 'resolved'
  else status
end;

alter table public.reports add constraint reports_status_check check (
  status in (
    'needs_review',
    'verified',
    'assigned',
    'in_progress',
    'resolved',
    'rejected',
    'duplicate',
    'needs_more_information'
  )
);

update public.reports
set public_visibility = case
  when status = 'rejected' then 'rejected'
  else 'public'
end
where public_visibility is null;

alter table public.reports alter column public_visibility set default 'under_review';
alter table public.reports alter column public_visibility set not null;
alter table public.reports drop constraint if exists reports_public_visibility_check;
alter table public.reports add constraint reports_public_visibility_check check (
  public_visibility in ('under_review', 'public', 'hidden', 'rejected')
);

create index if not exists reports_public_visibility_idx on public.reports (public_visibility);

drop view if exists public.public_reports;

create view public.public_reports as
select
  id,
  category,
  title,
  community,
  location_detail,
  description,
  urgency,
  status,
  public_visibility,
  service_area,
  danger_noted,
  evidence_label,
  evidence_file_name,
  evidence_file_path,
  evidence_public_url,
  evidence_mime_type,
  evidence_size_bytes,
  latitude,
  longitude,
  created_at
from public.reports
where public_visibility in ('under_review', 'public')
  and status <> 'rejected';

create or replace view public.public_report_dashboard_summary as
select
  count(*)::integer as total_submitted_reports,
  count(*) filter (
    where public_visibility not in ('hidden', 'rejected')
      and status <> 'rejected'
      and status = 'needs_review'
  )::integer as awaiting_review_reports,
  count(*) filter (
    where public_visibility not in ('hidden', 'rejected')
      and status <> 'rejected'
      and status = 'assigned'
  )::integer as assigned_reports,
  count(*) filter (
    where public_visibility not in ('hidden', 'rejected')
      and status <> 'rejected'
      and status = 'in_progress'
  )::integer as in_progress_reports,
  count(*) filter (
    where public_visibility not in ('hidden', 'rejected')
      and status <> 'rejected'
      and status = 'resolved'
  )::integer as resolved_reports,
  count(*) filter (
    where public_visibility = 'rejected'
      or status = 'rejected'
  )::integer as rejected_reports,
  count(*) filter (
    where public_visibility = 'hidden'
  )::integer as hidden_reports
from public.reports;

create or replace function public.is_report_publicly_visible(report_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reports
    where id = report_uuid
      and public_visibility in ('under_review', 'public')
      and status <> 'rejected'
  );
$$;

create table if not exists public.report_evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  public_url text,
  file_size integer,
  mime_type text,
  created_at timestamptz default now()
);

create index if not exists report_evidence_report_id_idx on public.report_evidence (report_id);
create index if not exists report_evidence_created_at_idx on public.report_evidence (created_at);

create table if not exists public.report_updates (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  status text,
  note text,
  responsible_service_area text,
  is_public boolean not null default true,
  created_at timestamptz default now()
);

alter table public.report_updates add column if not exists is_public boolean;
alter table public.report_updates alter column is_public set default true;
update public.report_updates set is_public = true where is_public is null;
alter table public.report_updates alter column is_public set not null;

create index if not exists report_updates_report_id_idx on public.report_updates (report_id);
create index if not exists report_updates_created_at_idx on public.report_updates (created_at desc);
create index if not exists report_updates_public_idx on public.report_updates (is_public);

alter table public.reports enable row level security;
alter table public.report_evidence enable row level security;
alter table public.report_updates enable row level security;

drop policy if exists "Reports are publicly readable" on public.reports;
drop policy if exists "Anyone can submit reports" on public.reports;
drop policy if exists "Report evidence records are publicly readable" on public.report_evidence;
drop policy if exists "Anyone can add report evidence records" on public.report_evidence;
drop policy if exists "Public report updates are readable" on public.report_updates;

create policy "Anyone can submit reports"
on public.reports
for insert
to anon, authenticated
with check (
  category in (
    'Flooding',
    'Blocked Drain',
    'Poor Drainage',
    'Illegal Dumping',
    'Sanitation Concern',
    'Polluted Water',
    'Unsafe Road',
    'Broken Streetlight',
    'Public Infrastructure',
    'Community Safety'
  )
  and urgency in ('Low', 'Medium', 'High', 'Emergency')
  and status = 'needs_review'
  and public_visibility = 'under_review'
  and (contact_preference is null or char_length(contact_preference) <= 120)
  and (reporter_name is null or char_length(reporter_name) <= 160)
  and (reporter_contact is null or char_length(reporter_contact) <= 240)
  and (
    contact_preference is distinct from 'Contact me for follow-up'
    or nullif(btrim(reporter_contact), '') is not null
  )
);

create policy "Report evidence records are publicly readable"
on public.report_evidence
for select
to anon, authenticated
using (public.is_report_publicly_visible(report_id));

create policy "Anyone can add report evidence records"
on public.report_evidence
for insert
to anon, authenticated
with check (true);

create policy "Public report updates are readable"
on public.report_updates
for select
to anon, authenticated
using (is_public = true and public.is_report_publicly_visible(report_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-evidence',
  'report-evidence',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Report evidence images are publicly readable" on storage.objects;
drop policy if exists "Anyone can upload report evidence images" on storage.objects;

create policy "Report evidence images are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'report-evidence');

create policy "Anyone can upload report evidence images"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'report-evidence'
  and (storage.foldername(name))[1] = 'reports'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

grant usage on schema public to anon, authenticated;
revoke all on function public.is_report_publicly_visible(uuid) from public;
grant execute on function public.is_report_publicly_visible(uuid) to anon, authenticated;
revoke select on public.reports from anon, authenticated;
grant insert on public.reports to anon, authenticated;
grant select on public.public_reports to anon, authenticated;
grant select on public.public_report_dashboard_summary to anon, authenticated;
grant select, insert on public.report_evidence to anon, authenticated;
grant select on public.report_updates to anon, authenticated;
