"use strict";

/* B1 curriculum layer: reads the curriculum data and renders it inside Grammar.
   It is deliberately separate from grammar.js so existing lessons remain untouched. */
(function () {
  const DATA_URL = "data/curriculum-b1.json";

  function lang() { return document.getElementById("language")?.value || "ru"; }
  function labels() {
    const l = lang();
    return { ru:{title:"Маршрут B1",intro:"Полный учебный маршрут до уровня B1: правило → практика → тренажёр → контроль.",planned:"Запланировано",progress:"готово",back:"← Назад к грамматике"}, uk:{title:"Маршрут B1",intro:"Повний навчальний маршрут до рівня B1: правило → практика → тренажер → контроль.",planned:"Заплановано",progress:"готово",back:"← Назад до граматики"}, en:{title:"B1 learning route",intro:"Complete B1 route: explanation → practice → trainer → assessment.",planned:"Planned",progress:"ready",back:"← Back to grammar"}, es:{title:"Ruta de aprendizaje B1",intro:"Ruta completa B1: explicación → práctica → entrenador → evaluación.",planned:"Planificado",progress:"listo",back:"← Volver a gramática"} }[l] || null;
  }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>\"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch])); }
  function statusLabel(status,L) { if(status==="in-progress") return "🟡 "+L.progress; if(status==="complete") return "🟢 "+L.progress; return "⚪ "+L.planned; }
  function setB1View(active) {
    const trainer=document.querySelector(".trainer");
    if(trainer) trainer.style.display=active ? "none" : "";
  }

  function render(data) {
    const root=document.getElementById("grammarSection"); if(!root)return;
    const L=labels(); setB1View(true); root.style.display="block";
    root.innerHTML=`<div class="grammar-header b1-route-header"><div><div class="grammar-kicker">🎓 B1</div><h2>${escapeHtml(L.title)}</h2><p>${escapeHtml(L.intro)}</p></div><button id="b1Back" type="button">${escapeHtml(L.back)}</button></div><div class="b1-route-summary"><strong>${escapeHtml(data.title)}</strong><span>${data.modules.length} учебных модулей</span><span>${data.lessonFlow.length} этапов каждого урока</span></div><div class="b1-modules">${data.modules.map((module,mi)=>`<section class="b1-module"><div class="b1-module-head"><span class="b1-module-number">${String(mi+1).padStart(2,"0")}</span><div><h3>${escapeHtml(module.title)}</h3><small>${module.topics.length} тем</small></div></div><div class="b1-topic-grid">${module.topics.map(topic=>`<button type="button" class="b1-topic-card" data-b1-topic="${escapeHtml(topic.id)}" data-b1-module="${escapeHtml(module.id)}"><strong>${escapeHtml(topic.title)}</strong><span>${statusLabel(topic.status,L)}</span></button>`).join("")}</div></section>`).join("")}</div><div class="b1-flow"><strong>Учебный цикл:</strong> ${data.lessonFlow.map((step,i)=>`<span>${i+1}. ${escapeHtml(step)}</span>`).join(" → ")}</div>`;
    document.getElementById("b1Back")?.addEventListener("click",()=>{setB1View(false);if(typeof renderGrammar==="function")renderGrammar("presente");});
    root.querySelectorAll("[data-b1-topic]").forEach(button=>button.addEventListener("click",()=>{const topicId=button.dataset.b1Topic;document.dispatchEvent(new CustomEvent("esprofe:b1Topic",{detail:{topicId,moduleId:button.dataset.b1Module}}));button.classList.add("selected");}));
  }

  async function open() {
    const root=document.getElementById("grammarSection"); if(!root)return; setB1View(true); root.style.display="block";
    try { const response=await fetch(DATA_URL,{cache:"no-store"}); if(!response.ok)throw new Error("B1 curriculum request failed"); render(await response.json()); }
    catch(error){root.innerHTML=`<div class="grammar-result-card"><h2>B1</h2><p>Не удалось загрузить учебный маршрут B1.</p><button id="b1Retry" class="grammar-primary">Повторить</button></div>`;document.getElementById("b1Retry")?.addEventListener("click",open);console.error(error);}
  }
  document.addEventListener("esprofe:subtopic",event=>{if(event.detail?.topic==="grammar"&&event.detail?.subtopic==="b1")open();});
  document.addEventListener("esprofe:languageChanged",()=>{const root=document.getElementById("grammarSection");if(root?.querySelector(".b1-modules"))open();});
  window.openB1Curriculum=open;
})();
