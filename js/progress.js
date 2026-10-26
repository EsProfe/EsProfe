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
const A1_ROUTE_POINTS = [[92,87],[112,102],[117,126],[126,87],[132,119],[174,75],[183,72],[218,79],[256,86],[279,87],[255,103],[291,110],[263,120],[198,120],[228,126],[203,145],[178,151],[181,170],[220,164],[206,180],[239,194],[227,215],[257,190],[279,213],[261,145],[299,151],[315,133],[310,190],[354,157],[403,134],[384,164],[366,181],[378,203],[369,224],[363,251],[344,269],[300,245],[251,245],[235,277],[266,276],[290,299],[329,303],[267,321],[201,332],[213,304],[188,309],[163,244],[172,218],[161,232],[180,196],[246,188],[236,202],[243,215],[266,242],[327,224],[345,237],[356,232],[371,241],[362,262],[350,278],[326,280],[337,290],[300,313],[255,313],[215,326],[210,321],[231,294],[253,303],[273,266],[276,270],[268,275],[322,309],[341,285],[363,271],[369,252],[373,246],[373,215],[377,194],[363,176],[373,178],[381,171]];

const A1_ROUTE_LANDMARKS=[{index:1,city:"Santiago",x:112,y:102,labelX:112,labelY:88},{index:5,city:"Oviedo",x:174,y:75,labelX:174,labelY:60},{index:8,city:"Bilbao",x:256,y:86,labelX:256,labelY:71},{index:17,city:"Salamanca",x:181,y:170,labelX:172,labelY:156},{index:20,city:"Madrid",x:239,y:194,labelX:239,labelY:180},{index:30,city:"Barcelona",x:384,y:164,labelX:396,labelY:150},{index:33,city:"Valencia",x:369,y:224,labelX:384,labelY:216},{index:40,city:"Granada",x:290,y:299,labelX:304,labelY:313},{index:42,city:"Málaga",x:267,y:321,labelX:252,labelY:337},{index:44,city:"Sevilla",x:213,y:304,labelX:203,labelY:320},{index:48,city:"Mérida",x:161,y:232,labelX:148,labelY:244}];
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

function renderA1Journey(data,code,labels,currentId){const cities=A1_LESSON_ORDER.map((_,i)=>A1_ROUTE_CITIES[i]||`A1 · ${i+1}`),currentIndex=Math.max(0,A1_LESSON_ORDER.indexOf(currentId)),currentCity=cities[currentIndex],fullRoute=A1_ROUTE_LANDMARKS.map(p=>`${p.x},${p.y}`).join(" "),reachedRoute=A1_ROUTE_LANDMARKS.filter(p=>p.index<=currentIndex).map(p=>`${p.x},${p.y}`).join(" "),stops=A1_ROUTE_LANDMARKS.map(p=>{const id=A1_LESSON_ORDER[p.index],state=journeyStopState(id,p.index,data,currentId),lesson=localizedLessonName(id,code),action=state!=="locked"?`data-journey-lesson="${id}" tabindex="0" role="button"`:"";return `<g class="a1-map-stop is-${state}" ${action} aria-label="${p.city} · ${lesson} · ${labels[`${state}Stop`]}"><title>${p.city} · ${lesson}</title><circle class="a1-map-stop-halo" cx="${p.x}" cy="${p.y}" r="10"></circle><circle class="a1-map-stop-core" cx="${p.x}" cy="${p.y}" r="${state==="current"?7.2:5.4}"></circle><text class="a1-map-city" x="${p.labelX}" y="${p.labelY}" text-anchor="middle">${p.city}</text><text class="a1-map-number" x="${p.x}" y="${p.y+2.4}" text-anchor="middle">${p.index+1}</text></g>`}).join("");return `<section class="a1-journey a1-journey--illustrated" aria-label="${labels.journey}"><div class="a1-journey-head"><div><strong>🧭 ${labels.journey}</strong><small>${labels.journeyHint}</small></div><span>🇪🇸 A1 · ${A1_LESSON_ORDER.length}</span></div><div class="a1-map-focus"><span>📍</span><div><small>${labels.currentStop}</small><strong>${currentCity}</strong></div><b>${currentIndex+1} / ${A1_LESSON_ORDER.length}</b></div><svg class="a1-spain-map a1-spain-map--journey" viewBox="0 0 480 360" role="img" aria-label="${labels.journey}"><defs><linearGradient id="a1Sea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d9f2ff"/><stop offset=".55" stop-color="#effaff"/><stop offset="1" stop-color="#cfe9f6"/></linearGradient><linearGradient id="a1Land" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf2"/><stop offset="1" stop-color="#f7edcf"/></linearGradient></defs><rect width="480" height="360" rx="20" fill="url(#a1Sea)"></rect><circle class="a1-map-sun" cx="412" cy="55" r="19"></circle><path class="a1-map-cloud" d="M54 56c8-17 30-12 33 0 18-8 30 13 17 22H47c-13-8-5-22 7-22z"></path><path class="a1-spain-land" d="M71 90 L116 67 L177 62 L233 74 L287 64 L348 92 L418 124 L423 176 L397 207 L383 245 L352 278 L335 316 L292 335 L239 340 L199 331 L166 309 L143 273 L128 229 L103 190 L77 148 Z"></path><path class="a1-map-hills" d="M118 170l28-28 26 25 34-42 38 40 43-29 42 34 30-19v68H118z"></path><path class="a1-map-hills a1-map-hills--far" d="M140 195l26-23 24 17 29-27 32 25 38-20 42 31 21-14v60H140z"></path><path class="a1-map-coast" d="M352 278l-17 38-43 19-53 5"></path><path class="a1-island" d="M422 262l15-3 13 8-9 8-16-2z"></path><path class="a1-island a1-canary" d="M86 330l12-3 10 6-8 7-14-2z"></path><text class="a1-map-water-label" x="77" y="233">ATLÁNTICO</text><text class="a1-map-water-label" x="390" y="286">MEDITERRÁNEO</text><polyline class="a1-spain-route a1-spain-route--future" points="${fullRoute}"></polyline><polyline class="a1-spain-route a1-spain-route--done" points="${reachedRoute}"></polyline>${stops}</svg><div class="a1-journey-legend"><span class="is-done">● ${labels.completedStop}</span><span class="is-current">● ${labels.currentStop}</span><span class="is-review">● ${labels.reviewStop}</span><span class="is-locked">● ${labels.lockedStop}</span></div></section>`}

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
