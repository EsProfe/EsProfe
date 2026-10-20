const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const model=require('../js/lesson-report.js'),service=require('../js/teaching-service.js');
const record={picked:'pequeña',ok:false,resolved:true,last:{picked:'pequeño',ok:true},attemptCount:38,wrongCount:6,history:Array.from({length:38},(_,i)=>({picked:i?'pequeño':'pequeña',ok:!!i,phase:i?'repeat':'first'}))};
const item={id:'w0',p:'el jugador + pequeño',a:'pequeño',stage:3};
const build=()=>model.build({items:[item],records:{w0:record},own:['Messi es un jugador bueno.','',''],resume:{stage:8},complete:false});
test('report preserves first mistake after correction and bounds retry history without losing counters',()=>{
 const snapshot=build();assert.equal(snapshot.tasks[0].firstAnswer,'pequeña');assert.equal(snapshot.tasks[0].firstCorrect,false);assert.equal(snapshot.tasks[0].lastAnswer,'pequeño');assert.equal(snapshot.tasks[0].history.length,20);assert.equal(snapshot.tasks[0].attempts,38);assert.equal(snapshot.tasks[0].wrongCount,6);assert.equal(snapshot.unresolved,0);assert.equal(snapshot.complete,false);
 const restored=model.restore({id:'attempt',lesson_id:'football-adjectives-a1',language:'uk',version:3,snapshot});assert.equal(restored.records.w0.picked,'pequeña');assert.equal(restored.records.w0.attemptCount,38);assert.equal(restored.reportVersion,3);assert.equal(restored.own[0],'Messi es un jugador bueno.');
 assert.throws(()=>model.restore({snapshot}),/invalid_report/);
});
test('guests cannot read or write teaching data and a response for another account is discarded',async()=>{
 let user=null,resolveRequest;const calls=[];
 const client={auth:{getUser:async()=>({data:{user}})},rpc:(name,params)=>{calls.push({name,params});return new Promise(resolve=>resolveRequest=resolve)}};
 const account={get user(){return user}},api=service.create(client,account);
 await assert.rejects(api.saveReport({}),{code:'signin'});assert.equal(calls.length,0);
 user={id:'student-1'};const pending=api.saveReport({id:'attempt',lessonId:'football-adjectives-a1',language:'uk',snapshot:build(),version:0,saveId:'save'});
 await new Promise(r=>setImmediate(r));assert.equal(calls[0].params.p_id,'attempt');assert.equal('p_student_id' in calls[0].params,false);
 user={id:'student-2'};resolveRequest({data:{version:1},error:null});await assert.rejects(pending,{code:'changed'});
});
function panelSetup({fail=false,guest=false}={}){
 const calls=[],scheduled=new Map();let number=0;
 const state={runId:crypto.randomUUID(),lang:'ru',stage:3,positions:{3:0},records:{w0:structuredClone(record)},drafts:{},tokens:{},own:['','',''],modelSeen:false,retrying:[],reportVersion:0,reportDirty:false,reportPending:null};
 let failNext=fail;
 const account={user:guest?null:{id:'student'},teaching:{async saveReport(p){calls.push(structuredClone(p));if(failNext){failNext=false;throw Error('offline')}return {version:p.version+1,updated_at:'2026-10-20T08:00:00Z'}}}};
 const context={window:{EsProfeLessonReport:model},crypto,clearTimeout:id=>scheduled.delete(id),setTimeout:fn=>{scheduled.set(++number,fn);return number},confirm:()=>true,alert(){}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../clase/report-panel.js'),'utf8'),context);
 const options={account,language:()=>state.lang,state:()=>state,complete:()=>false,items:[item],lessonId:'football-adjectives-a1',
  pending:p=>state.reportPending=p,saved:r=>state.reportVersion=r.version,markDirty:v=>state.reportDirty=v,statusChanged(){},hasGuest:()=>false};
 return {panel:context.window.EsProfeReportPanel.create(options),state,account,calls,scheduled};
}
test('answer syncing is batched, partial reports save, and retry reuses the same idempotency key',async()=>{
 const s=panelSetup({fail:true});for(let i=0;i<4;i++)s.panel.changed(true);assert.equal(s.calls.length,0);assert.equal(s.scheduled.size,1);assert.equal(s.panel.canReset(),false);
 s.panel.changed(true);await new Promise(r=>setImmediate(r));assert.equal(s.calls.length,1);assert.equal(s.state.reportVersion,0);assert(s.state.reportPending);assert.equal(s.panel.canReset(),false);
 assert.equal(await s.panel.save(),true);assert.equal(s.calls.length,2);assert.equal(s.calls[0].saveId,s.calls[1].saveId);assert.equal(s.state.reportVersion,1);assert.equal(s.state.reportDirty,false);assert.equal(s.state.reportPending,null);assert.equal(s.panel.canReset(),true);
 assert.equal(s.calls[1].snapshot.complete,false);await s.panel.save();assert.equal(s.calls.length,2,'unchanged report is not sent again');
});
test('guest clicks never schedule requests and logout cancels a queued save',async()=>{
 const s=panelSetup({guest:true});s.panel.changed(true);assert.equal(s.scheduled.size,0);assert.equal(await s.panel.save(),false);assert.equal(s.calls.length,0);
 s.account.user={id:'student'};s.panel.changed(true);assert.equal(s.scheduled.size,1);s.panel.reset();assert.equal(s.scheduled.size,0);
});
test('a newly opened tab refuses to discard persisted unsynced work',()=>{
 const s=panelSetup();s.state.reportDirty=true;assert.equal(s.panel.canReset(),false);
});

test('saved kit reports restore only into the matching lesson',()=>{
 const row={id:'kit-attempt',lesson_id:'football-kit-a1',language:'ru',version:1,snapshot:build()};
 assert.throws(()=>model.restore(row),/invalid_report/);
 assert.equal(model.restore(row,'football-kit-a1').runId,'kit-attempt');
 const old={...row,lesson_id:'football-adjectives-a1'};
 assert.throws(()=>model.restore(old,'football-kit-a1'),/invalid_report/);
});
