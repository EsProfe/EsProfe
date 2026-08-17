"use strict";

/* EsProfe — fixed visual diagrams for stem-changing verb groups. */
(function () {
  const diagramByVerb = {
    pensar: "data/stem-diagrams/e-ie.svg",
    poder: "data/stem-diagrams/o-ue.svg",
    pedir: "data/stem-diagrams/e-i.svg"
  };

  window.renderStemDiagram = function renderStemDiagram(lesson) {
    const src = diagramByVerb[lesson.verb];
    if (!src) return "";

    return `
      <div class="stem-diagram-image-wrap">
        <img
          class="stem-diagram-image"
          src="${src}"
          alt="${lesson.verb} — ${lesson.rootVowel} → ${lesson.changedVowel}"
          loading="eager"
        >
      </div>
    `;
  };
})();
