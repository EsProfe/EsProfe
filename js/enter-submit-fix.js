"use strict";

// Reliable keyboard submission for all EsProfe answer fields.
// Uses capture phase so Enter still works even if another handler stops propagation.
(function () {
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" || event.isComposing) return;

    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;

    if (target.id === "gpAnswer") {
      event.preventDefault();
      event.stopImmediatePropagation();
      const check = document.getElementById("gpCheck");
      if (check && !check.disabled) check.click();
      return;
    }

    if (target.id === "answer") {
      event.preventDefault();
      event.stopImmediatePropagation();
      const check = document.getElementById("checkAnswer");
      if (check && !check.disabled) check.click();
      return;
    }

    if (target.id === "testAnswer") {
      event.preventDefault();
      event.stopImmediatePropagation();
      const check = document.getElementById("testCheck");
      if (check && !check.disabled) check.click();
    }
  }, true);
})();
