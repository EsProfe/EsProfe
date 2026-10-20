-- Apply in Supabase SQL Editor as the database owner, then grant the teacher role
-- with the separate, verified-email statement in docs/TEACHER_REPORTS.md.
-- No existing profiles, attempts or A1 progress are modified.
begin;
create table if not exists public.teaching_teachers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80)
);
create table if not exists public.teaching_students (
  teacher_id uuid not null references public.teaching_teachers(user_id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  primary key (teacher_id,student_id), check (teacher_id <> student_id)
);
create index if not exists teaching_students_student on public.teaching_students(student_id,teacher_id);
create table if not exists public.teaching_invites (
  code text primary key,
  teacher_id uuid not null references public.teaching_teachers(user_id) on delete cascade,
  expires_at timestamptz not null default now()+interval '7 days',
  used_by uuid references auth.users(id) on delete cascade
);
create table if not exists public.teaching_reports (
  id uuid primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 1 and 120),
  language text not null check (language in ('ru','uk','en','es')),
  snapshot jsonb not null,
  version integer not null check (version>0),
  save_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists teaching_reports_student on public.teaching_reports(student_id,updated_at desc,id);
create table if not exists public.teaching_feedback (
  report_id uuid not null references public.teaching_reports(id) on delete cascade,
  teacher_id uuid not null references public.teaching_teachers(user_id) on delete cascade,
  note text not null default '' check (char_length(note)<=4000),
  corrections jsonb not null default '[]'::jsonb check (jsonb_typeof(corrections)='array' and jsonb_array_length(corrections)<=200),
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (report_id,teacher_id)
);
alter table public.teaching_teachers enable row level security;
alter table public.teaching_students enable row level security;
alter table public.teaching_invites enable row level security;
alter table public.teaching_reports enable row level security;
alter table public.teaching_feedback enable row level security;
revoke all on public.teaching_teachers,public.teaching_students,public.teaching_invites,public.teaching_reports,public.teaching_feedback from anon,authenticated;
grant select on public.teaching_teachers,public.teaching_students,public.teaching_reports,public.teaching_feedback to authenticated;
-- Role assignment and all writes go through owner-controlled SQL or checked RPCs.
drop policy if exists teaching_teacher_self on public.teaching_teachers;
create policy teaching_teacher_self on public.teaching_teachers for select to authenticated using (user_id=auth.uid());
drop policy if exists teaching_student_parties on public.teaching_students;
create policy teaching_student_parties on public.teaching_students for select to authenticated using (teacher_id=auth.uid() or student_id=auth.uid());
drop policy if exists teaching_report_read on public.teaching_reports;
create policy teaching_report_read on public.teaching_reports for select to authenticated using (
 student_id=auth.uid() or exists(select 1 from public.teaching_students s where s.student_id=teaching_reports.student_id and s.teacher_id=auth.uid())
);
drop policy if exists teaching_feedback_read on public.teaching_feedback;
create policy teaching_feedback_read on public.teaching_feedback for select to authenticated using (
 exists(select 1 from public.teaching_reports r where r.id=report_id and (
 r.student_id=auth.uid() or (teacher_id=auth.uid() and exists(select 1 from public.teaching_students s where s.student_id=r.student_id and s.teacher_id=auth.uid()))))
);
create or replace function public.teaching_create_invite() returns jsonb
language plpgsql security definer set search_path='' as $$
declare token text;begin
 if auth.uid() is null or not exists(select 1 from public.teaching_teachers where user_id=auth.uid()) then raise exception 'teacher_required' using errcode='42501';end if;
 -- A cryptographically random 122-bit UUID token; invites are never selectable by clients.
 token:=replace(pg_catalog.gen_random_uuid()::text,'-','');
 insert into public.teaching_invites(code,teacher_id) values(token,auth.uid());
 return jsonb_build_object('code',token,'expires_at',now()+interval '7 days');
end;$$;
create or replace function public.teaching_join(p_code text,p_name text) returns void
language plpgsql security definer set search_path='' as $$
declare invite public.teaching_invites;begin
 if auth.uid() is null then raise exception 'signin' using errcode='42501';end if;
 if char_length(trim(p_name)) not between 1 and 80 then raise exception 'invalid_name';end if;
 select * into invite from public.teaching_invites where code=lower(trim(p_code)) for update;
 if not found or invite.expires_at<now() or (invite.used_by is not null and invite.used_by<>auth.uid()) or invite.teacher_id=auth.uid() then raise exception 'invalid_invite';end if;
 insert into public.teaching_students(teacher_id,student_id,display_name) values(invite.teacher_id,auth.uid(),trim(p_name))
 on conflict(teacher_id,student_id) do update set display_name=excluded.display_name;
 update public.teaching_invites set used_by=auth.uid() where code=invite.code;
end;$$;
create or replace function public.teaching_my_teachers() returns table(teacher_id uuid,display_name text)
language sql security definer set search_path='' as $$
 select t.user_id,t.display_name from public.teaching_teachers t join public.teaching_students s on s.teacher_id=t.user_id where s.student_id=auth.uid();
$$;
create or replace function public.teaching_unlink(p_teacher uuid,p_student uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or auth.uid() not in (p_teacher,p_student) then raise exception 'forbidden' using errcode='42501';end if;
 delete from public.teaching_students where teacher_id=p_teacher and student_id=p_student;
 -- A revoked pairing cannot be silently restored using an old code.
 delete from public.teaching_invites where teacher_id=p_teacher and used_by=p_student;
end;$$;
create or replace function public.teaching_save_report(p_id uuid,p_lesson text,p_language text,p_snapshot jsonb,p_version integer,p_save_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare previous public.teaching_reports; n integer;begin
 if auth.uid() is null then raise exception 'signin' using errcode='42501';end if;
 if p_id is null or p_save_id is null or p_version is null or p_version<0 or p_lesson is null or char_length(p_lesson) not between 1 and 120 or p_language is null or p_language not in ('ru','uk','en','es') then raise exception 'invalid_report';end if;
 if p_snapshot is null or jsonb_typeof(p_snapshot)<>'object' or octet_length(p_snapshot::text)>240000
 or p_snapshot->>'schemaVersion' is distinct from '1' or jsonb_typeof(p_snapshot->'tasks') is distinct from 'array'
 or jsonb_typeof(p_snapshot->'own') is distinct from 'array' then raise exception 'invalid_report';end if;
 if jsonb_array_length(p_snapshot->'tasks')>200 or jsonb_array_length(p_snapshot->'own')<>3 then raise exception 'invalid_report';end if;
 if jsonb_typeof(p_snapshot->'resume') is distinct from 'object'
 or exists(select 1 from jsonb_array_elements(p_snapshot->'own') o where jsonb_typeof(o)<>'string' or char_length(o#>>'{}')>2000)
 or exists(select 1 from jsonb_array_elements(p_snapshot->'tasks') t where jsonb_typeof(t)<>'object'
 or t->>'id' is null or char_length(t->>'id') not between 1 and 120
 or jsonb_typeof(t->'firstCorrect') is distinct from 'boolean' or jsonb_typeof(t->'lastCorrect') is distinct from 'boolean'
 or jsonb_typeof(t->'resolved') is distinct from 'boolean' or jsonb_typeof(t->'history') is distinct from 'array'
 or jsonb_typeof(t->'firstAnswer') is distinct from 'string' or jsonb_typeof(t->'lastAnswer') is distinct from 'string'
 or jsonb_typeof(t->'expected') is distinct from 'string' or jsonb_typeof(t->'prompt') is distinct from 'string'
 or char_length(t->>'firstAnswer')>2000 or char_length(t->>'lastAnswer')>2000 or char_length(t->>'expected')>2000 or char_length(t->>'prompt')>2000)
 then raise exception 'invalid_report';end if;
 if exists(select 1 from jsonb_array_elements(p_snapshot->'tasks') t where jsonb_array_length(t->'history')>20)
 or (select count(*) from jsonb_array_elements(p_snapshot->'tasks'))<>(select count(distinct t->>'id') from jsonb_array_elements(p_snapshot->'tasks') t) then raise exception 'invalid_report';end if;
 if jsonb_typeof(p_snapshot->'complete') is distinct from 'boolean'
 or coalesce(p_snapshot->>'total','') !~ '^[0-9]{1,3}$'
 or coalesce(p_snapshot->>'done','') !~ '^[0-9]{1,3}$'
 or coalesce(p_snapshot->>'firstCorrect','') !~ '^[0-9]{1,3}$'
 or coalesce(p_snapshot->>'unresolved','') !~ '^[0-9]{1,3}$' then raise exception 'invalid_report';end if;
 if (p_snapshot->>'total')::integer not between 1 and 200
 or (p_snapshot->>'done')::integer<>jsonb_array_length(p_snapshot->'tasks')
 or (p_snapshot->>'done')::integer>(p_snapshot->>'total')::integer
 or (p_snapshot->>'firstCorrect')::integer<>(select count(*) from jsonb_array_elements(p_snapshot->'tasks') t where (t->>'firstCorrect')::boolean)
 or (p_snapshot->>'unresolved')::integer<>(select count(*) from jsonb_array_elements(p_snapshot->'tasks') t where not(t->>'firstCorrect')::boolean and not(t->>'resolved')::boolean) then raise exception 'invalid_report';end if;
 -- Serialize writes per attempt, including two concurrent initial saves.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_id::text,0));
 select * into previous from public.teaching_reports where id=p_id for update;
 if found then
  if previous.student_id<>auth.uid() or previous.lesson_id<>p_lesson then raise exception 'forbidden' using errcode='42501';end if;
  if previous.save_id=p_save_id then return jsonb_build_object('version',previous.version,'updated_at',previous.updated_at);end if;
  if previous.version<>p_version then raise exception 'report_conflict' using errcode='40001';end if;
  update public.teaching_reports set snapshot=p_snapshot,language=p_language,version=version+1,save_id=p_save_id,updated_at=now() where id=p_id returning * into previous;
 else
  if p_version<>0 then raise exception 'report_conflict' using errcode='40001';end if;
  insert into public.teaching_reports(id,student_id,lesson_id,language,snapshot,version,save_id) values(p_id,auth.uid(),p_lesson,p_language,p_snapshot,1,p_save_id) returning * into previous;
 end if;
 return jsonb_build_object('version',previous.version,'updated_at',previous.updated_at);
end;$$;
create or replace function public.teaching_save_feedback(p_report uuid,p_note text,p_corrections jsonb,p_version integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare student uuid; result public.teaching_feedback;begin
 if auth.uid() is null or not exists(select 1 from public.teaching_teachers where user_id=auth.uid()) then raise exception 'teacher_required' using errcode='42501';end if;
 select student_id into student from public.teaching_reports where id=p_report;
 if student is null or not exists(select 1 from public.teaching_students s where s.teacher_id=auth.uid() and s.student_id=student) then raise exception 'forbidden' using errcode='42501';end if;
 if p_note is null or char_length(p_note)>4000 or p_version is null or p_version<0 or p_corrections is null or jsonb_typeof(p_corrections)<>'array' or octet_length(p_corrections::text)>80000 then raise exception 'invalid_feedback';end if;
 if jsonb_array_length(p_corrections)>200 or exists(select 1 from jsonb_array_elements(p_corrections) c where
  jsonb_typeof(c)<>'object' or c->>'id' is null or char_length(c->>'comment')>2000 or char_length(c->>'corrected')>2000
  or jsonb_typeof(c->'reviewed') is distinct from 'boolean') then raise exception 'invalid_feedback';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_report::text||auth.uid()::text,1));
 select * into result from public.teaching_feedback where report_id=p_report and teacher_id=auth.uid() for update;
 if found then
  if result.version<>p_version then raise exception 'feedback_conflict' using errcode='40001';end if;
  update public.teaching_feedback set note=p_note,corrections=p_corrections,version=version+1,updated_at=now() where report_id=p_report and teacher_id=auth.uid() returning * into result;
 else
  if p_version<>0 then raise exception 'feedback_conflict' using errcode='40001';end if;
  insert into public.teaching_feedback(report_id,teacher_id,note,corrections) values(p_report,auth.uid(),p_note,p_corrections) returning * into result;
 end if;
 return jsonb_build_object('version',result.version,'updated_at',result.updated_at);
end;$$;
revoke all on function public.teaching_create_invite(),public.teaching_join(text,text),public.teaching_my_teachers(),public.teaching_unlink(uuid,uuid),public.teaching_save_report(uuid,text,text,jsonb,integer,uuid),public.teaching_save_feedback(uuid,text,jsonb,integer) from public,anon;
grant execute on function public.teaching_create_invite(),public.teaching_join(text,text),public.teaching_my_teachers(),public.teaching_unlink(uuid,uuid),public.teaching_save_report(uuid,text,text,jsonb,integer,uuid),public.teaching_save_feedback(uuid,text,jsonb,integer) to authenticated;
commit;
