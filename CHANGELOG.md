# Changelog
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

## [v0.5.5] - 2026-08-17

### Fixed

- Corrected the stem-changing diagram to use exactly two columns: singular and plural.
- Removed the extra separate 1st/2nd/3rd-person label column that was causing the diagram to differ from the approved scheme.
- Kept the three person rows inside the six conjugation cells themselves.
- Corrected the boot outline so it surrounds exactly `yo`, `tú`, `él/ella/usted` and `ellos/ellas/ustedes`.
- Kept `nosotros` and `vosotros` outside the boot.
- Kept the green root-vowel highlighting and green arrows to the infinitive.
- Kept all conjugated forms intact and left the rest of Grammar unchanged.
