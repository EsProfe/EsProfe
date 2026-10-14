"use strict";
(function () {
  const copy = {
    ru: { label: "Поиск", placeholder: "Поиск уроков, тем или слов...", empty: "Ничего не найдено", error: "Поиск недоступен. Попробуйте ещё раз." },
    uk: { label: "Пошук", placeholder: "Пошук уроків, тем або слів...", empty: "Нічого не знайдено", error: "Пошук недоступний. Спробуйте ще раз." },
    en: { label: "Search", placeholder: "Search lessons, topics or words...", empty: "No results found", error: "Search is unavailable. Please try again." },
    es: { label: "Buscar", placeholder: "Buscar lecciones, temas o palabras...", empty: "No se han encontrado resultados", error: "La búsqueda no está disponible. Inténtalo de nuevo." }
  };
  const language = () => document.getElementById("language")?.value || "ru";
  const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function init() {
    const input = document.getElementById("siteSearch"), box = document.getElementById("siteSearchResults");
    if (!input || !box) return;
    let timer, revision = 0;
    const text = () => copy[language()] || copy.ru;
    function labels() {
      input.placeholder = text().placeholder;
      const label = document.querySelector('label[for="siteSearch"]');
      if (label) label.textContent = text().label;
      input.setAttribute("aria-controls", box.id);
      input.setAttribute("aria-expanded", String(!box.hidden));
    }
    function close() {
      clearTimeout(timer); revision++; box.hidden = true;
      input.setAttribute("aria-expanded", "false");
    }
    async function render(query, version) {
      if (query.trim().length < 2) { close(); box.innerHTML = ""; return; }
      try {
        const results = await window.EsProfeCourseCatalog.search(query, { level: "A1" });
        if (version !== revision) return;
        box.innerHTML = results.length ? results.slice(0, 6).map(item => {
          const title = window.EsProfeCourseCatalog.localized(item.title, language());
          return `<button type="button" class="site-search-result" data-lesson="${esc(item.id)}"><strong>${esc(title[0])}</strong><small>${esc(title[1])}</small></button>`;
        }).join("") : `<div class="site-search-empty">${esc(text().empty)}</div>`;
        box.hidden = false; labels();
      } catch (error) {
        if (version !== revision) return;
        console.error("EsProfe search failed", error);
        box.innerHTML = `<div class="site-search-empty" role="status">${esc(text().error)}</div>`;
        box.hidden = false; labels();
      }
    }
    function search() {
      clearTimeout(timer); const version = ++revision;
      if (input.value.trim().length < 2) { close(); box.innerHTML = ""; return; }
      timer = setTimeout(() => render(input.value, version), 140);
    }
    async function open(id) {
      close(); input.value = "";
      // Open the shared lesson directly: no intermediate curriculum request or timed delay.
      try { await window.EsProfePlatform.openLesson(id); }
      catch (error) { console.error("EsProfe search navigation failed", error); }
    }
    input.addEventListener("input", search);
    input.addEventListener("keydown", event => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowDown" && !box.hidden) {
        event.preventDefault(); box.querySelector("[data-lesson]")?.focus();
      }
      if (event.key === "Enter" && !box.hidden) {
        const result = box.querySelector("[data-lesson]");
        if (result) { event.preventDefault(); open(result.dataset.lesson); }
      }
    });
    box.addEventListener("click", event => {
      const result = event.target.closest("[data-lesson]");
      if (result) open(result.dataset.lesson);
    });
    box.addEventListener("keydown", event => { if (event.key === "Escape") { close(); input.focus(); } });
    document.addEventListener("click", event => { if (!event.target.closest(".site-search")) close(); });
    document.addEventListener("esprofe:languageChanged", () => {
      labels(); if (!box.hidden) render(input.value, ++revision);
    });
    document.getElementById("language")?.addEventListener("change", labels);
    labels();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
