"use strict";

const ESPROFE_PROGRESS_KEY = "esprofe_progress_v1";
const ESPROFE_LESSON_PASS_PERCENT = 80;
const A1_LESSON_ORDER = [
  "alphabet-pronunciation",
  "greetings-farewells",
  "introductions-personal-data",
  "numbers",
  "date-time",
  "countries-nationalities"
];

const progressLabels = {
  ru: { title:"Мой прогресс", course:"Прогресс A1", passed:"Пройдено уроков", weak:"Слабые места", review:"Повторить", noWeak:"Слабых мест нет", recommendation:"Рекомендация", continue:"Продолжить обучение", reviewNow:"Повторить сейчас", lesson:"Урок" },
  uk: { title:"Мій прогрес", course:"Прогрес A1", passed:"Пройдено уроків", weak:"Слабкі місця", review:"Повторити", noWeak:"Слабких місць немає", recommendation:"Рекомендація", continue:"Продовжити навчання", reviewNow:"Повторити зараз", lesson:"Урок" },
  en: { title:"My progress", course:"A1 progress", passed:"Lessons completed", weak:"Weak spots", review:"Review", noWeak:"No weak spots", recommendation:"Recommendation", continue:"Continue learning", reviewNow:"Review now", lesson:"Lesson" },
  es: { title:"Mi progreso", course:"Progreso A1", passed:"Lecciones superadas", weak:"Puntos débiles", review:"Repasar", noWeak:"No hay puntos débiles", recommendation:"Recomendación", continue:"Continuar aprendiendo", reviewNow:"Repasar ahora", lesson:"Lección" }
};

const lessonNames = {
  "alphabet-pronunciation": { ru:"Алфавит и произношение", uk:"Алфавіт і вимова", en:"Alphabet and pronunciation", es:"Alfabeto y pronunciación" },
  "greetings-farewells": { ru:"Приветствия и прощания", uk:"Привітання і прощання", en:"Greetings and farewells", es:"Saludos y despedidas" },
  "introductions-personal-data": { ru:"Знакомство и личные данные", uk:"Знайомство та особисті дані", en:"Introductions and personal information", es:"Presentaciones y datos personales" }
};

const weakNames = {
  "alphabet-pronunciation": {
    vowels:{ru:"Гласные",uk:"Голосні",en:"Vowels",es:"Vocales"},
    h:{ru:"Немая h",uk:"Німа h",en:"Silent h",es:"H muda"},
    "ñ":{ru:"Звук ñ",uk:"Звук ñ",en:"The ñ sound",es:"El sonido ñ"},
    "j-g":{ru:"Произношение j / g",uk:"Вимова j / g",en:"Pronunciation of j / g",es:"Pronunciación de j / g"},
    "c-z":{ru:"Произношение c / z",uk:"Вимова c / z",en:"Pronunciation of c / z",es:"Pronunciación de c / z"},
    "r-rr":{ru:"Произношение r / rr",uk:"Вимова r / rr",en:"Pronunciation of r / rr",es:"Pronunciación de r / rr"},
    stress:{ru:"Ударение",uk:"Наголос",en:"Stress",es:"Acentuación"}
  },
  "greetings-farewells": {
    greeting:{ru:"Приветствия",uk:"Привітання",en:"Greetings",es:"Saludos"},
    daypart:{ru:"Приветствия по времени суток",uk:"Привітання за часом доби",en:"Greetings by time of day",es:"Saludos según la hora"},
    "how-are-you":{ru:"¿Qué tal? / ¿Cómo estás?",uk:"¿Qué tal? / ¿Cómo estás?",en:"¿Qué tal? / ¿Cómo estás?",es:"¿Qué tal? / ¿Cómo estás?"},
    farewell:{ru:"Прощания",uk:"Прощання",en:"Farewells",es:"Despedidas"},
    register:{ru:"tú / usted",uk:"tú / usted",en:"tú / usted",es:"tú / usted"}
  }
};

function normalizeProgress(data) {
  data = data || {};
  data.correct = Number(data.correct) || 0;
  data.mistakes = Number(data.mistakes) || 0;
  data.weak = data.weak || {};
  data.tests = Array.isArray(data.tests) ? data.tests : [];
  data.grammar = data.grammar || {};
  data.lessons = data.lessons || {};
  data.reviewQueue = data.reviewQueue || {};

  Object.entries(data.lessons).forEach(([level, lessons]) => {
    Object.entries(lessons || {}).forEach(([lessonId, lesson]) => {
      Object.entries(lesson.weakSpots || {}).forEach(([tag, count]) => {
        if (Number(count) <= 0) return;
        const key = `${level}:${lessonId}:${tag}`;
        if (!data.reviewQueue[key]) data.reviewQueue[key] = { key, level, lessonId, tag, mistakes:Number(count), active:true };
      });
    });
  });
  return data;
}

function getProgressData() {
  try { return normalizeProgress(JSON.parse(localStorage.getItem(ESPROFE_PROGRESS_KEY))); }
  catch (_) { return normalizeProgress({}); }
}

function saveProgressData(data) {
  localStorage.setItem(ESPROFE_PROGRESS_KEY, JSON.stringify(normalizeProgress(data)));
  document.dispatchEvent(new CustomEvent("esprofe:progressChanged"));
}

function progressRecordAnswer(verb, person, isCorrect) {
  const data = getProgressData();
  const key = `${verb.id ?? verb.infinitive}:${person}`;
  if (isCorrect) {
    data.correct++;
    if (data.weak[key]) {
      data.weak[key].mistakes = Math.max(0, (data.weak[key].mistakes || 1) - 1);
      if (!data.weak[key].mistakes) delete data.weak[key];
    }
  } else {
    data.mistakes++;
    if (!data.weak[key]) data.weak[key] = { verb:verb.infinitive, person, mistakes:0 };
    data.weak[key].mistakes++;
  }
  saveProgressData(data);
  renderProgress();
}

function progressRecordTest(percent) {
  const data = getProgressData();
  data.tests.push({ percent:Number(percent)||0, date:new Date().toISOString() });
  if (data.tests.length > 20) data.tests.shift();
  saveProgressData(data);
  renderProgress();
}

function progressRecordGrammar(id, percent, personResults) {
  const data = getProgressData();
  data.grammar[id] = { percent:Number(percent)||0, date:new Date().toISOString(), persons:personResults || [] };
  saveProgressData(data);
  renderProgress();
}

function hasActiveLessonWeakSpots(level, lessonId, data=getProgressData()) {
  return Object.values(data.reviewQueue || {}).some(item => item.active !== false && item.level === level && item.lessonId === lessonId && Number(item.mistakes) > 0);
}

function isLessonPassed(level, id, data=getProgressData()) {
  return Number(data.lessons?.[level]?.[id]?.percent || 0) >= ESPROFE_LESSON_PASS_PERCENT;
}

function isLessonCleared(level, id, data=getProgressData()) {
  return isLessonPassed(level, id, data) && !hasActiveLessonWeakSpots(level, id, data);
}

function progressRecordLesson(level, id, result) {
  const data = getProgressData();
  data.lessons[level] = data.lessons[level] || {};
  const percent = Number(result.percent) || 0;
  const weakSpots = result.weakSpots || {};

  const prefix = `${level}:${id}:`;
  Object.keys(data.reviewQueue).filter(k => k.startsWith(prefix)).forEach(k => delete data.reviewQueue[k]);
  Object.entries(weakSpots).forEach(([tag,count]) => {
    if (Number(count) <= 0) return;
    const key = `${level}:${id}:${tag}`;
    data.reviewQueue[key] = { key, level, lessonId:id, tag, mistakes:Number(count), active:true };
  });

  const passed = percent >= ESPROFE_LESSON_PASS_PERCENT;
  const cleared = passed && !hasActiveLessonWeakSpots(level, id, data);
  data.lessons[level][id] = { ...(data.lessons[level][id] || {}), ...result, id, level, percent, passed, cleared, date:new Date().toISOString() };

  saveProgressData(data);
  if (cleared && window.markStudentLessonComplete) window.markStudentLessonComplete(id, result.nextLessonId);
  renderProgress();
}

function progressResolveWeakSpot(level, lessonId, tag) {
  const data = getProgressData();
  delete data.reviewQueue[`${level}:${lessonId}:${tag}`];
  if (data.lessons?.[level]?.[lessonId]?.weakSpots) delete data.lessons[level][lessonId].weakSpots[tag];
  const lesson = data.lessons?.[level]?.[lessonId];
  if (lesson) lesson.cleared = Number(lesson.percent || 0) >= ESPROFE_LESSON_PASS_PERCENT && !hasActiveLessonWeakSpots(level, lessonId, data);
  saveProgressData(data);
  if (lesson?.cleared && window.markStudentLessonComplete) window.markStudentLessonComplete(lessonId, lesson.nextLessonId);
  renderProgress();
}

function isLessonUnlocked(level, id, data=getProgressData()) {
  if (level !== "A1") return true;
  const i = A1_LESSON_ORDER.indexOf(id);
  if (i <= 0) return true;
  return isLessonCleared(level, A1_LESSON_ORDER[i-1], data);
}

function getNextLearningStep(data=getProgressData()) {
  const activeReview = Object.values(data.reviewQueue || {})
    .filter(item => item.active !== false && item.level === "A1" && Number(item.mistakes) > 0)
    .sort((a,b) => A1_LESSON_ORDER.indexOf(a.lessonId) - A1_LESSON_ORDER.indexOf(b.lessonId))[0];
  if (activeReview) return { type:"review", topic:"a1", subtopic:activeReview.lessonId, tag:activeReview.tag };

  for (const id of A1_LESSON_ORDER) {
    if (!isLessonUnlocked("A1", id, data)) break;
    if (!isLessonCleared("A1", id, data)) return { type:"study", topic:"a1", subtopic:id };
  }
  return { type:"next", topic:"a1", subtopic:"route" };
}

function renderProgress() {
  const panel = document.getElementById("progressPanel");
  if (!panel) return;
  const code = document.getElementById("language")?.value || "ru";
  const t = progressLabels[code] || progressLabels.ru;
  const data = getProgressData();
  const built = A1_LESSON_ORDER.slice(0,2);
  const cleared = built.filter(id => isLessonCleared("A1", id, data)).length;
  const results = built.map(id => Number(data.lessons?.A1?.[id]?.percent || 0)).filter(v => v > 0);
  const latest = results.length ? results[results.length - 1] : 0;
  const reviews = Object.values(data.reviewQueue).filter(x => x.active !== false && x.level === "A1" && Number(x.mistakes) > 0);
  const step = getNextLearningStep(data);

  const reviewHtml = reviews.length ? reviews.map(w => {
    const lesson = lessonNames[w.lessonId]?.[code] || lessonNames[w.lessonId]?.ru || w.lessonId;
    const name = weakNames[w.lessonId]?.[w.tag]?.[code] || weakNames[w.lessonId]?.[w.tag]?.ru || w.tag;
    return `<button type="button" class="progress-review-card" data-review-level="${w.level}" data-review-lesson="${w.lessonId}" data-review-tag="${w.tag}"><span><small>${t.lesson}: ${lesson}</small><strong>${name}</strong><em>${w.mistakes}</em></span><b>${t.reviewNow} →</b></button>`;
  }).join("") : `<span class="progress-empty">${t.noWeak}</span>`;

  const nextName = lessonNames[step.subtopic]?.[code] || lessonNames[step.subtopic]?.ru || "A1";
  const actionLabel = step.type === "review" ? t.reviewNow : t.continue;
  panel.innerHTML = `<div class="progress-top"><div class="progress-title">📊 ${t.title}</div><strong>${latest}%</strong></div><div class="progress-bar"><span style="width:${latest}%"></span></div><div class="progress-stats"><span>🎓 ${t.course}: ${latest}%</span><span>✅ ${t.passed}: ${cleared}/${built.length}</span><span>🔴 ${t.weak}: ${reviews.length}</span></div><div class="progress-review-now"><strong>🔁 ${t.review}</strong>${reviewHtml}</div><div class="progress-route"><div><strong>${t.recommendation}</strong><br><span>${nextName}</span></div><button type="button" id="progressNextAction">${actionLabel} →</button></div>`;

  document.getElementById("progressNextAction")?.addEventListener("click", () => document.dispatchEvent(new CustomEvent("esprofe:progressAction", { detail:step })));
  panel.querySelectorAll("[data-review-lesson]").forEach(btn => btn.addEventListener("click", () => document.dispatchEvent(new CustomEvent("esprofe:reviewWeakSpot", { detail:{ level:btn.dataset.reviewLevel, lessonId:btn.dataset.reviewLesson, tag:btn.dataset.reviewTag } }))));
}

window.ESPROFE_LESSON_PASS_PERCENT = ESPROFE_LESSON_PASS_PERCENT;
window.A1_LESSON_ORDER = A1_LESSON_ORDER;
window.getProgressData = getProgressData;
window.getNextLearningStep = getNextLearningStep;
window.renderProgress = renderProgress;
window.progressRecordAnswer = progressRecordAnswer;
window.progressRecordTest = progressRecordTest;
window.progressRecordGrammar = progressRecordGrammar;
window.progressRecordLesson = progressRecordLesson;
window.progressResolveWeakSpot = progressResolveWeakSpot;
window.isLessonPassed = isLessonPassed;
window.isLessonCleared = isLessonCleared;
window.isLessonUnlocked = isLessonUnlocked;
window.hasActiveLessonWeakSpots = hasActiveLessonWeakSpots;

document.addEventListener("DOMContentLoaded", renderProgress);
document.addEventListener("esprofe:languageChanged", renderProgress);
document.addEventListener("esprofe:progressChanged", renderProgress);
