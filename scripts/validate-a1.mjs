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
    const source = await text(path);
    if (source !== source.normalize("NFC")) fail(`${path}: text is not NFC-normalized`);
    return JSON.parse(source);
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
  const routeOrder = [];
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
      routeOrder.push(topic.id);
    }
  }

  const readyOrder = Object.keys(catalog.lessons || {});
  const expectedReadyOrder = routeOrder.filter(id => catalog.lessons?.[id]?.status === "ready");
  if (readyOrder.join("|") !== expectedReadyOrder.join("|")) {
    fail("Catalog lesson order does not match the curriculum route");
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
    const routeIndex = routeOrder.indexOf(id);
    const expectedNext = routeOrder[routeIndex + 1];
    if (lesson.nextLessonId !== expectedNext) {
      fail(`${id}: nextLessonId ${lesson.nextLessonId} does not match route ${expectedNext}`);
    }
    if (lesson.supplements && typeof lesson.supplements !== "object") {
      fail(`${id}: supplements must be an object`);
    }
    if (lesson.stemDiagram) {
      if (!lesson.stemDiagram.infinitive || !lesson.stemDiagram.from || !lesson.stemDiagram.to) {
        fail(`${id}: stemDiagram identity is incomplete`);
      }
      if (!Array.isArray(lesson.stemDiagram.forms) || lesson.stemDiagram.forms.length !== 6) {
        fail(`${id}: stemDiagram must contain six forms`);
      }
      if (!Array.isArray(lesson.stemDiagram.marks) || lesson.stemDiagram.marks.length !== 6) {
        fail(`${id}: stemDiagram must contain six highlights`);
      }
      for (const language of LANGUAGES) {
        if (!lesson.stemDiagram.note?.[language]) fail(`${id}: stemDiagram ${language} note is missing`);
      }
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

    const questionIds = new Set();
    const usedTags = new Set();
    for (const question of lesson.questionBank || []) {
      if (!question.id || questionIds.has(question.id)) fail(`${id}: duplicate or missing question id ${question.id || "(empty)"}`);
      questionIds.add(question.id);
      if (!Object.hasOwn(lesson.ruleTags || {}, question.tag)) fail(`${id}/${question.id}: unknown rule tag ${question.tag}`);
      usedTags.add(question.tag);
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
    for (const tag of Object.keys(lesson.ruleTags || {})) {
      if (!usedTags.has(tag)) fail(`${id}: rule tag ${tag} has no questions`);
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
  const catalogRuntime = await text("js/a1-catalog.js");
  const progressRuntime = await text("js/progress.js");
  const curriculumRuntime = await text("js/a1-curriculum-v2.js");
  if (!catalogRuntime.includes("setA1LessonCatalog")) fail("A1 catalog does not initialize sequential progress");
  if (!progressRuntime.includes("window.setA1LessonCatalog")) fail("Progress does not accept catalog-driven lesson order");
  if (curriculumRuntime.includes("data.modules.slice(0,3)")) fail("A1 route still limits ready modules to the first three");
  if (!(await text("js/platform-shell.js")).includes("Учебные материалы A1 с последовательным маршрутом, прогрессом, слабыми местами и рекомендациями для ученика.")) {
    fail("Home page My course description is outdated");
  }
}

if (errors.length) {
  console.error(`A1 validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`A1 validation passed: ${Object.keys(catalog.lessons).length} ready lessons, ${LANGUAGES.length} languages.`);
