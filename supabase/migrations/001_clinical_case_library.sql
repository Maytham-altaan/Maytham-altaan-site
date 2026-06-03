-- Clinical Case Library — Phase 1 schema
-- Run this in the Supabase SQL Editor after creating your project.
-- (Project → SQL Editor → New query → paste → Run.)

-- ────────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────────

create table if not exists public.cases (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),

  -- Core content
  title_en        text not null,
  title_ar        text,
  summary_en      text not null,
  summary_ar      text,

  -- Categorization (multi-filter)
  specialty       text not null,
  case_type       text not null check (case_type in ('rare-presentation','drug-toxicity','complication','diagnostic-challenge','adverse-event','other')),
  drug            text,
  outcome         text check (outcome in ('survived','deceased','ongoing','unknown')),

  -- Anonymized patient demographics
  patient_age     int,
  patient_sex     text check (patient_sex in ('M','F','other','unspecified')),

  -- Long-form clinical sections (plain text, may contain newlines)
  presentation    text not null,
  investigations  text,
  diagnosis       text,
  treatment       text,
  case_outcome    text,
  learning_points text,
  references_text text,

  -- Consent file (link into storage bucket 'consents')
  consent_path    text not null,

  -- Submitter info
  submitter_name        text not null,
  submitter_email       text not null,
  submitter_affiliation text,
  show_author           boolean not null default true,
  display_author        text,  -- computed at approval time

  -- Review metadata
  reviewed_by      uuid references auth.users(id),
  reviewed_at      timestamptz,
  reviewer_notes   text,

  submitted_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists cases_status_idx       on public.cases(status);
create index if not exists cases_specialty_idx    on public.cases(specialty);
create index if not exists cases_case_type_idx    on public.cases(case_type);
create index if not exists cases_outcome_idx      on public.cases(outcome);
create index if not exists cases_submitted_at_idx on public.cases(submitted_at desc);

-- ────────────────────────────────────────────────────────────────

create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  case_id      uuid not null references public.cases(id) on delete cascade,
  author_id    uuid not null references auth.users(id),
  author_name  text not null, -- snapshot at post time
  body         text not null check (char_length(body) <= 4000),
  is_hidden    boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists comments_case_idx    on public.comments(case_id, created_at);
create index if not exists comments_author_idx  on public.comments(author_id);

-- ────────────────────────────────────────────────────────────────

create table if not exists public.reviewers (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid unique not null references auth.users(id),
  email        text unique not null,
  display_name text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Seed Maytham as the founding reviewer the first time his auth user is created.
-- (You may have to update this row manually after he signs in once; magic-link
--  flow creates the auth.users entry the first time he authenticates.)

-- ────────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────────
-- Create a private bucket 'consents' for the consent PDFs.
-- Run this in the SQL Editor too (or create it via Storage UI).

insert into storage.buckets (id, name, public)
values ('consents', 'consents', false)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────
-- ROW-LEVEL SECURITY
-- ────────────────────────────────────────────────────────────────

alter table public.cases    enable row level security;
alter table public.comments enable row level security;
alter table public.reviewers enable row level security;

-- Public can read approved cases only.
create policy "public can read approved cases"
  on public.cases for select
  using (status = 'approved');

-- Reviewers can read all cases.
create policy "reviewers can read all cases"
  on public.cases for select
  using (
    exists (select 1 from public.reviewers r where r.user_id = auth.uid() and r.is_active)
  );

-- Submission is via server (service role) — no public insert policy needed,
-- but allow logged-out submission via the service-role-backed API route only.

-- Reviewers can update cases (approve / reject).
create policy "reviewers can update cases"
  on public.cases for update
  using (
    exists (select 1 from public.reviewers r where r.user_id = auth.uid() and r.is_active)
  );

-- Public can read non-hidden comments for approved cases.
create policy "public can read visible comments"
  on public.comments for select
  using (
    not is_hidden and exists (
      select 1 from public.cases c where c.id = case_id and c.status = 'approved'
    )
  );

-- Authenticated users can post comments on approved cases.
create policy "authed users can post comments"
  on public.comments for insert
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.cases c where c.id = case_id and c.status = 'approved')
  );

-- Authors can hide / delete their own comments; reviewers can hide any.
create policy "authors can update own comments"
  on public.comments for update
  using (author_id = auth.uid());
create policy "reviewers can update any comment"
  on public.comments for update
  using (
    exists (select 1 from public.reviewers r where r.user_id = auth.uid() and r.is_active)
  );

-- Reviewers table: only reviewers can see the list.
create policy "reviewers can read reviewers"
  on public.reviewers for select
  using (
    exists (select 1 from public.reviewers r2 where r2.user_id = auth.uid() and r2.is_active)
  );

-- Storage policy: only reviewers can read the consents bucket;
-- service role (server) writes during submission.
create policy "reviewers can read consents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'consents'
    and exists (select 1 from public.reviewers r where r.user_id = auth.uid() and r.is_active)
  );

-- ────────────────────────────────────────────────────────────────
-- HELPERS
-- ────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_cases_updated on public.cases;
create trigger trg_cases_updated before update on public.cases
for each row execute function public.set_updated_at();
