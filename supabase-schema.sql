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
  status text not null default 'Needs review' check (status in ('Logged', 'Needs review', 'In review', 'Open', 'Resolved')),
  service_area text not null,
  danger_noted boolean not null default false,
  evidence_label text,
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

alter table public.reports enable row level security;

drop policy if exists "Reports are publicly readable" on public.reports;
drop policy if exists "Anyone can submit reports" on public.reports;

create policy "Reports are publicly readable"
on public.reports
for select
to anon, authenticated
using (true);

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
  and status in ('Logged', 'Needs review', 'In review', 'Open', 'Resolved')
);

grant usage on schema public to anon, authenticated;
grant select, insert on public.reports to anon, authenticated;

