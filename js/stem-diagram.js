"use strict";

/* EsProfe — shared colour diagram for stem-changing verb groups. */
(function () {
  const esc = value => String(value ?? "").replace(/[&<>\"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
  })[char]);

  const marked = (form, mark) => {
    const value = String(form || "");
    const needle = String(mark || "");
    const at = value.indexOf(needle);
    if (!needle || at < 0) return esc(value);
    return `${esc(value.slice(0, at))}<span class="stem-highlight">${esc(needle)}</span>${esc(value.slice(at + needle.length))}`;
  };

  window.renderStemDiagram = function renderStemDiagram(lesson, texts = {}) {
    if (!lesson?.verb || !Array.isArray(lesson.forms) || lesson.forms.length !== 6) return "";
    const persons = ["yo", "nosotros / nosotras", "tú", "vosotros / vosotras", "él / ella / usted", "ellos / ellas / ustedes"];
    const order = [0, 3, 1, 4, 2, 5];

    return `
      <div class="stem-diagram a1-boot-visual stem-color-diagram" aria-label="Esquema del zapato: ${esc(lesson.verb)}">
        <div class="stem-infinitive">
          <span>${marked(lesson.verb, lesson.rootVowel)}</span>
          <small>infinitivo</small>
        </div>
        <div class="boot-grid">
          <div class="boot-heading">Singular</div>
          <div class="boot-heading">Plural</div>
          ${order.map((sourceIndex, position) => {
            const unchanged = sourceIndex === 3 || sourceIndex === 4;
            const mark = unchanged ? lesson.rootVowel : lesson.changedVowel;
            return `<div class="boot-cell ${unchanged ? "unchanged-cell" : "changed-cell"}"><span class="stem-person">${persons[position]}</span><strong class="stem-form">${marked(lesson.forms[sourceIndex], mark)}</strong></div>`;
          }).join("")}
        </div>
        <p class="boot-note"><strong>${esc(texts.unchanged || "Nosotros y vosotros")}</strong><br>${esc(texts.unchangedText || "")}<br>${esc(texts.endings || "")}</p>
      </div>
    `;
  };
})();
