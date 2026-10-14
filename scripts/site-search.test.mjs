import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const source = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const catalog = JSON.parse(await source('data/a1-catalog.json'));
const deferred = () => { let resolve; const promise = new Promise(r => resolve = r); return { promise, resolve }; };
const settle = () => new Promise(resolve => setImmediate(resolve));

test('search uses the shared A1 catalog and finds accented terms on all four languages', async () => {
  let loads = 0;
  const c = vm.createContext({ EsProfeA1Catalog: { catalog: async () => { loads++; return catalog; } },
    fetch: () => { throw Error('Search must use the shared A1 loader'); } });
  c.window = c; vm.runInContext(await source('js/course-catalog.js'), c);
  for (const query of ['семья', 'сім’я', 'family', 'familia', 'pronunciacion', 'PRONUNCIACIÓN']) {
    assert.ok((await c.EsProfeCourseCatalog.search(query)).length, query);
  }
  assert.equal((await c.EsProfeCourseCatalog.search('data/')).length, 0);
  assert.ok(loads > 0);
});

async function environment() {
  function node(extra = {}) {
    return Object.assign({ handlers: {}, attrs: {}, addEventListener(name, fn) { this.handlers[name] = fn; },
      setAttribute(name, value) { this.attrs[name] = value; }, focus() {}, querySelector: () => null }, extra);
  }
  const input = node({ value: '' }), box = node({ id: 'siteSearchResults', hidden: true, innerHTML: '' }),
    label = {}, language = node({ value: 'ru' }), listeners = new Map(), timers = new Map(), requests = [], opened = [];
  let timerId = 0;
  const document = {
    readyState: 'complete', getElementById: id => ({ siteSearch: input, siteSearchResults: box, language }[id]),
    querySelector: () => label, addEventListener: (name, fn) => listeners.set(name, fn)
  };
  const c = vm.createContext({ document, console,
    setTimeout: fn => { const id = ++timerId; timers.set(id, fn); return id; }, clearTimeout: id => timers.delete(id),
    EsProfeCourseCatalog: { search: query => { const d = deferred(); requests.push({ query, ...d }); return d.promise; },
      localized: (title, l) => title[l] }, EsProfePlatform: { openLesson: async id => opened.push(id) }
  }); c.window = c; vm.runInContext(await source('js/site-search.js'), c);
  function type(query) { input.value = query; input.handlers.input(); }
  function flush() { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(fn => fn()); }
  const result = title => [{ id: 'family', title: Object.fromEntries(['ru','uk','en','es'].map(l => [l, [title + '-' + l, 'description']])) }];
  return { input, box, label, language, listeners, timers, requests, opened, type, flush, result };
}

test('a slow older query never overwrites a newer result', async () => {
  const e = await environment(); e.type('ser'); e.flush(); e.type('family'); e.flush();
  e.requests[1].resolve(e.result('family')); await settle();
  e.requests[0].resolve(e.result('ser')); await settle();
  assert.match(e.box.innerHTML, /family-ru/); assert.doesNotMatch(e.box.innerHTML, /ser-ru/);
});

test('clearing search or clicking outside cancels pending results', async () => {
  const e = await environment(); e.type('family'); e.flush(); e.type('');
  e.requests[0].resolve(e.result('family')); await settle(); assert.equal(e.box.hidden, true);
  e.type('ser'); e.flush(); e.listeners.get('click')({ target: { closest: () => null } });
  e.requests[1].resolve(e.result('ser')); await settle(); assert.equal(e.box.hidden, true);
});

test('visible results and the accessible search label translate together', async () => {
  const e = await environment(); e.type('family'); e.flush();
  e.requests[0].resolve(e.result('family')); await settle();
  e.language.value = 'uk'; e.listeners.get('esprofe:languageChanged')();
  e.requests[1].resolve(e.result('family')); await settle();
  assert.equal(e.label.textContent, 'Пошук'); assert.match(e.box.innerHTML, /family-uk/);
});

test('selecting a result opens the common lesson directly without a delayed catalog navigation', async () => {
  const e = await environment(); e.type('family'); e.flush();
  e.requests[0].resolve(e.result('family')); await settle();
  e.box.handlers.click({ target: { closest: () => ({ dataset: { lesson: 'family' } }) } }); await settle();
  assert.deepEqual(e.opened, ['family']); assert.equal(e.input.value, '');
  assert.equal(e.box.hidden, true); assert.equal(e.timers.size, 0);
});

test('a pending curriculum response cannot replace the selected lesson', async () => {
  const request = deferred(), listeners = new Map(), root = { innerHTML: '', style: {}, querySelectorAll: () => [] };
  const document = { documentElement: { dataset: { learningMode: 'free' } },
    getElementById: id => id === 'grammarSection' ? root : id === 'language' ? { value: 'ru' } : {},
    querySelector: () => null, addEventListener: (name, fn) => listeners.set(name, fn) };
  const c = vm.createContext({ document, console, fetch: () => request.promise, EsProfeA1Catalog: { catalog: async () => catalog } });
  c.window = c; vm.runInContext(await source('js/a1-curriculum-v2.js'), c);
  const opening = c.openA1Curriculum({ mode: 'free' });
  c.EsProfeA1Curriculum.cancel(); root.innerHTML = 'selected lesson';
  request.resolve({ ok: true, json: async () => JSON.parse(await source('data/curriculum-a1.json')) });
  await opening; assert.equal(root.innerHTML, 'selected lesson');
});
