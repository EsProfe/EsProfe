"use strict";

/* EsProfe — visual component for stem-changing verb lessons. */
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
    const infinitive = highlightFirst(lesson.verb, lesson.rootVowel, "stem-root-vowel");

    return `
      <div class="stem-diagram" aria-label="Схема спряжения ${lesson.verb}">
        <div class="stem-infinitive">
          <span class="stem-word">${infinitive}</span>
          <small>(инфинитив)</small>
        </div>

        <div class="stem-arrows" aria-hidden="true">
          <svg viewBox="0 0 1000 360" preserveAspectRatio="none">
            <defs>
              <marker id="stemArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z"></path>
              </marker>
            </defs>
            <path d="M700 300 C700 220 625 145 535 72" marker-end="url(#stemArrow)"></path>
            <path d="M830 355 C825 250 700 145 555 72" marker-end="url(#stemArrow)"></path>
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

          <svg class="boot-outline-svg" viewBox="0 0 1000 330" preserveAspectRatio="none" aria-hidden="true">
            <path d="M35 18 C15 28 14 45 18 70 L18 282 C18 305 34 317 58 318 L520 318 C548 318 560 303 560 280 L560 238 L960 238 C982 238 990 225 990 204 L990 178 C990 160 979 151 960 151 L560 151" />
          </svg>
        </div>

        <div class="boot-note">
          <strong>${texts.unchanged}:</strong> ${texts.unchangedText}<br>
          <strong>${texts.endings}</strong>
        </div>
      </div>
    `;
  };
})();
