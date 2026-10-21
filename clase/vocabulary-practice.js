/* Reusable optional vocabulary practice. Self-checks never award match goals. */
(function(root){
'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy={
 ru:{cards:'Карточки',pairs:'Найди пары',overview:'Обзор слов',forward:'Испанский → перевод',reverse:'Перевод → испанский',think:'Сначала вспомни ответ вслух. Затем переверни карточку.',flip:'Перевернуть',again:'Ещё повторить',know:'Вспомнил',listen:'Послушать',left:'Осталось',done:'Круг завершён!',doneNote:'Теперь примени слова в заданиях матча. Вернись к карточкам на следующем занятии.',restart:'Новый круг',rule:'К правилу →',pairHint:'Нажми на испанское слово, затем на перевод. Можно и перетащить слово к переводу.',right:'Верная пара!',wrong:'Пока не совпало. Попробуй другую пару.',next:'Следующие пары',matched:'Найдено',self:'Самопроверка · без голов',repeat:'Повторим после других карточек.',lastRepeat:'Повторим позже: сначала вспомни другие слова.',break:'Продолжить позже',language:'Направление'},
 uk:{cards:'Картки',pairs:'Знайди пари',overview:'Огляд слів',forward:'Іспанська → переклад',reverse:'Переклад → іспанська',think:'Спочатку згадай відповідь уголос. Потім переверни картку.',flip:'Перевернути',again:'Ще повторити',know:'Згадав',listen:'Послухати',left:'Залишилося',done:'Коло завершено!',doneNote:'Тепер використай слова в завданнях матчу. Повернися до карток на наступному занятті.',restart:'Нове коло',rule:'До правила →',pairHint:'Натисни на іспанське слово, потім на переклад. Можна й перетягнути слово до перекладу.',right:'Правильна пара!',wrong:'Поки не збіглося. Спробуй іншу пару.',next:'Наступні пари',matched:'Знайдено',self:'Самоперевірка · без голів',repeat:'Повторимо після інших карток.',lastRepeat:'Повторимо пізніше: спочатку згадай інші слова.',break:'Продовжити пізніше',language:'Напрямок'},
 en:{cards:'Flashcards',pairs:'Match pairs',overview:'Word overview',forward:'Spanish → translation',reverse:'Translation → Spanish',think:'Recall the answer aloud first. Then flip the card.',flip:'Flip the card',again:'Practise again',know:'I recalled it',listen:'Listen',left:'Remaining',done:'Round complete!',doneNote:'Now use the words in the match exercises. Revisit the cards next lesson.',restart:'New round',rule:'To the rule →',pairHint:'Select a Spanish word, then its translation. You can also drag the word to its translation.',right:'Correct pair!',wrong:'Not a match yet. Try a different pair.',next:'Next pairs',matched:'Matched',self:'Self-check · no goals',repeat:'This card will return after other cards.',lastRepeat:'Revisit this later: recall other words first.',break:'Continue later',language:'Direction'}
};
function shuffle(items,rng=Math.random){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
// A failed card waits behind up to three others; don't loop on the final card.
function rate(session,known){
 if(!session.flipped||!session.queue.length)return null;
 const id=session.queue.shift();session.flipped=false;
 session.attempts??={};session.attempts[id]=(session.attempts[id]||0)+1;
 if(known){session.recalled++;session.deferred=session.deferred.filter(x=>x!==id)}
 else if(session.queue.length>=3&&session.attempts[id]<2)session.queue.splice(3,0,id);
 else if(!session.deferred.includes(id))session.deferred.push(id);
 return id;
}
function create({entries,storage,key,language,picture,thumbnail=()=>'',credits=()=>'',speak,change,overview,rule,rng=Math.random}){
 const byId=new Map(entries.map(e=>[e.id,e]));let saved={},mode='overview',direction='forward',sessions={},stats={},pair=null;
 function fresh(dir=direction){const priority=id=>{const s=stats[id+':'+dir];return s?.needsReview?0:!s?1:2};return {queue:shuffle(entries.map(e=>e.id),rng).sort((a,b)=>priority(a)-priority(b)).slice(0,5),recalled:0,deferred:[],attempts:{},flipped:false}}
 function read(){
  saved={};try{saved=JSON.parse(storage.getItem(key())||'{}')||{}}catch(_){}
  stats=saved.version===1&&saved.stats&&typeof saved.stats==='object'?saved.stats:{};sessions={};
  for(const dir of ['forward','reverse']){
   const s=saved.version===1?saved.sessions?.[dir]:null;
   sessions[dir]=s&&Array.isArray(s.queue)&&Array.isArray(s.deferred)?{queue:s.queue.filter(id=>byId.has(id)),deferred:s.deferred.filter(id=>byId.has(id)),recalled:Number.isInteger(s.recalled)?s.recalled:0,attempts:s.attempts&&typeof s.attempts==='object'?s.attempts:{},flipped:false}:fresh(dir);
  }
  pair=null;mode='overview';direction='forward';
 }
 function persist(){try{storage.setItem(key(),JSON.stringify({version:1,sessions,stats}))}catch(_){} }
 function beginPairs(){pair={ids:shuffle(entries.map(e=>e.id),rng),at:0,matched:[],selected:null,message:''};pair.order=shuffle(pair.ids.slice(0,4),rng)}
 function setMode(next){mode=next;if(mode==='pairs'&&!pair)beginPairs();change()}
 function status(id,known){const k=id+':'+direction,old=stats[k]||{};stats[k]={attempts:(old.attempts||0)+1,needsReview:!known,lastPractised:Date.now()};persist()}
 function choose(id){if(pair.matched.includes(id))return;pair.selected=id;pair.message='';change()}
 function match(id){
  if(!pair.selected||pair.matched.includes(id))return;
  if(pair.selected===id){pair.matched.push(id);pair.message='right';pair.selected=null}else pair.message='wrong';change();
 }
 function toolbar(c){return `<div class="vocab-modes" aria-label="${esc(c.overview)}"><button type="button" data-vp-mode="overview">${c.overview}</button><button type="button" data-vp-mode="cards" aria-pressed="${mode==='cards'}">${c.cards}</button><button type="button" data-vp-mode="pairs" aria-pressed="${mode==='pairs'}">${c.pairs}</button></div>`}
 function render(){
  const lang=language(),c=copy[lang]||copy.en;
  if(mode==='overview')return toolbar(c);
  let body='';
  if(mode==='cards'){
   const s=sessions[direction],entry=byId.get(s.queue[0]);
   body=`<label class="vp-direction">${c.language} <select id="vp-direction"><option value="forward" ${direction==='forward'?'selected':''}>${c.forward}</option><option value="reverse" ${direction==='reverse'?'selected':''}>${c.reverse}</option></select></label>`;
   if(entry){
    const front=direction==='forward'?entry.word:entry[lang],back=direction==='forward'?entry[lang]:entry.word;
    body+=`<p class="vp-instruction">${c.think}</p><div class="vp-card ${s.flipped?'is-flipped':''}">${picture(entry.visual,direction==='reverse'&&!s.flipped)}<button type="button" id="vp-flip" aria-expanded="${s.flipped}"><span class="vp-prompt" ${direction==='forward'?'lang="es"':''}>${esc(front)}</span><span class="vp-answer" ${direction==='reverse'?'lang="es"':''}>${s.flipped?esc(back):c.flip+' ↻'}</span></button></div><div class="vp-actions">${s.flipped?`<button type="button" id="vp-again">${c.again}</button><button type="button" id="vp-know" class="primary">${c.know}</button><button type="button" id="vp-listen">🔊 ${c.listen}</button>`:''}</div><p class="vp-status" role="status">${c.left}: ${s.queue.length}${s.deferred.length?' · '+c.again+': '+s.deferred.length:''}</p>`;
   }else body+=`<div class="vp-finished"><h2>${c.done}</h2><p>${c.doneNote}</p>${s.deferred.length?`<p>${c.again}: ${s.deferred.map(id=>esc(byId.get(id).word)).join(', ')}</p>`:''}<button type="button" id="vp-restart">${c.restart}</button></div>`;
  }else{
   const ids=pair.ids.slice(pair.at,pair.at+4),complete=ids.every(id=>pair.matched.includes(id));
   body=`<p class="vp-instruction">${c.pairHint}</p><div class="vp-pairs"><div>${ids.map(id=>`<button type="button" lang="es" draggable="${!pair.matched.includes(id)}" data-vp-word="${id}" aria-pressed="${pair.selected===id}" ${pair.matched.includes(id)?'disabled':''}>${thumbnail(byId.get(id).visual)}<span>${pair.matched.includes(id)?'✓ ':''}${esc(byId.get(id).word)}</span></button>`).join('')}</div><div>${pair.order.map(id=>`<button type="button" data-vp-target="${id}" ${pair.matched.includes(id)?'disabled':''}>${pair.matched.includes(id)?'✓ ':''}${esc(byId.get(id)[lang])}</button>`).join('')}</div></div><p class="vp-status" role="status">${pair.message?c[pair.message]+' ':''}${c.matched}: ${pair.matched.length} / ${entries.length}</p>${credits()}${complete?(pair.at+4<entries.length?`<button type="button" id="vp-next-pairs" class="primary">${c.next} →</button>`:`<p>${c.done}</p>`):''}`;
  }
  return `<section class="vocabulary-practice">${toolbar(c)}<small>${c.self}</small><div class="vp-content">${body}</div><div class="vp-footer"><button type="button" id="vp-overview">← ${c.overview}</button><button type="button" id="vp-rule" class="primary">${c.rule}</button></div></section>`;
 }
 function bind(el){
  el.querySelectorAll('[data-vp-mode]').forEach(b=>b.onclick=()=>b.dataset.vpMode==='overview'?overview():setMode(b.dataset.vpMode));
  const on=(id,fn)=>{const b=el.querySelector('#'+id);if(b)b.onclick=fn};
  const select=el.querySelector('#vp-direction');if(select)select.onchange=e=>{direction=e.target.value;sessions[direction].flipped=false;change()};
  on('vp-flip',()=>{sessions[direction].flipped=!sessions[direction].flipped;change()});
  for(const [id,known] of [['vp-again',false],['vp-know',true]])on(id,()=>{const entry=rate(sessions[direction],known);if(entry)status(entry,known);change()});
  on('vp-listen',()=>{const entry=byId.get(sessions[direction].queue[0]);if(entry)speak(entry.word)});
  on('vp-restart',()=>{sessions[direction]=fresh();persist();change()});on('vp-overview',overview);on('vp-rule',rule);
  on('vp-next-pairs',()=>{pair.at+=4;pair.selected=null;pair.message='';pair.order=shuffle(pair.ids.slice(pair.at,pair.at+4),rng);change()});
  el.querySelectorAll('[data-vp-word]').forEach(b=>{b.onclick=()=>choose(b.dataset.vpWord);b.ondragstart=e=>{pair.selected=b.dataset.vpWord;pair.message='';e.dataTransfer.setData('text/plain',b.dataset.vpWord)}});
  el.querySelectorAll('[data-vp-target]').forEach(b=>{b.onclick=()=>match(b.dataset.vpTarget);b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain');if(pair.ids.slice(pair.at,pair.at+4).includes(id)&&!pair.matched.includes(id)){pair.selected=id;match(b.dataset.vpTarget)}}});
 }
 read();return {render,bind,reset:read,setMode,get active(){return mode!=='overview'}};
}
root.EsProfeVocabularyPractice={create,rate,shuffle};
})(window);
