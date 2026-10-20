/* Batched report sync. A request writes one bounded attempt, never one click. */
(function(root){
 'use strict';
 const copy={
 ru:{save:'Сохранить занятие и ответы',saving:'Сохраняем ответы…',saved:'Ответы сохранены в профиле.',pending:'Изменения пока только на устройстве.',error:'Не удалось сохранить ответы. Они остаются на устройстве; повторите сохранение.',setup:'Сохранение подробных ответов ещё не подключено. Ответы остаются на устройстве.',conflict:'На другом устройстве сохранена более новая версия. Откройте историю занятий и продолжите последнюю версию.',history:'Мои занятия и комментарии преподавателя',guest:'Для сохранения ответов войдите или зарегистрируйтесь. Гостевая попытка переносится отдельной кнопкой.',import:'Перенести гостевое занятие в мой профиль',importAsk:'Это занятие выполняли вы? Перенести его в ваш профиль? Текущая личная попытка останется в сохранённой истории, если вы уже её сохранили.',empty:'Сначала выполните хотя бы одно задание.',dirtyReset:'Есть ответы, не сохранённые в профиле. Сначала сохраните занятие или отмените сброс.',resume:'Продолжить сохранённое занятие',resumeAsk:'Загрузить это сохранённое занятие? Несохранённые ответы текущей попытки останутся только в резервной копии на этом устройстве.',loaded:'Сохранённое занятие загружено.'},
 uk:{save:'Зберегти заняття й відповіді',saving:'Зберігаємо відповіді…',saved:'Відповіді збережено у профілі.',pending:'Зміни поки лише на пристрої.',error:'Не вдалося зберегти відповіді. Вони залишаються на пристрої; повторіть збереження.',setup:'Збереження докладних відповідей ще не підключено. Відповіді залишаються на пристрої.',conflict:'На іншому пристрої збережено новішу версію. Відкрийте історію занять і продовжте останню версію.',history:'Мої заняття й коментарі викладача',guest:'Для збереження відповідей увійдіть або зареєструйтеся. Гостьова спроба переноситься окремою кнопкою.',import:'Перенести гостьове заняття до мого профілю',importAsk:'Це заняття виконували ви? Перенести його до вашого профілю? Поточна персональна спроба залишиться в історії, якщо ви її вже зберегли.',empty:'Спочатку виконайте хоча б одне завдання.',dirtyReset:'Є відповіді, не збережені у профілі. Спочатку збережіть заняття або скасуйте скидання.',resume:'Продовжити збережене заняття',resumeAsk:'Завантажити це збережене заняття? Незбережені поточні відповіді залишаться лише в резервній копії на цьому пристрої.',loaded:'Збережене заняття завантажено.'},
 en:{save:'Save lesson and answers',saving:'Saving answers…',saved:'Answers saved to your profile.',pending:'Changes are only saved on this device.',error:'Answers could not sync. They remain on this device; try saving again.',setup:'Detailed answer storage is not connected yet. Answers remain on this device.',conflict:'A newer version was saved on another device. Open lesson history and continue that version.',history:'My lessons and teacher feedback',guest:'Sign in or register to save answers. Guest work is transferred with a separate button.',import:'Transfer guest lesson to my profile',importAsk:'Did you complete this guest lesson? Transfer it to your profile? Your current personal attempt remains in history only if you already saved it.',empty:'Complete at least one exercise first.',dirtyReset:'Some answers have not synced. Save the lesson before resetting.',resume:'Continue a saved lesson',resumeAsk:'Load this saved lesson? Unsaved current answers will remain only in a local backup.',loaded:'Saved lesson loaded.'}
 };
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function create(options){
  let status='',busy=false,checks=0,timer=null,epoch=0,lastSignature='',pending=null,dirty=false;
  const t=()=>copy[options.language()]||copy.ru;
  const notify=()=>options.statusChanged();
  function prepare(){const s=options.state();const snapshot=root.EsProfeLessonReport.build({items:options.items,records:s.records,own:s.own,
   resume:{stage:s.stage,positions:s.positions,drafts:s.drafts,tokens:s.tokens,modelSeen:s.modelSeen,retrying:s.retrying},complete:options.complete()});
   return {state:s,snapshot,signature:JSON.stringify({id:s.runId,language:s.lang,snapshot})};}
  async function save(){
   if(busy||!options.account.user)return false;
   const p=prepare();if(!p.snapshot.tasks.length&&!p.snapshot.own.some(Boolean)){status=t().empty;notify();return false;}
   if(p.signature===lastSignature){return true;}
   clearTimeout(timer);timer=null;busy=true;status=t().saving;notify();
   const user=options.account.user.id,id=p.state.runId,revision=epoch;
   pending=p.state.reportPending||pending;
   // Retrying a lost response uses exactly the same request and idempotency key.
   if(!pending||pending.id!==id){pending={id,lessonId:options.lessonId,language:p.state.lang,snapshot:p.snapshot,version:p.state.reportVersion||0,saveId:crypto.randomUUID(),signature:p.signature};options.pending(pending);}
   try{
    const result=await options.account.teaching.saveReport(pending);
    if(epoch!==revision||options.account.user?.id!==user||options.state().runId!==id)return false;
    lastSignature=pending.signature;pending=null;options.pending(null);options.saved(result);checks=0;
    dirty=prepare().signature!==lastSignature;options.markDirty(dirty);status=dirty?t().pending:t().saved;return !dirty;
   }catch(error){if(epoch===revision){const code=String(error.code||'');status=/report_conflict/.test(error.message||'')||code==='40001'?t().conflict:['42P01','PGRST202','PGRST205'].includes(code)?t().setup:t().error;}return false;}
   finally{if(epoch===revision){busy=false;notify();if(dirty&&lastSignature&&status===t().pending)schedule();}}
  }
  function schedule(){if(!timer)timer=setTimeout(()=>{timer=null;save()},20000);}
  function changed(answer=false){if(!options.account.user)return;dirty=true;options.markDirty(true);status=t().pending;if(answer)checks++;if(checks>=5&&!busy){save()}else schedule();}
  function reset(){clearTimeout(timer);timer=null;epoch++;busy=false;checks=0;status='';pending=null;lastSignature='';dirty=false;}
  function html(){const c=t();return `<section class="panel report-sync"><p>${options.account.user?'':c.guest}</p>${options.account.user?`<button type="button" id="ep-report-save" ${busy?'disabled':''}>${c.save}</button>`:''}<p id="ep-report-status" role="status">${esc(status||(options.state().reportDirty?c.pending:options.state().reportSavedAt?c.saved:''))}</p><a href="../teacher/?view=student&lang=${options.language()}">${c.history}</a>${options.account.user&&options.hasGuest()?`<p><button type="button" id="ep-import-guest">${c.import}</button></p>`:''}</section>`;}
  function bind(node){const button=node.querySelector('#ep-report-save');if(button)button.onclick=save;const transfer=node.querySelector('#ep-import-guest');if(transfer)transfer.onclick=async()=>{
   if(!confirm(t().importAsk))return;
   if(options.hasPersonalWork()&&!await save())return;
   reset();options.importGuest();changed();await save();
  };}
  async function resume(id,review=false){if(!options.account.user)return;const user=options.account.user.id;const row=await options.account.teaching.report(id);
   if(user!==options.account.user?.id||row.student_id!==user)throw new Error('forbidden');
   if(row.lesson_id!==options.lessonId)throw new Error('wrong_lesson');
   if(!confirm(t().resumeAsk))return;
   reset();options.restore(root.EsProfeLessonReport.restore(row,options.lessonId),review);lastSignature=prepare().signature;status=t().loaded;notify();
  }
  return {html,bind,save,changed,reset,resume,get status(){return status},get busy(){return busy},get dirty(){return dirty},canReset(){const s=options.state();if(options.account.user&&(busy||dirty||s.reportDirty||s.reportPending||(!s.reportVersion&&(Object.keys(s.records).length||s.own.some(Boolean))))){alert(t().dirtyReset);return false}return true}};
 }
 root.EsProfeReportPanel={create};
})(window);
