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
    const card=document.querySelector(`[data-a1-topic="${ID}"]`);
    if(!card)return;
    const t=TEXT[lang()]||TEXT.ru;
    if(card.disabled)card.disabled=false;
    card.classList.remove("planned","locked");
    if(!card.classList.contains("ready"))card.classList.add("ready");
    const strong=card.querySelector("strong");
    const desc=card.querySelector(".a1-topic-description");
    const small=card.querySelector("small");
    if(strong&&strong.textContent!==t[0])strong.textContent=t[0];
    if(desc&&desc.textContent!==t[1])desc.textContent=t[1];
    if(small&&small.textContent!==t[2])small.textContent=t[2];
    if(card.dataset.qwBound!=="1"){
      card.dataset.qwBound="1";
      card.addEventListener("click",()=>document.dispatchEvent(new CustomEvent("esprofe:a1Topic",{detail:{topicId:ID,mode:document.documentElement.dataset.learningMode||"free"}})));
    }
  }
  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply()});
  }
  const root=document.getElementById("grammarSection")||document.body;
  const observer=new MutationObserver(schedule);
  observer.observe(root,{childList:true,subtree:true});
  document.addEventListener("esprofe:languageChanged",schedule);
  document.addEventListener("esprofe:progressChanged",schedule);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
})();