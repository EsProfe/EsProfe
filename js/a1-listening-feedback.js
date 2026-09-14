"use strict";
(function(){
  const DELAY=2500;
  const bypass=new WeakSet();

  function enhanceListeningFeedback(){
    const box=document.getElementById("kExercise");
    if(!box||box.dataset.feedbackEnhanced==="2")return;
    box.dataset.feedbackEnhanced="2";

    box.addEventListener("click",function(e){
      const btn=e.target.closest("[data-k-answer]");
      if(!btn||bypass.has(btn))return;

      const gap=box.querySelector(".a1-gapword");
      const buttons=[...box.querySelectorAll("[data-k-answer]")];
      if(!gap||!buttons.length)return;

      e.preventDefault();
      e.stopImmediatePropagation();

      const displayed=gap.textContent||"";
      const selected=btn.dataset.kAnswer||btn.textContent.trim();
      const answer=getCorrectChoice(displayed,buttons.map(b=>b.dataset.kAnswer||b.textContent.trim()));
      const completed=displayed.includes("_")?displayed.replace("_",answer||selected):displayed;

      gap.textContent=completed;
      gap.classList.add("a1-completed-word");
      buttons.forEach(b=>b.disabled=true);

      const feedback=box.querySelector("#kFeedback");
      if(feedback){
        const ok=selected===answer;
        const language=document.getElementById("language")?.value||"ru";
        const labels={
          ru:{ok:"✅ Правильно",bad:"❌ Неправильно · правильно:"},
          uk:{ok:"✅ Правильно",bad:"❌ Неправильно · правильно:"},
          en:{ok:"✅ Correct",bad:"❌ Incorrect · correct spelling:"},
          es:{ok:"✅ Correcto",bad:"❌ Incorrecto · escritura correcta:"}
        }[language]||{ok:"✅ Правильно",bad:"❌ Неправильно · правильно:"};
        feedback.textContent=ok?labels.ok:`${labels.bad} ${completed}`;
      }

      try{
        window.speechSynthesis?.cancel();
        const u=new SpeechSynthesisUtterance(completed);
        const voices=window.speechSynthesis?.getVoices?.()||[];
        const locale=v=>String(v.lang||"").replace("_","-").toLowerCase();
        const name=v=>String(v.name||"").toLowerCase();
        const isSpanish=v=>locale(v)==="es"||locale(v).startsWith("es-");
        const voice=voices.find(v=>isSpanish(v)&&/microsoft\s+pablo|\bpablo\b/.test(name(v)))||voices.find(v=>isSpanish(v)&&/microsoft\s+raul|\braul\b/.test(name(v)))||voices.find(v=>isSpanish(v)&&/microsoft\s+laura|\blaura\b/.test(name(v)))||voices.find(v=>locale(v)==="es-es")||voices.find(v=>locale(v).startsWith("es-"));
        if(voice){u.lang=voice.lang;u.voice=voice;u.rate=.8;window.speechSynthesis?.speak(u);}
      }catch(_){ }

      setTimeout(()=>{
        if(!btn.isConnected)return;
        buttons.forEach(b=>b.disabled=false);
        bypass.add(btn);
        btn.click();
        bypass.delete(btn);
      },DELAY);
    },true);
  }

  function getCorrectChoice(displayed,choices){
    const tail=String(displayed).replace("_","").toLowerCase();
    const candidates=choices.filter(Boolean);
    if(!candidates.length)return"";
    const first=tail.charAt(0);
    if(first==="a"||first==="o"||first==="u")return candidates.find(x=>x.toLowerCase()==="c")||candidates[0];
    if(first==="e"||first==="i")return candidates.find(x=>x.toLowerCase()==="qu")||candidates[0];
    return candidates[0];
  }

  const observer=new MutationObserver(enhanceListeningFeedback);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  enhanceListeningFeedback();
})();
