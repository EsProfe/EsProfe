"use strict";

const ESPROFE_STUDENT_KEY = "esprofe_student_v1";

const studentLabels = {
  ru: { profile:"Личный кабинет", name:"Ученик", level:"Уровень", current:"Сейчас изучаем", continue:"Продолжить", edit:"Изменить имя", save:"Сохранить", placeholder:"Введите имя", localNote:"Прогресс пока хранится на этом устройстве. Позже кабинет будет синхронизироваться между устройствами." },
  uk: { profile:"Особистий кабінет", name:"Учень", level:"Рівень", current:"Зараз вивчаємо", continue:"Продовжити", edit:"Змінити ім’я", save:"Зберегти", placeholder:"Введіть ім’я", localNote:"Прогрес поки зберігається на цьому пристрої. Пізніше кабінет буде синхронізуватися між пристроями." },
  en: { profile:"Student profile", name:"Student", level:"Level", current:"Now studying", continue:"Continue", edit:"Edit name", save:"Save", placeholder:"Enter name", localNote:"Progress is currently stored on this device. Later the profile will sync across devices." },
  es: { profile:"Área personal", name:"Estudiante", level:"Nivel", current:"Ahora estudias", continue:"Continuar", edit:"Cambiar nombre", save:"Guardar", placeholder:"Escribe tu nombre", localNote:"Por ahora, el progreso se guarda en este dispositivo. Más adelante, el perfil se sincronizará entre dispositivos." }
};

function getStudentProfile(){
  try {
    return JSON.parse(localStorage.getItem(ESPROFE_STUDENT_KEY)) || { name:"", level:"A1", currentLesson:"a1-01-alphabet", completedLessons:[] };
  } catch(_){
    return { name:"", level:"A1", currentLesson:"a1-01-alphabet", completedLessons:[] };
  }
}

function saveStudentProfile(profile){
  localStorage.setItem(ESPROFE_STUDENT_KEY, JSON.stringify(profile));
  document.dispatchEvent(new CustomEvent("esprofe:studentChanged", { detail:profile }));
}

function setStudentCurrentLesson(lessonId){
  const profile=getStudentProfile();
  profile.currentLesson=lessonId;
  saveStudentProfile(profile);
}

function markStudentLessonComplete(lessonId){
  const profile=getStudentProfile();
  profile.completedLessons=Array.from(new Set([...(profile.completedLessons||[]), lessonId]));
  saveStudentProfile(profile);
}

function getStudentLanguage(){ return document.getElementById("language")?.value || "ru"; }

function renderStudentProfile(){
  const panel=document.getElementById("studentProfile");
  if(!panel) return;
  const lang=getStudentLanguage();
  const t=studentLabels[lang]||studentLabels.ru;
  const profile=getStudentProfile();
  const displayName=profile.name || t.name;
  panel.innerHTML=`
    <div class="student-profile-head">
      <div><span class="student-profile-kicker">👤 ${t.profile}</span><strong>${displayName}</strong></div>
      <span class="student-level">${t.level} ${profile.level||"A1"}</span>
    </div>
    <div class="student-profile-body">
      <div><small>${t.current}</small><strong id="studentCurrentLessonLabel">A1 · 1. Алфавит и произношение</strong></div>
      <button type="button" id="studentContinueBtn">${t.continue} →</button>
    </div>
    <details class="student-profile-settings">
      <summary>${t.edit}</summary>
      <div class="student-name-form"><input id="studentNameInput" type="text" maxlength="40" placeholder="${t.placeholder}" value="${profile.name||""}"><button type="button" id="studentNameSave">${t.save}</button></div>
      <p>${t.localNote}</p>
    </details>`;
  document.getElementById("studentContinueBtn")?.addEventListener("click",()=>document.dispatchEvent(new CustomEvent("esprofe:openLesson",{detail:{lessonId:profile.currentLesson||"a1-01-alphabet"}})));
  document.getElementById("studentNameSave")?.addEventListener("click",()=>{
    const next=getStudentProfile();
    next.name=(document.getElementById("studentNameInput")?.value||"").trim();
    saveStudentProfile(next);
    renderStudentProfile();
  });
}

document.addEventListener("DOMContentLoaded",renderStudentProfile);
document.addEventListener("esprofe:languageChanged",renderStudentProfile);
document.addEventListener("esprofe:studentChanged",renderStudentProfile);
window.getStudentProfile=getStudentProfile;
window.saveStudentProfile=saveStudentProfile;
window.setStudentCurrentLesson=setStudentCurrentLesson;
window.markStudentLessonComplete=markStudentLessonComplete;
window.renderStudentProfile=renderStudentProfile;
