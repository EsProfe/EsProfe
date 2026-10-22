const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const catalog=require('../clase/lesson-catalog.js');
test('teaching catalog keeps old links and isolates each lesson, file and storage key',()=>{
 assert.equal(catalog.current().id,'football-adjectives-a1');
 assert.equal(catalog.lessons.length,3);
 for(const field of ['id','file','key'])assert.equal(new Set(catalog.lessons.map(l=>l[field])).size,3);
 assert(catalog.href('football-kit-a1','uk').includes('lesson=football-kit-a1&lang=uk'));
 const ids=new Set();
 for(const lesson of catalog.lessons){const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../clase',lesson.file)));
  if(lesson.id==='football-kit-a1')assert.equal(data.lessonId,lesson.id);
  for(const q of Object.values(data.groups).flat()){
   assert(!ids.has(q.id));ids.add(q.id);assert(q.a);
   if(q.type==='choice')assert(q.o.includes(q.a));
  }
 }
});
test('kit lesson includes eleven familiar colours, kit and goalkeeper without estar',()=>{
 const data=require('../clase/football-kit.json');assert.equal(data.colors.length,11);
 assert.equal(Object.values(data.groups).flat().length,21);
 for(const q of Object.values(data.groups).flat()){
  assert(q.visual);assert(data.photos[q.visual.photo]);assert(fs.existsSync(path.join(__dirname,'../clase/images',q.visual.photo+'.webp')));
  for(const lang of ['ru','uk','en'])assert(q.meaning[lang]);
  assert(!/\best[aá]n?\b/i.test(q.p+' '+q.a));
 }
 for(const noun of ['camiseta','pantalones cortos','botas de fútbol','guantes','portero','árbitro','equipo'])assert(data.vocab.some(v=>v[0].includes(noun)));
});

test('old kit version preserves old answers and routes independently',()=>{
 const vm=require('node:vm'),ctx={window:{location:{search:'?lesson=football-kit-a1&version=1'}},URLSearchParams};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/lesson-catalog.js'),'utf8'),ctx);
 const l=ctx.window.EsProfeLessonCatalog.current();assert.equal(l.file,'football-kit-v1.json');assert.equal(l.key,'esprofe_football_kit_v1');
 const old=require('../clase/football-kit-v1.json'),fresh=require('../clase/football-kit.json');
 assert.equal(old.groups[5][1].a,'Es roja.');assert.equal(fresh.groups[5][1].a,'Es amarilla.');
 const ids=new Set(Object.values(old.groups).flat().map(q=>q.id));assert(Object.values(fresh.groups).flat().every(q=>!ids.has(q.id)));
 assert(catalog.href('football-kit-a1','ru',1).endsWith('&version=1'));
});

test('vocabulary fills available rows and columns without changing assessed tasks',()=>{
 const vm=require('node:vm'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/kit-visuals.js'),'utf8'),ctx);
 const layout=ctx.window.EsProfeKitVisuals.vocabularyLayout;
 assert.equal(layout(1050,450,10).capacity,10);assert.equal(layout(1050,450,10).pages,2);
 assert.equal(layout(950,405,10).capacity,8);assert.equal(layout(390,440,10).capacity,4);
 assert.equal(layout(390,250,10).capacity,2);
 const data=require('../clase/football-kit.json');
 for(const noun of ['delantero','centrocampista','defensa'])assert(data.vocab.some(v=>v[0].includes(noun)));
 assert.equal(data.vocab.length,data.vocabVisuals.length);
 assert.deepEqual(data.groups[3][3].o,['Son guantes.','Es el árbitro.']);
 for(const photo of Object.values(data.photos))assert(photo.author&&photo.source&&photo.license);
});

test('one vocabulary navigation bar leads through words, colours and then the rule',()=>{
 const vm=require('node:vm'),source=fs.readFileSync(path.join(__dirname,'../clase/lesson.js'),'utf8');
 const fitSource=source.slice(source.indexOf('function fitVocabulary('),source.indexOf('function kitRule('));
 for(const lang of ['ru','uk','en']){
  const cards=Array.from({length:10},()=>({hidden:false})),grid={children:cards,style:{}},colors={},intro={getBoundingClientRect:()=>({height:20})};
  const section={clientWidth:900,clientHeight:450,querySelector:s=>({'.kit-vocab-grid':grid,'.color-vocab':colors,'.vocabulary-intro':intro})[s]};
  const inner={style:{},querySelector:()=>section},back={},next={classList:{add(){}}},counter={},pager={querySelector:s=>({'#ep-screen-back':back,'#ep-screen-next':next,'#ep-screen-count':counter})[s]};
  const ctx={window:{},screenPage:0,lang,t:()=>({back:'Back'}),go:n=>ctx.destination=n};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/kit-visuals.js'),'utf8'),ctx);vm.runInNewContext(fitSource,ctx);
  ctx.fit=()=>ctx.fitVocabulary(inner,pager);ctx.fit();
  assert.equal(cards.filter(c=>!c.hidden).length,8);assert.equal(next.disabled,false);back.onclick();assert.equal(ctx.destination,0);
  next.onclick();assert.equal(cards.filter(c=>!c.hidden).length,2);assert.equal(colors.hidden,true);
  next.onclick();assert.equal(grid.hidden,true);assert.equal(colors.hidden,false);assert.equal(next.disabled,false);
  next.onclick();assert.equal(ctx.destination,2);
 }
});
