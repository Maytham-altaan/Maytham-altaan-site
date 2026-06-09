-- 004: Star ratings for cases (and, by aggregation, for contributors).

create table if not exists public.case_ratings (
  case_id    uuid not null references public.cases(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rating     int  not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (case_id, user_id)
);
create index if not exists case_ratings_case_idx on public.case_ratings(case_id);

alter table public.case_ratings enable row level security;

-- Anyone can read ratings (needed for public averages).
drop policy if exists "anyone can read case ratings" on public.case_ratings;
create policy "anyone can read case ratings"
  on public.case_ratings for select
  using (true);

-- Signed-in users can rate / change / remove their own rating only.
drop policy if exists "users can rate" on public.case_ratings;
create policy "users can rate"
  on public.case_ratings for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update own rating" on public.case_ratings;
create policy "users can update own rating"
  on public.case_ratings for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "users can remove own rating" on public.case_ratings;
create policy "users can remove own rating"
  on public.case_ratings for delete
  to authenticated
  using (user_id = auth.uid());
