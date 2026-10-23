"use strict";
(function () {
  function createCatalogClient({ level, catalogUrl, onCatalog } = {}) {
    if (!level || !catalogUrl) throw new Error("A catalog level and URL are required.");
    let catalogPromise = null;
    let lessonsPromise = null;
    const filePromises = new Map();

    async function json(url) {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(level + " catalog load failed: " + url);
      return response.json();
    }

    function catalog() {
      return catalogPromise || (catalogPromise = json(catalogUrl).then(data => {
        onCatalog?.(data);
        return data;
      }));
    }

    function file(url) {
      if (!filePromises.has(url)) filePromises.set(url, json(url));
      return filePromises.get(url);
    }

    async function entry(id) {
      const data = await catalog();
      return data.lessons?.[id] || null;
    }

    async function lessons() {
      if (lessonsPromise) return lessonsPromise;
      lessonsPromise = (async () => {
        const data = await catalog();
        const files = [...new Set(Object.values(data.lessons || {})
          .filter(item => item.status === "ready")
          .map(item => item.file))];
        const parts = await Promise.all(files.map(file));
        return Object.assign({}, ...parts);
      })();
      return lessonsPromise;
    }

    async function lesson(id) {
      const meta = await entry(id);
      if (!meta || meta.status !== "ready") return null;
      const data = await file(meta.file);
      const item = data?.[id] || null;
      if (item && !item.id) item.id = id;
      if (item && meta.illustration && !item.illustration) item.illustration = meta.illustration;
      return item;
    }

    async function ready(id) {
      return (await entry(id))?.status === "ready";
    }

    async function card(id, language = "ru") {
      const meta = await entry(id);
      return meta ? { icon: meta.icon || "📘", text: meta[language] || meta.ru || [id, ""] } : null;
    }

    async function moduleTitle(id, language = "ru", fallback = id) {
      const data = await catalog();
      return data.modules?.[id]?.[language] || data.modules?.[id]?.ru || fallback;
    }

    return { level, catalog, entry, lessons, lesson, ready, card, moduleTitle };
  }

  window.EsProfeCatalogLoader = { createCatalogClient };
})();
