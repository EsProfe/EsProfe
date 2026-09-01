# Changelog
## [v0.12.0] - 2026-09-01

### Added

- Added eight complete A1 lessons for `tener`, `ir`, `hacer`, `venir`, `querer`, `poder`, `decir` and mixed irregular-present practice.
- Added 100 questions covering verb forms, stem changes, special `yo` forms and essential A1 structures.
- Added focused teaching for `tener que`, `ir a + infinitive`, `querer/poder + infinitive`, weather with `hacer`, movement with `venir` and reported content with `decir que`.

### Improved

- Extended the unified A1 catalog and sequential route to 35 ready lessons.
- Kept lesson explanations, examples, practice, assessment and weak-spot review synchronized across RU / UK / EN / ES.
- Restored an adaptive Spanish-labelled boot diagram for the stem-changing lessons `tener`, `venir`, `querer`, `poder` and `decir`.

## [v0.11.0] - 2026-09-01

### Added

- Added five complete A1 lessons for regular present-tense verbs: `-AR`, `-ER`, `-IR`, mixed-pattern practice and a final trainer.
- Added 66 questions with four-language teaching content, written-accent practice and contrasts between the three conjugation patterns.

### Improved

- Extended the unified A1 catalog and sequential route to 27 ready lessons.
- Preferred an available `es-ES` voice for A1 lesson audio, with fallback to another installed Spanish voice.

### Fixed

- Forced the pronunciation drill syllables `ca`, `co`, `cu` to be spoken as [ka], [ko], [ku].
- Restored visual completion of missing-letter words and automatic playback of the correct full word after every answer.

## [v0.10.0] - 2026-08-31

### Added

- Added six complete A1 lessons for **Ser / estar / hay**, each with four-language explanations, examples, practice, trainer, assessment, results and weak-spot review.
- Added focused lessons for the present-tense forms and basic uses of both `ser` and `estar`, an existence lesson for `hay`, and a final contrast lesson.
- Added 86 new A1 questions covering forms, written accents, identity, origin, profession, time, location, states, existence and the definite/indefinite contrast.

### Improved

- Made the visible A1 module list catalog-driven, so every module containing a ready lesson is rendered automatically.
- Made the sequential **My course** order derive from the same ready-lesson catalog used by Free learning.
- Expanded validation to check lesson order, next-lesson links, rule tags, question IDs and Unicode normalization.
- Reworded the **My course** description on the home page in all four languages.

### Fixed

- Corrected the countries lesson link to the first articles lesson.
- Added the missing pronunciation rule-tag map required for accurate weak-spot review.

## [v0.9.0] - 2026-08-31

### Fixed

- Repaired invalid JSON in the A1 Date and time lesson that prevented the unified loader from completing.
- Removed the duplicate `alphabet-pronunciation` data overlay that replaced the main lesson at runtime.
- Moved localized nationality options and number agreement explanations into their lesson source files.
- Corrected several A1 Spanish and Ukrainian teaching prompts found during the philological review.

### Architecture

- Upgraded `data/a1-catalog.json` to version 3: every ready lesson now has one catalog entry containing its file, status, icon and four localized card texts.
- Changed `js/a1-catalog.js` to load only the selected lesson file and fail explicitly on invalid data instead of silently assembling partial lessons.
- Moved pronunciation supplements and the countries reference into their owning lesson JSON files.
- Replaced the countries DOM observer/fetch patch with a renderer called directly by the shared A1 lesson engine.
- Added localized labels to the seven-stage lesson stepper inside the shared engine.
- Removed obsolete A1 loaders, card activators, navigation interceptors, data overlays and runtime patches.
- Added `scripts/validate-a1.mjs` as the pre-deployment gate for JSON/JavaScript syntax, catalog/route consistency, four-language content and question/answer integrity.

## [v0.8.0] - 2026-08-21

### Added

- Added `data/curriculum-a1.json` as the complete structured A1 curriculum map.
- Defined the A1 route from foundations and pronunciation through grammar, verbs, vocabulary, communication, skills and final assessment.
- Added a common lesson flow for every A1 topic: explanation → examples → practice → trainer → assessment → result → review.
- Added dedicated A1 modules for articles, pronouns, ser / estar / hay, regular and irregular present tense, reflexive verbs, adjectives, prepositions and core A1 constructions.
- Added A1 vocabulary, communication tasks, four language skills and a final weak-spots review stage.

### Project direction

- Development priority is now A1 first, then A2, then B1.
- Existing trainers and learning sections remain in place and will be connected progressively to the A1 curriculum instead of being rewritten.

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
