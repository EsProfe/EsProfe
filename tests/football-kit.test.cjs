const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const catalog=require('../clase/lesson-catalog.js');
test('teaching catalog keeps old links and isolates each lesson, file and storage key',()=>{
 assert.equal(catalog.current().id,'football-adjectives-a1');
 assert.equal(catalog.lessons.length,2);
 for(const field of ['id','file','key'])assert.equal(new Set(catalog.lessons.map(l=>l[field])).size,2);
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
