
(async()=>{
const root=document.getElementById('esprofe-football');
const lesson=window.EsProfeLessonCatalog.current();
const response=await fetch(lesson.file+'?v=20261021-match10');if(!response.ok)throw new Error('Lesson data unavailable');
const data=await response.json();
const {D,vocab,football,groups,X,A,subjects,adjectiveData}=data;
document.title=(D[new URLSearchParams(window.location.search).get('lang')]||D.ru).title+' — EsProfe';
const kit=lesson.id==='football-kit-a1';
const photoLesson=kit&&data.version===2;
window.EsProfeKitPhotos=data.photos||{};
const picture=v=>window.EsProfeKitVisuals.picture(v);
const copyResponse=await fetch('account-copy.json?v=20261020-reports1');if(!copyResponse.ok)throw new Error('Account copy unavailable');
const accountCopy=await copyResponse.json();
const account=window.EsProfeLessonAccount;
let saveKey='',runId=crypto.randomUUID(),savedAttemptId=null,cloudMessage='',cloudBusy=false,historyRows=null,historyFailed=false;
let reportVersion=0,reportSavedAt=null,reportPending=null,reportDirty=false;
let initialAuthError=null;
try{await account.init()}catch(error){initialAuthError=error}
let lang='ru',stage=0,positions={3:0,4:0,5:0,6:0},records={},drafts={},tokens={},hiddenWords=new Set(),own=['','',''],modelSeen=false,reviewQueue=null,reviewAt=0,reviewFeedback=null,message='';
const all=Object.values(groups).flat();
const scoring=[...groups[4],...groups[5]];
let screenPage=0,screenKey='';
let selectedToken='',retrying=new Set(),autoReview=false,resumeStage=0;
const SAVE_KEY=lesson.key;
function storageKey(){return account.user?SAVE_KEY+':'+account.user.id:SAVE_KEY}
function uiRecord(item){return reviewQueue?reviewFeedback:retrying.has(item?.id)?null:(records[item?.id]?.last||records[item?.id])}
function retry(){const item=current();retrying.add(item.id);if(reviewQueue)reviewFeedback=null;delete drafts[item.id];delete tokens[item.id];selectedToken='';message='';render()}
function state(){return {contentVersion:data.version||1,runId,savedAttemptId,lang,stage:reviewQueue?resumeStage:stage,positions,records,drafts,tokens,own,modelSeen,retrying:[...retrying],reportVersion,reportSavedAt,reportPending,reportDirty}}
function persist(){try{localStorage.setItem(saveKey,JSON.stringify(state()))}catch(_){}}
function hasGuest(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));return !!s&&(Object.keys(s.records||{}).length>0||(s.own||[]).some(Boolean))}catch{return false}}
const reportPanel=window.EsProfeReportPanel?.create({account,lessonId:lesson.id,contentVersion:data.version||1,language:()=>lang,
 items:Object.entries(groups).flatMap(([group,items])=>items.map(item=>({...item,stage:Number(group)}))),state:()=>{capture();return state()},complete,
 pending:p=>{reportPending=p;persist()},saved:r=>{reportVersion=r.version;reportSavedAt=r.updated_at;persist()},
 markDirty:value=>{reportDirty=value;persist()},statusChanged:()=>{const el=root.querySelector('#ep-report-status');if(el)el.textContent=reportPanel.status;const button=root.querySelector('#ep-report-save');if(button)button.disabled=reportPanel.busy;fit()},hasGuest,hasPersonalWork:()=>Object.keys(records).length>0||own.some(Boolean),
 importGuest:()=>{const guest=JSON.parse(localStorage.getItem(SAVE_KEY));localStorage.setItem(saveKey+':before-import',JSON.stringify(state()));
  guest.runId=crypto.randomUUID();guest.reportVersion=0;guest.reportPending=null;guest.savedAttemptId=null;
  localStorage.setItem(saveKey,JSON.stringify(guest));loadLocal();localStorage.removeItem(SAVE_KEY);render()},
 restore:(s,review)=>{localStorage.setItem(saveKey+':before-restore',JSON.stringify(state()));localStorage.setItem(saveKey,JSON.stringify(s));loadLocal();if(review){resumeStage=8;stage=8;autoReview=false;reviewQueue=all.filter(x=>records[x.id]&&!records[x.id].ok);reviewAt=0;reviewFeedback=null;reviewQueue.forEach(x=>{delete drafts[x.id];delete tokens[x.id]})}render()}
});


const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).trim().toLocaleLowerCase().replace(/[.!?¿¡]/g,'').replace(/\s+/g,' ');
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
const orders=Object.fromEntries(all.filter(x=>x.o).map(x=>[x.id,shuffle(x.o.map((_,i)=>i))]));
const t=()=>D[lang], tr=w=>w[{uk:1,en:2,ru:3}[lang]];
function current(){return reviewQueue?reviewQueue[reviewAt]:groups[stage]?.[positions[stage]]}
function capture(){const el=root.querySelector('#ep-answer');if(el&&current())drafts[current().id]=el.value;root.querySelectorAll('[data-own]').forEach(el=>own[Number(el.dataset.own)]=el.value)}
function sentence(item,answer){
if(kit)return norm(answer)===norm(item.a)?(item.sentence||item.a):(item.p.includes('___')?item.p.replace('___',answer):answer);
if(item.type==='build'||item.id.startsWith('s')||item.id.startsWith('f'))return answer;
if(item.p.includes('___'))return item.p.replace('___',answer);
if(item.id.startsWith('w')&&/\b(?:es|son)\b/i.test(answer))return answer;
const subject=item.p.split(' + ')[0];return subject.charAt(0).toUpperCase()+subject.slice(1)+( /^(los|las) /i.test(subject)?' son ':' es ')+answer+'.';
}
function isCorrectAnswer(item,answer){return norm(answer)===norm(item.a)||(item.accepted||[]).some(x=>norm(answer)===norm(x))||(item.id.startsWith('w')&&norm(answer)===norm(sentence(item,item.a)))}
// Regrade stored answers only when a supported alternative was previously rejected.
function repairAcceptedRecords(){
 for(const item of all){
  const record=records[item.id];if(!record)continue;
  const firstFixed=!record.ok&&isCorrectAnswer(item,record.picked||'');
  const lastFixed=record.last&&!record.last.ok&&isCorrectAnswer(item,record.last.picked||'');
  let fixedHistory=0;
  for(const entry of record.history||[]){if(!entry.ok&&isCorrectAnswer(item,entry.picked||'')){entry.ok=true;fixedHistory++}}
  if(firstFixed)record.ok=true;if(lastFixed)record.last.ok=true;
  if(firstFixed||lastFixed||fixedHistory){
   if(Number.isInteger(record.wrongCount))record.wrongCount=Math.max(0,record.wrongCount-Math.max(fixedHistory,firstFixed?1:0,lastFixed?1:0));
   if(record.ok&&(record.last||record).ok){record.resolved=true;retrying.delete(item.id)}
   reportDirty=true;
  }
 }
}
function adjective(word,gender){let data,form;for(const [base,value] of Object.entries(adjectiveData)){const variants=base.endsWith('o')?[base,base.slice(0,-1)+'a',base+'s',base.slice(0,-1)+'as']:[base,base+(base==='débil'?'es':'s')];const i=variants.indexOf(word.toLowerCase());if(i>=0){data=value;form=base.endsWith('o')?(i>=2?2:i):(i===1?2:gender==='f'?1:0);break}}if(!data)return word;if(lang==='en')return data[2];return data[lang==='ru'?0:1][form]}
function translate(value){const line=norm(value);const simple=line.match(/^(.*?) (es|son) ([^ ]+)$/);if(simple&&subjects[simple[1]]){const sub=subjects[simple[1]],text=sub[{ru:0,uk:1,en:2}[lang]];return text+(lang==='en'?(simple[2]==='son'?' are ':' is '):' ')+adjective(sub===subjects['el equipo']?({'pequeño':'pequeña','pequeña':'pequeño','bueno':'buena','buena':'bueno','malo':'mala','mala':'malo','hermoso':'hermosa','hermosa':'hermoso','feo':'fea','fea':'feo','rico':'rica','rica':'rico'}[simple[3]]||simple[3]):simple[3],sub[3])+'.'}
const named=line.match(/^(.*?) es (un|una) (jugador|jugadora|portero|delantera|equipo) ([^ ]+)$/);
if(named){const names={messi:['Месси','Мессі','Messi'],alexia:['Алексия','Алексія','Alexia'],españa:['Испания','Іспанія','Spain'],marta:['Марта','Марта','Marta'],leo:['Лео','Лео','Leo'],ana:['Ана','Ана','Ana'],'el equipo de pablo':['Команда Пабло','Команда Пабло','Pablo’s team']};const n=names[named[1]]?.[{ru:0,uk:1,en:2}[lang]]||named[1];const nouns={jugador:['игрок','гравець','player'],jugadora:['футболистка','футболістка','female player'],portero:['вратарь','воротар','goalkeeper'],delantera:['нападающая','нападниця','female forward'],equipo:['команда','команда','team']};let adj=adjective(named[3]==='equipo'?({'pequeño':'pequeña','pequeña':'pequeño','bueno':'buena','buena':'bueno','malo':'mala','mala':'malo'}[named[4]]||named[4]):named[4],named[3]==='jugadora'||named[3]==='delantera'||named[3]==='equipo'?'f':'m');const noun=nouns[named[3]][{ru:0,uk:1,en:2}[lang]];if(lang==='en')return n+' is a '+adj+' '+noun+'.';return n+' — '+adj+' '+noun+'.'}
const gloss={es:['есть','є','is'],son:['есть','є','are'],un:['один (м. р.)','один (чол. р.)','a (masculine)'],una:['одна (ж. р.)','одна (жін. р.)','a (feminine)'],jugador:['игрок','гравець','player'],jugadora:['футболистка','футболістка','female player'],equipo:['команда','команда','team'],portero:['вратарь','воротар','goalkeeper'],delantera:['нападающая','нападниця','female forward']};return value.split(/\s+/).map(word=>{const w=norm(word);return gloss[w]?.[{ru:0,uk:1,en:2}[lang]]||adjective(w,'m')}).join(' · ');
}
let audioStatus='',audioRequest=0;
function speakSpanish(text){
const request=++audioRequest;audioStatus='';
if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){audioStatus=A[lang].missing;render();return}
const synth=window.speechSynthesis;synth.cancel();
const play=()=>{if(request!==audioRequest)return;const voices=synth.getVoices().filter(v=>/^es(?:[-_]|$)/i.test(v.lang));const voice=voices.find(v=>/^es[-_]ES$/i.test(v.lang))||voices[0];if(!voice){audioStatus=A[lang].missing;render();return}const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.85;utterance.pitch=1;utterance.onend=()=>{};utterance.onerror=e=>{if(request===audioRequest&&e.error!=='canceled'&&e.error!=='interrupted'){audioStatus=A[lang].failed;render()}};synth.speak(utterance)};
if(synth.getVoices().length)play();else{let fired=false;const ready=()=>{if(fired)return;fired=true;synth.removeEventListener('voiceschanged',ready);play()};synth.addEventListener('voiceschanged',ready);setTimeout(ready,1000)}
}
function feedback(r,item){if(!r)return '';const x=X[lang],right=sentence(item,item.a),wrong=sentence(item,r.picked);
const meaning=kit?item.meaning?.[lang]||'':translate(right);
return (r.ok?`<strong>${scoring.includes(item)&&!reviewQueue&&records[item.id]?.ok?'⚽ '+t().correct:({ru:'Правильно!',uk:'Правильно!',en:'Correct!'})[lang]}</strong>`:`<div class="wrong-answer"><b>❌ ${x.your}</b><div class="es-answer">${esc(wrong)}</div>${kit?'':`<small>${x.literal}</small>`}<div>${kit?'':esc(translate(wrong))}</div></div>`)+`<div class="right-answer"><b>✅ ${x.right}</b><div class="es-answer">${esc(right)}</div><div>${esc(meaning)}</div></div>`+(!r.ok?`<p class="muted">${lang==='en'?x.explain:t().why}</p>`:'')+`<button type="button" id="ep-listen" class="cursor-interaction">🔊 ${A[lang].listen}</button><small>${t().read}</small>${audioStatus?`<p role="status" class="muted">${esc(audioStatus)}</p>`:''}`;
}
function taskUI(item){const a=reviewQueue?reviewAt:positions[stage],total=reviewQueue?reviewQueue.length:groups[stage].length,r=uiRecord(item),checked=!!r;
let label=stage===3?t().warm:stage===4?t().match:stage===6?t().fix:item.type==='build'?t().build:item.type==='input'?t().write:t().selectType;
let control='';
if(item.type==='choice'&&kit)control=`<div class="choices">${orders[item.id].map(i=>`<button type="button" class="cursor-interaction ${drafts[item.id]===item.o[i]?'selected':''}" data-choice="${i}" ${checked?'disabled':''}>${esc(item.o[i])}</button>`).join('')}</div>`;
else if(item.type==='choice')control=`<div class="goal-wrap"><div id="ep-goal" class="goal-net ${drafts[item.id]?'has-ball':''}" role="group" aria-label="${X[lang].goal}"><button type="button" id="ep-drop" class="cursor-interaction" ${checked?'disabled':''}>⚽ ${esc(drafts[item.id]||X[lang].goal)}</button></div><p class="muted">${X[lang].drag}</p></div><div class="choices">${orders[item.id].map(i=>`<button type="button" draggable="${!checked}" class="cursor-interaction ${selectedToken===item.o[i]?'selected':''}" data-choice="${i}" ${checked?'disabled':''}>${esc(item.o[i])}</button>`).join('')}</div><label class="dropdown-label" for="ep-options">${X[lang].dropdown}</label><select id="ep-options" ${checked?'disabled':''}><option value="">${X[lang].choose}</option>${orders[item.id].map(i=>`<option value="${esc(item.o[i])}" ${drafts[item.id]===item.o[i]?'selected':''}>${esc(item.o[i])}</option>`).join('')}</select>`;
else if(item.type==='build'){const used=tokens[item.id]||[];control=`<div class="answerbox" aria-label="${t().answer}">${used.map((i,j)=>`<button type="button" class="cursor-interaction" data-remove="${j}" ${checked?'disabled':''}>${esc(item.o[i])}</button>`).join('')}</div><div class="tokens">${orders[item.id].map(i=>`<button type="button" class="cursor-interaction" data-token="${i}" ${used.includes(i)||checked?'disabled':''}>${esc(item.o[i])}</button>`).join('')}</div>`}
else control=`<label for="ep-answer" class="muted">${t().answer}</label><input id="ep-answer" autocomplete="off" spellcheck="false" value="${esc(drafts[item.id]||'')}" ${checked?'disabled':''}>`;
if(photoLesson){const f=r?`<strong>${r.ok?(scoring.includes(item)&&!reviewQueue&&records[item.id]?.ok?'⚽ '+t().correct:({ru:'Правильно!',uk:'Правильно!',en:'Correct!'})[lang]):X[lang].your+': '+esc(r.picked)}</strong><div class="es-answer">${esc(sentence(item,item.a))}</div><div>${esc(item.meaning?.[lang]||'')}</div><button type="button" id="ep-listen">🔊 ${A[lang].listen}</button>${audioStatus?`<small role="status">${esc(audioStatus)}</small>`:''}`:'';
return `<section class="photo-task"><div class="task-caption">${t().task} ${a+1} ${t().of} ${total} · ${label}</div><div class="sentence">${esc(item.p)}</div>${picture(item.visual)}<div class="task-response">${checked?'':control}<div class="feedback ${r?(r.ok?'good':'bad'):''}" aria-live="polite">${message?esc(message):f}</div></div><div class="footer"><button type="button" id="ep-prev" ${a===0?'disabled':''}>← ${t().back}</button>${checked&&!r.ok?`<button type="button" id="ep-retry" class="primary">${({ru:'Исправить ответ',uk:'Виправити відповідь',en:'Try again'})[lang]}</button>`:checked?`<button type="button" id="ep-task-next" class="primary">${t().continue} →</button>`:`<button type="button" id="ep-check" class="primary">${t().check}</button>`}</div></section>`;}
return `<div class="eyebrow">${t().task} ${a+1} ${t().of} ${total}</div>${checked?'':`<p>${label}</p>`}${!checked&&item.p?`<div class="sentence">${esc(item.p)}</div>`:''}${!checked&&item.visual?picture(item.visual):''}${checked?'':control}<div class="feedback ${r?(r.ok?'good':'bad'):''}" aria-live="polite">${message?esc(message):feedback(r,item)}</div><div class="footer"><button type="button" id="ep-prev" class="cursor-interaction" ${a===0?'disabled':''}>← ${t().back}</button>${checked&&!r.ok?`<button type="button" id="ep-retry" class="primary cursor-interaction">${({ru:"Исправить ответ",uk:"Виправити відповідь",en:"Try again"})[lang]}</button>`:checked?`<button type="button" id="ep-task-next" class="primary cursor-interaction">${t().continue} →</button>`:`<button type="button" id="ep-check" class="primary cursor-interaction">${t().check}</button>`}</div>`}
function model(){if(kit)return `<p>${t().newintro}</p><div class="hint">${t().formula}</div>${t().modelQuestions.map(line=>`<p class="model">${esc(line)}</p>`).join('')}<p>${t().note}</p><button type="button" id="ep-model-start" class="primary">${t().modelstart} →</button>`;return `<p>${t().newintro}</p><div class="hint">${t().formula}</div><div class="panel">${['Messi es un jugador bueno.','Alexia es una jugadora buena.','España es un equipo fuerte.'].map((x,i)=>`<div class="model">${x}</div><div class="muted">${t().newmeaning[i]}</div>`).join('')}</div><p>${t().note}</p><button type="button" id="ep-model-start" class="primary cursor-interaction">${t().modelstart} →</button>`}
function result(){const done=all.filter(x=>records[x.id]),first=done.filter(x=>records[x.id].ok),errors=all.filter(x=>records[x.id]&&!records[x.id].ok&&!records[x.id].resolved);return `<div class="scores"><div class="panel"><strong>${first.length} / ${all.length}</strong>${t().first}</div><div class="panel"><strong>${done.length} / ${all.length}</strong>${t().attempts}</div></div>${done.length<all.length?`<p class="hint">${t().pending}</p>`:''}${errors.length?`<button type="button" id="ep-review" class="primary cursor-interaction">${t().review} (${errors.length}) →</button>`:done.length===all.length?`<p>${t().allright}</p>`:''}<div class="panel"><h2>${t().viewown}</h2>${own.map(x=>`<p>${esc(x)||'—'}</p>`).join('')}<small>${t().ownnote}</small></div>${reportPanel?.html()||''}${reportPanel?`<details><summary>${accountCopy[lang].legacyHistory}</summary>${accountResult()}</details>`:accountResult()}<details><summary>${t().home}</summary><p>${t().hw}</p></details><p class="muted">${accountCopy[lang].local}</p><button type="button" id="ep-reset" class="cursor-interaction">${t().reset}</button>`}
function complete(){return all.every(item=>(records[item.id]?.last||records[item.id])?.ok&&(records[item.id]?.ok||records[item.id]?.resolved))&&all.every(item=>!retrying.has(item.id))&&own.every(text=>text.trim())&&!ownRepeats().length}
function ownRepeats(){
 if(kit)return [];
 const bases=own.map(text=>{const word=norm(text).split(' ').pop();return Object.keys(adjectiveData).find(base=>{
 const forms=base.endsWith('o')?[base,base.slice(0,-1)+'a',base+'s',base.slice(0,-1)+'as']:[base,base+(base==='débil'?'es':'s')];
 return forms.includes(word);
 });});
 return bases.map((base,i)=>base&&bases.filter(other=>other===base).length>1?i:-1).filter(i=>i>=0);
}
function updateOwnHints(){capture();reportPanel?.changed();const repeats=ownRepeats();root.querySelectorAll('[data-own-warning]').forEach(el=>{el.textContent=repeats.includes(Number(el.dataset.ownWarning))?accountCopy[lang].ownRepeat:''});persist();fit()}
function continueIncomplete(){const missing=all.find(item=>!records[item.id]);if(missing){const key=Object.keys(groups).find(key=>groups[key].includes(missing));positions[key]=groups[key].indexOf(missing);go(Number(key));return}go(6)}
function accountError(error){const c=accountCopy[lang];return c[error.code]||c.error}
function accountResult(){
  const c=accountCopy[lang];const missing=all.filter(item=>!records[item.id]).length;
  if(!account.user)return `<div class="hint">${c.signin}</div>`;
  const history=historyRows?.map(row=>`<li>${esc(new Date(row.completed_at).toLocaleString(lang==='uk'?'uk-UA':lang==='ru'?'ru-RU':'en-GB'))} · ${row.score} / ${row.total} · ${esc(row.language.toUpperCase())}</li>`).join('');
  return `<section class="panel account-result"><button type="button" id="ep-cloud-save" class="primary" ${cloudBusy||savedAttemptId||!complete()?'disabled':''}>${savedAttemptId?c.saved:cloudBusy?c.busy:c.save}</button>${!complete()?`<p class="muted">${missing?c.missingTasks.replace('{n}',missing):c.incomplete}</p>${missing?`<button type="button" id="ep-incomplete">${c.continueTasks} →</button>`:''}`:''}<p role="status">${esc(cloudMessage)}</p><details ${historyRows||historyFailed||cloudBusy?'open':''}><summary>${c.history}</summary>${historyRows?historyRows.length?`<ul>${history}</ul>`:`<p>${c.noHistory}</p>`:''}<button type="button" id="ep-history" ${cloudBusy?'disabled':''}>${cloudBusy?c.busy:c.refresh}</button>${historyFailed?`<p role="status">${c.error}</p>`:''}</details></section>`;
}
async function loadHistory(){
  if(cloudBusy)return;const owner=account.user?.id;
  capture();cloudBusy=true;historyFailed=false;render();
  try{const rows=await account.history();if(account.user?.id===owner)historyRows=rows}
  catch(_){if(account.user?.id===owner)historyFailed=true}
  finally{if(account.user?.id===owner){cloudBusy=false;render()}}
}
async function saveCloud(){
  if(cloudBusy||savedAttemptId||!complete())return;
  const owner=account.user?.id,attemptId=runId;
  const snapshot={id:runId,score:all.filter(item=>records[item.id]?.ok).length,total:all.length,language:lang,complete:complete()};
  capture();cloudBusy=true;cloudMessage='';render();
  try{
    const id=await account.saveAttempt(snapshot);
    if(owner===account.user?.id&&attemptId===runId){savedAttemptId=id;cloudMessage=accountCopy[lang].saved;persist()}
  }catch(error){if(owner===account.user?.id&&attemptId===runId)cloudMessage=accountError(error)}
  finally{if(owner===account.user?.id&&attemptId===runId){cloudBusy=false;render()}}
}
function openAccount(){
  capture();persist();
  const c=accountCopy[lang],dialog=document.createElement('dialog');dialog.className='ep-account-dialog';
  dialog.innerHTML=`<form method="dialog"><button type="submit" class="ep-close">${c.close}</button></form><h2>${account.user?c.signedIn:c.account}</h2>${account.user?`<p>${esc(account.user.email||'')}</p><button type="button" id="ep-signout">${c.logout}</button>`:`<p>${c.intro}</p><form id="ep-signin"><label>${c.email}<input name="email" type="email" autocomplete="username" required></label><label>${c.password}<input name="password" type="password" autocomplete="current-password" required></label><button type="submit">${c.login}</button></form>`}${!account.user?`<p><label><input id="ep-register" type="checkbox">${c.register}</label></p><p class="muted">${c.registerNote}</p><label><input id="ep-register-consent" type="checkbox">${c.consent}</label>`:''}<p class="ep-auth-status" role="status"></p>`;
  document.body.append(dialog);dialog.addEventListener('close',()=>{dialog.remove();root.querySelector('#ep-account')?.focus()});dialog.showModal();
  const status=dialog.querySelector('.ep-auth-status');
  const form=dialog.querySelector('#ep-signin');
  if(form)form.onsubmit=async event=>{
    event.preventDefault();const button=form.querySelector('button');button.disabled=true;status.textContent=c.busy;
    const password=form.elements.password.value;form.elements.password.value='';
    try{if(dialog.querySelector('#ep-register')?.checked){if(password.length<8){status.textContent=c.registerNote;button.disabled=false;return}if(!dialog.querySelector('#ep-register-consent').checked){status.textContent=c.consent;button.disabled=false;return}const result=await account.signUp(form.elements.email.value.trim(),password);if(result.confirmationRequired){status.textContent=c.checkMail;button.disabled=false;return}}else await account.signIn(form.elements.email.value.trim(),password);dialog.close()}
    catch(error){status.textContent=accountError(error);button.disabled=false}
  };
  const logout=dialog.querySelector('#ep-signout');
  if(logout)logout.onclick=async()=>{
    logout.disabled=true;status.textContent=c.busy;
    try{await account.signOut();dialog.close()}
    catch(error){status.textContent=accountError(error);logout.disabled=false}
  };
  if(!account.available)status.textContent=c.unavailable;
}
function legacyKitVocabulary(){return `<p>${t().words}</p><div class="vocab">${vocab.map((w,i)=>`<button type="button" class="word kit-word" data-word="${i}">${picture(data.vocabVisuals?.[i]||{kind:['shirt','shorts','boots','gloves','keeper'][i],color:'#2876d3'})}<b>${esc(w[0])}</b><span>${hiddenWords.has(i)?'…':esc(tr(w))}</span></button>`).join('')}</div><div class="vocab color-vocab">${data.colors.map(c=>`<div class="word"><span class="color-chip" style="background:${c.hex}"></span><b>${esc(c.word)}</b><span>${esc(c[lang])}</span></div>`).join('')}</div>`;}
function kitVocabulary(){
 if(!photoLesson)return legacyKitVocabulary();
 return `<section class="photo-vocabulary"><p class="vocabulary-intro">${t().words}</p><div class="kit-vocab-grid">${vocab.map((w,i)=>`<article class="word kit-word">${picture(data.vocabVisuals[i])}<button type="button" data-word="${i}" aria-label="${esc(w[0]+' — '+t().reveal)}"><b>${esc(w[0])}</b><span>${hiddenWords.has(i)?'…':esc(tr(w))}</span></button></article>`).join('')}</div><div class="vocab color-vocab">${data.colors.map(c=>`<div class="word"><span class="color-chip" style="background:${c.hex}"></span><b>${esc(c.word)}</b><span>${esc(c[lang])}</span></div>`).join('')}</div></section>`;
}
function fitVocabulary(inner,pager){
 inner.style.flex='1';pager.hidden=false;
 const section=inner.querySelector('.photo-vocabulary'),grid=section.querySelector('.kit-vocab-grid'),colors=section.querySelector('.color-vocab');
 const cards=[...grid.children],intro=section.querySelector('.vocabulary-intro');
 const height=section.clientHeight-intro.getBoundingClientRect().height-8;
 const layout=window.EsProfeKitVisuals.vocabularyLayout(section.clientWidth,height,cards.length);
 screenPage=Math.min(screenPage,layout.pages-1);
 const colourPage=screenPage===layout.pages-1;
 grid.hidden=colourPage;colors.hidden=!colourPage;
 grid.style.gridTemplateColumns=`repeat(${layout.columns},minmax(0,1fr))`;
 grid.style.gridTemplateRows=`repeat(${layout.rows},minmax(0,1fr))`;
 cards.forEach((card,i)=>card.hidden=i<screenPage*layout.capacity||i>=(screenPage+1)*layout.capacity);
 const labels={ru:{words:'Слова',colors:'Цвета',start:'← К началу',next:'Далее →',rule:'К правилу →'},uk:{words:'Слова',colors:'Кольори',start:'← До початку',next:'Далі →',rule:'До правила →'},en:{words:'Words',colors:'Colours',start:'← Start',next:'Next →',rule:'To the rule →'}}[lang];
 pager.querySelector('#ep-screen-count').textContent=colourPage?labels.colors:labels.words+' · '+(screenPage+1)+' / '+(layout.pages-1);
 const back=pager.querySelector('#ep-screen-back'),next=pager.querySelector('#ep-screen-next');
 back.disabled=false;next.disabled=false;
 back.textContent=screenPage===0?labels.start:'← '+t().back;
 next.textContent=colourPage?labels.rule:screenPage===layout.pages-2?labels.colors+' →':labels.next;
 next.classList.add('primary');
 back.onclick=()=>{if(screenPage===0){go(0);return}screenPage--;fit()};
 next.onclick=()=>{if(colourPage){go(2);return}screenPage++;fit()};
}
function kitRule(){return `<p>${t().rule}</p><div class="panel kit-rule-examples"><p class="model">La camiseta es roja.</p><p class="model">Los pantalones cortos son rojos.</p><p class="model">Las botas son rojas.</p><p class="model">Los guantes son rojos.</p></div><p>${t().unchanged}</p><div class="hint">${t().one}: <b>es</b> · ${t().many}: <b>son</b></div>`;}
function render(){const key=[stage,reviewAt,current()?.id,!!uiRecord(current()),!!reviewQueue].join(':');if(key!==screenKey){screenPage=0;screenKey=key}persist();root.lang=lang;const done=Object.keys(records).length;const goals=scoring.filter(x=>records[x.id]?.ok).length;let content='';
if(reviewQueue)content=reviewAt<reviewQueue.length?taskUI(current()):`<p>${t().reviewdone}</p><button id="ep-review-finish" type="button" class="primary cursor-interaction">${t().names[8]} →</button>`;
else if(stage===0)content=`<p>${t().intro}</p><div class="panel"><div class="eyebrow">${t().goal}</div><p>${t().rule}</p><div class="steps">${(kit?['camiseta','pantalones cortos','botas','guantes']:['bueno','buena','buenos','buenas']).map(w=>`<span>${w}</span>`).join('')}</div></div><details><summary>⚽ ${t().names[1]}</summary><div class="vocab">${football.map(w=>`<div class="word"><b>${w[0]}</b><span>${tr(w)}</span></div>`).join('')}</div></details><button type="button" id="ep-start" class="primary cursor-interaction">${t().start} →</button>`;
else if(stage===1&&kit)content=kitVocabulary();
else if(stage===1)content=`<p>${t().words}</p><div class="hint">${X[lang].contrast}</div><div class="vocab">${vocab.map((w,i)=>`<button type="button" class="word cursor-interaction" data-word="${i}" aria-label="${esc(w[0]+' — '+t().reveal)}"><b>${w[0]}</b><span>${hiddenWords.has(i)?'…':tr(w)}</span></button>`).join('')}</div>`;
else if(stage===2&&kit)content=kitRule();
else if(stage===2)content=`<p>${t().rule}</p><div class="panel"><table><thead><tr><th></th><th>${t().masc}</th><th>${t().fem}</th></tr></thead><tbody><tr><th>${t().one}</th><td>El jugador es <b>bueno</b>.</td><td>La jugadora es <b>buena</b>.</td></tr><tr><th>${t().many}</th><td>Los jugadores son <b>buenos</b>.</td><td>Las jugadoras son <b>buenas</b>.</td></tr></tbody></table></div><div class="steps"><span>-o</span><span>-a</span><span>-os</span><span>-as</span></div><p>${t().unchanged}</p><div class="model">La jugadora es fuerte.<br>Las jugadoras son fuertes.<br>El jugador es débil.<br>Los jugadores son débiles.</div><div class="hint">${t().one}: <b>es</b> · ${t().many}: <b>son</b></div>`;
else if(stage===5&&!modelSeen)content=model();
else if(groups[stage])content=taskUI(current());
else if(stage===7)content=`<p>${t().own}</p><div class="hint"><strong>${kit?t().ownRule:accountCopy[lang].ownRule}</strong></div>${(data.ownPrompts||['… es un jugador …','… es una jugadora …','… es un equipo …']).map((x,i)=>`<div class="own"><label for="ep-own-${i}" class="muted">${i+1}. ${x}</label><textarea id="ep-own-${i}" data-own="${i}" spellcheck="false" aria-describedby="ep-own-warning-${i}">${esc(own[i])}</textarea><p class="muted" id="ep-own-warning-${i}" data-own-warning="${i}" aria-live="polite">${ownRepeats().includes(i)?accountCopy[lang].ownRepeat:''}</p></div>`).join('')}<p class="muted">${t().ownnote}</p><p aria-live="polite">${esc(message)}</p><button type="button" id="ep-finish" class="primary cursor-interaction">${t().finish} →</button>`;
else content=result();
root.innerHTML=`<header class="header"><a class="brand" href="../" aria-label="EsProfe"><img class="logo" src="../assets/brand/esprofe-logo-spain.jpg" alt="EsProfe">EsProfe</a><div class="headright"><div class="scoreboard" aria-live="polite" aria-label="${t().goals}"><span>⚽ ${t().goals}</span><strong>${goals}${photoLesson?` / ${scoring.length}`:''}</strong></div><span class="status">${t().preview}</span><button type="button" id="ep-account">${account.user?accountCopy[lang].signedIn:accountCopy[lang].account}</button><label for="ep-language" class="muted">${t().lang}</label><select id="ep-language"><option value="uk" ${lang==='uk'?'selected':''}>Українська</option><option value="en" ${lang==='en'?'selected':''}>English</option><option value="ru" ${lang==='ru'?'selected':''}>Русский</option></select></div></header><div class="shell"><nav aria-label="${t().practice}"><select id="ep-lesson" aria-label="${({ru:'Урок',uk:'Урок',en:'Lesson'})[lang]}">${window.EsProfeLessonCatalog.lessons.map(l=>`<option value="${l.id}" ${lesson.id===l.id?'selected':''}>${esc(l.titles[lang])}</option>`).join('')}</select><select id="ep-section" aria-label="${t().practice}">${t().names.map((n,i)=>`<option value="${i}" ${stage===i?'selected':''}>${i+1}. ${n}</option>`).join('')}</select><div class="fit-content">${t().names.map((n,i)=>`<button type="button" class="cursor-interaction ${stage===i&&!reviewQueue?'active':''}" data-stage="${i}" ${stage===i&&!reviewQueue?'aria-current="step"':''}>${i+1}. ${n}</button>`).join('')}<small>${t().goals}: ${goals} / ${scoring.length}</small><small>${X[lang].hint}</small><small>${accountCopy[lang].local}</small></div></nav><main><div class="fit-content"><div class="eyebrow">A1 · ⚽ ${t().preview}</div><h1>${reviewQueue?t().repeat:stage===0?t().title:stage===8?(complete()?t().result:t().names[8]):t().names[stage]}</h1>${content}${!reviewQueue&&[1,2].includes(stage)&&!(photoLesson&&stage===1)?`<div class="footer"><button id="ep-simple-back" type="button" class="cursor-interaction">← ${t().back}</button><button id="ep-simple-next" type="button" class="primary cursor-interaction">${t().ready} →</button></div>`:''}<div class="track" role="progressbar" aria-label="${t().attempts}" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${all.length}"><div class="fill" style="width:${done/all.length*100}%"></div></div></div><div class="screen-pager" hidden><button type="button" id="ep-screen-back">← ${t().back}</button><span id="ep-screen-count" role="status"></span><button type="button" id="ep-screen-next">${({ru:"Далее",uk:"Далі",en:"Next"})[lang]} →</button></div></main></div>`;
root.classList.toggle('photo-lesson',photoLesson);root.classList.toggle('photo-own',photoLesson&&stage===7&&!reviewQueue);root.classList.toggle('photo-rule',photoLesson&&stage===2&&!reviewQueue);root.classList.toggle('photo-words',photoLesson&&stage===1&&!reviewQueue);root.classList.toggle('photo-question',photoLesson&&!!root.querySelector('.photo-task'));bind();reportPanel?.bind(root);fit();}
function putGoal(word){const item=current();if(!item||word!==''&&!item.o?.includes(word))return;drafts[item.id]=word;selectedToken='';message='';render();reportPanel?.changed()}
// Keep text at its chosen size; distribute long sections across viewport pages.
function fit(){
const main=root.querySelector('main'),inner=main?.querySelector('.fit-content'),pager=main?.querySelector('.screen-pager');
if(!inner||!pager)return;
if(photoLesson&&inner.querySelector('.photo-vocabulary')){fitVocabulary(inner,pager);return;}
if(photoLesson&&inner.querySelector('.photo-task')){screenPage=0;pager.hidden=true;inner.style.flex='1';return;}
const style=getComputedStyle(main);
const fullHeight=main.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
const height=fullHeight-74;
if(height<80)return;
inner.style.flex='none';
const blocks=()=>[...inner.children];
blocks().forEach(el=>el.hidden=false);
if(inner.scrollHeight<=fullHeight-4){screenPage=0;pager.hidden=true;inner.style.flex='1';return}
// Vocabulary rows stay together with their translations, and keep their handlers.
inner.querySelectorAll('.vocab:not([data-paged])').forEach(grid=>{
 const words=[...grid.children];grid.dataset.paged='true';
 const rows=[];for(let i=0;i<words.length;i+=2){const row=grid.cloneNode(false);row.append(...words.slice(i,i+2));rows.push(row)}
 grid.replaceWith(...rows);
});
// Split oversized panels only at semantic element boundaries.
for(let pass=0;pass<5;pass++){
 let changed=false;
 for(const el of blocks()){
  if(el.getBoundingClientRect().height<=height||!el.children.length||el.matches('table,.vocab,.choices,.tokens,.answerbox,.footer'))continue;
  if(el.children.length===1){el.replaceWith(el.firstElementChild);changed=true;continue}
  const parts=[...el.children].map(child=>{
   const wrap=document.createElement(el.tagName==='UL'?'ul':'div');wrap.className=el.className;
   if(el.tagName==='DETAILS')wrap.className='panel';
   wrap.append(child);return wrap;
  });el.replaceWith(...parts);changed=true;
 }
 if(!changed)break;
}
const items=blocks();const pages=[[]];
items.forEach(el=>el.hidden=true);
for(const el of items){
 el.hidden=false;
 if(inner.scrollHeight>height&&pages.at(-1).length){
  pages.at(-1).forEach(node=>node.hidden=true);pages.push([]);
 }
 pages.at(-1).push(el);
}
screenPage=Math.min(screenPage,pages.length-1);
items.forEach(el=>el.hidden=true);pages[screenPage].forEach(el=>el.hidden=false);
inner.style.flex='1';
pager.hidden=pages.length===1;
pager.querySelector('#ep-screen-count').textContent=(screenPage+1)+' / '+pages.length;
const back=pager.querySelector('#ep-screen-back'),next=pager.querySelector('#ep-screen-next');
back.disabled=screenPage===0;next.disabled=screenPage===pages.length-1;
back.onclick=()=>{capture();screenPage--;fit()};next.onclick=()=>{capture();screenPage++;fit()};
}
root.addEventListener('toggle',fit,true);
window.addEventListener('resize',fit);
if(window.visualViewport)window.visualViewport.addEventListener('resize',fit);
if(typeof ResizeObserver!=='undefined')new ResizeObserver(fit).observe(root);
document.fonts?.ready.then(fit);
function on(id,fn){const el=root.querySelector('#'+id);if(el)el.onclick=fn}
function go(s){screenPage=0;audioStatus='';audioRequest++;if(window.speechSynthesis)window.speechSynthesis.cancel();autoReview=false;selectedToken='';capture();stage=s;reviewQueue=null;reviewFeedback=null;message='';render();if(s===8)reportPanel?.save()}
function check(){capture();const item=current();const answer=item.type==='build'?(tokens[item.id]||[]).map(i=>item.o[i]).join(' '):(drafts[item.id]||'');if(!answer.trim()){message=t().empty;render();return}if(uiRecord(item))return;
const r={ok:isCorrectAnswer(item,answer),answer:item.a,picked:answer};const first=!records[item.id];
if(first)records[item.id]={...r,last:r,history:[],resolved:r.ok,due:Object.keys(records).length+4};
const saved=records[item.id];saved.attemptCount=(saved.attemptCount||saved.history.length)+1;saved.wrongCount=(saved.wrongCount??saved.history.filter(h=>!h.ok).length)+(r.ok?0:1);saved.last=r;saved.history.push({...r,phase:reviewQueue?'repeat':first?'first':'correction'});if(saved.history.length>20)saved.history.shift();retrying.delete(item.id);
if(reviewQueue){reviewFeedback=r;if(r.ok)saved.resolved=true;else saved.due=Object.keys(records).length+3;}
message='';audioStatus='';render();reportPanel?.changed(true);if(r.ok)speakSpanish(sentence(item,item.a));}
function nextTask(){audioStatus='';audioRequest++;if(window.speechSynthesis)window.speechSynthesis.cancel();selectedToken='';capture();message='';if(!uiRecord(current())?.ok)return;
if(reviewQueue){reviewAt++;reviewFeedback=null;if(autoReview&&reviewAt>=reviewQueue.length){reviewQueue=null;autoReview=false;stage=resumeStage;}render();return}
if(positions[stage]+1<groups[stage].length)positions[stage]++;else stage++;
const count=Object.keys(records).length;const due=all.find(x=>records[x.id]&&!records[x.id].resolved&&records[x.id].due<=count);
if(due){resumeStage=stage;autoReview=true;reviewQueue=[due];reviewAt=0;reviewFeedback=null;delete drafts[due.id];delete tokens[due.id];}
render()}
function bind(){root.querySelector('#ep-lesson').onchange=async e=>{capture();persist();if(account.user&&reportDirty&&!await reportPanel.save()){render();return}location.href=window.EsProfeLessonCatalog.href(e.target.value,lang)};root.querySelector('#ep-section').onchange=e=>go(Number(e.target.value));on('ep-account',openAccount);on('ep-cloud-save',saveCloud);on('ep-history',loadHistory);on('ep-incomplete',continueIncomplete);root.querySelectorAll('[data-own]').forEach(el=>el.oninput=updateOwnHints);root.querySelector('#ep-language').onchange=e=>{capture();lang=e.target.value;message='';audioStatus='';render()};root.querySelectorAll('[data-stage]').forEach(el=>el.onclick=()=>go(Number(el.dataset.stage)));root.querySelectorAll('[data-word]').forEach(el=>el.onclick=()=>{const i=Number(el.dataset.word);hiddenWords.has(i)?hiddenWords.delete(i):hiddenWords.add(i);render()});root.querySelectorAll('[data-choice]').forEach(el=>{el.onclick=()=>{if(kit){putGoal(current().o[Number(el.dataset.choice)]);return}selectedToken=current().o[Number(el.dataset.choice)];message='';render()};el.ondragstart=e=>{e.dataTransfer.setData('text/plain',current().o[Number(el.dataset.choice)]);e.dataTransfer.effectAllowed='copy'}});const goal=root.querySelector('#ep-goal');const currentRecord=uiRecord(current());if(goal&&!currentRecord){goal.ondragover=e=>{e.preventDefault();goal.classList.add('drag-over')};goal.ondragleave=()=>goal.classList.remove('drag-over');goal.ondrop=e=>{e.preventDefault();putGoal(e.dataTransfer.getData('text/plain'))};on('ep-drop',()=>putGoal(selectedToken))}const select=root.querySelector('#ep-options');if(select)select.onchange=e=>putGoal(e.target.value);root.querySelectorAll('[data-token]').forEach(el=>el.onclick=()=>{const item=current();tokens[item.id]??=[];tokens[item.id].push(Number(el.dataset.token));render();reportPanel?.changed()});root.querySelectorAll('[data-remove]').forEach(el=>el.onclick=()=>{tokens[current().id].splice(Number(el.dataset.remove),1);render();reportPanel?.changed()});on('ep-start',()=>go(1));on('ep-simple-back',()=>go(stage-1));on('ep-simple-next',()=>go(stage+1));on('ep-model-start',()=>{modelSeen=true;render()});on('ep-listen',()=>{const item=current();if(item)speakSpanish(sentence(item,item.a))});on('ep-check',check);on('ep-retry',retry);on('ep-task-next',nextTask);on('ep-prev',()=>{capture();if(reviewQueue){reviewAt--;reviewFeedback=null}else positions[stage]--;message='';render()});on('ep-finish',()=>{capture();if(own.some(x=>!x.trim())){message=t().ownempty;render()}else if(ownRepeats().length){message=accountCopy[lang].ownRepeat;render()}else go(8)});on('ep-review',()=>{autoReview=false;resumeStage=8;reviewQueue=all.filter(x=>records[x.id]&&!records[x.id].ok&&!records[x.id].resolved);reviewAt=0;reviewFeedback=null;reviewQueue.forEach(x=>{delete drafts[x.id];delete tokens[x.id]});render()});on('ep-review-finish',()=>go(8));on('ep-reset',()=>{if(!reportPanel?.canReset()&&reportPanel)return;if(!confirm(t().resetask))return;reportPanel?.reset();reportVersion=0;reportSavedAt=null;reportPending=null;reportDirty=false;retrying.clear();autoReview=false;records={};drafts={};tokens={};positions={3:0,4:0,5:0,6:0};own=['','',''];modelSeen=false;runId=crypto.randomUUID();savedAttemptId=null;cloudMessage='';go(0)});const input=root.querySelector('#ep-answer');if(input)input.oninput=()=>{capture();persist();reportPanel?.changed()};if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();check()}}}
function loadLocal(){
  saveKey=storageKey();
  stage=0;positions={3:0,4:0,5:0,6:0};records={};drafts={};tokens={};own=['','',''];modelSeen=false;
  retrying=new Set();reviewQueue=null;reviewFeedback=null;autoReview=false;selectedToken='';message='';
  runId=crypto.randomUUID();reportVersion=0;reportSavedAt=null;reportPending=null;reportDirty=false;savedAttemptId=null;cloudMessage='';cloudBusy=false;historyRows=null;historyFailed=false;
  try{
    const saved=JSON.parse(localStorage.getItem(saveKey));
    if(saved&&D[saved.lang]){
      lang=saved.lang;
      stage=Number.isInteger(saved.stage)&&saved.stage>=0&&saved.stage<=8?saved.stage:0;
      for(const key of Object.keys(positions)){
        const value=saved.positions?.[key];
        positions[key]=Number.isInteger(value)&&value>=0&&value<groups[key].length?value:0;
      }
      records=saved.records||{};drafts=saved.drafts||{};tokens=saved.tokens||{};
      own=Array.isArray(saved.own)&&saved.own.length===3?saved.own:['','',''];modelSeen=!!saved.modelSeen;
      retrying=new Set(saved.retrying||[]);
      if(/^[0-9a-f-]{36}$/i.test(saved.runId||''))runId=saved.runId;
      savedAttemptId=saved.savedAttemptId===runId?runId:null;reportVersion=Number.isInteger(saved.reportVersion)?saved.reportVersion:0;reportSavedAt=saved.reportSavedAt||null;reportPending=saved.reportPending||null;reportDirty=!!saved.reportDirty;
    }
  }catch(_){}
  repairAcceptedRecords();
}
loadLocal();
account.subscribe(()=>{
  reportPanel?.reset();capture();persist();audioRequest++;window.speechSynthesis?.cancel();
  loadLocal();render();
});
const requestedLanguage=new URLSearchParams(window.location.search).get("lang");if(D[requestedLanguage])lang=requestedLanguage;
render();
const resumeParams=new URLSearchParams(window.location.search);const resumeId=resumeParams.get('resume')||resumeParams.get('review');
if(resumeId&&reportPanel&&account.user)reportPanel.resume(resumeId,resumeParams.has('review')).catch(()=>{cloudMessage=accountCopy[lang].error;render()});
if(initialAuthError){cloudMessage=accountCopy[lang].error;render()}
})().catch(error=>{console.error(error);document.getElementById("esprofe-football").textContent="Не удалось загрузить урок / Не вдалося завантажити урок / Could not load the lesson. Обновите страницу / Оновіть сторінку / Reload the page.";});

