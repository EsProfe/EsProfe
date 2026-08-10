# Changelog
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