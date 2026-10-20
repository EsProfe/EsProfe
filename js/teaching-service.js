/* All authorization is enforced again in Postgres; no role comes from form data. */
(function(root){
 'use strict';
 const failure=code=>Object.assign(new Error(code),{code});
 function create(client,account){
  async function owner(){if(!client||!account.user)throw failure('signin');const current=account.user.id;
   const {data,error}=await client.auth.getUser();if(error)throw error;
   if(!data.user||data.user.id!==current||account.user?.id!==current)throw failure('changed');return current;}
  async function request(run){const id=await owner(),result=await run(id);if(account.user?.id!==id)throw failure('changed');
   if(result.error)throw result.error;return result.data;}
  const rpc=(name,params)=>request(()=>client.rpc(name,params));
  async function role(){return !!(await request(id=>client.from('teaching_teachers').select('user_id').eq('user_id',id).maybeSingle()));}
  function students(offset=0){return request(id=>client.from('teaching_students').select('student_id,display_name,created_at').eq('teacher_id',id).order('created_at',{ascending:false}).order('student_id').range(offset,offset+49));}
  function reports(studentId,offset=0){return request(id=>client.from('teaching_reports').select('id,student_id,lesson_id,language,version,created_at,updated_at,done:snapshot->done,total:snapshot->total,first_correct:snapshot->firstCorrect,unresolved:snapshot->unresolved,complete:snapshot->complete')
   .eq('student_id',studentId||id).order('updated_at',{ascending:false}).order('id').range(offset,offset+19));}
  function report(id){return request(()=>client.from('teaching_reports').select('*').eq('id',id).single());}
  function feedback(id){return request(()=>client.from('teaching_feedback').select('teacher_id,note,corrections,version,updated_at').eq('report_id',id));}
  function saveReport({id,lessonId,language,snapshot,version,saveId}){return rpc('teaching_save_report',{p_id:id,p_lesson:lessonId,p_language:language,p_snapshot:snapshot,p_version:version,p_save_id:saveId});}
  function saveFeedback(id,note,corrections,version){return rpc('teaching_save_feedback',{p_report:id,p_note:note,p_corrections:corrections,p_version:version});}
  return Object.freeze({role,students,reports,report,feedback,saveReport,saveFeedback,
   createInvite:()=>rpc('teaching_create_invite'),join:(code,name)=>rpc('teaching_join',{p_code:code,p_name:name}),
   teachers:()=>rpc('teaching_my_teachers'),unlink:(teacher,student)=>rpc('teaching_unlink',{p_teacher:teacher,p_student:student})});
 }
 root.EsProfeTeaching=Object.freeze({create});
 if(typeof module!=='undefined')module.exports=root.EsProfeTeaching;
})(typeof window==='undefined'?globalThis:window);
