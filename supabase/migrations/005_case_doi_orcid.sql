-- 005: Professional citation metadata for cases.
-- DOI (assigned at/after publication) and the submitting author's ORCID.
alter table public.cases add column if not exists doi text;
alter table public.cases add column if not exists submitter_orcid text;
