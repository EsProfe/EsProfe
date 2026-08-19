"use strict";

// Grammar navigation: Presente has three separate verb-group tabs.
(function () {
  const presentLabels = { ru: "Presente", uk: "Presente", en: "Presente", es: "Presente" };

  function applyGrammarNavigation() {
    const lang = document.getElementById("language")?.value || "ru";
    const presentButton = document.querySelector('.subtopic-chip[data-subtopic="presente"] strong');
    if (presentButton) presentButton.textContent = presentLabels[lang] || presentLabels.ru;
  }

  document.addEventListener("DOMContentLoaded", applyGrammarNavigation);
  document.addEventListener("esprofe:languageChanged", applyGrammarNavigation);
  document.addEventListener("esprofe:subtopic", () => setTimeout(applyGrammarNavigation, 0));
})();
