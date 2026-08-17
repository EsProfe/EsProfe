# Changelog
## [v0.5.4] - 2026-08-17

### Fixed

- Finalized the stem-changing diagram to match the approved visual layout.
- Kept the diagram as a dedicated component and did not change the layout of the rest of the Grammar section.
- Added a clear singular/plural two-column structure with three person rows.
- Added separate person labels beside the three rows for readability.
- Kept the red boot outline around exactly the four stem-changing forms.
- Kept `nosotros` and `vosotros` outside the boot while highlighting their unchanged root vowel in green.
- Kept the two green arrows connected to the infinitive's root vowel.
- Kept all conjugated forms as intact words and preserved responsive sizing.

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
