"use strict";

const stemChangingLessons = {
  e_ie: {
    title: { ru: "e → ie", uk: "e → ie", en: "e → ie", es: "e → ie" },
    description: {
      ru: "Гласная основы e меняется на ie в четырёх формах «сапожка». Nosotros и vosotros сохраняют основу.",
      uk: "Голосна основи e змінюється на ie у чотирьох формах «чобітка». Nosotros і vosotros зберігають основу.",
      en: "The stem vowel e changes to ie in the four boot forms. Nosotros and vosotros keep the original stem.",
      es: "La vocal de la raíz e cambia a ie en las cuatro formas del «zapato». Nosotros y vosotros mantienen la raíz original."
    },
    verb: "pensar",
    persons: ["yo", "tú", "él / ella / usted", "nosotros / nosotras", "vosotros / vosotras", "ellos / ellas / ustedes"],
    forms: ["pienso", "piensas", "piensa", "pensamos", "pensáis", "piensan"],
    changedVowel: "ie",
    rootVowel: "e"
  },
  o_ue: {
    title: { ru: "o → ue", uk: "o → ue", en: "o → ue", es: "o → ue" },
    description: {
      ru: "Гласная основы o меняется на ue в четырёх формах «сапожка». Nosotros и vosotros сохраняют основу.",
      uk: "Голосна основи o змінюється на ue у чотирьох формах «чобітка». Nosotros і vosotros зберігають основу.",
      en: "The stem vowel o changes to ue in the four boot forms. Nosotros and vosotros keep the original stem.",
      es: "La vocal de la raíz o cambia a ue en las cuatro formas del «zapato». Nosotros y vosotros mantienen la raíz original."
    },
    verb: "poder",
    persons: ["yo", "tú", "él / ella / usted", "nosotros / nosotras", "vosotros / vosotras", "ellos / ellas / ustedes"],
    forms: ["puedo", "puedes", "puede", "podemos", "podéis", "pueden"],
    changedVowel: "ue",
    rootVowel: "o"
  },
  e_i: {
    title: { ru: "e → i", uk: "e → i", en: "e → i", es: "e → i" },
    description: {
      ru: "Гласная основы e меняется на i в четырёх формах «сапожка». Nosotros и vosotros сохраняют основу.",
      uk: "Голосна основи e змінюється на i у чотирьох формах «чобітка». Nosotros і vosotros зберігають основу.",
      en: "The stem vowel e changes to i in the four boot forms. Nosotros and vosotros keep the original stem.",
      es: "La vocal de la raíz e cambia a i en las cuatro formas del «zapato». Nosotros y vosotros mantienen la raíz original."
    },
    verb: "pedir",
    persons: ["yo", "tú", "él / ella / usted", "nosotros / nosotras", "vosotros / vosotras", "ellos / ellas / ustedes"],
    forms: ["pido", "pides", "pide", "pedimos", "pedís", "piden"],
    changedVowel: "i",
    rootVowel: "e"
  }
};

const stemT = {
  ru: {
    title: "Отклоняющиеся глаголы",
    intro: "Изучаем изменение основы: сначала правило, затем тренировка и контроль.",
    rule: "В настоящем времени у некоторых глаголов меняется гласная в основе. Изменение происходит в четырёх формах «сапожка»: yo, tú, él/ella/usted и ellos/ellas/ustedes.",
    unchanged: "Nosotros и vosotros",
    unchangedText: "Корневая гласная в формах nosotros и vosotros остается такой же, как в инфинитиве.",
    endings: "Окончания остаются обычными для presente.",
    practice: "▶ Тренироваться",
    check: "Проверить",
    back: "← Назад",
    result: "Результат",
    correct: "Правильно!",
    answer: "Правильный ответ: ",
    excellent: "Отлично. Материал усвоен.",
    good: "Хорошо, но стоит повторить ошибки.",
    again: "Материал пока усвоен недостаточно. Повторите правило и тренировку.",
    repeat: "Повторить",
    lesson: "Вернуться к уроку"
  },
  uk: {
    title: "Дієслова зі зміною основи",
    intro: "Вивчаємо зміну основи: спочатку правило, потім тренування і контроль.",
    rule: "У теперішньому часі в деяких дієсловах змінюється голосна в основі. Зміна відбувається у чотирьох формах «чобітка»: yo, tú, él/ella/usted та ellos/ellas/ustedes.",
    unchanged: "Nosotros і vosotros",
    unchangedText: "Коренева голосна у формах nosotros і vosotros залишається такою самою, як в інфінітиві.",
    endings: "Закінчення залишаються звичайними для presente.",
    practice: "▶ Тренуватися",
    check: "Перевірити",
    back: "← Назад",
    result: "Результат",
    correct: "Правильно!",
    answer: "Правильна відповідь: ",
    excellent: "Чудово. Матеріал засвоєно.",
    good: "Добре, але варто повторити помилки.",
    again: "Матеріал поки засвоєно недостатньо. Повторіть правило і тренування.",
    repeat: "Повторити",
    lesson: "До уроку"
  },
  en: {
    title: "Stem-changing verbs",
    intro: "Learn stem changes: first the rule, then practice and assessment.",
    rule: "In the present tense, some verbs change a vowel in the stem. The change occurs in the four boot forms: yo, tú, él/ella/usted and ellos/ellas/ustedes.",
    unchanged: "Nosotros and vosotros",
    unchangedText: "The stem vowel in nosotros and vosotros stays the same as in the infinitive.",
    endings: "The endings remain the regular present-tense endings.",
    practice: "▶ Practise",
    check: "Check",
    back: "← Back",
    result: "Result",
    correct: "Correct!",
    answer: "Correct answer: ",
    excellent: "Excellent. Material mastered.",
    good: "Good, but review your mistakes.",
    again: "The material is not mastered yet. Review the rule and practise again.",
    repeat: "Repeat",
    lesson: "Back to lesson"
  },
  es: {
    title: "Verbos con cambio de raíz",
    intro: "Aprende los cambios de raíz: primero la regla, después la práctica y la evaluación.",
    rule: "En presente, algunos verbos cambian una vocal de la raíz. El cambio aparece en las cuatro formas del «zapato»: yo, tú, él/ella/usted y ellos/ellas/ustedes.",
    unchanged: "Nosotros y vosotros",
    unchangedText: "La vocal de la raíz en nosotros y vosotros se mantiene igual que en el infinitivo.",
    endings: "Las terminaciones siguen siendo las normales del presente.",
    practice: "▶ Practicar",
    check: "Comprobar",
    back: "← Volver",
    result: "Resultado",
    correct: "¡Correcto!",
    answer: "Respuesta correcta: ",
    excellent: "Excelente. Material dominado.",
    good: "Bien, pero repasa los errores.",
    again: "El material aún no está dominado. Repite la regla y practica de nuevo.",
    repeat: "Repetir",
    lesson: "Volver a la lección"
  }
};

function stemLang() {
  return document.getElementById("language")?.value || "ru";
}

function st(key) {
  return (stemT[stemLang()] || stemT.ru)[key];
}

function renderStemChangingLesson() {
  const root = document.getElementById("grammarSection");
  if (!root) return;

  const key = window.currentStemType || "e_ie";
  const lesson = stemChangingLessons[key];
  const texts = {
    unchanged: st("unchanged"),
    unchangedText: st("unchangedText"),
    endings: st("endings")
  };

  root.style.display = "block";
  root.innerHTML = `
    <div class="grammar-header">
      <div>
        <div class="grammar-kicker">📖 Грамматика</div>
        <h2>${st("title")}</h2>
        <p>${st("intro")}</p>
      </div>
      <button id="stemBack" type="button">${st("back")}</button>
    </div>

    <div class="stem-type-switch">
      ${Object.keys(stemChangingLessons).map(k => `
        <button type="button" data-stem-type="${k}" class="${k === key ? "active" : ""}">
          ${stemChangingLessons[k].title[stemLang()]}
        </button>
      `).join("")}
    </div>

    <div class="grammar-card">
      <h3>${lesson.verb} — ${lesson.title[stemLang()]}</h3>
      <p>${lesson.description[stemLang()]}</p>
      ${window.renderStemDiagram(lesson, texts)}
    </div>

    <button class="grammar-primary" id="stemPractice">${st("practice")}</button>
  `;

  document.getElementById("stemBack").onclick = () => {
    root.style.display = "none";
    document.querySelector(".trainer").style.display = "flex";
  };

  root.querySelectorAll("[data-stem-type]").forEach(button => {
    button.onclick = () => {
      window.currentStemType = button.dataset.stemType;
      renderStemChangingLesson();
    };
  });

  document.getElementById("stemPractice").onclick = () => startStemPractice(key);
}

function startStemPractice(key) {
  const lesson = stemChangingLessons[key];
  const root = document.getElementById("grammarSection");
  let pos = 0;
  let score = 0;

  root.innerHTML = `
    <div class="grammar-header">
      <div>
        <div class="grammar-kicker">🏋️ ${st("title")}</div>
        <h2>${lesson.title[stemLang()]}</h2>
      </div>
    </div>
    <div class="grammar-practice-card">
      <p id="stemProgress">1 / 6</p>
      <h3>${lesson.verb}</h3>
      <p id="stemPerson"></p>
      <input id="stemAnswer" type="text" autocomplete="off">
      <button id="stemCheck" class="grammar-primary">${st("check")}</button>
      <p id="stemResult"></p>
    </div>
  `;

  const next = () => {
    if (pos >= 6) {
      renderStemResult(key, score);
      return;
    }

    document.getElementById("stemProgress").textContent = `${pos + 1} / 6`;
    document.getElementById("stemPerson").textContent = lesson.persons[pos];

    const input = document.getElementById("stemAnswer");
    input.disabled = false;
    input.value = "";
    document.getElementById("stemResult").textContent = "";
    input.focus();
  };

  const check = () => {
    const input = document.getElementById("stemAnswer");
    if (input.disabled) return;

    const answer = input.value.trim().toLowerCase();
    if (!answer) return;

    input.disabled = true;
    const ok = answer === lesson.forms[pos];
    document.getElementById("stemResult").textContent = ok
      ? `✅ ${st("correct")}`
      : `❌ ${st("answer")}${lesson.forms[pos]}`;

    if (ok) score++;
    pos++;
    setTimeout(next, 650);
  };

  document.getElementById("stemCheck").onclick = check;
  document.getElementById("stemAnswer").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      check();
    }
  });

  next();
}

function renderStemResult(key, score) {
  const root = document.getElementById("grammarSection");
  const percent = Math.round(score / 6 * 100);
  const message = percent >= 90 ? st("excellent") : percent >= 70 ? st("good") : st("again");

  root.innerHTML = `
    <div class="grammar-result-card">
      <div class="grammar-kicker">🏆 ${st("result")}</div>
      <h2>${percent}%</h2>
      <p>${message}</p>
      <div class="grammar-result-bar"><span style="width:${percent}%"></span></div>
      <button class="grammar-primary" id="stemRepeat">${st("repeat")}</button>
      <button id="stemLesson">${st("lesson")}</button>
    </div>
  `;

  document.getElementById("stemRepeat").onclick = () => startStemPractice(key);
  document.getElementById("stemLesson").onclick = renderStemChangingLesson;

  if (window.progressRecordGrammar) {
    window.progressRecordGrammar(`stem_${key}`, percent, []);
  }
}

const baseRenderGrammar = window.renderGrammar;
const baseOpenGrammar = window.openGrammar;

window.renderGrammar = function (id = "presente") {
  if (id === "irregular") return renderStemChangingLesson();
  return baseRenderGrammar(id);
};

window.openGrammar = function (id = "presente") {
  if (id === "irregular") {
    document.querySelector(".trainer").style.display = "none";
    window.currentStemType = "e_ie";
    renderStemChangingLesson();
    document.getElementById("grammarSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  return baseOpenGrammar(id);
};
