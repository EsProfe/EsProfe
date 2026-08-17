# Changelog
## [v0.5.3] - 2026-08-17

### Fixed

- Rebuilt the stem-changing diagram layout using a dedicated `css/stem-diagram.css` file instead of changing the global grammar layout.
- Fixed the infinitive so it renders as one intact word (`pensar`) with only the root vowel highlighted green.
- Fixed the conjugated forms so `pienso`, `piensas`, `piensa`, `pensamos`, `pensáis` and `piensan` remain intact words.
- Replaced the previous CSS boot outline with a dedicated SVG outline to keep the boot shape stable at different sizes.
- Kept the 2-column × 3-row structure limited to the stem-changing diagram.
- Kept the existing lesson and practice logic unchanged.

## [v0.5.2] - 2026-08-14

### Changed

- Extracted the stem-changing conjugation diagram into a dedicated `js/stem-diagram.js` component.
- Kept stem-changing lesson data and training logic in `js/irregular-grammar.js` while separating presentation from lesson behavior.
- Reworked the diagram markup so each conjugated form is rendered as one intact word instead of splitting the root and ending into separate lines.
- Scoped the diagram typography and responsive sizing to the stem-changing component.
- Kept the rest of the grammar section unchanged; the 2-column × 3-row layout applies only to the stem-changing diagram.
- Kept Enter key support and the existing three stem-change patterns compatible with the previous version.

## [v0.5.1] - 2026-08-14

### Changed

- Reworked the stem-changing verb visualization into the agreed 2-column × 3-row structure: singular/plural columns and first/second/third person rows.
- The four changing forms are grouped visually: yo, tú, él/ella/usted and ellos/ellas/ustedes.
- Nosotros and vosotros remain outside the boot group.
- Highlighted the unchanged root vowel in nosotros and vosotros in green.
- Added green arrows connecting the root vowel in nosotros/vosotros with the same vowel in the infinitive.
- Added the explanatory note that the root vowel in nosotros and vosotros remains the same as in the infinitive.
- Added the note that present-tense endings remain regular.
- Kept the lesson logic, three stem-change patterns and six-question practice mode compatible with the previous version.

## [v0.5.0] - 2026-08-14

### Added

- Added a dedicated grammar lesson for stem-changing verbs.
- Added the three first stem-change patterns: e → ie, o → ue, e → i.
- Added examples: pensar, poder and pedir.
- Added a compact visual "boot" layout that groups the four changing forms and keeps nosotros/vosotros separate.
- Added interactive switching between the three stem-change patterns.
- Added a six-question practice mode with Enter key support.
- Added a result screen for the stem-changing verb lesson.
- Added multilingual lesson text for Russian, Ukrainian, English and Spanish.

### Design

- The temporary boot visualization is implemented in HTML/CSS so the final approved illustration can be inserted later without changing the lesson logic.

## [v0.4.2] - 2026-08-14

### Fixed

- Fixed localization of the test result buttons when switching interface languages.
- Fixed `translator.js` so `testAgain` and `backToTraining` are handled consistently.
- Removed obsolete and malformed test-button localization code from `translator.js`.
- Ensured the test check button uses the localized `check` value.

## [v0.4.0] - 2026-08-10

### Added

- Added a 10-question interactive test mode.
- Added random selection of verbs and grammatical persons for test questions.
- Added automatic answer checking in test mode.
- Added test progress display.
- Added final test score and percentage.
- Added the ability to restart the test.
- Added the ability to return from the test to regular training.
- Added Enter key support in test mode.
- Added test interface localization in Russian, Ukrainian, English and Spanish.

### Changed

- Extended `index.html` with test mode and test result sections.
- Updated `app.js` to support both regular training and test mode.
- Extended localization files with test-related messages.

### Backup

Created a backup of the working version:

`EsProfe_v0.4.0_test-mode.zip`
All significant changes to the EsProfe project are documented in this file.

## [v0.3.0] - 2026-08-10

### Added

- Expanded the verb database to 100 Spanish verbs.
- Added translations of verbs in Russian, Ukrainian, English and Spanish.
- Added interactive answer input.
- Added automatic conjugation checking.
- Added correct and incorrect answer statistics.
- Added Enter key support for checking answers.
- Added random person selection: yo, tú, él, nosotros, vosotros, ellos.
- Expanded interface localization to four languages.
- Added localized trainer messages.
- Added translator.js before app.js.

### Changed

- Updated index.html for the interactive trainer.
- Updated app.js.
- Updated translator.js.
- Updated localization files: ru.json, uk.json, en.json, es.json.

### Fixed

- Fixed verb translation when switching languages.
- Fixed localization loading before application startup.
- Fixed application initialization sequence.

### Backup

Created a backup of the working version:

EsProfe_v0.3.0_localization.zip
