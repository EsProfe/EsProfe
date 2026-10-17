"use strict";
/* One account, one A1 state. The shared account module owns the Supabase client. */
(() => {
  let ready = false, applying = false, timer = 0, status = "local";
  const account = () => window.EsProfeStudentAccount;
  const meaningful = state => !!(state && (Object.keys(state.lessons?.A1 || {}).length || Object.keys(state.reviewQueue || {}).length || state.name || state.completedLessons?.length));
  const stamp = state => Date.parse(state?.updatedAt || "") || 0;
  const emit = next => { status = next; document.dispatchEvent(new CustomEvent("esprofe:cloudSync", {detail:{status}})); };
  const snapshot = () => ({ progress:window.getProgressData?.() || {}, profile:window.getStudentProfile?.() || {} });
  const legacySnapshot = () => ({ progress:window.getLegacyProgressData?.() || {}, profile:window.getLegacyStudentProfile?.() || {} });
  const newerLocal = (local, remote) => Math.max(stamp(local.progress),stamp(local.profile)) > Date.parse(remote?.updated_at || "");
  function applyRemote(remote) { applying=true; window.replaceProgressData?.(remote.progress); window.replaceStudentProfile?.(remote.profile); applying=false; }
  async function restore() {
    ready=false;
    if (!account()?.user) { emit("local"); return; }
    emit("loading");
    try {
      const remote = await account().loadA1State();
      const local = snapshot();
      if (!remote) {
        const first = meaningful(local.progress) || meaningful(local.profile) ? local : legacySnapshot();
        if (meaningful(first.progress) || meaningful(first.profile)) await account().saveA1State(first);
      } else if (newerLocal(local, remote)) {
        await account().saveA1State(local);
      } else {
        applyRemote(remote);
      }
      ready=true; emit("synced");
    } catch (_) { ready=true; emit("waiting"); }
  }
  async function save() {
    timer=0;
    if (!ready || applying || !account()?.user) return;
    emit("saving");
    try { await account().saveA1State(snapshot()); emit("synced"); }
    catch (_) { emit("waiting"); }
  }
  function schedule() { if (!ready || applying || !account()?.user) return; emit("saving"); clearTimeout(timer); timer=setTimeout(save,900); }
  document.addEventListener("esprofe:accountChanged", restore);
  // Covers a restored browser session even if the account event happened
  // before this module finished loading.
  document.addEventListener("DOMContentLoaded", () => {
    if (account()?.user) restore();
  }, {once:true});
  document.addEventListener("esprofe:progressChanged", schedule);
  document.addEventListener("esprofe:studentChanged", schedule);
  document.addEventListener("visibilitychange", () => { if(document.visibilityState==="hidden") save(); });
  window.EsProfeCloudSync = Object.freeze({ restore, save, get status(){return status;} });
})();
