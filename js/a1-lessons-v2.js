"use strict";
(function () {
  const PASS = () => Number(window.ESPROFE_LESSON_PASS_PERCENT || 80);
  let lesson = null,
    stage = "",
    stageTrail = [],
    suppressTrail = false,
    practiceScore = 0,
    trainerScore = 0,
    assessmentScore = 0,
    weak = {},
    lastOpen = "";
  const root = () => document.getElementById("grammarSection"),
    lang = () => document.getElementById("language")?.value || "ru",
    esc = (v) =>
      String(v ?? "").replace(
        /[&<>\"]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
      );
  const ui = {
    ru: {
      back: "← Маршрут A1",
      previous: "← Назад",
      listen: "🔊 Слушать",
      examples: "Перейти к примерам",
      start: "Начать практику",
      correct: "Правильно",
      wrong: "Неправильно",
      practice: "Практика",
      trainer: "Тренажёр",
      assessment: "Контроль",
      result: "Результат",
      repeat: "Повторить урок",
      reviewErrors: "Разобрать ошибки",
      route: "Вернуться к маршруту A1",
      mastered: "Урок пройден",
      almost: "Урок пройден, но ошибки нужно закрыть",
      again: "Нужно закрепить материал перед следующим уроком",
      weak: "Слабые места",
      noWeak: "Активных слабых мест нет",
      fix: "Закрепить это правило",
      fixed: "Слабое место закрыто",
      notFixed: "Пока не закрыто — повтори правило и попробуй ещё раз",
    },
    uk: {
      back: "← Маршрут A1",
      previous: "← Назад",
      listen: "🔊 Слухати",
      examples: "Перейти до прикладів",
      start: "Почати практику",
      correct: "Правильно",
      wrong: "Неправильно",
      practice: "Практика",
      trainer: "Тренажер",
      assessment: "Контроль",
      result: "Результат",
      repeat: "Повторити урок",
      reviewErrors: "Розібрати помилки",
      route: "Повернутися до маршруту A1",
      mastered: "Урок пройдено",
      almost: "Урок пройдено, але помилки треба закрити",
      again: "Потрібно закріпити матеріал перед наступним уроком",
      weak: "Слабкі місця",
      noWeak: "Активних слабких місць немає",
      fix: "Закріпити це правило",
      fixed: "Слабке місце закрито",
      notFixed: "Поки не закрито — повтори правило й спробуй ще раз",
    },
    en: {
      back: "← A1 route",
      previous: "← Back",
      listen: "🔊 Listen",
      examples: "Go to examples",
      start: "Start practice",
      correct: "Correct",
      wrong: "Incorrect",
      practice: "Practice",
      trainer: "Trainer",
      assessment: "Assessment",
      result: "Result",
      repeat: "Repeat lesson",
      reviewErrors: "Review mistakes",
      route: "Back to A1 route",
      mastered: "Lesson passed",
      almost: "Lesson passed, but mistakes still need review",
      again: "Review the material before the next lesson",
      weak: "Weak spots",
      noWeak: "No active weak spots",
      fix: "Practise this point",
      fixed: "Weak spot cleared",
      notFixed: "Not cleared yet — review the rule and try again",
    },
    es: {
      back: "← Ruta A1",
      previous: "← Atrás",
      listen: "🔊 Escuchar",
      examples: "Ir a los ejemplos",
      start: "Empezar práctica",
      correct: "Correcto",
      wrong: "Incorrecto",
      practice: "Práctica",
      trainer: "Entrenador",
      assessment: "Evaluación",
      result: "Resultado",
      repeat: "Repetir lección",
      reviewErrors: "Revisar errores",
      route: "Volver a la ruta A1",
      mastered: "Lección superada",
      almost: "Lección superada, pero hay errores que corregir",
      again: "Conviene reforzar el contenido antes de la siguiente lección",
      weak: "Puntos débiles",
      noWeak: "No hay puntos débiles activos",
      fix: "Practicar este punto",
      fixed: "Punto débil superado",
      notFixed:
        "Todavía no está superado: repasa la regla e inténtalo de nuevo",
    },
  };
  const STEP_LABELS = {
    ru: [
      "Объяснение",
      "Примеры",
      "Практика",
      "Тренажёр",
      "Контроль",
      "Результат",
      "Повторение",
    ],
    uk: [
      "Пояснення",
      "Приклади",
      "Практика",
      "Тренажер",
      "Контроль",
      "Результат",
      "Повторення",
    ],
    en: [
      "Explanation",
      "Examples",
      "Practice",
      "Trainer",
      "Assessment",
      "Result",
      "Review",
    ],
    es: [
      "Explicación",
      "Ejemplos",
      "Práctica",
      "Entrenador",
      "Evaluación",
      "Resultado",
      "Repaso",
    ],
  };
  const BOOT_UI = {
    ru: {
      changed: "Внутри красного контура: изменение основы или особая форма yo.",
      unchanged: "Nosotros и vosotros сохраняют гласную основы.",
    },
    uk: {
      changed:
        "Усередині червоного контуру: зміна основи або особлива форма yo.",
      unchanged: "Nosotros і vosotros зберігають голосну основи.",
    },
    en: {
      changed: "Inside the red outline: a stem change or a special yo form.",
      unchanged: "Nosotros and vosotros keep the original stem vowel.",
    },
    es: {
      changed:
        "Dentro del contorno rojo: cambio de raíz o forma especial de yo.",
      unchanged: "Nosotros y vosotros mantienen la vocal original de la raíz.",
    },
  };
  const U = () => ui[lang()] || ui.ru;
  function shuffle(a) {
    a = [...a];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  let spanishVoice = null;
  function selectSpanishVoice() {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    spanishVoice =
      voices.find((v) => /^es-ES$/i.test(v.lang)) ||
      voices.find((v) => /^es(?:-|$)/i.test(v.lang)) ||
      null;
    return spanishVoice;
  }
  if (window.speechSynthesis) {
    selectSpanishVoice();
    window.speechSynthesis.addEventListener?.(
      "voiceschanged",
      selectSpanishVoice,
    );
  }
  function speak(word, { syllable = false } = {}) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const teachingSyllables = { ca: "cá", co: "có", cu: "cú" };
    const text = syllable
      ? teachingSyllables[String(word).toLowerCase()] || word
      : word;
    const x = new SpeechSynthesisUtterance(text);
    x.lang = "es-ES";
    x.rate = 0.78;
    const voice = spanishVoice || selectSpanishVoice();
    if (voice) x.voice = voice;
    window.speechSynthesis.speak(x);
  }
  function setView() {
    document.querySelector(".trainer")?.style.setProperty("display", "none");
    if (root()) root().style.display = "block";
  }
  const STEPS = [
    "explanation",
    "examples",
    "practice",
    "trainer",
    "assessment",
    "result",
    "review",
  ];
  function remember(next) {
    if (!suppressTrail && stage && stage !== next) stageTrail.push(stage);
    stage = next;
  }
  function stepper(active) {
    const labels = STEP_LABELS[lang()] || STEP_LABELS.ru,
      current = STEPS.indexOf(active);
    return `<div class="a1-lesson-navigation"><button type="button" class="a1-previous" data-a1-go-back ${stageTrail.length ? "" : "disabled"}>${esc(U().previous)}</button><button type="button" class="a1-route-link" data-a1-go-route>${esc(U().back)}</button></div><div class="a1-stepper a1-stepper-seven">${STEPS.map((s, i) => `<button type="button" class="${s === active ? "active" : ""}" data-a1-step="${s}" title="${esc(labels[i])}" aria-label="${esc(labels[i])}" ${i > current || s === "result" || s === "review" ? "disabled" : ""}>${esc(labels[i])}</button>`).join("")}</div>`;
  }
  function openStage(next) {
    if (next === "explanation") return renderExplanation();
    if (next === "examples") return renderExamples();
    if (next === "practice") return runStage("practice", 6);
    if (next === "trainer") return runStage("trainer", 8);
    if (next === "assessment") return runStage("assessment", 10);
    if (next === "review") return renderReview();
  }
  function goBack() {
    const previous = stageTrail.pop();
    if (!previous)
      return window.openA1Curriculum?.({
        mode: document.documentElement.dataset.learningMode,
      });
    suppressTrail = true;
    openStage(previous);
    suppressTrail = false;
  }
  function markedForm(form, mark) {
    const value = String(form || ""),
      needle = String(mark || "");
    if (!needle) return esc(value);
    const at = value.indexOf(needle);
    return at < 0
      ? esc(value)
      : `${esc(value.slice(0, at))}<span class="stem-highlight">${esc(needle)}</span>${esc(value.slice(at + needle.length))}`;
  }
  function bootDiagramHTML() {
    const d = lesson?.stemDiagram;
    if (!d || !Array.isArray(d.forms) || d.forms.length !== 6) return "";
    const b = BOOT_UI[lang()] || BOOT_UI.ru,
      persons = [
        "yo",
        "nosotros / nosotras",
        "tú",
        "vosotros / vosotras",
        "él / ella / usted",
        "ellos / ellas / ustedes",
      ],
      order = [0, 3, 1, 4, 2, 5];
    return `<section class="a1-boot-section" aria-label="Esquema del zapato"><div class="a1-boot-title"><span>👢</span><div><h3>Esquema del «zapato»: ${esc(d.infinitive)} · ${esc(d.from)} → ${esc(d.to)}</h3><p>${esc(b.changed)}</p></div></div><div class="stem-diagram a1-boot-visual stem-color-diagram"><div class="stem-infinitive"><span>${markedForm(d.infinitive, d.from)}</span><small>infinitivo</small></div><div class="boot-grid"><div class="boot-heading">Singular</div><div class="boot-heading">Plural</div>${order.map((sourceIndex, position) => `<div class="boot-cell ${position === 1 || position === 3 ? "unchanged-cell" : "changed-cell"}"><span class="stem-person">${esc(persons[position])}</span><strong class="stem-form">${markedForm(d.forms[sourceIndex], d.marks?.[sourceIndex])}</strong></div>`).join("")}</div><p class="boot-note"><strong>${esc(b.unchanged)}</strong><br>${esc(d.note?.[lang()] || d.note?.ru || "")}</p></div></section>`;
  }
  function reflexiveVisualHTML() {
    if (!["reflexive-pronouns", "reflexive-present"].includes(lesson?.id))
      return "";
    const text = {
      ru: [
        "Lavar и lavarse: что меняется?",
        "Глагол спрягается по той же модели. Возвратное местоимение согласуется с лицом: yo → me, tú → te, nosotros/as → nos; в 3-м лице — se.",
      ],
      uk: [
        "Lavar і lavarse: що змінюється?",
        "Дієслово відмінюється за тією самою моделлю. Зворотний займенник узгоджується з особою: yo → me, tú → te, nosotros/as → nos; у 3-й особі — se.",
      ],
      en: [
        "Lavar and lavarse: what changes?",
        "The verb follows the same conjugation pattern. The reflexive pronoun matches the person: yo → me, tú → te, nosotros/as → nos; third person uses se.",
      ],
      es: [
        "Lavar y lavarse: ¿qué cambia?",
        "El verbo sigue el mismo modelo de conjugación. El pronombre reflexivo concuerda con la persona: yo → me, tú → te, nosotros/as → nos; en tercera persona, se.",
      ],
    }[lang()] || [
      "Lavar и lavarse: что меняется?",
      "Глагол спрягается по той же модели. Возвратное местоимение согласуется с лицом: yo → me, tú → te, nosotros/as → nos; в 3-м лице — se.",
    ];
    const rows = [
      ["yo", "lavo", "me"],
      ["tú", "lavas", "te"],
      ["él, ella, usted", "lava", "se"],
      ["nosotros/as", "lavamos", "nos"],
      ["vosotros/as", "laváis", "os"],
      ["ellos, ellas, ustedes", "lavan", "se"],
    ];
    return `<section class="a1-reflexive-visual" aria-label="Lavar y lavarse"><div class="a1-reflexive-visual-head"><h3>${esc(text[0])}</h3><p>${esc(text[1])}</p></div><div class="a1-reflexive-table-wrap"><table class="a1-reflexive-table"><thead><tr><th></th><th><em>lavar</em></th><th><em>lavar<span>se</span></em></th></tr></thead><tbody>${rows.map(([person, plain, pronoun]) => `<tr><th scope="row">${esc(person)}</th><td>${esc(plain)}</td><td><b>${esc(pronoun)}</b> ${esc(plain)}</td></tr>`).join("")}</tbody></table></div></section>`;
  }
  function possessiveVisualHTML() {
    if (lesson?.id !== "possessives") return "";
    const text = {
      ru: [
        "¿Su o sus?",
        "Форма зависит от количества предметов, а не от владельцев.",
      ],
      uk: [
        "¿Su o sus?",
        "Форма залежить від кількості предметів, а не від власників.",
      ],
      en: [
        "¿Su o sus?",
        "The form depends on the number of things, not on the number of owners.",
      ],
      es: [
        "¿Su o sus?",
        "La forma depende del número de cosas, no del número de propietarios.",
      ],
    }[lang()] || [
      "¿Su o sus?",
      "Форма зависит от количества предметов, а не от владельцев.",
    ];
    const rows = [
      ["él / ella", "su libro", "sus libros"],
      ["ellos / ellas", "su libro", "sus libros"],
    ];
    return `<section class="a1-possessive-visual" aria-label="${esc(text[0])}"><h3>${esc(text[0])}</h3><p>${esc(text[1])}</p><div class="a1-reflexive-table-wrap"><table class="a1-possessive-table"><thead><tr><th>propietario</th><th>1 cosa</th><th>varias cosas</th></tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, i) => `<${i ? "td" : 'th scope="row"'}>${esc(cell)}</${i ? "td" : "th"}>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
  }
  function possessiveFormsHTML() {
    if (lesson?.id !== "possessives") return "";
    const h = {
        ru: ["Лицо", "Единственное число", "Множественное число"],
        uk: ["Особа", "Однина", "Множина"],
        en: ["Person", "Singular", "Plural"],
        es: ["Persona", "Singular", "Plural"],
      }[lang()] || ["Лицо", "Единственное число", "Множественное число"],
      rows = [
        ["yo", "mi", "mis"],
        ["tú", "tu", "tus"],
        ["él / ella / usted", "su", "sus"],
        ["nosotros/as", "nuestro / nuestra", "nuestros / nuestras"],
        ["vosotros/as", "vuestro / vuestra", "vuestros / vuestras"],
        ["ellos / ellas / ustedes", "su", "sus"],
      ];
    return `<section class="a1-possessive-visual"><div class="a1-reflexive-table-wrap"><table class="a1-possessive-table"><thead><tr>${h.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((x, i) => `<${i ? "td" : 'th scope="row"'}>${esc(x)}</${i ? "td" : "th"}>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
  }
  function demonstrativeVisualHTML() {
    if (lesson?.id !== "demonstratives") return "";
    const t = {
        ru: [
          "Расстояние: aquí, ahí, allí",
          "На схеме — близко ко мне, на среднем расстоянии и далеко.",
          "рядом со мной",
          "у собеседника / среднее расстояние",
          "далеко",
        ],
        uk: [
          "Відстань: aquí, ahí, allí",
          "На схемі — близько до мене, на середній відстані й далеко.",
          "біля мене",
          "біля співрозмовника / середня відстань",
          "далеко",
        ],
        en: [
          "Distance: aquí, ahí, allí",
          "The diagram shows near me, at medium distance and far away.",
          "near me",
          "near the listener / medium distance",
          "far away",
        ],
        es: [
          "Distancia: aquí, ahí, allí",
          "El esquema muestra cerca de mí, a distancia media y lejos.",
          "cerca de mí",
          "cerca del oyente / distancia media",
          "lejos",
        ],
      }[lang()] || [
        "Расстояние: aquí, ahí, allí",
        "На схеме — близко ко мне, на среднем расстоянии и далеко.",
        "рядом со мной",
        "у собеседника / среднее расстояние",
        "далеко",
      ],
      cells = [
        ["AQUÍ", t[2], "Este coche", "🚗"],
        ["AHÍ", t[3], "Ese coche", "🚘"],
        ["ALLÍ", t[4], "Aquel coche", "🚙"],
      ];
    return `<section class="a1-image-visual"><h3>${esc(t[0])}</h3><p>${esc(t[1])}</p><div class="a1-distance-visual">${cells.map(([place, meaning, model, icon]) => `<article><strong>${esc(place)}</strong><small>${esc(meaning)}</small><b>${esc(model)}</b><span>${icon}</span></article>`).join("")}</div></section>`;
  }
  function prepositionVisualHTML() {
    if (lesson?.id !== "prepositions-basic") return "";
    const t = {
        ru: [
          "A, en, de: как увидеть разницу",
          "Думай о доме как о точке на карте: к нему, внутри него или от него.",
          "направление — куда?",
          "место — где?",
          "происхождение / движение — откуда?",
          "a casa",
          "en casa",
          "de casa",
          "дом",
        ],
        uk: [
          "A, en, de: як побачити різницю",
          "Уяви дім як точку на карті: до нього, усередині нього або від нього.",
          "напрямок — куди?",
          "місце — де?",
          "походження / рух — звідки?",
          "a casa",
          "en casa",
          "de casa",
          "дім",
        ],
        en: [
          "A, en, de: see the difference",
          "Think of a house as a point on a map: towards it, inside it or away from it.",
          "direction — where to?",
          "place — where?",
          "origin / movement — where from?",
          "a casa",
          "en casa",
          "de casa",
          "house",
        ],
        es: [
          "A, en, de: ve la diferencia",
          "Piensa en una casa como un punto en el mapa: hacia ella, dentro de ella o desde ella.",
          "dirección — ¿adónde?",
          "lugar — ¿dónde?",
          "origen / movimiento — ¿de dónde?",
          "a casa",
          "en casa",
          "de casa",
          "casa",
        ],
      }[lang()] || [
        "A, en, de: как увидеть разницу",
        "Думай о доме как о точке на карте: к нему, внутри него или от него.",
        "направление — куда?",
        "место — где?",
        "происхождение / движение — откуда?",
        "a casa",
        "en casa",
        "de casa",
        "дом",
      ],
      cells = [
        ["A", t[2], t[5], "→"],
        ["EN", t[3], t[6], "⌂"],
        ["DE", t[4], t[7], "←"],
      ];
    return `<section class="a1-preposition-visual" aria-label="A, en, de"><h3>${esc(t[0])}</h3><p>${esc(t[1])}</p><div class="a1-preposition-flow">${cells.map(([prep, meaning, example, symbol]) => `<article class="a1-preposition-${prep.toLowerCase()}"><strong>${esc(prep)}</strong><span aria-hidden="true">${esc(symbol)}</span><b>${esc(t[8])}</b><small>${esc(meaning)}</small><em>${esc(example)}</em></article>`).join("")}</div></section>`;
  }
  function locationVisualHTML() {
    if (lesson?.id !== "location-prepositions") return "";
    const t = {
        ru: [
          "¿Dónde está la pelota?",
          "Смотри на положение мяча относительно коробки. Сочетания с de учим целиком.",
          "сверху",
          "снизу",
          "слева",
          "справа",
          "перед",
          "за",
          "внутри",
          "снаружи",
        ],
        uk: [
          "¿Dónde está la pelota?",
          "Подивися на положення м’яча відносно коробки. Сполучення з de вчи цілком.",
          "зверху",
          "знизу",
          "ліворуч",
          "праворуч",
          "перед",
          "за",
          "всередині",
          "зовні",
        ],
        en: [
          "¿Dónde está la pelota?",
          "Look at the ball’s position relative to the box. Learn expressions with de as whole patterns.",
          "above",
          "below",
          "to the left",
          "to the right",
          "in front",
          "behind",
          "inside",
          "outside",
        ],
        es: [
          "¿Dónde está la pelota?",
          "Observa la posición de la pelota respecto a la caja. Aprende las expresiones con de como modelos completos.",
          "arriba",
          "abajo",
          "a la izquierda",
          "a la derecha",
          "delante",
          "detrás",
          "dentro",
          "fuera",
        ],
      }[lang()] || [
        "¿Dónde está la pelota?",
        "Смотри на положение мяча относительно коробки. Сочетания с de учим целиком.",
        "сверху",
        "снизу",
        "слева",
        "справа",
        "перед",
        "за",
        "внутри",
        "снаружи",
      ],
      cells = [
        ["top", "La pelota está sobre la caja.", t[2]],
        ["bottom", "La pelota está debajo de la caja.", t[3]],
        ["left", "La pelota está a la izquierda de la caja.", t[4]],
        ["right", "La pelota está a la derecha de la caja.", t[5]],
        ["front", "La pelota está delante de la caja.", t[6]],
        ["behind", "La pelota está detrás de la caja.", t[7]],
        ["inside", "La pelota está dentro de la caja.", t[8]],
        ["outside", "La pelota está fuera de la caja.", t[9]],
      ];
    return `<section class="a1-location-visual" aria-label="¿Dónde está la pelota?"><h3>${esc(t[0])}</h3><p>${esc(t[1])}</p><div class="a1-location-grid">${cells.map(([position, model, meaning]) => `<article><div class="a1-ball-box a1-pos-${position}" aria-hidden="true"><i>⚽</i><b>□</b></div><strong>${esc(model)}</strong><small>${esc(meaning)}</small></article>`).join("")}</div></section>`;
  }
  function familyTreeHTML() {
    const t={ru:["Семейное дерево","дедушка","бабушка","отец","мать","дядя","тётя","брат","сестра","я","двоюродный брат","двоюродная сестра","сын","дочь","племянник","племянница"],uk:["Родинне дерево","дідусь","бабуся","батько","мати","дядько","тітка","брат","сестра","я","двоюрідний брат","двоюрідна сестра","син","донька","племінник","племінниця"],en:["Family tree","grandfather","grandmother","father","mother","uncle","aunt","brother","sister","I","cousin","cousin","son","daughter","nephew","niece"],es:["Árbol familiar","abuelo","abuela","padre","madre","tío","tía","hermano","hermana","yo","primo","prima","hijo","hija","sobrino","sobrina"]}[lang()]||[];const C=(i,icon,word)=>`<article><span>${icon}</span><b>${word}</b><small>${esc(t[i])}</small></article>`;return `<section class="a1-family-tree-visual"><h3>${esc(t[0])}</h3><div class="a1-family-generations">${C(1,"👴","el abuelo")}${C(2,"👵","la abuela")}<i>↓</i>${C(3,"👨","el padre")}${C(4,"👩","la madre")}<i>↓</i>${C(7,"👦","el hermano")}${C(9,"🙂","yo")}${C(8,"👧","la hermana")}</div><div class="a1-family-extra">${C(5,"👨‍🦱","el tío")}${C(6,"👩","la tía")}<i>↓</i>${C(10,"👦","el primo")}${C(11,"👧","la prima")}</div><div class="a1-family-extra">${C(7,"👦","el hermano")}${C(8,"👧","la hermana")}<i>↓</i>${C(14,"👶","el sobrino")}${C(15,"👶","la sobrina")}</div></section>`}
  function cityVisualHTML() {
    if (lesson?.id === "family") return familyTreeHTML();
    if (lesson?.id === "home") { const cards=[["🍳","cocina"],["🛁","baño"],["🛏️","dormitorio"],["🛋️","salón"]]; const title={ru:"Мой дом",uk:"Мій дім",en:"My home",es:"Mi casa"}[lang()]||""; return `<section class="a1-vocab-visual"><h3>${esc(title)}</h3><div>${cards.map(([icon,word])=>`<article><span>${icon}</span><b>${word}</b></article>`).join("")}</div></section>`; }
    if (lesson?.id !== "city-directions") return "";
    const t = {
      ru: [
        "Мини‑карта: как дойти до музея",
        "Иди прямо, затем поверни направо. Музей рядом с банком.",
        "СТАРТ",
        "БАНК",
        "МУЗЕЙ",
        "прямо",
        "направо",
      ],
      uk: [
        "Міні‑карта: як дійти до музею",
        "Іди прямо, потім поверни праворуч. Музей поруч із банком.",
        "СТАРТ",
        "БАНК",
        "МУЗЕЙ",
        "прямо",
        "праворуч",
      ],
      en: [
        "Mini-map: how to get to the museum",
        "Go straight, then turn right. The museum is next to the bank.",
        "START",
        "BANK",
        "MUSEUM",
        "straight",
        "right",
      ],
      es: [
        "Mini mapa: cómo llegar al museo",
        "Sigue todo recto y gira a la derecha. El museo está al lado del banco.",
        "INICIO",
        "BANCO",
        "MUSEO",
        "recto",
        "derecha",
      ],
    }[lang()] || [
      "Мини‑карта: как дойти до музея",
      "Иди прямо, затем поверни направо. Музей рядом с банком.",
      "СТАРТ",
      "БАНК",
      "МУЗЕЙ",
      "прямо",
      "направо",
    ];
    return `<section class="a1-city-visual"><h3>${esc(t[0])}</h3><p>${esc(t[1])}</p><div class="a1-city-map"><b>${esc(t[2])}</b><span class="a1-map-straight">→<small>${esc(t[5])}</small></span><span class="a1-map-turn">↳<small>${esc(t[6])}</small></span><strong>🏦 ${esc(t[3])}</strong><em>🏛️ ${esc(t[4])}</em></div></section>`;
  }
  function supplementHTML() {
    if (lesson?.id !== "alphabet-pronunciation" || !lesson.supplements)
      return "";
    const k = lesson.supplements.kSound,
      t = k?.i18n?.[lang()] || k?.i18n?.ru,
      s = lesson.supplements.stress,
      st = s?.i18n?.[lang()] || s?.i18n?.ru;
    if (!t || !st) return "";
    return `<section class="a1-special a1-k-sound"><h2>${esc(t.title)}</h2><div class="a1-memory"><strong>${esc(t.memoryTitle)}</strong><p>${esc(t.memoryText)}</p><div class="a1-syllables">${["ca", "co", "cu"].map((x) => `<button type="button" data-speak="${x}"><b>${x}</b><small>🔊</small></button>`).join("")}</div></div><div class="a1-rule-grid">${t.rules.map(([h, p]) => `<article><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div><h3>${esc(t.exerciseTitle)}</h3><p>${esc(t.exerciseText)}</p><div id="kExercise"></div></section><section class="a1-special a1-stress"><h2>${esc(st.title)}</h2><p>${esc(st.intro)}</p><div class="a1-stress-rules">${st.rules.map(([h, p]) => `<article><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div><div class="a1-tilde-warning"><h3>⚠️ ${esc(st.warningTitle)}</h3><p>${esc(st.warning)}</p><div class="a1-pairs">${st.pairs.map((p) => `<article><div><b>${esc(p[0])}</b><small>${esc(p[1])}</small></div><span>↔</span><div><b>${esc(p[2])}</b><small>${esc(p[3])}</small></div></article>`).join("")}</div></div></section>`;
  }
  function initSupplements() {
    root()
      ?.querySelectorAll("[data-speak]")
      .forEach(
        (b) => (b.onclick = () => speak(b.dataset.speak, { syllable: true })),
      );
    const k = lesson?.supplements?.kSound,
      box = document.getElementById("kExercise");
    if (!k || !box) return;
    let i = 0;
    function show() {
      const q = k.items[i];
      box.innerHTML = `<div class="a1-listen-card"><div class="a1-counter">${i + 1} / ${k.items.length}</div><button type="button" class="a1-audio" id="kAudio">${U().listen}</button><strong class="a1-gapword">${esc(q.display)}</strong><div class="a1-inline-options">${q.options.map((o) => `<button type="button" data-k-answer="${esc(o)}">${esc(o)}</button>`).join("")}</div><p id="kFeedback" aria-live="polite"></p></div>`;
      document.getElementById("kAudio").onclick = () => speak(q.word);
      box.querySelectorAll("[data-k-answer]").forEach(
        (b) =>
          (b.onclick = () => {
            const ok = b.dataset.kAnswer === q.answer;
            const gap = box.querySelector(".a1-gapword");
            if (gap) {
              gap.textContent = q.word;
              gap.classList.add("a1-completed-word");
            }
            document.getElementById("kFeedback").textContent = ok
              ? `✅ ${U().correct}: ${q.word}`
              : `❌ ${U().wrong}: ${q.word}`;
            box
              .querySelectorAll("[data-k-answer]")
              .forEach((x) => (x.disabled = true));
            speak(q.word);
            setTimeout(() => {
              i = (i + 1) % k.items.length;
              show();
            }, 2500);
          }),
      );
    }
    show();
  }
  function renderExplanation() {
    if (!lesson) return;
    remember("explanation");
    setView();
    const r = root(),
      t = lesson.i18n?.[lang()] || lesson.i18n?.ru;
    if (!t) return;
    r.innerHTML = `<div class="a1-lesson">${stepper(stage)}<div class="a1-kicker">A1 · ${esc(t.title)}</div><h2>${esc(t.title)}</h2><p class="a1-goal">${esc(t.goal)}</p><p>${esc(t.intro)}</p><div class="a1-rule-grid">${(t.rules || []).map(([h, p]) => `<article><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join("")}</div>${reflexiveVisualHTML()}${possessiveFormsHTML()}${possessiveVisualHTML()}${demonstrativeVisualHTML()}${prepositionVisualHTML()}${locationVisualHTML()}${cityVisualHTML()}${bootDiagramHTML()}${supplementHTML()}<button class="grammar-primary a1-main" id="a1Examples">${U().examples}</button></div>`;
    document.getElementById("a1Examples").onclick = renderExamples;
    initSupplements();
    window.EsProfeA1CountryReference?.render?.(lesson, r);
  }
  function renderExamples() {
    remember("examples");
    const r = root(),
      t = lesson.i18n?.[lang()] || lesson.i18n?.ru;
    r.innerHTML = `<div class="a1-lesson">${stepper(stage)}<div class="a1-kicker">A1 · ${esc(t.examplesTitle)}</div><h2>${esc(t.examplesTitle)}</h2><p>${esc(t.goal)}</p><div class="a1-example-grid">${(lesson.examples || []).map((x) => `<button type="button" class="a1-example" data-word="${esc(x.word)}"><strong>${esc(x.word)}</strong><small>${U().listen}</small></button>`).join("")}</div><button class="grammar-primary a1-main" id="a1Start">${U().start}</button></div>`;
    r.querySelectorAll("[data-word]").forEach(
      (b) => (b.onclick = () => speak(b.dataset.word)),
    );
    document.getElementById("a1Start").onclick = () => runStage("practice", 6);
  }
  function localizedOptions(q) {
    const raw = q.optionsByLang?.[lang()] ?? q.optionsByLang?.ru ?? q.options;
    return Array.isArray(raw) ? raw : [];
  }
  function correctAnswer(q) {
    return q.answers?.[lang()] ?? q.answers?.ru ?? q.answer ?? "";
  }
  function runStage(kind, count) {
    remember(kind);
    const r = root(),
      t = lesson.i18n?.[lang()] || lesson.i18n?.ru,
      items = shuffle(lesson.questionBank || []).slice(
        0,
        Math.min(count, (lesson.questionBank || []).length),
      );
    let i = 0,
      score = 0;
    const title =
      kind === "practice"
        ? t.practiceTitle
        : kind === "trainer"
          ? t.trainerTitle
          : t.assessmentTitle;
    function show() {
      if (i >= items.length) {
        if (kind === "practice") {
          practiceScore = score;
          return runStage("trainer", 8);
        }
        if (kind === "trainer") {
          trainerScore = score;
          return runStage("assessment", 10);
        }
        assessmentScore = score;
        return renderResult(items.length);
      }
      const q = items[i],
        opts = shuffle(localizedOptions(q));
      r.innerHTML = `<div class="a1-lesson">${stepper(kind)}<div class="a1-kicker">A1 · ${esc(title)}</div><div class="a1-question-card"><div class="a1-counter">${i + 1} / ${items.length}</div><h2>${esc(q.prompt?.[lang()] || q.prompt?.ru || q.prompt || "")}</h2><div class="a1-options">${opts.map((o, n) => `<button type="button" class="a1-option" data-option-index="${n}">${esc(o)}</button>`).join("")}</div><p id="a1Feedback"></p></div></div>`;
      r.querySelectorAll("[data-option-index]").forEach(
        (b) => (b.onclick = () => check(q, opts[+b.dataset.optionIndex])),
      );
    }
    function check(q, value) {
      const answer = correctAnswer(q),
        ok = value === answer;
      if (ok) score++;
      else weak[q.tag] = (weak[q.tag] || 0) + 1;
      document.getElementById("a1Feedback").textContent = ok
        ? `✅ ${U().correct}`
        : `❌ ${U().wrong}: ${answer}`;
      r.querySelectorAll("[data-option-index]").forEach(
        (b) => (b.disabled = true),
      );
      setTimeout(
        () => {
          i++;
          show();
        },
        kind === "assessment" ? 350 : 650,
      );
    }
    show();
  }
  function renderResult(total) {
    remember("result");
    const r = root(),
      t = lesson.i18n?.[lang()] || lesson.i18n?.ru,
      percent = total ? Math.round((assessmentScore / total) * 100) : 0,
      weakTags = Object.entries(weak).sort((a, b) => b[1] - a[1]),
      passed = percent >= PASS(),
      msg = passed ? (weakTags.length ? U().almost : U().mastered) : U().again;
    window.EsProfeLearningProgress?.recordLessonResult?.("A1", lesson.id, {
      percent,
      practice: practiceScore,
      trainer: trainerScore,
      assessment: assessmentScore,
      weakSpots: Object.fromEntries(weakTags),
      nextLessonId: lesson.nextLessonId,
    });
    r.innerHTML = `<div class="a1-lesson">${stepper(stage)}<div class="a1-result"><div class="a1-score">${percent}%</div><h2>${esc(msg)}</h2><p>${esc(t.resultTitle)}: ${assessmentScore}/${total} · ${U().practice}: ${practiceScore}/6 · ${U().trainer}: ${trainerScore}/8</p><h3>${U().weak}</h3><div class="a1-weak-list">${weakTags.length ? weakTags.map(([k, v]) => `<span>${esc(k)} · ${v}</span>`).join("") : esc(U().noWeak)}</div><div class="a1-result-actions">${weakTags.length ? `<button class="grammar-primary" id="a1Review">${U().reviewErrors}</button>` : ""}<button id="a1Repeat">${U().repeat}</button><button id="a1Route">${U().route}</button></div></div></div>`;
    document
      .getElementById("a1Review")
      ?.addEventListener("click", renderReview);
    document.getElementById("a1Repeat").onclick = () => {
      practiceScore = trainerScore = assessmentScore = 0;
      weak = {};
      stageTrail = [];
      stage = "";
      renderExplanation();
    };
    document.getElementById("a1Route").onclick = () =>
      window.openA1Curriculum?.({
        mode: document.documentElement.dataset.learningMode,
      });
  }
  function ruleForTag(tag) {
    const t = lesson.i18n?.[lang()] || lesson.i18n?.ru,
      idx = (lesson.ruleTags || {})[tag];
    return Number.isInteger(idx) ? t.rules?.[idx] || [tag, ""] : [tag, ""];
  }
  function renderReview() {
    remember("review");
    const r = root(),
      t = lesson.i18n?.[lang()] || lesson.i18n?.ru,
      items = Object.entries(weak).sort((a, b) => b[1] - a[1]);
    r.innerHTML = `<div class="a1-lesson">${stepper(stage)}<h2>${esc(t.reviewTitle)}</h2>${items
      .map(([tag, count]) => {
        const rule = ruleForTag(tag);
        return `<article class="a1-review-card"><h3>${esc(rule[0])} <small>× ${count}</small></h3><p>${esc(rule[1])}</p><button type="button" class="grammar-primary" data-fix-tag="${esc(tag)}">${U().fix}</button></article>`;
      })
      .join("")}<button id="a1Route">${U().route}</button></div>`;
    r.querySelectorAll("[data-fix-tag]").forEach(
      (b) => (b.onclick = () => runWeak(b.dataset.fixTag)),
    );
    document.getElementById("a1Route").onclick = () =>
      window.openA1Curriculum?.({
        mode: document.documentElement.dataset.learningMode,
      });
  }
  function runWeak(tag) {
    const pool = (lesson.questionBank || []).filter((q) => q.tag === tag),
      r = root();
    if (!pool.length) return renderReview();
    const q = shuffle(pool)[0],
      opts = shuffle(localizedOptions(q)),
      rule = ruleForTag(tag);
    r.innerHTML = `<div class="a1-lesson">${stepper("review")}<article class="a1-review-card"><h3>${esc(rule[0])}</h3><p>${esc(rule[1])}</p></article><div class="a1-question-card"><h2>${esc(q.prompt?.[lang()] || q.prompt?.ru || q.prompt || "")}</h2><div class="a1-options">${opts.map((o, n) => `<button type="button" data-weak-index="${n}">${esc(o)}</button>`).join("")}</div><p id="a1Feedback"></p></div></div>`;
    r.querySelectorAll("[data-weak-index]").forEach(
      (b) =>
        (b.onclick = () => {
          const ok = opts[+b.dataset.weakIndex] === correctAnswer(q);
          document.getElementById("a1Feedback").textContent = ok
            ? `✅ ${U().fixed}`
            : `❌ ${U().notFixed}`;
          r.querySelectorAll("[data-weak-index]").forEach(
            (x) => (x.disabled = true),
          );
          if (ok) {
            delete weak[tag];
            window.EsProfeLearningProgress?.clearWeakSpot?.(
              "A1",
              lesson.id,
              tag,
            );
          }
          setTimeout(renderReview, 800);
        }),
    );
  }
  async function open(id) {
    if (!id) return;
    const token = id + ":" + Date.now();
    lastOpen = token;
    try {
      const x = await window.EsProfeA1Catalog.lesson(id);
      if (lastOpen !== token) return;
      if (!x) throw new Error(`A1 lesson not found: ${id}`);
      lesson = x;
      stage = "";
      stageTrail = [];
      practiceScore = trainerScore = assessmentScore = 0;
      weak = {};
      renderExplanation();
    } catch (e) {
      console.error(e);
      if (root())
        root().innerHTML = `<div class="a1-lesson"><p>Урок пока недоступен.</p></div>`;
    }
  }
  function onTopic(e) {
    const id = e?.detail?.topicId || e?.detail?.lessonId;
    if (id) open(id);
  }
  document.addEventListener("click", (e) => {
    const back = e.target.closest("[data-a1-go-back]");
    if (back) {
      goBack();
      return;
    }
    const route = e.target.closest("[data-a1-go-route]");
    if (route) {
      window.openA1Curriculum?.({
        mode: document.documentElement.dataset.learningMode,
      });
      return;
    }
    const target = e.target.closest("[data-a1-step]");
    if (target && !target.disabled) openStage(target.dataset.a1Step);
  });
  document.addEventListener("esprofe:a1Topic", onTopic);
  document.addEventListener("esprofe:languageChanged", () => {
    if (lesson && document.querySelector(".a1-lesson")) {
      const oldTrail = stageTrail;
      stageTrail = [];
      stage = "";
      renderExplanation();
      stageTrail = oldTrail;
    }
  });
  window.openA1Lesson = open;
})();
