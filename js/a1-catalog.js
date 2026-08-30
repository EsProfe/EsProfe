"use strict";
(function(){
  const CATALOG_URL="data/a1-catalog.json";
  let catalogPromise=null;
  let lessonsPromise=null;
  async function json(url){const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error(`A1 load failed: ${url}`);return r.json()}
  function catalog(){return catalogPromise||(catalogPromise=json(CATALOG_URL))}
  async function lessons(){
    if(lessonsPromise)return lessonsPromise;
    lessonsPromise=(async()=>{const c=await catalog(),parts=await Promise.all(c.lessonFiles.map(async file=>{try{return await json(file)}catch(e){console.error(e);return {}}}));return Object.assign({},...parts)})();
    return lessonsPromise;
  }
  async function lesson(id){const all=await lessons();return all[id]||null}
  async function ready(id){const c=await catalog();return c.ready.includes(id)}
  async function card(id,language="ru"){const c=await catalog(),m=c.cards?.[id];return m?{icon:m.icon||"📘",text:m[language]||m.ru||[id,""]}:null}
  window.EsProfeA1Catalog={catalog,lessons,lesson,ready,card};
})();