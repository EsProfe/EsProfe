"use strict";

/* Reusable B1 lesson flow: explanation -> practice -> trainer -> assessment -> result -> review. */
(function () {
  const DATA_URL = "data/b1-lessons.json";
  let current = null;
  let practiceIndex = 0;
  let assessmentIndex = 0;
  let practiceScore = 0;
  let assessmentScore = 0;

  const root = () => document.getElementById("grammarSection");
  const esc = value => String(value ?? "").replace(/[&<>\"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch]));

  function renderLesson(lesson) {
    const el = root();
    if (!el) return;
    current = lesson;
    practiceIndex = 0;
    assessmentIndex = 0;
    practiceScore = 0;
    assessmentScore = 0;
    el.innerHTML = `
      <div class="b1-lesson">
        <button type="button" class="b1-lesson-back" id="b1LessonBack">← B1</button>
        <div class="b1-lesson-kicker">B1 · Урок</div>
        <h2>${esc(lesson.title)}</h2>
        <div class="b1-stepper"><span class="active">1. Правило</span><span>2. Практика</span><span>3. Тренажёр</span><span>4. Контроль</span><span>5. Результат</span></div>
        <section class="b1-lesson-card"><h3>${esc(lesson.explanation.title)}</h3><p>${esc(lesson.explanation.text)}</p><div class="b1-examples">${lesson.explanation.examples.map(x => `<div>${esc(x)}</div>`).join("")}</div><button class="grammar-primary" id="startB1Practice">Начать практику</button></section>
        <section class="b1-lesson-card" id="b1Practice" style="display:none"></section>
        <section class="b1-lesson-card" id="b1Assessment" style="display:none"></section>
      </div>`;
    document.getElementById("b1LessonBack")?.addEventListener("click", () => window.openB1Curriculum?.());
    document.getElementById("startB1Practice")?.addEventListener("click", showPractice);
  }

  function showPractice() {
    const card = document.getElementById("b1Practice");
    if (!card) return;
    const item = current.practice[practiceIndex];
    card.style.display = "block";
    card.innerHTML = `<div class="b1-card-kicker">Практика ${practiceIndex + 1} / ${current.practice.length}</div><h3>${esc(item.prompt)}</h3><input id="b1PracticeAnswer" class="b1-answer" autocomplete="off"><button id="b1PracticeCheck" class="grammar-primary">Проверить</button><p id="b1PracticeResult"></p>`;
    const input = document.getElementById("b1PracticeAnswer");
    const check = () => {
      const value = input.value.trim().toLowerCase();
      const ok = value === item.answer.toLowerCase();
      document.getElementById("b1PracticeResult").textContent = ok ? "✅ Correcto" : `❌ Правильный ответ: ${item.answer}`;
      if (ok) practiceScore++;
      setTimeout(() => {
        practiceIndex++;
        if (practiceIndex < current.practice.length) showPractice(); else showAssessment();
      }, 500);
    };
    document.getElementById("b1PracticeCheck")?.addEventListener("click", check);
    input?.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
    input?.focus();
  }

  function showAssessment() {
    const card = document.getElementById("b1Assessment");
    if (!card) return;
    const item = current.assessment[assessmentIndex];
    card.style.display = "block";
    card.innerHTML = `<div class="b1-card-kicker">Контроль ${assessmentIndex + 1} / ${current.assessment.length}</div><h3>${esc(item.prompt)}</h3><input id="b1AssessmentAnswer" class="b1-answer" autocomplete="off"><button id="b1AssessmentCheck" class="grammar-primary">Проверить</button><p id="b1AssessmentResult"></p>`;
    const input = document.getElementById("b1AssessmentAnswer");
    const check = () => {
      const value = input.value.trim().toLowerCase();
      const ok = value === item.answer.toLowerCase();
      document.getElementById("b1AssessmentResult").textContent = ok ? "✅ Correcto" : `❌ Правильный ответ: ${item.answer}`;
      if (ok) assessmentScore++;
      setTimeout(() => {
        assessmentIndex++;
        if (assessmentIndex < current.assessment.length) showAssessment(); else showResult();
      }, 500);
    };
    document.getElementById("b1AssessmentCheck")?.addEventListener("click", check);
    input?.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
    input?.focus();
  }

  function showResult() {
    const card = document.getElementById("b1Assessment");
    const percent = Math.round(assessmentScore / current.assessment.length * 100);
    const repeat = percent < 80;
    card.innerHTML = `<div class="b1-result"><div class="b1-result-score">${percent}%</div><h3>${repeat ? "Рекомендуем повторить тему" : "Тема усвоена"}</h3><p>Контроль: ${assessmentScore} / ${current.assessment.length}. Практика: ${practiceScore} / ${current.practice.length}.</p><p>${repeat ? "Обрати внимание на ошибки и пройди тему ещё раз." : "Можно переходить к следующей теме."}</p><button class="grammar-primary" id="b1ResultBack">Вернуться к маршруту B1</button></div>`;
    document.getElementById("b1ResultBack")?.addEventListener("click", () => window.openB1Curriculum?.());
  }

  async function openLesson(topicId) {
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("B1 lesson data failed");
      const data = await response.json();
      if (!data[topicId]) return;
      renderLesson(data[topicId]);
    } catch (error) { console.error(error); }
  }

  document.addEventListener("esprofe:b1Topic", event => openLesson(event.detail?.topicId));
  window.openB1Lesson = openLesson;
})();
