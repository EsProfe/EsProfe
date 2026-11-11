const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const lessons=['football-training','football-stadium','football-actions','football-feelings','football-numbers'].map(name=>require('../clase/'+name+'.json'));
test('short lessons cover their vocabulary with unique tasks and local optimized assets',()=>{
 const ids=new Set();for(const d of lessons){const qs=Object.values(d.groups).flat();assert.equal(qs.length,d.lessonId==='football-stadium-a1'?19:18);assert(d.vocab.length>=4&&d.vocab.length<=6);assert.equal(d.vocab.length,d.vocabVisuals.length);
  for(const q of qs){assert(!ids.has(q.id));ids.add(q.id);if(q.visual)assert(q.visual.illustration?d.illustrations[q.visual.illustration]:d.photos[q.visual.photo]);if(q.type==='choice')assert(q.o.includes(q.a));for(const lang of ['ru','uk','en'])assert(q.meaning[lang]);}
  for(const key of d.vocabIds){assert(qs.some(q=>q.visual?.illustration===key)||d.reviewVocabIds?.includes(key),'missing practice: '+key);const f=path.join(__dirname,'../clase/images',d.illustrations[key].file);assert(fs.existsSync(f));assert(fs.statSync(f).size>1000,'empty or incomplete image: '+f);assert.equal(fs.readFileSync(f).toString('ascii',0,4),'RIFF');assert.equal(fs.readFileSync(f).toString('ascii',8,12),'WEBP');assert(fs.statSync(f).size<100000,'oversized image: '+f);}
 }
 const stadium=lessons[1];assert(stadium.vocab.some(w=>w[0]==='la copa'));assert(stadium.vocab.some(w=>w[0]==='el Mundial'));assert(stadium.groups[5][0].accepted.includes('la Copa del Mundo'));assert(stadium.groups[5][2].a==='Hay una copa.');
});
test('illustration renderer supports explicit plural pictures and avoids Spanish answer labels',()=>{
 const ctx={window:{EsProfeLessonIllustrations:lessons[0].illustrations,EsProfeLessonLanguage:'ru',EsProfeIllustrationLabel:'Иллюстрация EsProfe'}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/kit-visuals.js'),'utf8'),ctx);
 const html=ctx.window.EsProfeKitVisuals.picture({illustration:'training-bottle',repeat:2});assert.equal((html.match(/<img /g)||[]).length,2);assert(!html.includes('la botella'));assert(html.includes('бутылка'));assert.equal(ctx.window.EsProfeKitVisuals.picture({illustration:'unknown'}),'');assert(ctx.window.EsProfeKitVisuals.illustrationThumbnail({illustration:'training-cone'}).includes('training-cone.webp'));
});

test('stadium has six overview cards including a reviewed ball, with one-page layouts at different widths',()=>{
 const d=lessons[1];assert.equal(d.vocab.length,6);assert.equal(d.vocabIds.length,6);assert.equal(new Set(d.vocabIds).size,6);assert.deepEqual(d.reviewVocabIds,['stadium-ball']);assert(d.vocab.some(w=>w[0]==='el balón / la pelota'));
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/kit-visuals.js'),'utf8'),ctx);
 for(const [width,height,cols,rows] of [[1200,500,6,1],[900,450,3,2],[390,440,2,3],[360,300,2,3]]){const layout=ctx.window.EsProfeKitVisuals.vocabularyLayout(width,height,6,0,d.vocabularyOverview);assert.equal(layout.pages,1);assert.equal(layout.capacity,6);assert.equal(layout.columns,cols);assert.equal(layout.rows,rows);}
});

test('stadium adds only two review questions while preserving the original assessed tasks',()=>{
 const d=lessons[1],qs=Object.values(d.groups).flat();assert.equal(qs.length,19);assert.equal(qs.filter(q=>q.id.startsWith('fs1-review-')).length,2);
 assert.equal(d.groups[3].at(-1).a,'Es un portero.');assert.equal(d.groups[5][3].a,'Es un equipo.');assert(d.groups[5][3].accepted.includes('el equipo'));
 const photo=d.photos.team;assert(photo.author&&photo.source&&photo.license);assert(fs.existsSync(path.join(__dirname,'../clase/images/team.webp')));
});

test('World Cup translation uses a localized source prompt and hides its picture',()=>{
 const q=lessons[1].groups[5].find(q=>q.id==='fs1-q0');assert.equal(q.translation,true);
 assert(q.pByLanguage.uk.includes('чемпіонат світу з футболу'));for(const lang of ['ru','uk','en'])assert(q.pByLanguage[lang]);
 const engine=fs.readFileSync(path.join(__dirname,'../clase/lesson.js'),'utf8');assert(engine.includes("item.translation?'':picture(item.visual)"));
});

test('all current football lessons give each half at least six tasks',()=>{
 const {lessons}=require('../clase/lesson-catalog.js');
 for(const [i,{file}] of lessons.entries()){
  const d=require('../clase/'+file);
  assert.deepEqual([d.groups[4].length,d.groups[5].length],i===0?[14,15]:[6,6],file);
  if(i>0)for(const lang of ['ru','uk','en'])assert.match(d.D[lang].intro,/\b12\b/,file);
 }
});
