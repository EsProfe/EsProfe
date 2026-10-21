const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/vocabulary-practice.js'),'utf8'),context);
const api=context.window.EsProfeVocabularyPractice;
const entries=Array.from({length:10},(_,i)=>({id:'v'+i,word:'el ejemplo '+i,ru:'пример '+i,uk:'приклад '+i,en:'example '+i,visual:{photo:'photo'+i}}));
function setup(){
 const store=new Map();let user='guest',lang='ru',html='',nodes=[];
 const host={querySelector:s=>nodes.find(x=>x.id===s.slice(1))||null,querySelectorAll:s=>{const name=s.slice(1,-1).replace(/^data-/, '').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());return nodes.filter(n=>name in n.dataset)}};
 function draw(){html=practice.render();nodes=[];for(const tag of html.matchAll(/<(button|select)\b([^>]*)>/g)){const attrs=tag[2],dataset={};for(const a of attrs.matchAll(/data-([a-z-]+)="([^"]*)"/g))dataset[a[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=a[2];nodes.push({id:attrs.match(/\bid="([^"]*)"/)?.[1],dataset,disabled:/\bdisabled\b/.test(attrs),focus(){}})}practice.bind(host)}
 const practice=api.create({entries,storage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},key:()=>user,language:()=>lang,picture:(_,conceal)=>conceal?'<figure>Neutral photo caption</figure>':'<figure>Photo</figure>',thumbnail:()=>'<img alt="">',speak(){},change:draw,overview:()=>practice.setMode('overview'),rule(){},rng:()=>.99});
 return {practice,store,host,draw,html:()=>html,node:(key,value)=>nodes.find(n=>n.dataset[key]===value),session:()=>JSON.parse(store.get(user)).sessions,switchUser(value){user=value;practice.reset();draw()},language(value){lang=value;draw()}};
}
test('failed cards return after three intervening cards and cannot create an endless round',()=>{
 const s={queue:['a','b','c','d','e'],deferred:[],recalled:0,flipped:false};assert.equal(api.rate(s,false),null);
 s.flipped=true;api.rate(s,false);assert.equal(s.queue.join(','),'b,c,d,a,e');
 for(let i=0;i<3;i++){s.flipped=true;api.rate(s,true)}assert.equal(s.queue[0],'a');
 s.flipped=true;api.rate(s,false);assert(s.deferred.includes('a'));assert(!s.queue.includes('a'));
 s.flipped=true;api.rate(s,true);assert.equal(s.queue.length,0);
});
test('five-card rounds hide the answer until flip, keep both directions, resume and isolate users',()=>{
 const s=setup();s.practice.setMode('cards');assert(!s.html().includes('пример 0'));assert(s.html().includes('Photo'));assert(s.html().includes('Осталось: 5'));
 s.host.querySelector('#vp-flip').onclick();assert(s.html().includes('пример 0'));s.host.querySelector('#vp-know').onclick();assert.equal(s.session().forward.queue.length,4);
 s.host.querySelector('#vp-direction').onchange({target:{value:'reverse'}});assert(s.html().includes('пример 0'));assert(!s.html().includes('el ejemplo 0'));assert(s.html().includes('Neutral photo caption'));
 s.host.querySelector('#vp-flip').onclick();assert(s.html().includes('el ejemplo 0'));s.host.querySelector('#vp-again').onclick();assert.equal(s.session().reverse.queue[3],'v0');
 s.switchUser('student');s.practice.setMode('cards');assert(s.html().includes('Осталось: 5'));
 s.switchUser('guest');s.practice.setMode('cards');assert(s.html().includes('Осталось: 4'));assert(!s.html().includes('пример 1'));
 s.language('uk');assert(s.html().includes('Залишилося: 4'));
});
test('pairs support tap and drag, reject mismatches, and preserve selected and matched items',()=>{
 const s=setup();s.practice.setMode('pairs');assert(s.html().includes('<img'));
 s.node('vpWord','v0').onclick();s.node('vpTarget','v1').onclick();assert(s.html().includes('Пока не совпало'));assert(!s.node('vpWord','v0').disabled);
 s.node('vpTarget','v0').onclick();assert(s.node('vpWord','v0').disabled);assert(s.node('vpTarget','v0').disabled);
 let transferred;const before=s.node('vpWord','v1');before.ondragstart({dataTransfer:{setData:(_,v)=>transferred=v}});
 assert.equal(s.node('vpWord','v1'),before,'dragstart must not rerender and cancel the drag');
 s.node('vpTarget','v1').ondrop({preventDefault(){},dataTransfer:{getData:()=>transferred}});assert(s.node('vpWord','v1').disabled);
 for(const id of ['v2','v3']){s.node('vpWord',id).onclick();s.node('vpTarget',id).onclick()}
 s.host.querySelector('#vp-next-pairs').onclick();assert(s.node('vpWord','v4'));assert(s.html().includes('Найдено: 4 / 10'));
});
test('stable vocabulary IDs cover exactly the lesson words and each visual exists',()=>{
 const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../clase/football-kit.json')));assert.equal(d.vocabIds.length,d.vocab.length);assert.equal(new Set(d.vocabIds).size,d.vocab.length);
 for(const v of d.vocabVisuals)assert(d.photos[v.photo]);
});
