const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {PGlite}=require('@electric-sql/pglite');
const teacher='00000000-0000-4000-8000-000000000001',otherTeacher='00000000-0000-4000-8000-000000000002',student='00000000-0000-4000-8000-000000000003',otherStudent='00000000-0000-4000-8000-000000000004';
const report='00000000-0000-4000-8000-000000000005',saveId='00000000-0000-4000-8000-000000000006';
const snapshot={schemaVersion:1,total:45,done:1,firstCorrect:0,unresolved:1,complete:false,tasks:[{id:'w0',prompt:'el jugador + pequeño',expected:'pequeño',firstAnswer:'pequeña',firstCorrect:false,lastAnswer:'pequeña',lastCorrect:false,resolved:false,attempts:1,history:[{answer:'pequeña',correct:false,phase:'first'}]}],own:['','',''],resume:{stage:3,positions:{3:0}}};
test('Postgres enforces teacher consent, private reports, versioned saves and feedback',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;`);
  await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/teacher-reports.sql'),'utf8'));
  for(const id of [teacher,otherTeacher,student,otherStudent])await db.query('insert into auth.users values($1)',[id]);
  await db.query('insert into public.teaching_teachers values($1,$2),($3,$4)',[teacher,'Teacher One',otherTeacher,'Teacher Two']);
  async function as(id){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec('set role '+(id?'authenticated':'anon'));}
  async function denied(fn,pattern){await assert.rejects(fn,pattern)}
  await as(null);await denied(()=>db.query('select * from public.teaching_reports'),/permission denied/);
  await as(student);await denied(()=>db.query('select public.teaching_create_invite()'),/teacher_required/);
  await denied(()=>db.query('insert into public.teaching_teachers values($1,$2)',[student,'Self promoted']),/permission denied/);
  await as(teacher);const invite=(await db.query('select public.teaching_create_invite() as value')).rows[0].value;
  assert.equal(invite.code.length,32);await denied(()=>db.query('select * from public.teaching_invites'),/permission denied/);
  await as(student);await db.query('select public.teaching_join($1,$2)',[invite.code,'Pupil']);
  assert.equal((await db.query('select * from public.teaching_my_teachers()')).rows[0].display_name,'Teacher One');
  await as(otherStudent);await denied(()=>db.query('select public.teaching_join($1,$2)',[invite.code,'Other']),/invalid_invite/);
  await as(student);
  const save=(version=0,id=saveId,payload=snapshot)=>db.query('select public.teaching_save_report($1,$2,$3,$4::jsonb,$5,$6) as value',[report,'football-adjectives-a1','uk',JSON.stringify(payload),version,id]);
  assert.equal((await save()).rows[0].value.version,1);
  assert.equal((await save()).rows[0].value.version,1,'lost response retry is idempotent');
  await denied(()=>save(0,'00000000-0000-4000-8000-000000000007'),/report_conflict/);
  await denied(()=>save(1,'00000000-0000-4000-8000-000000000007',{schemaVersion:1,tasks:{},own:[]}),/invalid_report/);
  await denied(()=>db.query('update public.teaching_reports set student_id=$1',[otherStudent]),/permission denied/);
  await as(otherStudent);assert.equal((await db.query('select * from public.teaching_reports')).rows.length,0);
  await denied(()=>save(1,'00000000-0000-4000-8000-000000000007'),/forbidden/);
  await as(otherTeacher);assert.equal((await db.query('select * from public.teaching_reports')).rows.length,0);
  await denied(()=>db.query('select public.teaching_save_feedback($1,$2,$3::jsonb,$4)',[report,'No access','[]',0]),/forbidden/);
  await as(teacher);assert.equal((await db.query('select * from public.teaching_reports')).rows.length,1);
  await denied(()=>save(1,'00000000-0000-4000-8000-000000000007'),/forbidden/);
  const corrections=[{id:'w0',comment:'Check gender',corrected:'El jugador es pequeño.',reviewed:false}];
  const feedback=await db.query('select public.teaching_save_feedback($1,$2,$3::jsonb,$4) as value',[report,'Practise next lesson',JSON.stringify(corrections),0]);assert.equal(feedback.rows[0].value.version,1);
  await denied(()=>db.query('select public.teaching_save_feedback($1,$2,$3::jsonb,$4)',[report,'Old version','[]',0]),/feedback_conflict/);
  await as(student);assert.equal((await db.query('select * from public.teaching_feedback')).rows[0].note,'Practise next lesson');
  await denied(()=>db.query('select public.teaching_save_feedback($1,$2,$3::jsonb,$4)',[report,'Pretend teacher','[]',1]),/teacher_required/);
  const fixed=structuredClone(snapshot);fixed.tasks[0].lastAnswer='pequeño';fixed.tasks[0].lastCorrect=true;fixed.tasks[0].resolved=true;fixed.unresolved=0;
  assert.equal((await save(1,'00000000-0000-4000-8000-000000000008',fixed)).rows[0].value.version,2);
  assert.equal((await db.query('select snapshot from public.teaching_reports')).rows[0].snapshot.tasks[0].firstAnswer,'pequeña');
  await db.query('select public.teaching_unlink($1,$2)',[teacher,student]);
  await denied(()=>db.query('select public.teaching_join($1,$2)',[invite.code,'Pupil']),/invalid_invite/);
  await as(teacher);assert.equal((await db.query('select * from public.teaching_reports')).rows.length,0);assert.equal((await db.query('select * from public.teaching_feedback')).rows.length,0);
  await denied(()=>db.query('select public.teaching_save_feedback($1,$2,$3::jsonb,$4)',[report,'Access revoked','[]',1]),/forbidden/);
  await as(student);assert.equal((await db.query('select * from public.teaching_reports')).rows.length,1);assert.equal((await db.query('select * from public.teaching_feedback')).rows.length,1);
 }finally{await db.close()}
});
