/* Stable teaching lesson IDs and routes shared by lessons and report history. */
(function(root){
 const lessons=[
  {id:'football-adjectives-a1',file:'lesson.json',key:'esprofe_football_review_v3',titles:{ru:'Футбол 1. Игроки и команды',uk:'Футбол 1. Гравці й команди',en:'Football 1. Players and teams',es:'Fútbol 1. Jugadores y equipos'}},
  {id:'football-kit-a1',file:'football-kit.json',version:2,key:'esprofe_football_kit_v2',titles:{ru:'Футбол 2. Форма команды',uk:'Футбол 2. Форма команди',en:'Football 2. Team kit',es:'Fútbol 2. La equipación'}},
  {id:'football-location-a1',file:'football-location.json',version:1,key:'esprofe_football_location_v1',titles:{ru:'Футбол 3. Где игроки?',uk:'Футбол 3. Де гравці?',en:'Football 3. Where are the players?',es:'Fútbol 3. ¿Dónde están los jugadores?'}},
  {id:'football-training-a1',file:'football-training.json',version:1,key:'esprofe_football_training_v1',titles:{ru:'Футбол 4. На тренировке',uk:'Футбол 4. На тренуванні',en:'Football 4. At training',es:'Fútbol 4. En el entrenamiento'}},
  {id:'football-stadium-a1',file:'football-stadium.json',version:1,key:'esprofe_football_stadium_v1',titles:{ru:'Футбол 5. На стадионе',uk:'Футбол 5. На стадіоні',en:'Football 5. At the stadium',es:'Fútbol 5. En el estadio'}},
  {"id": "football-actions-a1", "file": "football-actions.json", "version": 1, "key": "esprofe_football_actions_v1", "titles": {"ru": "Футбол 6. Что делает игрок?", "uk": "Футбол 6. Що робить гравець?", "en": "Football 6. What does the player do?", "es": "Fútbol 6. ¿Qué hace el jugador?"}},
  {"id": "football-feelings-a1", "file": "football-feelings.json", "version": 1, "key": "esprofe_football_feelings_v1", "titles": {"ru": "Футбол 7. После матча", "uk": "Футбол 7. Після матчу", "en": "Football 7. After the match", "es": "Fútbol 7. Después del partido"}},
  {"id": "football-numbers-a1", "file": "football-numbers.json", "version": 1, "key": "esprofe_football_numbers_v1", "titles": {"ru": "Футбол 8. Номер игрока", "uk": "Футбол 8. Номер гравця", "en": "Football 8. Shirt numbers", "es": "Fútbol 8. El número del jugador"}}
 ];
 const get=id=>lessons.find(x=>x.id===id);
 const current=()=>{const params=new URLSearchParams(root.location?.search||'');const l=get(params.get('lesson'))||lessons[0];return l.id==='football-kit-a1'&&params.get('version')==='1'?{...l,version:1,file:'football-kit-v1.json',key:'esprofe_football_kit_v1'}:l};
 const href=(id,lang='ru',version)=>'../clase/?lesson='+encodeURIComponent(id)+'&lang='+encodeURIComponent(lang==='es'?'en':lang)+(id==='football-kit-a1'&&version===1?'&version=1':'');
 root.EsProfeLessonCatalog=Object.freeze({lessons,get,current,href});
 if(typeof module!=='undefined')module.exports=root.EsProfeLessonCatalog;
})(typeof window==='undefined'?globalThis:window);
