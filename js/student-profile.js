"use strict";

const ESPROFE_STUDENT_KEY = "esprofe_student_v1";

const studentLabels = {
  ru:{profile:"Личный кабинет",name:"Ученик",level:"Уровень",current:"Сейчас",continue:"Открыть урок",edit:"Изменить имя",save:"Сохранить",placeholder:"Введите имя",localNote:"Прогресс пока хранится на этом устройстве.",cloudSynced:"✓ Синхронизировано с вашим аккаунтом.",cloudSaving:"Сохраняем прогресс…",cloudWaiting:"Сохранено на устройстве; ждёт синхронизации.",alphabet:"A1 · Алфавит и произношение",greetings:"A1 · Приветствия и прощания",intro:"A1 · Знакомство и личные данные",route:"Маршрут курса A1"},
  uk:{profile:"Особистий кабінет",name:"Учень",level:"Рівень",current:"Зараз",continue:"Відкрити урок",edit:"Змінити ім’я",save:"Зберегти",placeholder:"Введіть ім’я",localNote:"Прогрес поки зберігається на цьому пристрої.",cloudSynced:"✓ Синхронізовано з вашим акаунтом.",cloudSaving:"Зберігаємо прогрес…",cloudWaiting:"Збережено на пристрої; очікує синхронізації.",alphabet:"A1 · Алфавіт і вимова",greetings:"A1 · Привітання і прощання",intro:"A1 · Знайомство та особисті дані",route:"Маршрут курсу A1"},
  en:{profile:"Student profile",name:"Student",level:"Level",current:"Now",continue:"Open lesson",edit:"Edit name",save:"Save",placeholder:"Enter name",localNote:"Progress is currently stored on this device.",cloudSynced:"✓ Synced with your account.",cloudSaving:"Saving progress…",cloudWaiting:"Saved on this device; waiting to sync.",alphabet:"A1 · Alphabet and pronunciation",greetings:"A1 · Greetings and farewells",intro:"A1 · Introductions and personal information",route:"A1 course route"},
  es:{profile:"Área personal",name:"Estudiante",level:"Nivel",current:"Ahora",continue:"Abrir la lección",edit:"Cambiar nombre",save:"Guardar",placeholder:"Escribe tu nombre",localNote:"Por ahora, el progreso se guarda en este dispositivo.",cloudSynced:"✓ Sincronizado con tu cuenta.",cloudSaving:"Guardando el progreso…",cloudWaiting:"Guardado en este dispositivo; pendiente de sincronización.",alphabet:"A1 · Alfabeto y pronunciación",greetings:"A1 · Saludos y despedidas",intro:"A1 · Presentaciones y datos personales",route:"Ruta del curso A1"}
};

function normalizeStudent(profile) {
  profile = profile || {};
  return {
    name: profile.name || "",
    level: profile.level || "A1",
    studentId: profile.studentId || null,
    currentLesson: profile.currentLesson || "alphabet-pronunciation",
    completedLessons: Array.isArray(profile.completedLessons) ? profile.completedLessons : [],
    updatedAt: typeof profile.updatedAt === "string" ? profile.updatedAt : null
  };
}

function studentStorageKey() {
  const accountId = window.EsProfeStudentAccount?.user?.id;
  return accountId ? `${ESPROFE_STUDENT_KEY}:${accountId}` : ESPROFE_STUDENT_KEY;
}

function getStudentProfile() {
  try { return normalizeStudent(JSON.parse(localStorage.getItem(studentStorageKey()))); }
  catch (_) { return normalizeStudent({}); }
}

function saveStudentProfile(profile) {
  const normalized = normalizeStudent(profile);
  normalized.updatedAt = new Date().toISOString();
  localStorage.setItem(studentStorageKey(), JSON.stringify(normalized));
  document.dispatchEvent(new CustomEvent("esprofe:studentChanged"));
}

function replaceStudentProfile(profile) {
  localStorage.setItem(studentStorageKey(), JSON.stringify(normalizeStudent(profile)));
  document.dispatchEvent(new CustomEvent("esprofe:studentChanged"));
}

function getLegacyStudentProfile() {
  try { return normalizeStudent(JSON.parse(localStorage.getItem(ESPROFE_STUDENT_KEY))); }
  catch (_) { return normalizeStudent({}); }
}

function setStudentCurrentLesson(lessonId) {
  const profile = getStudentProfile();
  profile.currentLesson = lessonId;
  saveStudentProfile(profile);
}

function markStudentLessonComplete(lessonId, nextLessonId) {
  const profile = getStudentProfile();
  profile.completedLessons = Array.from(new Set([...(profile.completedLessons || []), lessonId]));
  if (nextLessonId) profile.currentLesson = nextLessonId;
  saveStudentProfile(profile);
}

function getCurrentLessonId() {
  if (typeof window.getNextLearningStep === "function") {
    const step = window.getNextLearningStep();
    if (step?.subtopic && step.subtopic !== "route") return step.subtopic;
  }
  return getStudentProfile().currentLesson || "alphabet-pronunciation";
}

function getLessonLabel(id, labels) {
  if (id === "alphabet-pronunciation") return labels.alphabet;
  if (id === "greetings-farewells") return labels.greetings;
  if (id === "introductions-personal-data") return labels.intro;
  return labels.route;
}

function renderStudentProfile() {
  const panel = document.getElementById("studentProfile");
  if (!panel) return;

  const code = document.getElementById("language")?.value || "ru";
  const t = studentLabels[code] || studentLabels.ru;
  const profile = getStudentProfile();
  const displayName = profile.name || window.EsProfeStudentAccount?.user?.email || t.name;
  const currentId = getCurrentLessonId();
  const currentLabel = getLessonLabel(currentId, t);

  const cloud = window.EsProfeCloudSync?.status;
  const note = window.EsProfeStudentAccount?.user ? (cloud === "synced" ? t.cloudSynced : cloud === "saving" || cloud === "loading" ? t.cloudSaving : cloud === "waiting" ? t.cloudWaiting : t.localNote) : t.localNote;
  panel.innerHTML = `<div class="student-profile-head"><div><span class="student-profile-kicker">👤 ${t.profile}</span><strong>${displayName}</strong></div><span class="student-level">${t.level}: ${profile.level}</span></div><div class="student-profile-body"><div><small>${t.current}</small><strong>${currentLabel}</strong></div><button type="button" id="studentContinueBtn">${t.continue} →</button></div><details class="student-profile-settings"><summary>${t.edit}</summary><div class="student-name-form"><input id="studentNameInput" type="text" maxlength="40" placeholder="${t.placeholder}" value="${profile.name || ""}"><button type="button" id="studentNameSave">${t.save}</button></div><p>${note}</p></details>`;

  document.getElementById("studentContinueBtn")?.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("esprofe:progressAction", { detail:{ topic:"a1", subtopic:currentId } }));
  });
  document.getElementById("studentNameSave")?.addEventListener("click", () => {
    const updated = getStudentProfile();
    updated.name = (document.getElementById("studentNameInput")?.value || "").trim();
    saveStudentProfile(updated);
    renderStudentProfile();
  });
}

window.getStudentProfile = getStudentProfile;
window.getLegacyStudentProfile = getLegacyStudentProfile;
window.replaceStudentProfile = replaceStudentProfile;
window.saveStudentProfile = saveStudentProfile;
window.setStudentCurrentLesson = setStudentCurrentLesson;
window.markStudentLessonComplete = markStudentLessonComplete;
window.renderStudentProfile = renderStudentProfile;

document.addEventListener("DOMContentLoaded", renderStudentProfile);
document.addEventListener("esprofe:languageChanged", renderStudentProfile);
document.addEventListener("esprofe:studentChanged", renderStudentProfile);
document.addEventListener("esprofe:progressChanged", renderStudentProfile);
document.addEventListener("esprofe:accountChanged", renderStudentProfile);
document.addEventListener("esprofe:cloudSync", renderStudentProfile);
