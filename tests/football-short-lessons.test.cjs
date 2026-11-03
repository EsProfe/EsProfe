const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const lessons=['football-training','football-stadium','football-actions','football-feelings'].map(name=>require('../clase/'+name+'.json'));
test('short lessons cover their vocabulary with unique tasks and local optimized assets',()=>{
 const ids=new Set();for(const d of lessons){const qs=Object.values(d.groups).flat();assert.equal(qs.length,12);assert.equal(d.groups[4].length+d.groups[5].length,6);assert(d.vocab.length>=4&&d.vocab.length<=5);assert.equal(d.vocab.length,d.vocabVisuals.length);
  for(const q of qs){assert(!ids.has(q.id));ids.add(q.id);assert(d.illustrations[q.visual.illustration]);if(q.type==='choice')assert(q.o.includes(q.a));for(const lang of ['ru','uk','en'])assert(q.meaning[lang]);}
  for(const key of d.vocabIds){assert(qs.some(q=>q.visual.illustration===key),'missing practice: '+key);const f=path.join(__dirname,'../clase/images',d.illustrations[key].file);assert(fs.existsSync(f));assert(fs.statSync(f).size<100000,'oversized image: '+f);}
 }
 const stadium=lessons[1];assert(stadium.vocab.some(w=>w[0]==='la copa'));assert(stadium.vocab.some(w=>w[0]==='el Mundial'));assert(stadium.groups[5][0].accepted.includes('la Copa del Mundo'));assert(stadium.groups[5][2].a==='Hay una copa.');
});
test('illustration renderer supports explicit plural pictures and avoids Spanish answer labels',()=>{
 const ctx={window:{EsProfeLessonIllustrations:lessons[0].illustrations,EsProfeLessonLanguage:'ru',EsProfeIllustrationLabel:'Иллюстрация EsProfe'}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/kit-visuals.js'),'utf8'),ctx);
 const html=ctx.window.EsProfeKitVisuals.picture({illustration:'training-bottle',repeat:2});assert.equal((html.match(/<img /g)||[]).length,2);assert(!html.includes('la botella'));assert(html.includes('бутылка'));assert.equal(ctx.window.EsProfeKitVisuals.picture({illustration:'unknown'}),'');assert(ctx.window.EsProfeKitVisuals.illustrationThumbnail({illustration:'training-cone'}).includes('training-cone.webp'));
});
