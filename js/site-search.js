"use strict";
(function(){
  const copy={ru:{placeholder:"Поиск уроков, тем или слов...",empty:"Ничего не найдено"},uk:{placeholder:"Пошук уроків, тем або слів...",empty:"Нічого не знайдено"},en:{placeholder:"Search lessons, topics or words...",empty:"No results found"},es:{placeholder:"Buscar lecciones, temas o palabras...",empty:"No se han encontrado resultados"}};
  const language=()=>document.getElementById("language")?.value||"ru";
  const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function labels(){const t=copy[language()]||copy.ru;const input=document.getElementById("siteSearch");if(input)input.placeholder=t.placeholder;return t}
  async function render(query){
    const box=document.getElementById("siteSearchResults");if(!box)return;
    if(query.trim().length<2){box.hidden=true;box.innerHTML="";return}
    try{
      const results=await window.EsProfeCourseCatalog?.search(query,{level:"A1"})||[];
      const t=labels();box.hidden=false;
      box.innerHTML=results.length?results.slice(0,6).map(item=>{const title=window.EsProfeCourseCatalog.localized(item.title,language());return '<button type="button" class="site-search-result" data-lesson="'+esc(item.id)+'"><strong>'+esc(title[0])+'</strong><small>'+esc(title[1])+'</small></button>'}).join(""):'<div class="site-search-empty">'+esc(t.empty)+'</div>';
    }catch(e){console.error("EsProfe search failed",e)}
  }
  function open(id){document.querySelector('[data-action="free"]')?.click();setTimeout(()=>document.dispatchEvent(new CustomEvent("esprofe:a1Topic",{detail:{topicId:id,mode:"free"}})),80)}
  function init(){const input=document.getElementById("siteSearch"),box=document.getElementById("siteSearchResults");if(!input||!box)return;let timer;input.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(()=>render(input.value),140)});box.addEventListener("click",e=>{const b=e.target.closest("[data-lesson]");if(!b)return;input.value="";box.hidden=true;open(b.dataset.lesson)});document.addEventListener("click",e=>{if(!e.target.closest(".site-search"))box.hidden=true});document.addEventListener("esprofe:languageChanged",labels);document.getElementById("language")?.addEventListener("change",labels);labels()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();