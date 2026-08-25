"use strict";
(function(){
const labels={
ru:{title:"Прогресс занятия",hint:"Продолжайте — дерево растёт вместе с вашей практикой",answers:"заданий",correct:"верно",streak:"серия",milestone:"Отличная серия!",save:"Хотите сохранить результаты и получать рекомендации?",profile:"Создать профиль"},
uk:{title:"Прогрес заняття",hint:"Продовжуйте — дерево росте разом із вашою практикою",answers:"завдань",correct:"правильно",streak:"серія",milestone:"Чудова серія!",save:"Хочете зберігати результати та отримувати рекомендації?",profile:"Створити профіль"},
en:{title:"Session progress",hint:"Keep going — the tree grows with your practice",answers:"tasks",correct:"correct",streak:"streak",milestone:"Great streak!",save:"Want to save your results and get recommendations?",profile:"Create profile"},
es:{title:"Progreso de la sesión",hint:"Sigue así: el árbol crece con tu práctica",answers:"actividades",correct:"correctas",streak:"racha",milestone:"¡Muy buena racha!",save:"¿Quieres guardar tus resultados y recibir recomendaciones?",profile:"Crear perfil"}}
;
let state={answers:0,correct:0,streak:0,bestStreak:0};
let enabled=false;
function code(){return document.getElementById("language")?.value||"ru"}
function t(){return labels[code()]||labels.ru}
function stage(){const n=state.correct;if(n>=25)return{icon:"🌳✨",pct:100};if(n>=15)return{icon:"🌳",pct:75};if(n>=8)return{icon:"🌿",pct:50};if(n>=3)return{icon:"🌱",pct:25};return{icon:"🌰",pct:8}}
function ensure(){let el=document.getElementById("sessionProgress");if(el)return el;const mount=document.getElementById("legacyMount");if(!mount)return null;el=document.createElement("section");el.id="sessionProgress";el.className="session-progress";const hero=mount.querySelector(".hero");if(hero)hero.insertAdjacentElement("afterend",el);else mount.prepend(el);return el}
function render(){const el=ensure();if(!el)return;el.hidden=!enabled;if(!enabled)return;const x=t(),s=stage();el.innerHTML=`<div class="session-progress-visual" aria-hidden="true">${s.icon}</div><div class="session-progress-body"><div class="session-progress-top"><strong>${x.title}</strong><span>${state.answers} ${x.answers} · ${state.correct} ${x.correct}</span></div><div class="session-progress-bar"><span style="width:${s.pct}%"></span></div><small>${x.hint}</small>${state.streak>=5?`<div class="session-streak">🔥 ${x.milestone} ${state.streak}</div>`:""}</div>`}
function setEnabled(value){enabled=!!value;render()}
function record(isCorrect){if(!enabled)return;state.answers++;if(isCorrect){state.correct++;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak)}else state.streak=0;render();document.dispatchEvent(new CustomEvent("esprofe:sessionProgressChanged",{detail:{...state}}))}
function reset(){state={answers:0,correct:0,streak:0,bestStreak:0};render()}
window.EsProfeSessionProgress={setEnabled,record,reset,getState:()=>({...state})};
document.addEventListener("esprofe:languageChanged",render);
document.addEventListener("DOMContentLoaded",render);
})();
