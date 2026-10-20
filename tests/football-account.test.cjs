const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../clase/lesson-account.js'), 'utf8');
const owner = {id:'f4eed01e-59cf-46f2-a515-fafbdf7b1430',email:'student@example.test'};
const attempt = {id:crypto.randomUUID(),score:40,total:47,language:'ru',complete:true};
function setup(options={}) {
  const calls=[], rows=new Map(), profiles=new Map();
  let session=options.guest?null:{user:owner},callback;
  const client={auth:{
    getSession:async()=>({data:{session},error:null}),
    getUser:async()=>({data:{user:session?.user},error:null}),
    signInWithPassword:async()=>{session={user:owner};return {data:{user:owner},error:null}},
    signOut:async()=>{session=null;return {error:null}},
    onAuthStateChange:fn=>{callback=fn}
  },from(table){
    const filters=[];let mode='read',inserted;
    const query={select(){return query},eq(k,v){filters.push([k,v]);return query},
      order(k,v){calls.push({order:[k,v]});return query},limit(n){calls.push({limit:n});return query},
      insert(row){mode='insert';inserted=row;return query},
      async maybeSingle(){const result=await query;return {...result,data:result.data?.[0]||null}},
      then(resolve,reject){return Promise.resolve().then(()=>{
        calls.push({table,mode,filters:[...filters],row:inserted});
        const db=table==='profiles'?profiles:rows;
        if(mode==='insert'){
          if(options.insertError&&table==='lesson_attempts')return {data:null,error:{code:'42501'}};
          if(db.has(inserted.id))return {data:null,error:{code:'23505'}};
          db.set(inserted.id,{...inserted,completed_at:'2026-10-13T07:00:00Z'});
          return {data:null,error:null};
        }
        return {data:[...db.values()].filter(row=>filters.every(([k,v])=>row[k]===v)),error:null};
      }).then(resolve,reject)}
    };return query;
  }};
  const context={window:{EsProfeSupabaseConfig:{url:'https://project.supabase.co',publishableKey:'sb_publishable_test',lessonId:'football-adjectives-a1'},supabase:options.noSdk?undefined:{createClient:()=>client}},setTimeout,AbortSignal,fetch};
  vm.runInNewContext(source,context);
  return {account:context.window.EsProfeLessonAccount,calls,rows,profiles,switchUser(next){session=next?{user:next}:null;callback('SIGNED_IN',session)}};
}
test('guest cannot write any result',async()=>{
  const s=setup({guest:true});await s.account.init();
  await assert.rejects(s.account.saveAttempt(attempt),{code:'signin'});
  assert.equal(s.calls.length,0);
});
test('only verified owner is used and missing student profile is created',async()=>{
  const s=setup();await s.account.init();await s.account.saveAttempt({...attempt,student_id:'someone-else'});
  assert.equal(s.profiles.get(owner.id).role,'student');
  const row=s.rows.get(attempt.id);
  assert.equal(row.student_id,owner.id);assert.equal(row.lesson_id,'football-adjectives-a1');
  assert.equal(row.score,40);assert.equal(row.total,47);
});
test('retry after lost response does not duplicate the completed attempt',async()=>{
  const s=setup();await s.account.init();await s.account.saveAttempt(attempt);await s.account.saveAttempt(attempt);
  assert.equal(s.rows.size,1);
  await assert.rejects(s.account.saveAttempt({...attempt,score:41}),{code:'conflict'});
});
test('incomplete, invalid and unsupported results never reach database',async()=>{
  const s=setup();await s.account.init();
  for(const invalid of [{complete:false},{score:48},{total:0},{language:'de'},{id:'bad'}]){
    await assert.rejects(s.account.saveAttempt({...attempt,...invalid}),{code:'incomplete'});
  }
  assert.equal(s.calls.length,0);
});
test('history is filtered by owner and lesson, with bounded size',async()=>{
  const s=setup();await s.account.init();await s.account.saveAttempt(attempt);
  s.rows.set('other',{id:'other',student_id:'someone-else',lesson_id:'football-adjectives-a1'});
  const rows=await s.account.history();assert.equal(rows.length,1);
  const query=s.calls.findLast(c=>c.table==='lesson_attempts'&&c.mode==='read');
  assert.deepEqual(query.filters,[['student_id',owner.id],['lesson_id','football-adjectives-a1']]);
  assert(s.calls.some(c=>c.limit===5));
});
test('RLS/write error is propagated, never reported as saved',async()=>{
  const s=setup({insertError:true});await s.account.init();
  await assert.rejects(s.account.saveAttempt(attempt),{code:'42501'});assert.equal(s.rows.size,0);
});
test('SDK failure leaves lesson guest mode usable',async()=>{
  const s=setup({noSdk:true});await s.account.init();assert.equal(s.account.available,false);
  await assert.rejects(s.account.signIn('student@example.test','unused'),{code:'unavailable'});
});
test('sign out clears owner and stops result writes',async()=>{
  const s=setup();await s.account.init();await s.account.signOut();assert.equal(s.account.user,null);
  await assert.rejects(s.account.saveAttempt(attempt),{code:'signin'});
});

// A small DOM adapter checks lesson integration without substituting browser layout QA.
class Root {
  constructor(){this.elements=new Map();this.html=''}
  set innerHTML(html){this.html=html;this.elements=new Map();for(const m of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){
    this.elements.set('#'+m[1],{disabled:/\sdisabled/.test(m[0]),value:m[0].match(/\bvalue="([^"]*)"/)?.[1]||'',focus(){}});
  }}
  get innerHTML(){return this.html}
  querySelector(selector){return this.elements.get(selector)||null}
  querySelectorAll(){return []}
  addEventListener(){}
}
const lessonData=JSON.parse(fs.readFileSync(path.join(__dirname,'../clase/lesson.json')));
const copyData=JSON.parse(fs.readFileSync(path.join(__dirname,'../clase/account-copy.json')));
const lessonSource=fs.readFileSync(path.join(__dirname,'../clase/lesson.js'),'utf8');
function completedState(){return {lang:'ru',stage:8,positions:{3:0,4:0,5:0,6:0},records:Object.fromEntries(Object.values(lessonData.groups).flat().map(q=>[q.id,{ok:true,last:{ok:true},resolved:true}])),drafts:{},tokens:{},own:['Leo es bueno.','Ana es mala.','España es fuerte.'],modelSeen:true,runId:attempt.id}}
async function lessonSetup(state,lessonId){
  const root=new Root(),storage=new Map(),saved=[];let subscriber;
  const selected=lessonId||'football-adjectives-a1';
  const data=selected==='football-kit-a1'?JSON.parse(fs.readFileSync(path.join(__dirname,'../clase/football-kit.json'))):lessonData;
  const key=(selected==='football-kit-a1'?'esprofe_football_kit_v1':'esprofe_football_review_v3')+':'+owner.id;
  if(state)storage.set(key,JSON.stringify(state));
  const account={user:owner,available:true,init:async()=>owner,subscribe:fn=>{subscriber=fn},history:async()=>[],saveAttempt:async a=>{saved.push(a);return a.id}};
  const context={window:{EsProfeLessonAccount:account,location:{search:lessonId?'?lesson='+lessonId:''},addEventListener(){}},document:{getElementById:()=>root,fonts:null},fetch:async url=>({ok:true,json:async()=>['lesson.json','football-kit.json'].includes(url.split('?')[0])?data:copyData}),crypto,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},URLSearchParams,console,setTimeout,confirm:()=>true};
  for(const file of ['lesson-catalog.js','kit-visuals.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/'+file),'utf8'),context);
  await vm.runInNewContext(lessonSource,context);
  return {root,storage,saved,account,key,switchUser(next){account.user=next;subscriber()}};
}
test('lesson saves complete score once and persists saved state across reload',async()=>{
  const s=await lessonSetup(completedState());assert.equal(s.root.querySelector('#ep-cloud-save').disabled,false);
  await s.root.querySelector('#ep-cloud-save').onclick();
  assert.equal(s.saved.length,1);assert.equal(s.saved[0].total,45);assert.equal(s.saved[0].score,45);
  assert.equal(s.root.querySelector('#ep-cloud-save').disabled,true);
  await s.root.querySelector('#ep-cloud-save').onclick();assert.equal(s.saved.length,1);
  const restored=await lessonSetup(JSON.parse(s.storage.get(s.key)));
  assert.equal(restored.root.querySelector('#ep-cloud-save').disabled,true);
});
test('lesson refuses unfinished result and preserves separate account and guest progress',async()=>{
  const state=completedState();delete state.records.w0;
  const s=await lessonSetup(state);assert.equal(s.root.querySelector('#ep-cloud-save').disabled,true);
  await s.root.querySelector('#ep-cloud-save').onclick();assert.equal(s.saved.length,0);
  assert(!s.root.innerHTML.includes('Матч завершён!'));
  const before=s.storage.get(s.key);s.switchUser(null);
  assert.equal(s.storage.get(s.key),before);assert(s.storage.has('esprofe_football_review_v3'));
  s.switchUser(owner);assert(s.root.innerHTML.includes('44 / 45'));
});

test('different gender endings of the same adjective trigger a repetition warning',async()=>{
  const state=completedState();state.own=['Leo es bueno.','Ana es buena.','España es fuerte.'];
  const s=await lessonSetup(state);assert.equal(s.root.querySelector('#ep-cloud-save').disabled,true);
  await s.root.querySelector('#ep-cloud-save').onclick();assert.equal(s.saved.length,0);
});
test('result shows exact missing count and continues at first unanswered exercise',async()=>{
  const state=completedState();delete state.records.w0;
  const s=await lessonSetup(state);assert(s.root.innerHTML.includes('осталось выполнить заданий: 1'));
  s.root.querySelector('#ep-incomplete').onclick();
  assert(s.root.querySelector('#ep-answer'));assert(s.root.innerHTML.includes('el jugador + pequeño'));
});
test('warmup accepts both an adjective and a full correct sentence',async()=>{
  for(const answer of ['pequeño','El jugador es pequeño.']){
    const state=completedState();state.stage=3;delete state.records.w0;
    const s=await lessonSetup(state);s.root.querySelector('#ep-answer').value=answer;
    s.root.querySelector('#ep-check').onclick();
    const record=JSON.parse(s.storage.get(s.key)).records.w0;
    assert.equal(record.ok,true);assert(s.root.innerHTML.includes('Правильно!'));
  }
});
test('incorrect full sentence is shown once without a repeated subject',async()=>{
  const state=completedState();state.stage=3;delete state.records.w0;
  const s=await lessonSetup(state);s.root.querySelector('#ep-answer').value='El jugador es pequeña.';
  s.root.querySelector('#ep-check').onclick();
  assert.equal(JSON.parse(s.storage.get(s.key)).records.w0.ok,false);
  assert(!s.root.innerHTML.includes('El jugador es El jugador'));
});
test('previously rejected correct full sentence is repaired on reload',async()=>{
  const state=completedState();state.records.w0={ok:false,picked:'el jugador es pequeño',last:{ok:false,picked:'el jugador es pequeño'},resolved:false,history:[{ok:false,picked:'el jugador es pequeño'}]};
  const s=await lessonSetup(state);const record=JSON.parse(s.storage.get(s.key)).records.w0;
  assert.equal(record.ok,true);assert.equal(record.last.ok,true);assert.equal(record.history[0].ok,true);
  assert.equal(s.root.querySelector('#ep-cloud-save').disabled,false);
});

test('second football lesson has separate local state, accepts short colour answers and retains first mistakes',async()=>{
 const state={...completedState(),stage:5,records:{},modelSeen:true,own:['La camiseta es roja.','Los pantalones cortos son rojos.','Los guantes son rojos.']};
 const s=await lessonSetup(state,'football-kit-a1');
 assert(s.root.innerHTML.includes('Inglaterra'));assert(s.root.innerHTML.includes('<svg'));
 s.root.querySelector('#ep-answer').value='blanca';s.root.querySelector('#ep-check').onclick();
 assert.equal(JSON.parse(s.storage.get(s.key)).records['k-q0'].ok,true);
 assert(!s.storage.has('esprofe_football_review_v3:'+owner.id));
 s.root.querySelector('#ep-task-next').onclick();s.root.querySelector('#ep-answer').value='rojo';s.root.querySelector('#ep-check').onclick();
 s.root.querySelector('#ep-retry').onclick();s.root.querySelector('#ep-answer').value='Es roja.';s.root.querySelector('#ep-check').onclick();
 const r=JSON.parse(s.storage.get(s.key)).records['k-q1'];assert.equal(r.ok,false);assert.equal(r.last.ok,true);assert.equal(r.resolved,false,'an initial mistake still needs spaced review');
});
test('second lesson permits repeated colours in free examples and reports its own total',async()=>{
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../clase/football-kit.json')));
 const state={...completedState(),own:['La camiseta es roja.','Los pantalones cortos son rojos.','Los guantes son rojos.'],records:Object.fromEntries(Object.values(data.groups).flat().map(q=>[q.id,{ok:true,last:{ok:true},resolved:true}]))};
 const s=await lessonSetup(state,'football-kit-a1');assert.equal(s.root.querySelector('#ep-cloud-save').disabled,false);
 await s.root.querySelector('#ep-cloud-save').onclick();assert.equal(s.saved[0].total,19);
});
