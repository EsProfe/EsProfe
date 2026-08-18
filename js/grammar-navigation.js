"use strict";

// Grammar navigation: Presente covers AR, ER and IR in one lesson.
(function () {
  const presentLabels = {
    ru: "Presente · AR, ER, IR",
    uk: "Presente · AR, ER, IR",
    en: "Presente · AR, ER, IR",
    es: "Presente · AR, ER, IR"
  };

  function applyGrammarNavigation() {
    const lang = document.getElementById("language")?.value || "ru";
    const presentButton = document.querySelector('.subtopic-chip[data-subtopic="presente"] strong');
    if (presentButton) presentButton.textContent = presentLabels[lang] || presentLabels.ru;

    const switcher = document.querySelector(".grammar-lesson-switch");
    if (!switcher) return;

    const buttons = switcher.querySelectorAll("button[data-lesson]");
    buttons.forEach((button) => {
      if (button.dataset.lesson === "presente") {
        button.textContent = "AR · ER · IR";
        button.style.display = "inline-flex";
      } else {
        button.style.display = "none";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", applyGrammarNavigation);
  document.addEventListener("esprofe:languageChanged", applyGrammarNavigation);
  document.addEventListener("esprofe:subtopic", () => setTimeout(applyGrammarNavigation, 0));

  const observer = new MutationObserver(applyGrammarNavigation);
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("grammarSection");
    if (root) observer.observe(root, { childList: true, subtree: true });
  });
})();
