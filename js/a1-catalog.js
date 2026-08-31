"use strict";
(function(){
  const CATALOG_URL="data/a1-catalog.json";
  let catalogPromise=null,lessonsPromise=null;
  const filePromises=new Map();
  async function json(url){const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error(`A1 load failed: ${url}`);return r.json()}
  function catalog(){return catalogPromise||(catalogPromise=json(CATALOG_URL).then(c=>{window.setA1LessonCatalog?.(c);return c}))}
  function file(url){if(!filePromises.has(url))filePromises.set(url,json(url));return filePromises.get(url)}
  async function entry(id){const c=await catalog();return c.lessons?.[id]||null}
  async function lessons(){if(lessonsPromise)return lessonsPromise;lessonsPromise=(async()=>{const c=await catalog(),files=[...new Set(Object.values(c.lessons||{}).filter(x=>x.status==="ready").map(x=>x.file))],parts=await Promise.all(files.map(file));return Object.assign({},...parts)})();return lessonsPromise}
  async function lesson(id){const meta=await entry(id);if(!meta||meta.status!=="ready")return null;const data=await file(meta.file),x=data?.[id]||null;if(x&&!x.id)x.id=id;return x}
  async function ready(id){const meta=await entry(id);return meta?.status==="ready"}
  async function card(id,language="ru"){const m=await entry(id);return m?{icon:m.icon||"📘",text:m[language]||m.ru||[id,""]}:null}
  async function moduleTitle(id,language="ru",fallback=id){const c=await catalog(),m=c.modules?.[id];return m?.[language]||m?.ru||fallback}
  window.EsProfeA1Catalog={catalog,entry,lessons,lesson,ready,card,moduleTitle};
  catalog().catch(error=>console.error(error));
})();
