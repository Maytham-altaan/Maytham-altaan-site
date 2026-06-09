-- 003: Case photo, optional consent, and likes.

-- 1. Primary case photo (path inside the public 'case-images' bucket).
alter table public.cases add column if not exists image_path text;

-- 2. Consent is now OPTIONAL. Cases are published anonymized (no patient
--    identifiers); submitters confirm anonymization and may optionally
--    attach a signed consent PDF.
alter table public.cases alter column consent_path drop not null;

-- 3. Likes — one row per (case, user).
create table if not exists public.case_likes (
  case_id    uuid not null references public.cases(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (case_id, user_id)
);
create index if not exists case_likes_case_idx on public.case_likes(case_id);

alter table public.case_likes enable row level security;

-- Anyone can read likes (public engagement counts on public cases).
drop policy if exists "anyone can read case likes" on public.case_likes;
create policy "anyone can read case likes"
  on public.case_likes for select
  using (true);

-- Signed-in users can like / unlike, but only as themselves.
drop policy if exists "users can like" on public.case_likes;
create policy "users can like"
  on public.case_likes for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can unlike" on public.case_likes;
create policy "users can unlike"
  on public.case_likes for delete
  to authenticated
  using (user_id = auth.uid());

-- 4. Public bucket for case photos (served via public URL; writes via
--    the service-role API route only).
insert into storage.buckets (id, name, public)
values ('case-images', 'case-images', true)
on conflict (id) do nothing;
