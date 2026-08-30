"use strict";
(function(){
  const ID="question-words";
  const TEXT={
    ru:["Вопросительные слова","qué · quién · dónde · cuándo · cómo · cuál · cuánto","▶ Открыть урок"],
    uk:["Питальні слова","qué · quién · dónde · cuándo · cómo · cuál · cuánto","▶ Відкрити урок"],
    en:["Question words","qué · quién · dónde · cuándo · cómo · cuál · cuánto","▶ Open lesson"],
    es:["Palabras interrogativas","qué · quién · dónde · cuándo · cómo · cuál · cuánto","▶ Abrir lección"]
  };
  function lang(){return document.getElementById("language")?.value||"ru"}
  function apply(){
    const card=document.querySelector(`[data-a1-topic="${ID}"]`);if(!card)return;
    const t=TEXT[lang()]||TEXT.ru;
    card.disabled=false;card.classList.remove("planned","locked");card.classList.add("ready");
    const strong=card.querySelector("strong"),desc=card.querySelector(".a1-topic-description"),small=card.querySelector("small");
    if(strong)strong.textContent=t[0];if(desc)desc.textContent=t[1];if(small)small.textContent=t[2];
    if(card.dataset.qwBound!=="1"){card.dataset.qwBound="1";card.addEventListener("click",()=>document.dispatchEvent(new CustomEvent("esprofe:a1Topic",{detail:{topicId:ID,mode:document.documentElement.dataset.learningMode||"free"}})))}
  }
  const observer=new MutationObserver(apply);observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("esprofe:languageChanged",()=>setTimeout(apply,0));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply);else apply();
})();