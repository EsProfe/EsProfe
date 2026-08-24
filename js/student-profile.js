"use strict";

const ESPROFE_STUDENT_KEY = "esprofe_student_v1";

const studentLabels = {
  ru:{profile:"Личный кабинет",name:"Ученик",level:"Уровень",current:"Сейчас",continue:"Продолжить обучение",edit:"Изменить имя",save:"Сохранить",placeholder:"Введите имя",localNote:"Прогресс пока хранится на этом устройстве.",alphabet:"A1 · Алфавит и произношение",greetings:"A1 · Приветствия и прощания",intro:"A1 · Знакомство и личные данные",route:"Маршрут курса A1"},
  uk:{profile:"Особистий кабінет",name:"Учень",level:"Рівень",current:"Зараз",continue:"Продовжити навчання",edit:"Змінити ім’я",save:"Зберегти",placeholder:"Введіть ім’я",localNote:"Прогрес поки зберігається на цьому пристрої.",alphabet:"A1 · Алфавіт і вимова",greetings:"A1 · Привітання і прощання",intro:"A1 · Знайомство та особисті дані",route:"Маршрут курсу A1"},
  en:{profile:"Student profile",name:"Student",level:"Level",current:"Now",continue:"Continue learning",edit:"Edit name",save:"Save",placeholder:"Enter name",localNote:"Progress is currently stored on this device.",alphabet:"A1 · Alphabet and pronunciation",greetings:"A1 · Greetings and farewells",intro:"A1 · Introductions and personal information",route:"A1 course route"},
  es:{profile:"Área personal",name:"Estudiante",level:"Nivel",current:"Ahora",continue:"Continuar aprendiendo",edit:"Cambiar nombre",save:"Guardar",placeholder:"Escribe tu nombre",localNote:"Por ahora, el progreso se guarda en este dispositivo.",alphabet:"A1 · Alfabeto y pronunciación",greetings:"A1 · Saludos y despedidas",intro:"A1 · Presentaciones y datos personales",route:"Ruta del curso A1"}
};

function normalizeStudent(profile) {
  profile = profile || {};
  return {
    name: profile.name || "",
    level: profile.level || "A1",
    studentId: profile.studentId || null,
    currentLesson: profile.currentLesson || "alphabet-pronunciation",
    completedLessons: Array.isArray(profile.completedLessons) ? profile.completedLessons : []
  };
}

function getStudentProfile() {
  try { return normalizeStudent(JSON.parse(localStorage.getItem(ESPROFE_STUDENT_KEY))); }
  catch (_) { return normalizeStudent({}); }
}

function saveStudentProfile(profile) {
  localStorage.setItem(ESPROFE_STUDENT_KEY, JSON.stringify(normalizeStudent(profile)));
  document.dispatchEvent(new CustomEvent("esprofe:studentChanged"));
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
  const displayName = profile.name || t.name;
  const currentId = getCurrentLessonId();
  const currentLabel = getLessonLabel(currentId, t);

  panel.innerHTML = `<div class="student-profile-head"><div><span class="student-profile-kicker">👤 ${t.profile}</span><strong>${displayName}</strong></div><span class="student-level">${t.level}: ${profile.level}</span></div><div class="student-profile-body"><div><small>${t.current}</small><strong>${currentLabel}</strong></div><button type="button" id="studentContinueBtn">${t.continue} →</button></div><details class="student-profile-settings"><summary>${t.edit}</summary><div class="student-name-form"><input id="studentNameInput" type="text" maxlength="40" placeholder="${t.placeholder}" value="${profile.name || ""}"><button type="button" id="studentNameSave">${t.save}</button></div><p>${t.localNote}</p></details>`;

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
window.saveStudentProfile = saveStudentProfile;
window.setStudentCurrentLesson = setStudentCurrentLesson;
window.markStudentLessonComplete = markStudentLessonComplete;
window.renderStudentProfile = renderStudentProfile;

document.addEventListener("DOMContentLoaded", renderStudentProfile);
document.addEventListener("esprofe:languageChanged", renderStudentProfile);
document.addEventListener("esprofe:studentChanged", renderStudentProfile);
document.addEventListener("esprofe:progressChanged", renderStudentProfile);
