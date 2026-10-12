
(async()=>{
const root=document.getElementById('esprofe-football');
const response=await fetch('lesson.json');if(!response.ok)throw new Error('Lesson data unavailable');
const {D,vocab,football,groups,X,A,subjects,adjectiveData}=await response.json();
let lang='ru',stage=0,positions={3:0,4:0,5:0,6:0},records={},drafts={},tokens={},hiddenWords=new Set(),own=['','',''],modelSeen=false,reviewQueue=null,reviewAt=0,reviewFeedback=null,message='';
const all=Object.values(groups).flat();
const scoring=[...groups[4],...groups[5]];
let selectedToken='',retrying=new Set(),autoReview=false,resumeStage=0;
const SAVE_KEY='esprofe_football_review_v3';
function uiRecord(item){return reviewQueue?reviewFeedback:retrying.has(item?.id)?null:(records[item?.id]?.last||records[item?.id])}
function retry(){const item=current();retrying.add(item.id);if(reviewQueue)reviewFeedback=null;delete drafts[item.id];delete tokens[item.id];selectedToken='';message='';render()}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({lang,stage:reviewQueue?resumeStage:stage,positions,records,drafts,tokens,own,modelSeen,retrying:[...retrying]}))}catch(_){}}


const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).trim().toLocaleLowerCase().replace(/[.!?¿¡]/g,'').replace(/\s+/g,' ');
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
const orders=Object.fromEntries(all.filter(x=>x.o).map(x=>[x.id,shuffle(x.o.map((_,i)=>i))]));
const t=()=>D[lang], tr=w=>w[{uk:1,en:2,ru:3}[lang]];
function current(){return reviewQueue?reviewQueue[reviewAt]:groups[stage]?.[positions[stage]]}
function capture(){const el=root.querySelector('#ep-answer');if(el&&current())drafts[current().id]=el.value;root.querySelectorAll('[data-own]').forEach(el=>own[Number(el.dataset.own)]=el.value)}
function sentence(item,answer){
if(item.type==='build'||item.id.startsWith('s')||item.id.startsWith('f'))return answer;
if(item.p.includes('___'))return item.p.replace('___',answer);
const subject=item.p.split(' + ')[0];return subject.charAt(0).toUpperCase()+subject.slice(1)+( /^(los|las) /i.test(subject)?' son ':' es ')+answer+'.';
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
return (r.ok?`<strong>${scoring.includes(item)&&!reviewQueue&&records[item.id]?.ok?'⚽ '+t().correct:({ru:'Правильно!',uk:'Правильно!',en:'Correct!'})[lang]}</strong>`:`<div class="wrong-answer"><b>❌ ${x.your}</b><div class="es-answer">${esc(wrong)}</div><small>${x.literal}</small><div>${esc(translate(wrong))}</div></div>`)+`<div class="right-answer"><b>✅ ${x.right}</b><div class="es-answer">${esc(right)}</div><div>${esc(translate(right))}</div></div>`+(!r.ok?`<p class="muted">${lang==='en'?x.explain:t().why}</p>`:'')+`<button type="button" id="ep-listen" class="cursor-interaction">🔊 ${A[lang].listen}</button><small>${t().read}</small>${audioStatus?`<p role="status" class="muted">${esc(audioStatus)}</p>`:''}`;
}
function taskUI(item){const a=reviewQueue?reviewAt:positions[stage],total=reviewQueue?reviewQueue.length:groups[stage].length,r=uiRecord(item),checked=!!r;
let label=stage===3?t().warm:stage===4?t().match:stage===6?t().fix:item.type==='build'?t().build:item.type==='input'?t().write:t().selectType;
let control='';
if(item.type==='choice')control=`<div class="goal-wrap"><div id="ep-goal" class="goal-net ${drafts[item.id]?'has-ball':''}" role="group" aria-label="${X[lang].goal}"><button type="button" id="ep-drop" class="cursor-interaction" ${checked?'disabled':''}>⚽ ${esc(drafts[item.id]||X[lang].goal)}</button></div><p class="muted">${X[lang].drag}</p></div><div class="choices">${orders[item.id].map(i=>`<button type="button" draggable="${!checked}" class="cursor-interaction ${selectedToken===item.o[i]?'selected':''}" data-choice="${i}" ${checked?'disabled':''}>${esc(item.o[i])}</button>`).join('')}</div><label class="dropdown-label" for="ep-options">${X[lang].dropdown}</label><select id="ep-options" ${checked?'disabled':''}><option value="">${X[lang].choose}</option>${orders[item.id].map(i=>`<option value="${esc(item.o[i])}" ${drafts[item.id]===item.o[i]?'selected':''}>${esc(item.o[i])}</option>`).join('')}</select>`;
else if(item.type==='build'){const used=tokens[item.id]||[];control=`<div class="answerbox" aria-label="${t().answer}">${used.map((i,j)=>`<button type="button" class="cursor-interaction" data-remove="${j}" ${checked?'disabled':''}>${esc(item.o[i])}</button>`).join('')}</div><div class="tokens">${orders[item.id].map(i=>`<button type="button" class="cursor-interaction" data-token="${i}" ${used.includes(i)||checked?'disabled':''}>${esc(item.o[i])}</button>`).join('')}</div>`}
else control=`<label for="ep-answer" class="muted">${t().answer}</label><input id="ep-answer" autocomplete="off" spellcheck="false" value="${esc(drafts[item.id]||'')}" ${checked?'disabled':''}>`;
return `<div class="eyebrow">${t().task} ${a+1} ${t().of} ${total}</div><p>${label}</p>${item.p?`<div class="sentence">${esc(item.p)}</div>`:''}${control}<div class="feedback ${r?(r.ok?'good':'bad'):''}" aria-live="polite">${message?esc(message):feedback(r,item)}</div><div class="footer"><button type="button" id="ep-prev" class="cursor-interaction" ${a===0?'disabled':''}>← ${t().back}</button>${checked&&!r.ok?`<button type="button" id="ep-retry" class="primary cursor-interaction">${({ru:"Исправить ответ",uk:"Виправити відповідь",en:"Try again"})[lang]}</button>`:checked?`<button type="button" id="ep-task-next" class="primary cursor-interaction">${t().continue} →</button>`:`<button type="button" id="ep-check" class="primary cursor-interaction">${t().check}</button>`}</div>`}
function model(){return `<p>${t().newintro}</p><div class="hint">${t().formula}</div><div class="panel">${['Messi es un jugador bueno.','Alexia es una jugadora buena.','España es un equipo fuerte.'].map((x,i)=>`<div class="model">${x}</div><div class="muted">${t().newmeaning[i]}</div>`).join('')}</div><p>${t().note}</p><button type="button" id="ep-model-start" class="primary cursor-interaction">${t().modelstart} →</button>`}
function result(){const done=all.filter(x=>records[x.id]),first=done.filter(x=>records[x.id].ok),errors=all.filter(x=>records[x.id]&&!records[x.id].ok&&!records[x.id].resolved);return `<div class="scores"><div class="panel"><strong>${first.length} / ${all.length}</strong>${t().first}</div><div class="panel"><strong>${done.length} / ${all.length}</strong>${t().attempts}</div></div>${done.length<all.length?`<p class="hint">${t().pending}</p>`:''}${errors.length?`<button type="button" id="ep-review" class="primary cursor-interaction">${t().review} (${errors.length}) →</button>`:done.length?`<p>${t().allright}</p>`:''}<div class="panel"><h2>${t().viewown}</h2>${own.map(x=>`<p>${esc(x)||'—'}</p>`).join('')}<small>${t().ownnote}</small></div><details><summary>${t().home}</summary><p>${t().hw}</p></details><p class="muted">${t().saved}</p><button type="button" id="ep-reset" class="cursor-interaction">${t().reset}</button>`}
function render(){persist();root.lang=lang;const done=Object.keys(records).length;const goals=scoring.filter(x=>records[x.id]?.ok).length;let content='';
if(reviewQueue)content=reviewAt<reviewQueue.length?taskUI(current()):`<p>${t().reviewdone}</p><button id="ep-review-finish" type="button" class="primary cursor-interaction">${t().names[8]} →</button>`;
else if(stage===0)content=`<p>${t().intro}</p><div class="panel"><div class="eyebrow">${t().goal}</div><p>${t().rule}</p><div class="steps"><span>bueno</span><span>buena</span><span>buenos</span><span>buenas</span></div></div><details><summary>⚽ ${t().names[1]}</summary><div class="vocab">${football.map(w=>`<div class="word"><b>${w[0]}</b><span>${tr(w)}</span></div>`).join('')}</div></details><button type="button" id="ep-start" class="primary cursor-interaction">${t().start} →</button>`;
else if(stage===1)content=`<p>${t().words}</p><div class="hint">${X[lang].contrast}</div><div class="vocab">${vocab.map((w,i)=>`<button type="button" class="word cursor-interaction" data-word="${i}" aria-label="${esc(w[0]+' — '+t().reveal)}"><b>${w[0]}</b><span>${hiddenWords.has(i)?'…':tr(w)}</span></button>`).join('')}</div>`;
else if(stage===2)content=`<p>${t().rule}</p><div class="panel"><table><thead><tr><th></th><th>${t().masc}</th><th>${t().fem}</th></tr></thead><tbody><tr><th>${t().one}</th><td>El jugador es <b>bueno</b>.</td><td>La jugadora es <b>buena</b>.</td></tr><tr><th>${t().many}</th><td>Los jugadores son <b>buenos</b>.</td><td>Las jugadoras son <b>buenas</b>.</td></tr></tbody></table></div><div class="steps"><span>-o</span><span>-a</span><span>-os</span><span>-as</span></div><p>${t().unchanged}</p><div class="model">La jugadora es fuerte.<br>Las jugadoras son fuertes.<br>El jugador es débil.<br>Los jugadores son débiles.</div><div class="hint">${t().one}: <b>es</b> · ${t().many}: <b>son</b></div>`;
else if(stage===5&&!modelSeen)content=model();
else if(groups[stage])content=taskUI(current());
else if(stage===7)content=`<p>${t().own}</p>${['… es un jugador …','… es una jugadora …','… es un equipo …'].map((x,i)=>`<div class="own"><label for="ep-own-${i}" class="muted">${x}</label><textarea id="ep-own-${i}" data-own="${i}" spellcheck="false">${esc(own[i])}</textarea></div>`).join('')}<p class="muted">${t().ownnote}</p><p aria-live="polite">${esc(message)}</p><button type="button" id="ep-finish" class="primary cursor-interaction">${t().finish} →</button>`;
else content=result();
root.innerHTML=`<header class="header"><a class="brand" href="../" aria-label="EsProfe"><img class="logo" src="../assets/brand/esprofe-logo-spain.jpg" alt="EsProfe">EsProfe</a><div class="headright"><div class="scoreboard" aria-live="polite" aria-label="${t().goals}"><span>⚽ ${t().goals}</span><strong>${goals}</strong></div><span class="status">${t().preview}</span><label for="ep-language" class="muted">${t().lang}</label><select id="ep-language"><option value="uk" ${lang==='uk'?'selected':''}>Українська</option><option value="en" ${lang==='en'?'selected':''}>English</option><option value="ru" ${lang==='ru'?'selected':''}>Русский</option></select></div></header><div class="shell"><nav aria-label="${t().practice}"><div class="fit-content">${t().names.map((n,i)=>`<button type="button" class="cursor-interaction ${stage===i&&!reviewQueue?'active':''}" data-stage="${i}" ${stage===i&&!reviewQueue?'aria-current="step"':''}>${i+1}. ${n}</button>`).join('')}<small>${t().goals}: ${goals} / ${scoring.length}</small><small>${X[lang].hint}</small><small>${t().saved}</small></div></nav><main><div class="fit-content"><div class="eyebrow">A1 · ⚽ ${t().preview}</div><h1>${reviewQueue?t().repeat:stage===0?t().title:stage===8?t().result:t().names[stage]}</h1>${content}${!reviewQueue&&[1,2].includes(stage)?`<div class="footer"><button id="ep-simple-back" type="button" class="cursor-interaction">← ${t().back}</button><button id="ep-simple-next" type="button" class="primary cursor-interaction">${t().ready} →</button></div>`:''}<div class="track" role="progressbar" aria-label="${t().attempts}" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${all.length}"><div class="fill" style="width:${done/all.length*100}%"></div></div></div></main></div>`;
bind();fit();}
function putGoal(word){const item=current();if(!item||word!==''&&!item.o?.includes(word))return;drafts[item.id]=word;selectedToken='';message='';render()}
function fit(){
root.querySelectorAll('.fit-content').forEach(inner=>{
const parent=inner.parentElement,style=getComputedStyle(parent);
const availableH=parent.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
const availableW=parent.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
if(availableH<=4||availableW<=0)return;
inner.style.transform='none';inner.style.width='100%';
let scale=1;
for(let i=0;i<6;i++){
 inner.style.width=(availableW/scale)+'px';
 const naturalH=inner.scrollHeight;
 if(naturalH*scale<=availableH-2)break;
 scale=Math.min(scale,(availableH-2)/naturalH);
}
inner.style.transform='scale('+scale+')';
});
}
root.addEventListener('toggle',fit,true);
window.addEventListener('resize',fit);
if(window.visualViewport)window.visualViewport.addEventListener('resize',fit);
if(typeof ResizeObserver!=='undefined')new ResizeObserver(fit).observe(root);
document.fonts?.ready.then(fit);
function on(id,fn){const el=root.querySelector('#'+id);if(el)el.onclick=fn}
function go(s){audioStatus='';audioRequest++;if(window.speechSynthesis)window.speechSynthesis.cancel();autoReview=false;selectedToken='';capture();stage=s;reviewQueue=null;reviewFeedback=null;message='';render()}
function check(){capture();const item=current();const answer=item.type==='build'?(tokens[item.id]||[]).map(i=>item.o[i]).join(' '):(drafts[item.id]||'');if(!answer.trim()){message=t().empty;render();return}if(uiRecord(item))return;
const r={ok:norm(answer)===norm(item.a),answer:item.a,picked:answer};const first=!records[item.id];
if(first)records[item.id]={...r,last:r,history:[],resolved:r.ok,due:Object.keys(records).length+4};
const saved=records[item.id];saved.last=r;saved.history.push({...r,phase:reviewQueue?'repeat':first?'first':'correction'});retrying.delete(item.id);
if(reviewQueue){reviewFeedback=r;if(r.ok)saved.resolved=true;else saved.due=Object.keys(records).length+3;}
message='';audioStatus='';render();if(r.ok)speakSpanish(sentence(item,item.a));}
function nextTask(){audioStatus='';audioRequest++;if(window.speechSynthesis)window.speechSynthesis.cancel();selectedToken='';capture();message='';if(!uiRecord(current())?.ok)return;
if(reviewQueue){reviewAt++;reviewFeedback=null;if(autoReview&&reviewAt>=reviewQueue.length){reviewQueue=null;autoReview=false;stage=resumeStage;}render();return}
if(positions[stage]+1<groups[stage].length)positions[stage]++;else stage++;
const count=Object.keys(records).length;const due=all.find(x=>records[x.id]&&!records[x.id].resolved&&records[x.id].due<=count);
if(due){resumeStage=stage;autoReview=true;reviewQueue=[due];reviewAt=0;reviewFeedback=null;delete drafts[due.id];delete tokens[due.id];}
render()}
function bind(){root.querySelector('#ep-language').onchange=e=>{capture();lang=e.target.value;message='';audioStatus='';render()};root.querySelectorAll('[data-stage]').forEach(el=>el.onclick=()=>go(Number(el.dataset.stage)));root.querySelectorAll('[data-word]').forEach(el=>el.onclick=()=>{const i=Number(el.dataset.word);hiddenWords.has(i)?hiddenWords.delete(i):hiddenWords.add(i);render()});root.querySelectorAll('[data-choice]').forEach(el=>{el.onclick=()=>{selectedToken=current().o[Number(el.dataset.choice)];message='';render()};el.ondragstart=e=>{e.dataTransfer.setData('text/plain',current().o[Number(el.dataset.choice)]);e.dataTransfer.effectAllowed='copy'}});const goal=root.querySelector('#ep-goal');const currentRecord=uiRecord(current());if(goal&&!currentRecord){goal.ondragover=e=>{e.preventDefault();goal.classList.add('drag-over')};goal.ondragleave=()=>goal.classList.remove('drag-over');goal.ondrop=e=>{e.preventDefault();putGoal(e.dataTransfer.getData('text/plain'))};on('ep-drop',()=>putGoal(selectedToken))}const select=root.querySelector('#ep-options');if(select)select.onchange=e=>putGoal(e.target.value);root.querySelectorAll('[data-token]').forEach(el=>el.onclick=()=>{const item=current();tokens[item.id]??=[];tokens[item.id].push(Number(el.dataset.token));render()});root.querySelectorAll('[data-remove]').forEach(el=>el.onclick=()=>{tokens[current().id].splice(Number(el.dataset.remove),1);render()});on('ep-start',()=>go(1));on('ep-simple-back',()=>go(stage-1));on('ep-simple-next',()=>go(stage+1));on('ep-model-start',()=>{modelSeen=true;render()});on('ep-listen',()=>{const item=current();if(item)speakSpanish(sentence(item,item.a))});on('ep-check',check);on('ep-retry',retry);on('ep-task-next',nextTask);on('ep-prev',()=>{capture();if(reviewQueue){reviewAt--;reviewFeedback=null}else positions[stage]--;message='';render()});on('ep-finish',()=>{capture();if(own.some(x=>!x.trim())){message=t().ownempty;render()}else go(8)});on('ep-review',()=>{autoReview=false;resumeStage=8;reviewQueue=all.filter(x=>records[x.id]&&!records[x.id].ok&&!records[x.id].resolved);reviewAt=0;reviewFeedback=null;reviewQueue.forEach(x=>{delete drafts[x.id];delete tokens[x.id]});render()});on('ep-review-finish',()=>go(8));on('ep-reset',()=>{if(!confirm(t().resetask))return;retrying.clear();autoReview=false;records={};drafts={};tokens={};positions={3:0,4:0,5:0,6:0};own=['','',''];modelSeen=false;go(0)});const input=root.querySelector('#ep-answer');if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();check()}}}
try{const saved=JSON.parse(localStorage.getItem(SAVE_KEY));if(saved&&D[saved.lang]){lang=saved.lang;stage=saved.stage;positions=saved.positions;records=saved.records;drafts=saved.drafts;tokens=saved.tokens;own=saved.own;modelSeen=saved.modelSeen;retrying=new Set(saved.retrying||[]);}}catch(_){}
const requestedLanguage=new URLSearchParams(window.location.search).get("lang");if(D[requestedLanguage])lang=requestedLanguage;
render();
})().catch(error=>{console.error(error);document.getElementById("esprofe-football").textContent="Не удалось загрузить урок / Не вдалося завантажити урок / Could not load the lesson. Обновите страницу / Оновіть сторінку / Reload the page.";});
