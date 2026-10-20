/* Authentication and completed-attempt history; no lesson content or passwords are stored here. */
(() => {
  'use strict';
  const config = window.EsProfeSupabaseConfig;
  const client = config && window.supabase?.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    global: { fetch: (url, options = {}) => fetch(url, {
      ...options, signal: options.signal || AbortSignal.timeout(15000)
    }) }
  });
  let user = null;
  let revision = 0;
  let initialized = false;
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => fn(user));
  const failure = code => Object.assign(new Error(code), { code });
  function setUser(next) {
    const changed = user?.id !== next?.id;
    user = next || null;
    if (changed) { revision++; emit(); }
  }
  async function init() {
    if (initialized) return user;
    initialized = true;
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    setUser(data.session?.user);
    // Defer work outside the auth callback: no Supabase calls while its lock is held.
    client.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => setUser(session?.user), 0);
    });
    return user;
  }
  async function ensureProfile(owner) {
    const { data, error } = await client.from('profiles').select('id')
      .eq('id', owner.id).maybeSingle();
    if (error) throw error;
    if (data) return;
    const result = await client.from('profiles').insert({
      id: owner.id, display_name: '', role: 'student'
    });
    if (result.error && result.error.code !== '23505') throw result.error;
  }
  async function signIn(email, password) {
    if (!client) throw failure('unavailable');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    await ensureProfile(data.user);
    return user;
  }
  async function signUp(email,password) {
    if(!client)throw failure('unavailable');
    const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+'/clase/'}});
    if(error)throw error;
    if(data.session?.user){setUser(data.session.user);await ensureProfile(data.session.user);}
    return {confirmationRequired:!data.session};
  }
  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw error;
    setUser(null);
  }
  async function verifiedOwner() {
    if (!client || !user) throw failure('signin');
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    if (!data.user || !user || data.user.id !== user.id) throw failure('signin');
    return data.user;
  }
  async function history() {
    const owner = await verifiedOwner(), currentRevision = revision;
    const { data, error } = await client.from('lesson_attempts')
      .select('id,score,total,language,completed_at')
      .eq('student_id', owner.id).eq('lesson_id', config.lessonId)
      .order('completed_at', { ascending: false }).limit(5);
    if (error) throw error;
    if (currentRevision !== revision) throw failure('changed');
    return data;
  }
  async function saveAttempt(attempt) {
    if (!attempt.complete || !Number.isInteger(attempt.score) ||
        !Number.isInteger(attempt.total) || attempt.total <= 0 ||
        attempt.score < 0 || attempt.score > attempt.total ||
        !['ru', 'uk', 'en'].includes(attempt.language) ||
        !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(attempt.id)) {
      throw failure('incomplete');
    }
    const owner = await verifiedOwner(), currentRevision = revision;
    await ensureProfile(owner);
    if (currentRevision !== revision) throw failure('changed');
    const row = {
      id: attempt.id, student_id: owner.id, lesson_id: config.lessonId,
      score: attempt.score, total: attempt.total, language: attempt.language
    };
    // A stable attempt UUID makes retrying a lost response safe without UPDATE access.
    const { error } = await client.from('lesson_attempts').insert(row);
    if (error) {
      if (error.code !== '23505') throw error;
      const existing = await client.from('lesson_attempts')
        .select('id,student_id,lesson_id,score,total,language')
        .eq('id', row.id).eq('student_id', owner.id).maybeSingle();
      if (existing.error) throw existing.error;
      if (!existing.data || Object.keys(row).some(key => existing.data[key] !== row[key])) {
        throw failure('conflict');
      }
    }
    if (currentRevision !== revision) throw failure('changed');
    return row.id;
  }
  window.EsProfeLessonAccount = Object.freeze({
    init, signIn, signUp, signOut, history, saveAttempt,
    teaching: window.EsProfeTeaching?.create(client,{get user(){return user}}),
    get user() { return user; },
    get available() { return !!client; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  });
})();
