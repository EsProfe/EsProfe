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
    if (presentButton) {
      const label = presentLabels[lang] || presentLabels.ru;
      if (presentButton.textContent !== label) presentButton.textContent = label;
    }

    const switcher = document.querySelector(".grammar-lesson-switch");
    if (!switcher) return;

    switcher.querySelectorAll("button[data-lesson]").forEach((button) => {
      const isPresent = button.dataset.lesson === "presente";
      const wantedText = isPresent ? "AR · ER · IR" : button.textContent;
      if (isPresent && button.textContent !== wantedText) button.textContent = wantedText;
      const wantedDisplay = isPresent ? "inline-flex" : "none";
      if (button.style.display !== wantedDisplay) button.style.display = wantedDisplay;
    });
  }

  document.addEventListener("DOMContentLoaded", applyGrammarNavigation);
  document.addEventListener("esprofe:languageChanged", applyGrammarNavigation);
  document.addEventListener("esprofe:subtopic", () => setTimeout(applyGrammarNavigation, 0));

  // Observe grammar rendering, but only react when the DOM actually changes.
  let scheduled = false;
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("grammarSection");
    if (!root) return;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        applyGrammarNavigation();
      });
    });
    observer.observe(root, { childList: true, subtree: true });
  });
})();
