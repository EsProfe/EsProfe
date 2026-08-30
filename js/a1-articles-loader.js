"use strict";
(function(){
  const ARTICLE_IDS=new Set(["definite-articles","indefinite-articles","noun-gender","noun-plural","article-noun-agreement"]);
  let cache=null;
  async function loadArticleLesson(id){
    if(!ARTICLE_IDS.has(id))return null;
    if(!cache){
      const r=await fetch("data/a1-articles.json?v=20260830-articles1",{cache:"no-store"});
      if(!r.ok)throw new Error("A1 articles data load failed");
      cache=await r.json();
    }
    return cache[id]||null;
  }
  window.EsProfeA1ExtraLessonLoader=loadArticleLesson;
})();
