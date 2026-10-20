import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataDir = path.join(root, 'data');
const manifest = JSON.parse(await readFile(path.join(dataDir, 'a1-audio-manifest.json'), 'utf8'));

function collectAudio(value, output = []) {
  if (Array.isArray(value)) value.forEach(item => collectAudio(item, output));
  else if (value && typeof value === 'object') {
    if (typeof value.audio === 'string') output.push(value.audio);
    Object.values(value).forEach(item => collectAudio(item, output));
  }
  return output;
}

test('A1 audio review manifest covers every direct lesson audio phrase exactly once', async () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.locale, 'es-ES');
  const files = (await readdir(dataDir)).filter(name => /^a1-.*\.json$/.test(name) && name !== 'a1-audio-manifest.json');
  const directAudio = new Set();
  for (const file of files) {
    const lessonData = JSON.parse(await readFile(path.join(dataDir, file), 'utf8'));
    collectAudio(lessonData).forEach(text => directAudio.add(text));
  }
  const entries = manifest.entries;
  assert.equal(entries.length, 38);
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
  assert.equal(new Set(entries.map(entry => entry.questionId)).size, entries.length);
  assert.deepEqual(new Set(entries.map(entry => entry.text)), directAudio);
  for (const entry of entries) {
    assert.match(entry.id, /^a1-audio-/);
    assert.match(entry.sourceFile, /^data\/a1-.*\.json$/);
    assert.match(entry.questionId, /^[a-z]+\d+$/);
    assert.equal(entry.reviewStatus, 'pending');
    for (const field of ['finalAsset', 'sourceUrl', 'license', 'attribution']) assert.equal(entry[field], null);
  }
});

test('requested A1 preview pronunciations keep orthography but use a Spanish voice and smooth spoken text', async () => {
  const byQuestion = Object.fromEntries(manifest.entries.map(entry => [entry.questionId, entry]));
  for (const id of ['li5', 'sc4', 'ws23']) assert.match(byQuestion[id].spokenText, / sále /);
  assert.equal(byQuestion.sp2.spokenText, 'Hola Pablo.');
  assert.equal(byQuestion.sp5.spokenText, '¿Puedes repetir por favor?');
  assert.equal(byQuestion.sp6.spokenText, '¿Me ayudas por favor?');
  const page = await readFile(path.join(root, 'audio-review.html'), 'utf8');
  assert.match(page, /\^es-ES\$/);
  assert.match(page, /utterance\.lang='es-ES'/);
  assert.doesNotMatch(page, /button\.disabled=!spanishVoice\(\)/);
});
