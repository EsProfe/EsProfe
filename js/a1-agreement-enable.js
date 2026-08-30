"use strict";
(function(){
  const ID="article-noun-agreement";
  const LABELS={
    ru:["Согласование артикля и существительного","el/la/los/las · un/una/unos/unas · род + число","Открыть урок"],
    uk:["Узгодження артикля та іменника","el/la/los/las · un/una/unos/unas · рід + число","Відкрити урок"],
    en:["Article–noun agreement","el/la/los/las · un/una/unos/unas · gender + number","Open lesson"],
    es:["Concordancia entre artículo y sustantivo","el/la/los/las · un/una/unos/unas · género + número","Abrir lección"]
  };
  function lang(){return document.getElementById("language")?.value||"ru"}
  function enable(){
    const card=document.querySelector(`[data-a1-topic="${ID}"]`);
    if(!card)return;
    const t=LABELS[lang()]||LABELS.ru;
    card.disabled=false;
    card.classList.remove("planned","locked");
    card.classList.add("ready");
    const icon=card.querySelector(".a1-topic-icon"); if(icon)icon.textContent="🔗";
    const strong=card.querySelector("strong"); if(strong)strong.textContent=t[0];
    const desc=card.querySelector(".a1-topic-description"); if(desc)desc.textContent=t[1];
    const small=card.querySelector("small"); if(small)small.textContent=`▶ ${t[2]}`;
    if(card.dataset.agreementEnabled)return;
    card.dataset.agreementEnabled="1";
    card.addEventListener("click",e=>{
      e.preventDefault();e.stopImmediatePropagation();
      document.dispatchEvent(new CustomEvent("esprofe:a1Topic",{detail:{topicId:ID,mode:document.documentElement.dataset.learningMode||"free"}}));
    },true);
  }
  const observer=new MutationObserver(enable);
  observer.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener("esprofe:languageChanged",()=>setTimeout(enable,0));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",enable,{once:true});else enable();
})();