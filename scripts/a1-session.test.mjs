import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../js/a1-lessons-v2.js', import.meta.url), 'utf8');
const languages = ['ru', 'uk', 'en', 'es'];
function fixture(vocabulary = false) {
  return {
    id: 'session-test', ruleTags: { forms: 0, vocabulary: 0 },
    i18n: Object.fromEntries(languages.map(l => [l, {
      title: `title-${l}`, goal: '', intro: '', rules: [[`rule-${l}`, `text-${l}`]],
      examplesTitle: `examples-${l}`, practiceTitle: `practice-${l}`,
      trainerTitle: `trainer-${l}`, assessmentTitle: `assessment-${l}`,
      resultTitle: `result-${l}`, reviewTitle: `review-${l}`
    }])),
    examples: [{ word: 'hola' }],
    ...(vocabulary ? { flashcards: Array.from({ length: 15 }, (_, i) =>
      [`word-${i}`, `ru-${i}`, `uk-${i}`, `en-${i}`, `es-${i}`, '🧠']) } : {}),
    questionBank: Array.from({ length: 24 }, (_, i) => ({
      id: `q-${i}`, tag: 'forms',
      prompt: Object.fromEntries(languages.map(l => [l, `prompt-${i}-${l}`])),
      optionsByLang: Object.fromEntries(languages.map(l => [l, [`yes-${l}`, `no-${l}`]])),
      answers: Object.fromEntries(languages.map(l => [l, `yes-${l}`]))
    }))
  };
}

async function environment(vocabulary = false) {
  const listeners = new Map(), timers = new Map(), saved = [], resolved = [], answers = [];
  let nextTimer = 0;
  const language = { value: 'ru' }, nodes = [];
  const root = {
    style: {}, html: '',
    set innerHTML(value) {
      this.html = value; nodes.length = 0;
      for (const match of value.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>|<p\b([^>]*)>([\s\S]*?)<\/p>/g)) {
        const attributes = match[1] ?? match[3], text = match[2] ?? match[4];
        const attrs = Object.fromEntries([...attributes.matchAll(/([\w-]+)="([^"]*)"/g)].map(x => [x[1], x[2]]));
        nodes.push({ attrs, text, dataset: Object.fromEntries(Object.entries(attrs).filter(([key]) => key.startsWith('data-'))
          .map(([key, val]) => [key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), val])),
          disabled: /\bdisabled\b/.test(attributes), addEventListener(name, fn) { if (name === 'click') this.onclick = fn; } });
      }
    },
    get innerHTML() { return this.html; },
    querySelector: () => null,
    querySelectorAll(selector) {
      const attribute = /^\[([\w-]+)\]/.exec(selector)?.[1];
      return attribute ? nodes.filter(x => attribute in x.attrs) : [];
    }
  };
  const document = {
    documentElement: { dataset: { learningMode: 'course' } },
    getElementById: id => id === 'language' ? language : id === 'grammarSection' ? root : nodes.find(x => x.attrs.id === id) || null,
    querySelector: selector => selector === '.a1-lesson' && root.html.includes('class="a1-lesson"') ? root : null,
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, []); listeners.get(name).push(fn); },
    dispatchEvent(event) { for (const fn of listeners.get(event.type) || []) fn(event); }
  };
  const lesson = fixture(vocabulary);
  const c = vm.createContext({ document, console,
    setTimeout: (fn, delay) => { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    EsProfeA1Catalog: { lesson: async () => lesson },
    EsProfeLearningProgress: {
      recordLessonResult: (_, __, result) => saved.push(result),
      clearWeakSpot: (_, __, tag) => resolved.push(tag), recordPracticeAnswer: ok => answers.push(ok)
    },
    openA1Curriculum: () => root.innerHTML = '<div class="a1-route">route</div>',
    getProgressData: () => ({ reviewQueue: { test: { level: 'A1', lessonId: lesson.id, tag: 'forms', mistakes: 1 } } })
  });
  c.window = c; vm.runInContext(source, c);
  const dispatch = (type, detail) => document.dispatchEvent({ type, detail });
  await c.openA1Lesson(lesson.id);
  const clickId = id => { const n = document.getElementById(id); assert.ok(n?.onclick, id); n.onclick(); };
  function advance() {
    const entry = [...timers].sort((a, b) => a[1].delay - b[1].delay)[0];
    assert.ok(entry, 'A pending transition exists'); timers.delete(entry[0]); entry[1].fn();
  }
  function change(l) { language.value = l; dispatch('esprofe:languageChanged'); }
  function answer(correct = true) {
    const options = nodes.filter(x => ['data-option-index', 'data-vocab', 'data-weak-index'].some(k => k in x.attrs));
    let expected = `yes-${language.value}`;
    if (root.html.includes('data-vocab')) {
      const prompt = /<h2>([^<]*)<\/h2>/.exec(root.html)[1];
      const index = prompt.split('-').at(-1);
      expected = prompt.startsWith('word-') ? `${language.value}-${index}` : `word-${index}`;
    }
    const button = options.find(x => correct ? x.text === expected : x.text !== expected);
    assert.ok(button && !button.disabled, `Answer ${expected}`); button.onclick();
    return button;
  }
  function route() {
    const target = { closest: selector => selector === '[data-a1-go-route]' ? {} : null };
    document.dispatchEvent({ type: 'click', target });
  }
  return { c, lesson, root, nodes, saved, resolved, timers, answers, clickId, advance, change, answer, route, dispatch };
}

test('language changes keep examples, question and answered state; one answer scores once', async () => {
  const e = await environment(); e.clickId('a1Examples'); e.change('uk');
  assert.match(e.root.html, /examples-uk/); e.clickId('a1Start');
  const number = /prompt-(\d+)-/.exec(e.root.html)[1];
  for (const l of languages) { e.change(l); assert.match(e.root.html, new RegExp(`prompt-${number}-${l}`)); }
  const oldButton = e.answer(); oldButton.onclick();
  e.change('en'); assert.match(e.root.html, /1 \/ 6/);
  assert.ok(e.nodes.filter(x => 'data-option-index' in x.attrs).every(x => x.disabled));
  assert.equal(e.answers.length, 1); e.advance(); assert.match(e.root.html, /2 \/ 6/);
});

test('result survives translation without another saved attempt', async () => {
  const e = await environment(); e.clickId('a1Examples'); e.clickId('a1Start');
  for (let i = 0; i < 24; i++) { if (i === 7) e.change('uk'); e.answer(); e.advance(); }
  assert.equal(e.saved.length, 1); assert.equal(e.saved[0].percent, 100);
  assert.equal(e.saved[0].practice, 6); assert.equal(e.saved[0].trainer, 8);
  for (const l of languages) { e.change(l); assert.match(e.root.html, /a1-score">100%/); }
  assert.equal(e.saved.length, 1);
});

test('leaving a question cancels its delayed transition and does not overwrite the route', async () => {
  const e = await environment(); e.clickId('a1Examples'); e.clickId('a1Start'); e.answer();
  const callbacks = [...e.timers.values()].map(x => x.fn);
  e.route(); callbacks.forEach(fn => fn());
  assert.equal(e.timers.size, 0); assert.match(e.root.html, /a1-route/); assert.equal(e.saved.length, 0);
});

test('all vocabulary cards run in both directions; language preserves the current card and totals', async () => {
  const e = await environment(true); e.clickId('a1Examples'); e.clickId('a1Start');
  assert.match(e.root.html, /1 \/ 30/);
  const seen = new Set();
  for (let i = 0; i < 30; i++) {
    if (i === 5) e.change('uk');
    const prompt = /<h2>([^<]*)<\/h2>/.exec(e.root.html)[1];
    seen.add(`${prompt.startsWith('word-') ? 'forward' : 'reverse'}-${prompt.split('-').at(-1)}`);
    e.answer(); e.advance();
  }
  assert.equal(seen.size, 30);
  for (let i = 0; i < 18; i++) { e.answer(); e.advance(); }
  assert.equal(e.saved[0].practice, 30); assert.match(e.root.html, /30\/30/);
});

test('review retains its question across translations and resolves the tag once', async () => {
  const e = await environment();
  e.dispatch('esprofe:reviewWeakSpot', { level: 'A1', lessonId: e.lesson.id, tag: 'forms' });
  await new Promise(resolve => setImmediate(resolve));
  const number = /prompt-(\d+)-/.exec(e.root.html)[1];
  e.change('uk'); assert.match(e.root.html, new RegExp(`prompt-${number}-uk`));
  const oldButton = e.answer(); oldButton.onclick(); e.change('en');
  assert.deepEqual(e.resolved, ['forms']);
  assert.ok(e.nodes.filter(x => 'data-weak-index' in x.attrs).every(x => x.disabled));
  e.advance(); assert.match(e.root.html, /review-en/); assert.equal(e.saved.length, 0);
});

test('a vocabulary mistake returns later, retains its first-attempt score and translates feedback', async () => {
  const e = await environment(true); e.clickId('a1Examples'); e.clickId('a1Start');
  e.answer(false); e.change('uk');
  assert.match(e.root.html, /Повторимо це слово/);
  assert.ok(e.nodes.filter(x => 'data-vocab' in x.attrs).every(x => x.disabled));
  e.advance();
  for (let i = 0; i < 30; i++) { e.answer(); e.advance(); }
  for (let i = 0; i < 18; i++) { e.answer(); e.advance(); }
  assert.equal(e.saved.length, 1); assert.equal(e.saved[0].practice, 29);
  assert.equal(e.saved[0].weakSpots.vocabulary, 1); assert.match(e.root.html, /29\/30/);
});
