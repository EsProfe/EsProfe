"use strict";

const ESPROFE_PROGRESS_KEY = "esprofe_progress_v1";
const ESPROFE_LESSON_PASS_PERCENT = 80;
const A1_LESSON_ORDER = [];

let catalogLessonNames = {};

function progressStorageKey() {
  const accountId = window.EsProfeStudentAccount?.user?.id;
  return accountId ? `${ESPROFE_PROGRESS_KEY}:${accountId}` : ESPROFE_PROGRESS_KEY;
}

function setA1LessonCatalog(catalog) {
  const ready = Object.entries(catalog?.lessons || {}).filter(([,meta]) => meta.status === "ready");
  if (!ready.length) return;
  A1_LESSON_ORDER.splice(0, A1_LESSON_ORDER.length, ...ready.map(([id]) => id));
  catalogLessonNames = Object.fromEntries(ready);
  if (document.readyState !== "loading") renderProgress();
}

function localizedLessonName(id, code) {
  return catalogLessonNames[id]?.[code]?.[0]
    || catalogLessonNames[id]?.ru?.[0]
    || id;
}

const progressLabels = {
  ru: { title:"Мой прогресс", course:"Прогресс A1", passed:"Пройдено уроков", weak:"Слабые места", review:"Повторить", noWeak:"Слабых мест нет", recommendation:"Рекомендация", continue:"Продолжить обучение", reviewNow:"Повторить сейчас", lesson:"Урок", journey:"Мой маршрут по Испании", journeyHint:"Каждая остановка — один урок A1", currentStop:"Сейчас", completedStop:"Пройдено", reviewStop:"Нужно повторить", openStop:"Следующий урок", lockedStop:"Откроется позже" },
  uk: { title:"Мій прогрес", course:"Прогрес A1", passed:"Пройдено уроків", weak:"Слабкі місця", review:"Повторити", noWeak:"Слабких місць немає", recommendation:"Рекомендація", continue:"Продовжити навчання", reviewNow:"Повторити зараз", lesson:"Урок", journey:"Мій маршрут Іспанією", journeyHint:"Кожна зупинка — один урок A1", currentStop:"Зараз", completedStop:"Пройдено", reviewStop:"Потрібно повторити", openStop:"Наступний урок", lockedStop:"Відкриється пізніше" },
  en: { title:"My progress", course:"A1 progress", passed:"Lessons completed", weak:"Weak spots", review:"Review", noWeak:"No weak spots", recommendation:"Recommendation", continue:"Continue learning", reviewNow:"Review now", lesson:"Lesson", journey:"My route across Spain", journeyHint:"Each stop is one A1 lesson", currentStop:"Now", completedStop:"Completed", reviewStop:"Review needed", openStop:"Next lesson", lockedStop:"Opens later" },
  es: { title:"Mi progreso", course:"Progreso A1", passed:"Lecciones superadas", weak:"Puntos débiles", review:"Repasar", noWeak:"No hay puntos débiles", recommendation:"Recomendación", continue:"Continuar aprendiendo", reviewNow:"Repasar ahora", lesson:"Lección", journey:"Mi ruta por España", journeyHint:"Cada parada es una lección de A1", currentStop:"Ahora", completedStop:"Completado", reviewStop:"Necesita repaso", openStop:"Siguiente lección", lockedStop:"Se abrirá más adelante" }
};

const A1_ROUTE_CITIES = ["A Coruña","Santiago","Vigo","Lugo","Ourense","Oviedo","Gijón","Santander","Bilbao","San Sebastián","Vitoria","Pamplona","Logroño","León","Burgos","Valladolid","Zamora","Salamanca","Segovia","Ávila","Madrid","Toledo","Guadalajara","Cuenca","Soria","Zaragoza","Huesca","Teruel","Lleida","Girona","Barcelona","Tarragona","Castellón","Valencia","Alicante","Murcia","Albacete","Ciudad Real","Córdoba","Jaén","Granada","Almería","Málaga","Cádiz","Sevilla","Huelva","Badajoz","Cáceres","Mérida","Plasencia","Alcalá de Henares","Getafe","Aranjuez","Alcázar de San Juan","Requena","Xàtiva","Gandia","Dénia","Elche","Cartagena","Lorca","Vera","Motril","Ronda","Jerez","Sanlúcar de Barrameda","Écija","Antequera","Úbeda","Baeza","Linares","Adra","Águilas","Torrevieja","Benidorm","Altea","Sagunto","Peñíscola","Tortosa","Reus","Sitges"];

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
  },
  "introductions-personal-data": {
    name:{ru:"Имя: Me llamo / Soy",uk:"Ім'я: Me llamo / Soy",en:"Name: Me llamo / Soy",es:"Nombre: Me llamo / Soy"},
    origin:{ru:"Происхождение: Soy de",uk:"Походження: Soy de",en:"Origin: Soy de",es:"Origen: Soy de"},
    residence:{ru:"Место жительства: Vivo en",uk:"Місце проживання: Vivo en",en:"Residence: Vivo en",es:"Residencia: Vivo en"},
    language:{ru:"Языки: Hablo",uk:"Мови: Hablo",en:"Languages: Hablo",es:"Idiomas: Hablo"},
    register:{ru:"tú / usted",uk:"tú / usted",en:"tú / usted",es:"tú / usted"}
  }
};

function normalizeProgress(data) {
  data = data || {};
  data.updatedAt = typeof data.updatedAt === "string" ? data.updatedAt : null;
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
  try { return normalizeProgress(JSON.parse(localStorage.getItem(progressStorageKey()))); }
  catch (_) { return normalizeProgress({}); }
}

function saveProgressData(data) {
  const normalized = normalizeProgress(data);
  normalized.updatedAt = new Date().toISOString();
  localStorage.setItem(progressStorageKey(), JSON.stringify(normalized));
  document.dispatchEvent(new CustomEvent("esprofe:progressChanged"));
}

function replaceProgressData(data) {
  localStorage.setItem(progressStorageKey(), JSON.stringify(normalizeProgress(data)));
  document.dispatchEvent(new CustomEvent("esprofe:progressChanged"));
  renderProgress();
}

function getLegacyProgressData() {
  try { return normalizeProgress(JSON.parse(localStorage.getItem(ESPROFE_PROGRESS_KEY))); }
  catch (_) { return normalizeProgress({}); }
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
  const previous = data.lessons[level][id];
  const attempts = Array.isArray(previous?.attempts) ? [...previous.attempts] : previous ? [{ ...previous }] : [];
  const attempt = { ...result, weakSpots:{ ...weakSpots }, percent, date:new Date().toISOString() };
  attempts.push(attempt);
  data.lessons[level][id] = { ...previous, ...attempt, id, level, passed, cleared, attempts };

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
  if (i < 0) return false;
  if (i === 0) return true;
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

function journeyStopState(id, index, data, currentId) {
  if (hasActiveLessonWeakSpots("A1", id, data)) return "review";
  if (isLessonCleared("A1", id, data)) return "done";
  if (id === currentId) return "current";
  if (isLessonUnlocked("A1", id, data)) return "open";
  return "locked";
}

function renderA1Journey(data, code, labels, currentId) {
  const cities = A1_LESSON_ORDER.map((_, index) => A1_ROUTE_CITIES[index] || `A1 · ${index + 1}`);
  const stops = A1_LESSON_ORDER.map((id, index) => {
    const state = journeyStopState(id, index, data, currentId);
    const stateLabel = labels[`${state}Stop`];
    const city = cities[index];
    const lesson = localizedLessonName(id, code);
    const row = Math.floor(index / 9) + 1;
    const column = row % 2 ? index % 9 + 1 : 9 - index % 9;
    const disabled = state === "locked";
    return `<button type="button" class="a1-journey-stop is-${state}" data-journey-lesson="${id}" style="grid-column:${column};grid-row:${row}" title="${city} · ${lesson} · ${stateLabel}" ${disabled ? "disabled" : ""}><i>${index + 1}</i><span>${city}</span></button>`;
  }).join("");
  const currentIndex = Math.max(0, A1_LESSON_ORDER.indexOf(currentId));
  const mobileStops = A1_LESSON_ORDER.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((id, localIndex) => {
    const index = Math.max(0, currentIndex - 2) + localIndex;
    const state = journeyStopState(id, index, data, currentId);
    const city = cities[index];
    const lesson = localizedLessonName(id, code);
    return `<button type="button" class="a1-journey-mobile-stop is-${state}" data-journey-lesson="${id}" ${state === "locked" ? "disabled" : ""}><i>${index + 1}</i><span><strong>${city}</strong><small>${state === "current" ? labels.currentStop : state === "done" ? labels.completedStop : state === "review" ? labels.reviewStop : state === "open" ? labels.openStop : labels.lockedStop}</small></span></button>`;
  }).join("");
  return `<section class="a1-journey" aria-label="${labels.journey}"><div class="a1-journey-head"><div><strong>🧭 ${labels.journey}</strong><small>${labels.journeyHint}</small></div><span>🇪🇸 A1 · ${A1_LESSON_ORDER.length}</span></div><div class="a1-journey-map">${stops}</div><div class="a1-journey-mobile">${mobileStops}</div><div class="a1-journey-legend"><span class="is-done">● ${labels.completedStop}</span><span class="is-current">● ${labels.currentStop}</span><span class="is-review">● ${labels.reviewStop}</span><span class="is-locked">● ${labels.lockedStop}</span></div></section>`;
}

function renderProgress() {
  const panel = document.getElementById("progressPanel");
  if (!panel) return;
  const code = document.getElementById("language")?.value || "ru";
  const t = progressLabels[code] || progressLabels.ru;
  const data = getProgressData();
  const built = A1_LESSON_ORDER;
  const cleared = built.filter(id => isLessonCleared("A1", id, data)).length;
  const results = built.map(id => Number(data.lessons?.A1?.[id]?.percent || 0)).filter(v => v > 0);
  const latest = results.length ? results[results.length - 1] : 0;
  const reviews = Object.values(data.reviewQueue).filter(x => x.active !== false && x.level === "A1" && Number(x.mistakes) > 0);
  const step = getNextLearningStep(data);

  const reviewHtml = reviews.length ? reviews.map(w => {
    const lesson = localizedLessonName(w.lessonId, code);
    const name = weakNames[w.lessonId]?.[w.tag]?.[code] || weakNames[w.lessonId]?.[w.tag]?.ru || w.tag;
    return `<button type="button" class="progress-review-card" data-review-level="${w.level}" data-review-lesson="${w.lessonId}" data-review-tag="${w.tag}"><span><small>${t.lesson}: ${lesson}</small><strong>${name}</strong><em>${w.mistakes}</em></span><b>${t.reviewNow} →</b></button>`;
  }).join("") : `<span class="progress-empty">${t.noWeak}</span>`;

  const nextName = step.subtopic === "route" ? "A1" : localizedLessonName(step.subtopic, code);
  const actionLabel = step.type === "review" ? t.reviewNow : t.continue;
  const journey = built.length ? renderA1Journey(data, code, t, step.subtopic === "route" ? built[built.length - 1] : step.subtopic) : "";
  panel.innerHTML = `<div class="progress-top"><div class="progress-title">📊 ${t.title}</div><strong>${latest}%</strong></div><div class="progress-bar"><span style="width:${latest}%"></span></div><div class="progress-stats"><span>🎓 ${t.course}: ${latest}%</span><span>✅ ${t.passed}: ${cleared}/${built.length}</span><span>🔴 ${t.weak}: ${reviews.length}</span></div>${journey}<div class="progress-review-now"><strong>🔁 ${t.review}</strong>${reviewHtml}</div><div class="progress-route"><div><strong>${t.recommendation}</strong><br><span>${nextName}</span></div><button type="button" id="progressNextAction">${actionLabel} →</button></div>`;

  document.getElementById("progressNextAction")?.addEventListener("click", () => document.dispatchEvent(new CustomEvent("esprofe:progressAction", { detail:step })));
  panel.querySelectorAll("[data-review-lesson]").forEach(btn => btn.addEventListener("click", () => document.dispatchEvent(new CustomEvent("esprofe:reviewWeakSpot", { detail:{ level:btn.dataset.reviewLevel, lessonId:btn.dataset.reviewLesson, tag:btn.dataset.reviewTag } }))));
  panel.querySelectorAll("[data-journey-lesson]:not(:disabled)").forEach(btn => btn.addEventListener("click", () => document.dispatchEvent(new CustomEvent("esprofe:progressAction", { detail:{ topic:"a1", subtopic:btn.dataset.journeyLesson } }))));
}

window.ESPROFE_LESSON_PASS_PERCENT = ESPROFE_LESSON_PASS_PERCENT;
window.A1_LESSON_ORDER = A1_LESSON_ORDER;
window.setA1LessonCatalog = setA1LessonCatalog;
window.getProgressData = getProgressData;
window.getLegacyProgressData = getLegacyProgressData;
window.replaceProgressData = replaceProgressData;
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
document.addEventListener("esprofe:accountChanged", renderProgress);
