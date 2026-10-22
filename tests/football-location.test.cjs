const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const data=require('../clase/football-location.json');
test('short third lesson covers three places, singular/plural location and invariant hay',()=>{
 const tasks=Object.values(data.groups).flat();assert.equal(tasks.length,16);assert.equal(data.groups[4].length+data.groups[5].length,9);
 assert.equal(data.vocab.length,5);assert.equal(new Set(data.vocabIds).size,5);
 for(const place of ['el campo','la portería','el banquillo'])assert(data.vocab.some(w=>w[0]===place));
 for(const verb of ['está','están','hay'])assert(tasks.some(q=>q.a===verb));
 for(const q of tasks){for(const lang of ['ru','uk','en'])assert(q.meaning[lang]);if(q.visual.photo)assert(data.photos[q.visual.photo]);else assert(data.scenes[q.visual.scene]);if(q.p.includes('___'))assert(/\((estar|haber)\)/.test(q.p));}
 assert.deepEqual(data.scenes.training.places.map(p=>p.actors.map(a=>a.name)),[['Neuer'],['Messi','Modrich'],['Salah','Carvajal']]);
 for(const p of data.scenes.training.places)for(const actor of p.actors)assert(fs.existsSync(path.join(__dirname,'../clase/images',actor.photo+'.webp')));
});
test('scene vocabulary hides Spanish place labels until reverse flashcard is revealed',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/scene-visuals.js'),'utf8'),ctx);
 const render=ctx.window.EsProfeSceneVisuals.picture;
 for(const lang of ['ru','uk','en']){
  const hidden=render(data.scenes.training,{focus:'goal'},lang,true);assert(!hidden.includes('la portería'));assert(hidden.includes('Neuer'));assert(hidden.includes('zone-focus'));
  const shown=render(data.scenes.training,{},lang);assert(shown.includes('la portería'));assert(shown.includes(data.scenes.training.note[lang]));
 }
 const prompt=render(data.scenes.training,{focus:'goal',hideLabels:true},'ru');assert(!prompt.includes('la portería'));
});
test('a vocabulary without colour cards has no empty extra page',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/kit-visuals.js'),'utf8'),ctx);
 assert.equal(ctx.window.EsProfeKitVisuals.vocabularyLayout(1050,450,5,0).pages,1);
 const source=fs.readFileSync(path.join(__dirname,'../clase/lesson.js'),'utf8');
 const cards=Array.from({length:5},()=>({})),grid={children:cards,style:{}},colors={dataset:{empty:'true'}},intro={getBoundingClientRect:()=>({height:20})};
 const section={clientWidth:1050,clientHeight:450,querySelector:s=>({'.kit-vocab-grid':grid,'.color-vocab':colors,'.vocabulary-intro':intro})[s]};
 const back={},next={classList:{add(){}}},counter={},pager={querySelector:s=>({'#ep-screen-back':back,'#ep-screen-next':next,'#ep-screen-count':counter})[s]};
 Object.assign(ctx,{screenPage:0,lang:'ru',t:()=>({back:'Назад'}),go:n=>ctx.destination=n});ctx.fit=()=>ctx.fitVocabulary({style:{},querySelector:()=>section},pager);
 vm.runInNewContext(source.slice(source.indexOf('function fitVocabulary('),source.indexOf('function kitRule(')),ctx);ctx.fit();assert.equal(colors.hidden,true);assert.equal(counter.textContent,'Слова · 1 / 1');assert.equal(next.textContent,'К правилу →');next.onclick();assert.equal(ctx.destination,2);
});
