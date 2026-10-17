-- EsProfe A1: one protected course state per registered student.
-- Run once in Supabase Dashboard → SQL Editor. No service-role key is used by the site.

create table if not exists public.student_a1_state (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  profile jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1 check (schema_version = 1),
  updated_at timestamptz not null default now()
);

alter table public.student_a1_state enable row level security;

drop policy if exists "Students read their A1 state" on public.student_a1_state;
create policy "Students read their A1 state"
  on public.student_a1_state for select
  using (student_id = auth.uid());

drop policy if exists "Students create their A1 state" on public.student_a1_state;
create policy "Students create their A1 state"
  on public.student_a1_state for insert
  with check (student_id = auth.uid());

drop policy if exists "Students update their A1 state" on public.student_a1_state;
create policy "Students update their A1 state"
  on public.student_a1_state for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- These owner-only dashboard views contain no emails or answer text.
create or replace view public.owner_a1_metrics as
select
  count(*) as personal_learners,
  count(*) filter (where updated_at >= now() - interval '7 days') as active_last_7_days,
  count(*) filter (where updated_at >= now() - interval '30 days') as active_last_30_days,
  coalesce(avg(jsonb_array_length(coalesce(profile->'completedLessons','[]'::jsonb))),0) as avg_completed_lessons
from public.student_a1_state;

revoke all on public.owner_a1_metrics from anon, authenticated;
