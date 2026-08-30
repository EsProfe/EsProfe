"use strict";
(function(){
  const CATALOG_URL="data/a1-catalog.json";
  let catalogPromise=null,lessonsPromise=null;
  async function json(url){const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error(`A1 load failed: ${url}`);return r.json()}
  function normalize(file,data){
    if(file.includes("a1-countries-nationalities.json")){
      const q=data?.["countries-nationalities"]?.questionBank?.find(x=>x.id==="cn10");
      if(q){q.optionsByLang={ru:["со строчной буквы / con minúscula","с заглавной буквы / con mayúscula","только сокращениями"],uk:["з малої літери / con minúscula","з великої літери / con mayúscula","лише скороченнями"],en:["with a lowercase letter / con minúscula","with a capital letter / con mayúscula","only as abbreviations"],es:["con minúscula","con mayúscula","solo con abreviaturas"]};q.answers={ru:"со строчной буквы / con minúscula",uk:"з малої літери / con minúscula",en:"with a lowercase letter / con minúscula",es:"con minúscula"};}
    }
    if(file.includes("a1-numbers.json")){
      const lesson=data?.numbers,extra={ru:" Числительные от 200 до 900 согласуются в роде с существительным: doscientos libros, doscientas páginas; quinientos euros, quinientas personas. Формы cien/ciento по роду не изменяются.",uk:" Числівники від 200 до 900 узгоджуються в роді з іменником: doscientos libros, doscientas páginas; quinientos euros, quinientas personas. Форми cien/ciento за родом не змінюються.",en:" Numerals from 200 to 900 agree in gender with the noun: doscientos libros, doscientas páginas; quinientos euros, quinientas personas. Cien/ciento do not change for gender.",es:" Los numerales del 200 al 900 concuerdan en género con el sustantivo: doscientos libros, doscientas páginas; quinientos euros, quinientas personas. Cien/ciento no varían en género."};
      Object.entries(extra).forEach(([code,text])=>{const rule=lesson?.i18n?.[code]?.rules?.[2];if(rule&&!rule[1].includes("doscientas páginas"))rule[1]+=text});
    }
    return data;
  }
  function catalog(){return catalogPromise||(catalogPromise=json(CATALOG_URL))}
  async function lessons(){if(lessonsPromise)return lessonsPromise;lessonsPromise=(async()=>{const c=await catalog(),parts=await Promise.all(c.lessonFiles.map(async file=>{try{return normalize(file,await json(file))}catch(e){console.error(e);return {}}}));return Object.assign({},...parts)})();return lessonsPromise}
  async function lesson(id){const all=await lessons();const x=all[id]||null;if(x&&!x.id)x.id=id;return x}
  async function ready(id){const c=await catalog();return c.ready.includes(id)}
  async function card(id,language="ru"){const c=await catalog(),m=c.cards?.[id];return m?{icon:m.icon||"📘",text:m[language]||m.ru||[id,""]}:null}
  async function moduleTitle(id,language="ru",fallback=id){const c=await catalog(),m=c.modules?.[id];return m?.[language]||m?.ru||fallback}
  window.EsProfeA1Catalog={catalog,lessons,lesson,ready,card,moduleTitle};
})();