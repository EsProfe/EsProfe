const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../js/student-account.js'), 'utf8');
const owner = { id:'f4eed01e-59cf-46f2-a515-fafbdf7b1430', email:'student@example.test' };

function setup(options = {}) {
  const events = [], profiles = new Map(), states = new Map();
  let session = options.guest ? null : { user:owner }, callback;
  const client = {
    auth: {
      getSession: async () => ({ data:{session}, error:null }),
      getUser: async () => ({ data:{user:session?.user||null}, error:null }),
      signInWithPassword: async () => { session = {user:owner}; return {data:{user:owner}, error:null}; },
      signUp: async () => options.confirmationRequired ? {data:{user:owner,session:null},error:null} : (session={user:owner},{data:{user:owner,session},error:null}),
      signOut: async () => { session=null; return {error:null}; },
      onAuthStateChange: fn => { callback=fn; }
    },
    from(table) {
      let selectedId = owner.id;
      const rows = table === 'student_a1_state' ? states : profiles;
      const query = { select(){return query;}, eq(_field,value){selectedId=value;return query;}, maybeSingle:async()=>({data:rows.get(selectedId)||null,error:null}), insert(row){ profiles.set(row.id,{...row}); return Promise.resolve({error:null}); }, upsert(row){ states.set(row.student_id,{...row}); return Promise.resolve({error:null}); } };
      return query;
    }
  };
  const document = { getElementById:id => id==='language'?{value:'en'}:null, addEventListener(){}, dispatchEvent:event => events.push(event), createElement(){}, body:{appendChild(){}} };
  const context = { window:{ EsProfeSupabaseConfig:{url:'https://project.supabase.co',publishableKey:'sb_publishable_test'}, supabase:options.noSdk?undefined:{createClient:()=>client}, location:{origin:'https://esprofe.es',pathname:'/'} }, document, CustomEvent:class { constructor(type,init){this.type=type;this.detail=init?.detail;} }, setTimeout:fn=>fn() };
  vm.runInNewContext(source, context);
  return { account:context.window.EsProfeStudentAccount, events, profiles, states, switchUser(next){session=next?{user:next}:null;callback('TOKEN_REFRESHED',session);} };
}

test('existing authenticated user is restored and exposes a stable identity', async () => {
  const s=setup(); await s.account.init();
  assert.equal(s.account.user.id, owner.id); assert.equal(s.account.available, true);
  assert(s.events.some(event=>event.type==='esprofe:accountChanged'));
});
test('sign in verifies the account, creates its profile and opens the personal route', async () => {
  const s=setup({guest:true}); await s.account.init(); await s.account.signIn(owner.email,'safe-password');
  assert.equal(s.profiles.get(owner.id).role,'student');
  assert(s.events.some(event=>event.type==='esprofe:accountReady'));
});
test('registration reports email confirmation when Supabase does not return a session', async () => {
  const s=setup({guest:true,confirmationRequired:true}); await s.account.init();
  const result=await s.account.signUp(owner.email,'safe-password');
  assert.equal(result.confirmationRequired,true); assert.equal(s.account.user,null);
  assert.equal(s.profiles.size,0);
});
test('sign out clears the owner and unavailable auth is explicit', async () => {
  const s=setup(); await s.account.init(); await s.account.signOut(); assert.equal(s.account.user,null);
  const unavailable=setup({noSdk:true}); await unavailable.account.init();
  await assert.rejects(unavailable.account.signIn(owner.email,'safe-password'),{code:'unavailable'});
});
test('A1 state is written and read only for the verified account', async () => {
  const s=setup(); await s.account.init();
  await s.account.saveA1State({progress:{lessons:{A1:{'alphabet-pronunciation':{percent:100}}}},profile:{currentLesson:'greetings-farewells'}});
  assert.equal(s.states.get(owner.id).student_id,owner.id);
  const state=await s.account.loadA1State();
  assert.equal(state.profile.currentLesson,'greetings-farewells');
  await s.account.signOut();
  await assert.rejects(s.account.loadA1State(),{code:'signin'});
});
