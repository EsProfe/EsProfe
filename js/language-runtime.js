"use strict";
(function(){
  let activeB1Topic=null;
  let languageRefreshTimer=null;

  function reopenB1(){
    if(!activeB1Topic || !document.querySelector('.b1-lesson')) return;
    if(typeof window.openB1Lesson==='function') window.openB1Lesson(activeB1Topic);
  }

  function refreshDynamicViews(){
    document.documentElement.lang=document.getElementById('language')?.value||'ru';
    // A1 owns its own language refresh. Keeping it here as well used to reset
    // the lesson twice and could send the learner back to the explanation step.
    if(document.querySelector('.b1-lesson')) reopenB1();
    else if(document.querySelector('.b1-modules') && typeof window.openB1Curriculum==='function') window.openB1Curriculum();
  }

  function scheduleRefresh(){
    clearTimeout(languageRefreshTimer);
    languageRefreshTimer=setTimeout(refreshDynamicViews,40);
  }

  document.addEventListener('esprofe:b1Topic',e=>{activeB1Topic=e.detail?.topicId||activeB1Topic;});
  document.addEventListener('esprofe:languageChanged',scheduleRefresh);
  document.getElementById('language')?.addEventListener('change',scheduleRefresh);

  window.EsProfeLanguageRuntime={refresh:refreshDynamicViews};
})();
