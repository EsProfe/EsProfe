# Changelog
## [v0.5.5] - 2026-08-17

### Fixed

- Corrected the stem-changing diagram to use exactly two columns: singular and plural.
- Removed the extra separate 1st/2nd/3rd-person label column that was causing the diagram to differ from the approved scheme.
- Kept the three person rows inside the six conjugation cells themselves.
- Corrected the boot outline so it surrounds exactly `yo`, `tú`, `él/ella/usted` and `ellos/ellas/ustedes`.
- Kept `nosotros` and `vosotros` outside the boot.
- Kept the green root-vowel highlighting and green arrows to the infinitive.
- Kept all conjugated forms intact and left the rest of Grammar unchanged.

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
