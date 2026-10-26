"use strict";
(function(){
const DATA_URL="data/curriculum-a1.json";
const I={ru:{title:"Курс A1",freeIntro:"Все готовые уроки A1 доступны в свободном порядке. На каждой карточке видно, чему посвящён урок.",courseIntro:"Персональный маршрут A1: прогресс, слабые места и последовательное продвижение.",back:"← Назад",ready:"Открыть урок",planned:"Скоро",done:"Пройдено",review:"Нужно повторить",locked:"Следующий урок откроется после успешного завершения",completion:"Чтобы завершить урок: выполните все задания, наберите не менее 80% в контроле и исправьте ошибки.",modules:"модулей",topics:"тем",flow:"Учебный цикл",later:"Дальше по курсу"},uk:{title:"Курс A1",freeIntro:"Усі готові уроки A1 доступні у вільному порядку. На кожній картці видно тему уроку.",courseIntro:"Персональний маршрут A1: прогрес, слабкі місця та послідовне навчання.",back:"← Назад",ready:"Відкрити урок",planned:"Незабаром",done:"Пройдено",review:"Потрібно повторити",locked:"Наступний урок відкриється після успішного завершення",completion:"Щоб завершити урок: виконайте всі завдання, наберіть щонайменше 80% у контролі та виправте помилки.",modules:"модулів",topics:"тем",flow:"Навчальний цикл",later:"Далі за курсом"},en:{title:"A1 course",freeIntro:"All ready A1 lessons can be opened freely. Each card shows exactly what the lesson covers.",courseIntro:"Your personal A1 path with saved progress, weak spots and guided sequencing.",back:"← Back",ready:"Open lesson",planned:"Coming soon",done:"Completed",review:"Review needed",locked:"The next lesson opens after successful completion of",completion:"To complete the lesson: do all tasks, score at least 80% in the assessment and correct your mistakes.",modules:"modules",topics:"topics",flow:"Learning cycle",later:"Later in the course"},es:{title:"Curso A1",freeIntro:"Todas las lecciones A1 listas se pueden abrir libremente. Cada tarjeta muestra claramente el contenido.",courseIntro:"Tu itinerario personal A1 con progreso, puntos débiles y avance guiado.",back:"← Volver",ready:"Abrir lección",planned:"Próximamente",done:"Completado",review:"Necesita repaso",locked:"La siguiente lección se abrirá tras completar con éxito",completion:"Para completar la lección: realiza todas las actividades, consigue al menos un 80% en la prueba y corrige los errores.",modules:"módulos",topics:"temas",flow:"Ciclo de aprendizaje",later:"Más adelante"}};
const FLOW={ru:{explanation:"объяснение",examples:"примеры",practice:"практика",trainer:"тренажёр",assessment:"контроль",result:"результат",review:"повторение"},uk:{explanation:"пояснення",examples:"приклади",practice:"практика",trainer:"тренажер",assessment:"контроль",result:"результат",review:"повторення"},en:{explanation:"explanation",examples:"examples",practice:"practice",trainer:"trainer",assessment:"assessment",result:"result",review:"review"},es:{explanation:"explicación",examples:"ejemplos",practice:"práctica",trainer:"entrenador",assessment:"evaluación",result:"resultado",review:"repaso"}};
const MAP={ru:{title:"Маршрут по Испании",lead:"Каждая остановка — учебный этап A1. Пройденные города подсвечиваются.",done:"пройдено",review:"повторить",current:"текущая остановка",locked:"впереди"},uk:{title:"Маршрут Іспанією",lead:"Кожна зупинка — навчальний етап A1. Пройдені міста підсвічуються.",done:"пройдено",review:"повторити",current:"поточна зупинка",locked:"попереду"},en:{title:"Route across Spain",lead:"Each stop is an A1 learning stage. Completed cities light up.",done:"completed",review:"review",current:"current stop",locked:"ahead"},es:{title:"Ruta por España",lead:"Cada parada es una etapa de A1. Las ciudades completadas se iluminan.",done:"completado",review:"repasar",current:"parada actual",locked:"por delante"}};
const MAP_STOPS=[
  ["a1-foundations-01","Santiago",16,38],["a1-grammar-01","Oviedo",30,22],["a1-grammar-02","Bilbao",52,23],["a1-verbs-01","Zaragoza",67,35],["a1-verbs-02","Barcelona",84,39],["a1-verbs-03","Valencia",74,58],["a1-verbs-04","Murcia",73,74],["a1-grammar-03","Málaga",52,84],["a1-grammar-04","Sevilla",36,78],["a1-grammar-05","Mérida",27,63],["a1-vocabulary","Madrid",50,48],["a1-communication","Toledo",44,60],["a1-skills","Salamanca",35,39],["a1-assessment","Valladolid",39,29]
];
const lang=()=>document.getElementById("language")?.value||"ru",L=()=>I[lang()]||I.ru,esc=v=>String(v??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));let currentMode="course",catalog=null,renderVersion=0;
function isFree(){return currentMode==="free"}function unlocked(id){return isFree()||(window.isLessonUnlocked?window.isLessonUnlocked("A1",id):id==="alphabet-pronunciation")}function passed(id){return window.isLessonPassed?window.isLessonPassed("A1",id):false}function cleared(id){return window.isLessonCleared?window.isLessonCleared("A1",id):passed(id)}
function lessonMeta(id){return catalog?.lessons?.[id]}function isReady(id){return lessonMeta(id)?.status==="ready"}
function previousLessonTitle(id){const order=window.A1_LESSON_ORDER||[],previous=order[order.indexOf(id)-1],meta=lessonMeta(previous),text=meta?.[lang()]||meta?.ru;return text?.[0]||previous||""}
function status(id){if(!isReady(id))return["planned",`○ ${L().planned}`,true];if(isFree())return["ready",`▶ ${L().ready}`,false];const g=window.getProgressData?.().lessons?.A1?.[id];if(cleared(id))return["done",`✅ ${L().done} · ${g?.percent||0}%`,false];if(passed(id))return["review",`🔁 ${L().review} · ${g?.percent||0}%`,false];if(!unlocked(id))return["locked",`🔒 ${L().locked} «${previousLessonTitle(id)}»`,true,L().completion];return["ready",`▶ ${L().ready}`,false]}
function moduleTitle(m){const x=catalog?.modules?.[m.id];return x?.[lang()]||x?.ru||m.title}
function card(t){const [s,label,disabled,hint]=status(t.id),m=lessonMeta(t.id),text=m?.[lang()]||m?.ru||[t.title,""];return `<button type="button" class="a1-topic-card ${s}" data-a1-topic="${esc(t.id)}" ${disabled?"disabled":""}><span class="a1-topic-icon">${esc(m?.icon||"📘")}</span><span class="a1-topic-copy"><strong>${esc(text[0])}</strong><span class="a1-topic-description">${esc(text[1])}</span><small>${esc(label)}</small>${hint?`<small class="a1-topic-guidance">${esc(hint)}</small>`:""}</span></button>`}
function moduleBlock(m,index){return `<section class="a1-module" data-a1-module="${esc(m.id)}"><div class="a1-module-head"><span>${String(index+1).padStart(2,"0")}</span><h3>${esc(moduleTitle(m))}</h3></div><div class="a1-topic-grid">${m.topics.map(card).join("")}</div></section>`}
function moduleMapState(moduleId){
  const module=(window.__a1RouteModules||[]).find(item=>item.id===moduleId),topics=module?.topics?.filter(topic=>isReady(topic.id))||[];
  const total=topics.length,done=topics.filter(topic=>cleared(topic.id)).length,needsReview=topics.filter(topic=>passed(topic.id)&&!cleared(topic.id)).length;
  const current=topics.some(topic=>unlocked(topic.id)&&!cleared(topic.id));
  const state=total&&done===total?"done":needsReview?"review":current?"current":"locked";
  return {state,done,total};
}
function routeMapHTML(){
  if(isFree())return "";
  const t=MAP[lang()]||MAP.ru,route=MAP_STOPS.map(stop=>stop.slice(2).join(",")).join(" ");
  return `<section class="a1-spain-route" aria-labelledby="a1SpainRouteTitle"><div class="a1-spain-route-head"><div><h3 id="a1SpainRouteTitle">🗺️ ${esc(t.title)}</h3><p>${esc(t.lead)}</p></div><div class="a1-spain-route-legend"><span class="done">● ${esc(t.done)}</span><span class="current">● ${esc(t.current)}</span><span class="review">● ${esc(t.review)}</span><span class="locked">● ${esc(t.locked)}</span></div></div><div class="a1-spain-map-frame"><svg class="a1-spain-map" viewBox="0 0 100 100" role="img" aria-label="${esc(t.title)}"><path class="a1-spain-shape" d="M12 37 L18 28 L30 20 L47 15 L63 18 L81 28 L91 42 L86 54 L80 62 L78 76 L66 86 L52 90 L39 88 L29 82 L18 72 L12 59 L8 48 Z"/><polyline class="a1-spain-route-line" points="${route}"/>${MAP_STOPS.map(([moduleId,city,x,y])=>{const p=moduleMapState(moduleId),label=`${city} · ${p.done}/${p.total}`;return `<g class="a1-map-stop ${p.state}" data-a1-map-module="${esc(moduleId)}" tabindex="0" role="button" aria-label="${esc(label)}"><circle cx="${x}" cy="${y}" r="2.65"/><circle class="a1-map-stop-pulse" cx="${x}" cy="${y}" r="4.2"/><text x="${x}" y="${y-4.2}" text-anchor="middle">${esc(city)}</text></g>`}).join("")}<g class="a1-spain-islands" aria-hidden="true"><circle cx="92" cy="67" r="1.1"/><circle cx="12" cy="83" r=".9"/><circle cx="16" cy="86" r=".7"/></g></svg></div></section>`}
function openTopic(id){if(!isReady(id)||!unlocked(id))return;if(!isFree()&&passed(id)&&!cleared(id)){const q=Object.values(window.getProgressData?.().reviewQueue||{}).find(x=>x.level==="A1"&&x.lessonId===id&&x.active!==false);if(q)return document.dispatchEvent(new CustomEvent("esprofe:reviewWeakSpot",{detail:{level:"A1",lessonId:id,tag:q.tag}}))}document.dispatchEvent(new CustomEvent("esprofe:a1Topic",{detail:{topicId:id,mode:currentMode}}))}
async function open(options={}){
  const version=++renderVersion;
  currentMode=options.mode||document.documentElement.dataset.learningMode||"course";
  const r=document.getElementById("grammarSection");
  if(!r)return;
  document.querySelector(".trainer")?.style.setProperty("display","none");
  r.style.display="block";
  try{
    const [res,c]=await Promise.all([fetch(DATA_URL,{cache:"no-store"}),window.EsProfeA1Catalog.catalog()]);
    if(!res.ok)throw new Error("A1 curriculum load failed");
    catalog=c;
    const data=await res.json();
    if(version!==renderVersion)return;
    window.__a1RouteModules=data.modules;
    const l=L(),flow=FLOW[lang()]||FLOW.ru,intro=isFree()?l.freeIntro:l.courseIntro;
    const visible=data.modules.filter(m=>m.topics.some(t=>isReady(t.id)));
    const later=data.modules.filter(m=>!m.topics.some(t=>isReady(t.id)));
    const moduleHtml=visible.map(m=>moduleBlock(m,data.modules.indexOf(m))).join("");
    const laterHtml=later.map(m=>`<div class="a1-future-module"><span>${String(data.modules.indexOf(m)+1).padStart(2,"0")}</span><strong>${esc(moduleTitle(m))}</strong><small>○ ${esc(l.planned)}</small></div>`).join("");
    r.innerHTML=`<div class="a1-route"><div class="grammar-header"><div><div class="grammar-kicker">🎓 A1</div><h2>${esc(l.title)}</h2><p>${esc(intro)}</p></div><button id="a1RouteBack">${esc(l.back)}</button></div><div class="a1-route-summary"><strong>${data.modules.length} ${esc(l.modules)}</strong><span>${data.modules.reduce((n,m)=>n+m.topics.length,0)} ${esc(l.topics)}</span></div>${routeMapHTML()}${moduleHtml}${later.length?`<h3>${esc(l.later)}</h3><div class="a1-future-modules">${laterHtml}</div>`:""}<div class="a1-flow"><strong>${esc(l.flow)}:</strong> ${data.lessonFlow.map(x=>`<span>${esc(flow[x]||x)}</span>`).join(" → ")}</div></div>`;
    r.querySelectorAll("[data-a1-topic]:not(:disabled)").forEach(b=>b.addEventListener("click",()=>openTopic(b.dataset.a1Topic)));
    r.querySelectorAll("[data-a1-map-module]").forEach(stop=>{const go=()=>r.querySelector('[data-a1-module="'+stop.dataset.a1MapModule+'"]')?.scrollIntoView({behavior:"smooth",block:"start"});stop.addEventListener("click",go);stop.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();go()}})});
    document.getElementById("a1RouteBack").onclick=()=>document.dispatchEvent(new CustomEvent("esprofe:a1Back",{detail:{mode:currentMode}}));
  }catch(e){
    if(version!==renderVersion)return;
    console.error(e);
    r.innerHTML=`<div class="a1-route"><p>Не удалось загрузить A1.</p></div>`;
  }
}
document.addEventListener("esprofe:languageChanged",()=>{if(document.querySelector(".a1-route"))open({mode:currentMode})});document.addEventListener("esprofe:progressChanged",()=>{if(document.querySelector(".a1-route")&&!isFree())open({mode:currentMode})});window.openA1Curriculum=open;window.EsProfeA1Curriculum={cancel:()=>{renderVersion++}};
document.addEventListener("esprofe:a1Topic",()=>{renderVersion++});
})();
