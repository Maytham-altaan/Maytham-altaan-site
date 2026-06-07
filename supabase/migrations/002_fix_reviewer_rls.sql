-- 002: Fix infinite-recursion RLS on the reviewers table.
--
-- The original "reviewers can read reviewers" policy (001) queried the
-- reviewers table from within its own USING clause, which Postgres rejects
-- with "infinite recursion detected in policy for relation reviewers".
-- That made currentUserIsReviewer() error out and silently return false,
-- so legitimately-seated reviewers got "Reviewer access required" on
-- /cases/admin.
--
-- Fix: a SECURITY DEFINER helper that bypasses RLS for the reviewer check,
-- and rewrite every policy that referenced the reviewers table to call it.

create or replace function public.is_active_reviewer()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.reviewers
    where user_id = auth.uid() and is_active
  );
$$;

revoke all on function public.is_active_reviewer() from public;
grant execute on function public.is_active_reviewer() to authenticated, anon;

-- Reviewers table: a user can always read their own row (non-recursive),
-- and active reviewers can read the whole list (via the SECURITY DEFINER fn).
drop policy if exists "reviewers can read reviewers" on public.reviewers;
create policy "reviewers can read reviewers"
  on public.reviewers for select
  using (user_id = auth.uid() or public.is_active_reviewer());

-- Cases
drop policy if exists "reviewers can read all cases" on public.cases;
create policy "reviewers can read all cases"
  on public.cases for select
  using (public.is_active_reviewer());

drop policy if exists "reviewers can update cases" on public.cases;
create policy "reviewers can update cases"
  on public.cases for update
  using (public.is_active_reviewer());

-- Comments
drop policy if exists "reviewers can update any comment" on public.comments;
create policy "reviewers can update any comment"
  on public.comments for update
  using (public.is_active_reviewer());

-- Storage: consent PDFs
drop policy if exists "reviewers can read consents" on storage.objects;
create policy "reviewers can read consents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'consents' and public.is_active_reviewer());
