"use strict";
(function(){
  let activeA1Topic=null;
  let activeB1Topic=null;
  let languageRefreshTimer=null;

  function currentA1StageIndex(){
    const steps=[...document.querySelectorAll('.a1-stepper span')];
    return steps.findIndex(x=>x.classList.contains('active'));
  }

  function reopenA1(){
    if(!activeA1Topic || !document.querySelector('.a1-lesson')) return;
    const stageIndex=currentA1StageIndex();
    const open=window.openA1Lesson;
    if(typeof open!=="function") return;
    Promise.resolve(open(activeA1Topic)).then(()=>{
      if(stageIndex===1){
        setTimeout(()=>document.getElementById('a1Examples')?.click(),0);
      }
    });
  }

  function reopenB1(){
    if(!activeB1Topic || !document.querySelector('.b1-lesson')) return;
    if(typeof window.openB1Lesson==='function') window.openB1Lesson(activeB1Topic);
  }

  function refreshDynamicViews(){
    document.documentElement.lang=document.getElementById('language')?.value||'ru';
    if(document.querySelector('.a1-lesson')) reopenA1();
    else if(document.querySelector('.a1-route') && typeof window.openA1Curriculum==='function'){
      window.openA1Curriculum({mode:document.documentElement.dataset.learningMode||'course'});
    }
    if(document.querySelector('.b1-lesson')) reopenB1();
    else if(document.querySelector('.b1-modules') && typeof window.openB1Curriculum==='function') window.openB1Curriculum();
  }

  function scheduleRefresh(){
    clearTimeout(languageRefreshTimer);
    languageRefreshTimer=setTimeout(refreshDynamicViews,40);
  }

  document.addEventListener('esprofe:a1Topic',e=>{activeA1Topic=e.detail?.topicId||activeA1Topic;});
  window.addEventListener('esprofe:a1Topic',e=>{activeA1Topic=e.detail?.topicId||activeA1Topic;});
  document.addEventListener('esprofe:b1Topic',e=>{activeB1Topic=e.detail?.topicId||activeB1Topic;});
  document.addEventListener('esprofe:languageChanged',scheduleRefresh);
  document.getElementById('language')?.addEventListener('change',scheduleRefresh);

  window.EsProfeLanguageRuntime={refresh:refreshDynamicViews};
})();
