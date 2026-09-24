"use strict";
(function () {
  const STRUCTURE_URL = "data/course-structure.json?v=20260924-platform1";
  const CACHE = new Map();

  const A1_TRACKS = {
    verbs: new Set(["ser-present","ser-basic-uses","estar-present","estar-basic-uses","hay","ser-estar-hay","present-ar","present-er","present-ir","present-mixed-regular","present-regular-trainer","tener","ir","hacer","venir","querer","poder","decir","irregular-present-mixed","reflexive-pronouns","reflexive-present","daily-routine","reflexive-practice","ir-a-infinitive","tener-que","querer-infinitive","poder-infinitive"]),
    grammar: new Set(["definite-articles","indefinite-articles","noun-gender","noun-plural","article-noun-agreement","subject-pronouns","basic-word-order","negation-no","basic-questions","question-words","adjectives","adjective-agreement","possessives","demonstratives","comparisons-basic","prepositions-basic","location-prepositions","a-de-contractions","city-directions","gustar","encantar-interesar"]),
    vocabulary: new Set(["numbers","date-time","countries-nationalities","family","home","food-drinks","shopping","city-places","transport","daily-routine-vocab","jobs","weather-seasons","free-time"]),
    communication: new Set(["greetings-farewells","introductions-personal-data","introduce-yourself","ask-personal-info","order-food","shopping-dialogue","ask-directions","talk-routine","make-simple-plans"]),
    skills: new Set(["alphabet-pronunciation","reading","listening","writing","speaking"]),
    exams: new Set(["mixed-review","grammar-check","vocabulary-check","skills-check","final-test","weak-spots"])
  };

  function fetchJson(url) {
    if (!CACHE.has(url)) {
      CACHE.set(url, fetch(url, { cache: "no-store" }).then(r => {
        if (!r.ok) throw new Error("EsProfe catalog load failed: " + url);
        return r.json();
      }));
    }
    return CACHE.get(url);
  }

  async function structure() {
    return fetchJson(STRUCTURE_URL);
  }

  function localized(meta, language) {
    return meta?.[language] || meta?.ru || ["", ""];
  }

  function tracksFor(level, id) {
    if (level !== "A1") return ["route"];
    const tracks = ["route"];
    Object.entries(A1_TRACKS).forEach(([track, ids]) => {
      if (ids.has(id)) tracks.push(track);
    });
    return tracks;
  }

  async function levelCatalog(level) {
    const config = await structure();
    const source = config.catalogSources.find(item => item.level === level);
    if (!source || source.status !== "active") return { level, lessons: {} };
    return fetchJson(source.path);
  }

  async function lessons(level = "A1") {
    const catalog = await levelCatalog(level);
    return Object.entries(catalog.lessons || {}).map(([id, meta]) => ({
      id,
      level,
      status: meta.status,
      file: meta.file,
      icon: meta.icon || "📘",
      title: meta,
      tracks: tracksFor(level, id),
      contentType: A1_TRACKS.skills.has(id) ? "reading" : A1_TRACKS.exams.has(id) ? "assessment" : "lesson",
      search: { tags: [id, ...(tracksFor(level, id))] }
    }));
  }

  async function byTrack(track, level = "A1") {
    return (await lessons(level)).filter(item => item.tracks.includes(track));
  }

  function plain(value) {
    return String(value || "").toLocaleLowerCase();
  }

  async function search(query, filters = {}) {
    const value = plain(query).trim();
    if (value.length < 2) return [];
    const level = filters.level || "A1";
    const track = filters.track;
    const contentType = filters.contentType;
    return (await lessons(level)).filter(item => {
      if (track && !item.tracks.includes(track)) return false;
      if (contentType && item.contentType !== contentType) return false;
      const words = [
        item.id,
        ...item.tracks,
        ...Object.values(item.title || {}).flatMap(v => Array.isArray(v) ? v : [v]),
        ...(item.search?.tags || [])
      ].map(plain).join(" ");
      return words.includes(value);
    });
  }

  window.EsProfeCourseCatalog = {
    structure,
    levelCatalog,
    lessons,
    byTrack,
    search,
    localized
  };
})();
