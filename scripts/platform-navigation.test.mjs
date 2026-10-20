import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../js/platform-shell.js', import.meta.url), 'utf8');

// Model ancestor matching: the page's palette lives on <html>, while palette
// controls are buttons. A broad closest selector swallows every navigation click.
class Element {
  constructor(tag = 'div', dataset = {}, parent = null) {
    Object.assign(this, { tag, dataset, parent, style: {}, hidden: false, children: [] });
    this.classList = { toggle() {}, remove() {} };
  }
  closest(selector) {
    const match = /^(button)?\[data-([\w-]+)\]$/.exec(selector);
    assert.ok(match, `Supported selector: ${selector}`);
    const key = match[2].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    for (let node = this; node; node = node.parent) {
      if ((!match[1] || node.tag === match[1]) && key in node.dataset) return node;
    }
    return null;
  }
  appendChild() {}
  setAttribute() {}
  addEventListener() {}
}

function environment(language) {
  const html = new Element('html');
  const nodes = new Map(['platformHome', 'legacyWorkspace', 'legacyMount',
    'studentProfile', 'progressPanel', 'grammarSection', 'sectionWorkspace', 'language']
    .map(id => [id, new Element()]));
  nodes.get('language').value = language;
  const main = new Element('main'), topicMenu = new Element(), trainer = new Element();
  const listeners = new Map(), opens = [], state = { url: 'https://esprofe.es/', accountOpened:0 };
  main.appendChild = el => nodes.set(el.id, el);
  const document = {
    readyState: 'complete', documentElement: html,
    getElementById: id => nodes.get(id) || null,
    createElement: tag => new Element(tag),
    querySelector: selector => ({ main, '.topic-menu': topicMenu, '.trainer': trainer }[selector] || null),
    querySelectorAll: () => [],
    addEventListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(fn);
    },
    dispatchEvent(event) { for (const fn of listeners.get(event.type) || []) fn(event); }
  };
  const context = vm.createContext({ document, URL, URLSearchParams, setTimeout, console,
    location: { search: '', href: state.url }, history: { replaceState: (_, __, url) => state.url = String(url) },
    scrollTo() {}, openA1Curriculum: options => opens.push(options.mode), openA1Lesson: id => state.openedLesson = id,
    EsProfeStudentAccount: { user:null, open(){ state.accountOpened++; } },
    CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } }
  });
  context.window = context;
  vm.runInContext(source, context);
  function click(dataset, nested = false) {
    const button = new Element('button', dataset, html);
    document.dispatchEvent({ type: 'click', target: nested ? new Element('span', {}, button) : button });
  }
  return { html, nodes, opens, state, account:context.EsProfeStudentAccount, platform:context.EsProfePlatform, click };
}

for (const language of ['ru', 'uk', 'en', 'es']) {
  test(`free A1 opens without sign-in and My course requires an account (${language})`, () => {
    const env = environment(language);
    for (const nested of [false, true]) {
      env.click({ action: 'free' }, nested);
      assert.equal(env.nodes.get('platformHome').hidden, true);
      assert.equal(env.nodes.get('legacyWorkspace').hidden, false);
      assert.equal(env.html.dataset.learningMode, 'free');
      assert.equal(env.opens.at(-1), 'free');
      env.click({ action: 'home' });
      assert.equal(env.nodes.get('platformHome').hidden, false);
      assert.equal(env.nodes.get('legacyWorkspace').hidden, true);

      const beforeAccount = env.state.accountOpened;
      env.account.user = null;
      env.click({ action: 'course' }, nested);
      assert.equal(env.state.accountOpened, beforeAccount + 1);
      assert.equal(env.opens.at(-1), 'free');
      env.account.user = { id:'student-1' };
      env.click({ action: 'course' }, nested);
      assert.equal(env.html.dataset.learningMode, 'course');
      assert.equal(env.opens.at(-1), 'course');
      assert.equal(env.state.url, 'https://esprofe.es/');
    }
  });
}

test('only a palette button changes palette; navigation still works afterwards', () => {
  const env = environment('ru');
  env.click({ homePalette: 'sol' }, true);
  assert.equal(env.html.dataset.homePalette, 'sol');
  assert.equal(env.state.url, 'https://esprofe.es/?palette=sol');
  assert.equal(env.opens.length, 0);
  env.click({ action: 'free' }, true);
  assert.equal(env.opens.at(-1), 'free');
  assert.equal(env.html.dataset.homePalette, 'sol');
});

test('opening the current course lesson replaces the dashboard with the lesson', () => {
  const env = environment('ru');
  env.account.user = { id:'student-1' };
  env.platform.openCourseLesson('greetings-farewells');
  assert.equal(env.html.dataset.learningMode, 'course');
  assert.equal(env.state.openedLesson, 'greetings-farewells');
  assert.equal(env.nodes.get('studentProfile').style.display, 'none');
  assert.equal(env.nodes.get('progressPanel').style.display, 'none');
});
