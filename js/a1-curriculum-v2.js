"use strict";
(function(){
const DATA_URL="data/curriculum-a1.json";
const I={ru:{title:"Курс A1",freeIntro:"Все готовые уроки A1 доступны в свободном порядке. На каждой карточке видно, чему посвящён урок.",courseIntro:"Персональный маршрут A1: прогресс, слабые места и последовательное продвижение.",back:"← Назад",ready:"Открыть урок",planned:"Скоро",done:"Пройдено",review:"Нужно повторить",locked:"Сначала закрой предыдущий урок",modules:"модулей",topics:"тем",flow:"Учебный цикл",later:"Дальше по курсу"},uk:{title:"Курс A1",freeIntro:"Усі готові уроки A1 доступні у вільному порядку. На кожній картці видно тему уроку.",courseIntro:"Персональний маршрут A1: прогрес, слабкі місця та послідовне навчання.",back:"← Назад",ready:"Відкрити урок",planned:"Незабаром",done:"Пройдено",review:"Потрібно повторити",locked:"Спочатку заверши попередній урок",modules:"модулів",topics:"тем",flow:"Навчальний цикл",later:"Далі за курсом"},en:{title:"A1 course",freeIntro:"All ready A1 lessons can be opened freely. Each card shows exactly what the lesson covers.",courseIntro:"Your personal A1 path with saved progress, weak spots and guided sequencing.",back:"← Back",ready:"Open lesson",planned:"Coming soon",done:"Completed",review:"Review needed",locked:"Clear the previous lesson first",modules:"modules",topics:"topics",flow:"Learning cycle",later:"Later in the course"},es:{title:"Curso A1",freeIntro:"Todas las lecciones A1 listas se pueden abrir libremente. Cada tarjeta muestra claramente el contenido.",courseIntro:"Tu itinerario personal A1 con progreso, puntos débiles y avance guiado.",back:"← Volver",ready:"Abrir lección",planned:"Próximamente",done:"Completado",review:"Necesita repaso",locked:"Primero completa la lección anterior",modules:"módulos",topics:"temas",flow:"Ciclo de aprendizaje",later:"Más adelante"}};
const FLOW={ru:{explanation:"объяснение",examples:"примеры",practice:"практика",trainer:"тренажёр",assessment:"контроль",result:"результат",review:"повторение"},uk:{explanation:"пояснення",examples:"приклади",practice:"практика",trainer:"тренажер",assessment:"контроль",result:"результат",review:"повторення"},en:{explanation:"explanation",examples:"examples",practice:"practice",trainer:"trainer",assessment:"assessment",result:"result",review:"review"},es:{explanation:"explicación",examples:"ejemplos",practice:"práctica",trainer:"entrenador",assessment:"evaluación",result:"resultado",review:"repaso"}};
const lang=()=>document.getElementById("language")?.value||"ru",L=()=>I[lang()]||I.ru,esc=v=>String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));let currentMode="course",catalog=null;
function isFree(){return currentMode==="free"}function unlocked(id){return isFree()||(window.isLessonUnlocked?window.isLessonUnlocked("A1",id):id==="alphabet-pronunciation")}function passed(id){return window.isLessonPassed?window.isLessonPassed("A1",id):false}function cleared(id){return window.isLessonCleared?window.isLessonCleared("A1",id):passed(id)}
function lessonMeta(id){return catalog?.lessons?.[id]}function isReady(id){return lessonMeta(id)?.status==="ready"}
function status(id){if(!isReady(id))return["planned",`○ ${L().planned}`,true];if(isFree())return["ready",`▶ ${L().ready}`,false];const g=window.getProgressData?.().lessons?.A1?.[id];if(cleared(id))return["done",`✅ ${L().done} · ${g?.percent||0}%`,false];if(passed(id))return["review",`🔁 ${L().review} · ${g?.percent||0}%`,false];if(!unlocked(id))return["locked",`🔒 ${L().locked}`,true];return["ready",`▶ ${L().ready}`,false]}
function moduleTitle(m){const x=catalog?.modules?.[m.id];return x?.[lang()]||x?.ru||m.title}
function card(t){const [s,label,disabled]=status(t.id),m=lessonMeta(t.id),text=m?.[lang()]||m?.ru||[t.title,""];return `<button type="button" class="a1-topic-card ${s}" data-a1-topic="${esc(t.id)}" ${disabled?"disabled":""}><span class="a1-topic-icon">${esc(m?.icon||"📘")}</span><span class="a1-topic-copy"><strong>${esc(text[0])}</strong><span class="a1-topic-description">${esc(text[1])}</span><small>${esc(label)}</small></span></button>`}
function moduleBlock(m,index){return `<section class="a1-module"><div class="a1-module-head"><span>${String(index+1).padStart(2,"0")}</span><h3>${esc(moduleTitle(m))}</h3></div><div class="a1-topic-grid">${m.topics.map(card).join("")}</div></section>`}
function openTopic(id){if(!isReady(id)||!unlocked(id))return;if(!isFree()&&passed(id)&&!cleared(id)){const q=Object.values(window.getProgressData?.().reviewQueue||{}).find(x=>x.level==="A1"&&x.lessonId===id&&x.active!==false);if(q)return document.dispatchEvent(new CustomEvent("esprofe:reviewWeakSpot",{detail:{level:"A1",lessonId:id,tag:q.tag}}))}document.dispatchEvent(new CustomEvent("esprofe:a1Topic",{detail:{topicId:id,mode:currentMode}}))}
async function open(options={}){
  currentMode=options.mode||document.documentElement.dataset.learningMode||"course";
  const r=document.getElementById("grammarSection");
  if(!r)return;
  document.querySelector(".trainer")?.style.setProperty("display","none");
  r.style.display="block";
  try{
    const [res,c]=await Promise.all([fetch(DATA_URL,{cache:"no-store"}),window.EsProfeA1Catalog.catalog()]);
    if(!res.ok)throw new Error("A1 curriculum load failed");
    catalog=c;
    const data=await res.json(),l=L(),flow=FLOW[lang()]||FLOW.ru,intro=isFree()?l.freeIntro:l.courseIntro;
    const visible=data.modules.filter(m=>m.topics.some(t=>isReady(t.id)));
    const later=data.modules.filter(m=>!m.topics.some(t=>isReady(t.id)));
    const moduleHtml=visible.map(m=>moduleBlock(m,data.modules.indexOf(m))).join("");
    const laterHtml=later.map(m=>`<div class="a1-future-module"><span>${String(data.modules.indexOf(m)+1).padStart(2,"0")}</span><strong>${esc(moduleTitle(m))}</strong><small>○ ${esc(l.planned)}</small></div>`).join("");
    r.innerHTML=`<div class="a1-route"><div class="grammar-header"><div><div class="grammar-kicker">🎓 A1</div><h2>${esc(l.title)}</h2><p>${esc(intro)}</p></div><button id="a1RouteBack">${esc(l.back)}</button></div><div class="a1-route-summary"><strong>${data.modules.length} ${esc(l.modules)}</strong><span>${data.modules.reduce((n,m)=>n+m.topics.length,0)} ${esc(l.topics)}</span></div>${moduleHtml}${later.length?`<h3>${esc(l.later)}</h3><div class="a1-future-modules">${laterHtml}</div>`:""}<div class="a1-flow"><strong>${esc(l.flow)}:</strong> ${data.lessonFlow.map(x=>`<span>${esc(flow[x]||x)}</span>`).join(" → ")}</div></div>`;
    r.querySelectorAll("[data-a1-topic]:not(:disabled)").forEach(b=>b.addEventListener("click",()=>openTopic(b.dataset.a1Topic)));
    document.getElementById("a1RouteBack").onclick=()=>document.dispatchEvent(new CustomEvent("esprofe:a1Back",{detail:{mode:currentMode}}));
  }catch(e){
    console.error(e);
    r.innerHTML=`<div class="a1-route"><p>Не удалось загрузить A1.</p></div>`;
  }
}
document.addEventListener("esprofe:languageChanged",()=>{if(document.querySelector(".a1-route"))open({mode:currentMode})});document.addEventListener("esprofe:progressChanged",()=>{if(document.querySelector(".a1-route")&&!isFree())open({mode:currentMode})});window.openA1Curriculum=open;
})();
