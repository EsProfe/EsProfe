/* Versioned, bounded learning evidence. No network or DOM dependency. */
(function (root) {
 'use strict';
 const text = value => String(value ?? '').slice(0,2000);
 function build({items, records, own, resume, complete}) {
  const tasks=items.filter(item=>records[item.id]).map(item=>{
   const record=records[item.id], last=record.last||record;
   return {id:item.id,stage:item.stage,prompt:text(item.p),expected:text(item.a),firstAnswer:text(record.picked),firstCorrect:!!record.ok,
    lastAnswer:text(last.picked),lastCorrect:!!last.ok,resolved:!!record.resolved,
    wrongCount:record.wrongCount??(record.history||[]).filter(h=>!h.ok).length,attempts:Math.max(record.attemptCount||record.history?.length||0,1),history:(record.history||[]).slice(-20).map(h=>({answer:text(h.picked),correct:!!h.ok,phase:h.phase||'correction'}))};
  });
  return {schemaVersion:1,total:items.length,done:tasks.length,firstCorrect:tasks.filter(t=>t.firstCorrect).length,
   unresolved:tasks.filter(t=>!t.firstCorrect&&!t.resolved).length,complete:!!complete,tasks,own:own.map(text),resume};
 }
 function restore(row,lessonId='football-adjectives-a1') {
  const snapshot=row.snapshot;
  if(!lessonId||row.lesson_id!==lessonId||snapshot?.schemaVersion!==1||!Array.isArray(snapshot.tasks)||snapshot.own?.length!==3)throw new Error('invalid_report');
  const records=Object.fromEntries(snapshot.tasks.map(t=>[t.id,{picked:t.firstAnswer,ok:t.firstCorrect,answer:t.expected,
   last:{picked:t.lastAnswer,ok:t.lastCorrect,answer:t.expected},resolved:t.resolved,due:0,attemptCount:t.attempts,wrongCount:t.wrongCount,
   history:(t.history||[]).map(h=>({picked:h.answer,ok:h.correct,phase:h.phase,answer:t.expected}))}]));
  return {...snapshot.resume,lang:row.language,runId:row.id,reportVersion:row.version,reportSavedAt:row.updated_at,
   records,own:snapshot.own,savedAttemptId:null};
 }
 root.EsProfeLessonReport=Object.freeze({build,restore});
 if(typeof module!=='undefined')module.exports=root.EsProfeLessonReport;
})(typeof window==='undefined'?globalThis:window);
