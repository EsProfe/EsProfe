"use strict";
(function(){
  function enhanceListeningFeedback(){
    const box=document.getElementById("kExercise");
    if(!box||box.dataset.feedbackEnhanced==="1")return;
    box.dataset.feedbackEnhanced="1";
    box.addEventListener("click",function(e){
      const btn=e.target.closest("[data-k-answer]");
      if(!btn)return;
      const gap=box.querySelector(".a1-gapword");
      if(!gap)return;
      const displayed=gap.textContent||"";
      const choice=btn.dataset.kAnswer||btn.textContent.trim();
      if(displayed.includes("_"))gap.textContent=displayed.replace("_",choice);
      gap.classList.add("a1-completed-word");
      const snapshot=box.innerHTML;
      setTimeout(()=>{
        if(box.innerHTML!==snapshot&&box.querySelector(".a1-counter")){
          /* Main exercise may already have advanced; the engine timing is overridden below. */
        }
      },50);
    },true);
  }
  const originalSetTimeout=window.setTimeout.bind(window);
  window.setTimeout=function(fn,delay,...args){
    const box=document.getElementById("kExercise");
    if(box&&delay===650){
      const active=document.activeElement;
      if(active?.matches?.("[data-k-answer]"))delay=2500;
    }
    return originalSetTimeout(fn,delay,...args);
  };
  const observer=new MutationObserver(enhanceListeningFeedback);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  enhanceListeningFeedback();
})();
