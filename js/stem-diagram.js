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

    return `
      <div class="stem-cell-person">${lesson.persons[index]}</div>
      <strong class="stem-form">${html}</strong>
    `;
  }

  window.renderStemDiagram = function renderStemDiagram(lesson, texts) {
    const infinitive = highlightFirst(lesson.verb, lesson.rootVowel, "stem-root-vowel");

    return `
      <div class="stem-diagram" aria-label="Схема спряжения ${lesson.verb}">
        <div class="stem-diagram-title">
          <strong>${lesson.verb}</strong> — ${lesson.rootVowel} → ${lesson.changedVowel}
        </div>

        <p class="stem-diagram-intro">
          Главная основа <strong>${lesson.rootVowel}</strong> меняется на <strong>${lesson.changedVowel}</strong> в четырёх формах «сапожка». Nosotros и vosotros сохраняют основу.
        </p>

        <div class="stem-infinitive">
          <span class="stem-word">${infinitive}</span>
          <small>(инфинитив)</small>
        </div>

        <div class="stem-arrows" aria-hidden="true">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none">
            <defs>
              <marker id="stemArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z"></path>
              </marker>
            </defs>
            <path d="M690 285 C680 190 620 125 525 72" marker-end="url(#stemArrow)"></path>
            <path d="M835 285 C825 185 720 120 555 72" marker-end="url(#stemArrow)"></path>
          </svg>
        </div>

        <div class="stem-columns">
          <div class="stem-column-heading">Единственное число</div>
          <div class="stem-column-heading">Множественное число</div>
        </div>

        <div class="boot-grid">
          <div class="boot-cell changed-cell">${renderCell(lesson, 0, true)}</div>
          <div class="boot-cell unchanged-cell">${renderCell(lesson, 3, false)}</div>

          <div class="boot-cell changed-cell">${renderCell(lesson, 1, true)}</div>
          <div class="boot-cell unchanged-cell">${renderCell(lesson, 4, false)}</div>

          <div class="boot-cell changed-cell">${renderCell(lesson, 2, true)}</div>
          <div class="boot-cell changed-cell">${renderCell(lesson, 5, true)}</div>

          <svg class="boot-outline-svg" viewBox="0 0 1000 330" preserveAspectRatio="none" aria-hidden="true">
            <path d="M32 12 C16 20 12 34 14 55 L14 274 C14 298 30 316 55 318 L510 318 C535 318 548 304 548 280 L548 224 L962 224 C982 224 990 212 990 194 L990 176 C990 158 979 146 960 146 L548 146" />
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
