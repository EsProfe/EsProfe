"use strict";

/*
 * EsProfe — stem-changing verb diagram component.
 * The component is intentionally isolated from the lesson logic so the
 * conjugation lesson can change without changing the visual diagram.
 */
(function () {
  function highlightFirst(text, value, className) {
    const index = text.indexOf(value);
    if (index < 0) return text;
    return `${text.slice(0, index)}<span class="${className}">${value}</span>${text.slice(index + value.length)}`;
  }

  function renderCell(lesson, index, changed) {
    const form = lesson.forms[index];
    const html = changed
      ? highlightFirst(form, lesson.changedVowel, "stem-highlight")
      : highlightFirst(form, lesson.rootVowel, "stem-root-vowel");

    return `<span class="stem-person">${lesson.persons[index]}</span><strong class="stem-form">${html}</strong>`;
  }

  window.renderStemDiagram = function renderStemDiagram(lesson, texts) {
    return `
      <div class="stem-diagram" aria-label="Схема спряжения ${lesson.verb}">
        <div class="stem-infinitive">
          <span>${highlightFirst(lesson.verb, lesson.rootVowel, "stem-root-vowel")}</span>
          <small>(инфинитив)</small>
        </div>

        <div class="stem-arrows" aria-hidden="true">
          <svg viewBox="0 0 700 120" preserveAspectRatio="none">
            <defs>
              <marker id="stemArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z"></path>
              </marker>
            </defs>
            <path d="M545 112 C540 75 520 45 410 12" marker-end="url(#stemArrow)"></path>
            <path d="M625 112 C620 72 585 40 440 12" marker-end="url(#stemArrow)"></path>
          </svg>
        </div>

        <div class="boot-grid">
          <div class="boot-heading">Единственное число</div>
          <div class="boot-heading">Множественное число</div>

          <div class="boot-cell changed-cell">${renderCell(lesson, 0, true)}</div>
          <div class="boot-cell unchanged-cell">${renderCell(lesson, 3, false)}</div>

          <div class="boot-cell changed-cell">${renderCell(lesson, 1, true)}</div>
          <div class="boot-cell unchanged-cell">${renderCell(lesson, 4, false)}</div>

          <div class="boot-cell changed-cell">${renderCell(lesson, 2, true)}</div>
          <div class="boot-cell changed-cell">${renderCell(lesson, 5, true)}</div>

          <div class="boot-outline" aria-hidden="true"></div>
        </div>

        <div class="boot-note">
          <strong>${texts.unchanged}:</strong> ${texts.unchangedText}<br>
          <strong>${texts.endings}</strong>
        </div>
      </div>
    `;
  };
})();
