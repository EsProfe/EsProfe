-- EsProfe: consent-aware learning analytics foundation.
-- Run ONCE in Supabase Dashboard -> SQL Editor, after a1-cloud-sync.sql.
-- The public site uses only the anon/publishable key. It never receives a service-role key.

create table if not exists public.student_consents (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  analytics boolean not null default false,
  newsletter boolean not null default false,
  product_updates boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.student_consents enable row level security;

drop policy if exists "Students read their own consents" on public.student_consents;
create policy "Students read their own consents"
  on public.student_consents for select
  using (student_id = auth.uid());

drop policy if exists "Students create their own consents" on public.student_consents;
create policy "Students create their own consents"
  on public.student_consents for insert
  with check (student_id = auth.uid());

drop policy if exists "Students update their own consents" on public.student_consents;
create policy "Students update their own consents"
  on public.student_consents for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create table if not exists public.student_activity_events (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  event_name text not null check (event_name in (
    'account_registered', 'account_signed_in', 'course_opened',
    'lesson_started', 'lesson_completed', 'review_started',
    'review_completed', 'teacher_lesson_started', 'trainer_opened',
    'upgrade_interest'
  )),
  level text check (level is null or level in ('A1', 'A2', 'B1', 'B2')),
  lesson_id text,
  entry_point text check (entry_point is null or entry_point in ('home', 'route', 'search', 'profile', 'direct', 'teacher', 'trainer')),
  context jsonb not null default '{}'::jsonb check (jsonb_typeof(context) = 'object'),
  occurred_at timestamptz not null default now()
);

create index if not exists student_activity_events_student_occurred_idx
  on public.student_activity_events (student_id, occurred_at desc);
create index if not exists student_activity_events_name_occurred_idx
  on public.student_activity_events (event_name, occurred_at desc);

alter table public.student_activity_events enable row level security;

-- A browser may record only its own, consented events. It cannot read event data.
drop policy if exists "Students record consented activity" on public.student_activity_events;
create policy "Students record consented activity"
  on public.student_activity_events for insert
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.student_consents
      where student_consents.student_id = auth.uid()
        and student_consents.analytics = true
    )
  );

-- Server-only aggregate for the future owner dashboard.
-- No e-mail, name, answer text or free-form learner content is returned.
create or replace view public.owner_learning_metrics
with (security_invoker = true) as
select
  count(distinct student_id) as consented_learners,
  count(distinct student_id) filter (where occurred_at >= now() - interval '7 days') as active_last_7_days,
  count(distinct student_id) filter (where occurred_at >= now() - interval '30 days') as active_last_30_days,
  count(*) filter (where event_name = 'account_registered') as registrations_recorded,
  count(*) filter (where event_name = 'lesson_started') as lessons_started,
  count(*) filter (where event_name = 'lesson_completed') as lessons_completed,
  count(*) filter (where event_name = 'review_completed') as reviews_completed,
  count(*) filter (where event_name = 'upgrade_interest') as upgrade_interests
from public.student_activity_events;

revoke all on public.owner_learning_metrics from anon, authenticated;
