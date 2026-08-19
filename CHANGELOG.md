# Changelog
## [v0.7.2] - 2026-08-19

### Added

- Added a shared learning workspace for Vocabulary, Listening and DELE / EOI.
- Added functional A1 vocabulary flashcards for everyday vocabulary.
- Added A1–B1 listening practice with transcript and comprehension questions.
- Added DELE / EOI section cards covering the main exam task types.
- Added RU / UK / EN / ES content for the new section workspace.
- Added responsive styling for the new learning sections.
- Kept static instructional images optional; they can be attached later without changing the lesson architecture.

### Architecture

- Vocabulary, Listening and Exams now use a common section workspace instead of separate ad-hoc pages.
- The workspace is opened from the existing subtopic navigation and can later be connected to full lesson → practice → assessment flows.
- Existing verb and grammar trainers remain isolated and unchanged.

## [v0.7.1] - 2026-08-18

### Added

- Connected the structured B1 curriculum to the Grammar interface.
- Added `B1 · маршрут` / localized B1 route entry to the Grammar submenu.
- Added `js/b1-curriculum.js` as a separate B1 curriculum UI layer.
- Added `css/b1-curriculum.css` for B1 module/topic cards and the lesson-flow display.
- B1 curriculum is loaded from `data/curriculum-b1.json` at runtime.
- Added localized B1 menu labels for RU, UK, EN and ES.
- Added a clear module → topic structure so individual B1 topics can be connected to lessons and trainers later without rewriting the grammar engine.

### Architecture

- Kept the existing `grammar.js` lessons and stem-changing trainer isolated.
- Kept the B1 curriculum data separate from UI code.
- Kept B1 UI separate from the existing grammar renderer.
- Static images remain supported as ordinary lesson assets.

## [v0.7.0] - 2026-08-18

### Added

- Added `data/curriculum-b1.json` as the first structured B1 curriculum map.
- Defined a common lesson flow: explanation → examples → practice → trainer → assessment → result → review.
- Added B1 module structure for grammar, vocabulary, skills and assessment.
- Added planned B1 topics for past tenses, future, conditional, imperative, pronouns, essential subjunctive, por/para, prepositions, comparisons, connectors and B1 skills.
- Added explicit weak-spots/review stage to the B1 learning route.

### Project direction

- B1 launch target: three weeks.
- Static instructional images are now treated as normal lesson assets; they do not need to be interactive.
- Existing functionality remains the base; the project is extended rather than rewritten.

## [v0.6.0] - 2026-08-17

### Changed

- Replaced the fragile HTML/CSS boot visualization with three fixed SVG lesson diagrams.
- Added one diagram per stem-changing group: `e → ie`, `o → ue`, and `e → i`.
- The selected diagram is displayed directly below the corresponding stem-change button.
- Kept the practice logic, six-question assessment, Enter key support and progress recording unchanged.
- Kept the two-column × three-row layout isolated to these visual diagrams only.
- The SVG diagrams scale proportionally instead of being rearranged by responsive CSS.
