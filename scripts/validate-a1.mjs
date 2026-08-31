import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";

const ROOT = resolve(import.meta.dirname, "..");
const LANGUAGES = ["ru", "uk", "en", "es"];
const errors = [];

function fail(message) {
  errors.push(message);
}

async function text(path) {
  return readFile(resolve(ROOT, path), "utf8");
}

async function json(path) {
  try {
    return JSON.parse(await text(path));
  } catch (error) {
    fail(`${path}: invalid JSON (${error.message})`);
    return null;
  }
}

for (const directory of ["data", "locales"]) {
  for (const name of await readdir(resolve(ROOT, directory))) {
    if (name.endsWith(".json")) await json(`${directory}/${name}`);
  }
}

for (const name of await readdir(resolve(ROOT, "js"))) {
  if (!name.endsWith(".js")) continue;
  try {
    new vm.Script(await text(`js/${name}`), { filename: `js/${name}` });
  } catch (error) {
    fail(`js/${name}: invalid JavaScript (${error.message})`);
  }
}

const catalog = await json("data/a1-catalog.json");
const curriculum = await json("data/curriculum-a1.json");

if (catalog && curriculum) {
  if (catalog.version !== 3) fail("data/a1-catalog.json: expected version 3");
  if (catalog.level !== "A1") fail("data/a1-catalog.json: expected level A1");

  const route = new Map();
  for (const module of curriculum.modules || []) {
    if (!catalog.modules?.[module.id]) fail(`Catalog is missing module ${module.id}`);
    for (const language of LANGUAGES) {
      if (!catalog.modules?.[module.id]?.[language]) {
        fail(`Module ${module.id} is missing ${language} title`);
      }
    }
    for (const topic of module.topics || []) {
      if (route.has(topic.id)) fail(`Curriculum contains duplicate topic ${topic.id}`);
      route.set(topic.id, module.id);
    }
  }

  for (const [id, meta] of Object.entries(catalog.lessons || {})) {
    if (meta.status !== "ready") fail(`${id}: catalog status must be ready`);
    if (!route.has(id)) fail(`${id}: ready lesson is missing from curriculum route`);
    if (!meta.file) fail(`${id}: catalog file is missing`);
    if (!meta.icon) fail(`${id}: catalog icon is missing`);

    for (const language of LANGUAGES) {
      const card = meta[language];
      if (!Array.isArray(card) || card.length !== 2 || card.some(value => !value)) {
        fail(`${id}: invalid ${language} card metadata`);
      }
    }

    const lessonFile = meta.file ? await json(meta.file) : null;
    const lesson = lessonFile?.[id];
    if (!lesson) {
      fail(`${id}: ${meta.file || "catalog file"} does not contain the lesson`);
      continue;
    }
    if (lesson.moduleId !== route.get(id)) {
      fail(`${id}: moduleId ${lesson.moduleId} does not match route ${route.get(id)}`);
    }
    if (!Array.isArray(lesson.examples) || lesson.examples.length === 0) {
      fail(`${id}: examples are missing`);
    }
    if (!Array.isArray(lesson.questionBank) || lesson.questionBank.length < 10) {
      fail(`${id}: questionBank must contain at least 10 questions`);
    }
    if (lesson.supplements && typeof lesson.supplements !== "object") {
      fail(`${id}: supplements must be an object`);
    }
    if (lesson.reference) {
      if (!Array.isArray(lesson.reference.items) || lesson.reference.items.length === 0) {
        fail(`${id}: reference items are missing`);
      }
      for (const language of LANGUAGES) {
        if (!lesson.reference.i18n?.[language]) {
          fail(`${id}: reference ${language} content is missing`);
        }
      }
    }

    for (const language of LANGUAGES) {
      const copy = lesson.i18n?.[language];
      for (const key of ["title", "goal", "intro", "examplesTitle", "practiceTitle", "trainerTitle", "assessmentTitle", "resultTitle", "reviewTitle"]) {
        if (!copy?.[key]) fail(`${id}: ${language}.${key} is missing`);
      }
      if (!Array.isArray(copy?.rules) || copy.rules.length === 0) {
        fail(`${id}: ${language}.rules are missing`);
      }
    }

    for (const question of lesson.questionBank || []) {
      for (const language of LANGUAGES) {
        const prompt = question.prompt?.[language];
        const options = question.optionsByLang?.[language] ?? question.options;
        const answer = question.answers?.[language] ?? question.answer;
        if (!prompt) fail(`${id}/${question.id}: ${language} prompt is missing`);
        if (!Array.isArray(options) || options.length < 2) {
          fail(`${id}/${question.id}: ${language} options are invalid`);
        } else if (!options.includes(answer)) {
          fail(`${id}/${question.id}: ${language} answer is not present in options`);
        }
      }
    }
  }

  const index = await text("index.html");
  for (const required of ["js/a1-catalog.js", "js/a1-curriculum-v2.js", "js/a1-lessons-v2.js"]) {
    if (!index.includes(required)) fail(`index.html: ${required} is not connected`);
  }
  for (const obsolete of ["js/a1-curriculum.js", "js/a1-lessons.js", "js/a1-data-runtime.js", "js/a1-navigation-fix.js", "js/a1-question-words-enable.js"]) {
    if (index.includes(obsolete)) fail(`index.html: obsolete ${obsolete} is still connected`);
  }
  if ((await text("js/language-runtime.js")).includes("EsProfeA1Lessons")) {
    fail("js/language-runtime.js: obsolete A1 lesson API is still used");
  }
}

if (errors.length) {
  console.error(`A1 validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`A1 validation passed: ${Object.keys(catalog.lessons).length} ready lessons, ${LANGUAGES.length} languages.`);
