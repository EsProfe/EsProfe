/* Stable teaching lesson IDs and routes shared by lessons and report history. */
(function(root){
 const lessons=[
  {id:'football-adjectives-a1',file:'lesson.json',key:'esprofe_football_review_v3',titles:{ru:'Футбол 1. Игроки и команды',uk:'Футбол 1. Гравці й команди',en:'Football 1. Players and teams',es:'Fútbol 1. Jugadores y equipos'}},
  {id:'football-kit-a1',file:'football-kit.json',key:'esprofe_football_kit_v1',titles:{ru:'Футбол 2. Форма команды',uk:'Футбол 2. Форма команди',en:'Football 2. Team kit',es:'Fútbol 2. La equipación'}}
 ];
 const get=id=>lessons.find(x=>x.id===id);
 const current=()=>get(new URLSearchParams(root.location?.search||'').get('lesson'))||lessons[0];
 const href=(id,lang='ru')=>'../clase/?lesson='+encodeURIComponent(id)+'&lang='+encodeURIComponent(lang==='es'?'en':lang);
 root.EsProfeLessonCatalog=Object.freeze({lessons,get,current,href});
 if(typeof module!=='undefined')module.exports=root.EsProfeLessonCatalog;
})(typeof window==='undefined'?globalThis:window);
