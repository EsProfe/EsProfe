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
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
  function apply(){
    const card=document.querySelector(`[data-a1-topic="${ID}"]`);if(!card)return;
    const t=TEXT[lang()]||TEXT.ru;
    if(card.disabled)card.disabled=false;
    if(card.classList.contains("planned"))card.classList.remove("planned");
    if(card.classList.contains("locked"))card.classList.remove("locked");
    if(!card.classList.contains("ready"))card.classList.add("ready");
    setText(card.querySelector("strong"),t[0]);
    setText(card.querySelector(".a1-topic-description"),t[1]);
    setText(card.querySelector("small"),t[2]);
    if(card.dataset.qwBound!=="1"){
      card.dataset.qwBound="1";
      card.addEventListener("click",()=>document.dispatchEvent(new CustomEvent("esprofe:a1Topic",{detail:{topicId:ID,mode:document.documentElement.dataset.learningMode||"free"}})));
    }
  }
  const observer=new MutationObserver(apply);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("esprofe:languageChanged",()=>setTimeout(apply,50));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply);else apply();
})();