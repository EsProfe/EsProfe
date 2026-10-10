import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const ROOT = new URL('../', import.meta.url);
const source = name => readFile(new URL(name, ROOT), 'utf8');
const catalog = JSON.parse(await source('data/a1-catalog.json'));

function environment() {
  const listeners = new Map(), storage = new Map();
  const root = { innerHTML:'', style:{}, querySelectorAll:()=>[] };
  const nodes = new Map([['grammarSection',root],['language',{value:'ru'}]]);
  const document = {
    readyState:'loading', documentElement:{dataset:{learningMode:'course'}},
    getElementById(id) {
      if (nodes.has(id)) return nodes.get(id);
      if (root.innerHTML.includes(`id="${id}"`)) {
        const node = {addEventListener(){},style:{}}; nodes.set(id,node); return node;
      }
      return null;
    },
    querySelector:()=>null,
    addEventListener(name,fn) { if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn); },
    dispatchEvent(event) { for(const fn of listeners.get(event.type)||[])fn(event); }
  };
  const context = vm.createContext({document,console,setTimeout,clearTimeout,
    CustomEvent:class { constructor(type,options={}) {this.type=type;this.detail=options.detail;} },
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}});
  context.window=context;
  return {context,document,root};
}
async function load(env,...files) { for(const file of files)vm.runInContext(await source(file),env.context,{filename:file}); }
async function progressEnvironment() {
  const env=environment();await load(env,'js/progress.js','js/learning-progress.js');env.context.setA1LessonCatalog(catalog);return env;
}

test('every catalog lesson loads from its registered file; shared files load once',async()=>{
  const env=environment(),calls=new Map();
  env.context.fetch=async url=>{const path=url.split('?')[0];calls.set(path,(calls.get(path)||0)+1);return {ok:true,json:async()=>JSON.parse(await source(path))};};
  let order;
  env.context.setA1LessonCatalog=value=>{order=Object.keys(value.lessons);};
  await load(env,'js/a1-catalog.js');
  const ids=Object.keys(catalog.lessons),api=env.context.EsProfeA1Catalog;
  const loaded=await Promise.all(ids.map(id=>api.lesson(id)));
  assert.deepEqual(Array.from(order),ids);
  loaded.forEach((lesson,i)=>{assert.equal(lesson.id,ids[i]);assert.ok(lesson.questionBank.length>=10);});
  const all=await api.lessons();ids.forEach(id=>assert.ok(all[id]));
  for(const count of calls.values())assert.equal(count,1);
  assert.equal(await api.lesson('nonexistent'),null);
});

test('catalog owns all 81 sequential lessons, and unknown IDs stay locked',async()=>{
  const {context:c}=await progressEnvironment(),ids=Object.keys(catalog.lessons);
  assert.deepEqual(Array.from(c.A1_LESSON_ORDER),ids);
  assert.equal(c.isLessonUnlocked('A1',ids[0]),true);
  assert.equal(c.isLessonUnlocked('A1',ids[1]),false);
  assert.equal(c.isLessonUnlocked('A1','nonexistent'),false);
});

test('review resolution unlocks the next lesson and survives storage reload',async()=>{
  const {context:c}=await progressEnvironment();
  c.EsProfeLearningProgress.recordLessonResult('A1','alphabet-pronunciation',{percent:90,weakSpots:{stress:1},nextLessonId:'greetings-farewells'});
  assert.equal(c.isLessonPassed('A1','alphabet-pronunciation'),true);
  assert.equal(c.isLessonUnlocked('A1','greetings-farewells'),false);
  assert.equal(c.getNextLearningStep().type,'review');
  c.EsProfeLearningProgress.clearWeakSpot('A1','alphabet-pronunciation','stress');
  assert.equal(c.isLessonCleared('A1','alphabet-pronunciation'),true);
  assert.equal(c.isLessonUnlocked('A1','greetings-farewells'),true);
  assert.equal(c.getNextLearningStep().subtopic,'greetings-farewells');
  assert.equal(Object.keys(c.getProgressData().reviewQueue).length,0);
});

test('free learning cannot save assessments or clear personal mistakes',async()=>{
  const {context:c,document}=await progressEnvironment();
  c.EsProfeLearningProgress.recordLessonResult('A1','alphabet-pronunciation',{percent:80,weakSpots:{stress:2}});
  const before=JSON.stringify(c.getProgressData());
  document.documentElement.dataset.learningMode='free';
  c.EsProfeLearningProgress.clearWeakSpot('A1','alphabet-pronunciation','stress');
  c.EsProfeLearningProgress.recordLessonResult('A1','alphabet-pronunciation',{percent:100});
  assert.equal(JSON.stringify(c.getProgressData()),before);
});

test('assessment history retains attempts and original errors after review',async()=>{
  const {context:c}=await progressEnvironment();
  c.progressRecordLesson('A1','alphabet-pronunciation',{percent:60,weakSpots:{stress:3}});
  c.progressRecordLesson('A1','alphabet-pronunciation',{percent:90,weakSpots:{stress:1}});
  c.progressResolveWeakSpot('A1','alphabet-pronunciation','stress');
  const lesson=c.getProgressData().lessons.A1['alphabet-pronunciation'];
  assert.deepEqual(Array.from(lesson.attempts,a=>a.percent),[60,90]);
  assert.equal(lesson.attempts[1].weakSpots.stress,1);
  assert.equal(lesson.weakSpots.stress,undefined);
});

test('personal recommendation opens saved review in the common A1 engine',async()=>{
  const env=await progressEnvironment(),c=env.context;
  c.progressRecordLesson('A1','ir-a-infinitive',{percent:90,weakSpots:{conjugation:1}});
  const file=JSON.parse(await source(catalog.lessons['ir-a-infinitive'].file));
  c.EsProfeA1Catalog={lesson:async id=>({...file[id],id})};
  await load(env,'js/a1-lessons-v2.js');
  env.document.dispatchEvent(new c.CustomEvent('esprofe:reviewWeakSpot',{detail:{level:'A1',lessonId:'ir-a-infinitive',tag:'conjugation'}}));
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(env.root.innerHTML,/data-weak-index/);
  assert.match(env.root.innerHTML,/voy \/ vas \/ va/);
  assert.equal(c.getProgressData().lessons.A1['ir-a-infinitive'].attempts.length,1);
});
