import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../js/section-workspace.js', import.meta.url), 'utf8');
function environment(topic, subtopic, visible) {
  const listeners = new Map();
  const box = { dataset: { topic, subtopic }, style: { display: visible ? 'block' : 'none' },
    innerHTML: 'previous workspace', querySelectorAll: () => [] };
  const grammar = { style: { display: 'block' }, innerHTML: '<div class="a1-lesson">current question</div>' };
  const trainer = { style: { display: 'none' } }, back = {};
  const document = {
    getElementById: id => ({ sectionWorkspace: box, grammarSection: grammar, sectionBack: back, language: { value: 'en' } }[id] || null),
    querySelector: () => trainer,
    addEventListener: (name, fn) => listeners.set(name, fn)
  };
  const context = vm.createContext({ document, console }); context.window = context;
  vm.runInContext(source, context);
  return { box, grammar, translate: () => listeners.get('esprofe:languageChanged')() };
}

for (const [topic, subtopic] of [['vocabulary', 'daily'], ['listening', 'a1'], ['exams', 'dele']]) {
  test(`hidden ${topic} cannot replace an A1 exercise when language changes`, () => {
    const e = environment(topic, subtopic, false); e.translate();
    assert.equal(e.box.style.display, 'none');
    assert.equal(e.box.innerHTML, 'previous workspace');
    assert.equal(e.grammar.style.display, 'block');
    assert.match(e.grammar.innerHTML, /current question/);
  });
}

test('an open vocabulary workspace still translates normally', () => {
  const e = environment('vocabulary', 'daily', true); e.translate();
  assert.match(e.box.innerHTML, /Everyday vocabulary A1/);
  assert.equal(e.box.style.display, 'block');
  assert.equal(e.grammar.style.display, 'none');
});
