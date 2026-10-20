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
 assert.equal(Object.values(data.groups).flat().length,19);
 for(const q of Object.values(data.groups).flat()){
  assert(q.visual);assert(/^#[a-f0-9]{6}$/i.test(q.visual.color));
  for(const lang of ['ru','uk','en'])assert(q.meaning[lang]);
  assert(!/\best[aá]n?\b/i.test(q.p+' '+q.a));
 }
 for(const noun of ['camiseta','pantalones cortos','botas de fútbol','guantes','portero'])assert(data.vocab.some(v=>v[0].includes(noun)));
});
