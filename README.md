# EsProfe

EsProfe is a multilingual platform for learning Spanish. The current development priority is a complete A1 route with a shared lesson cycle:

`explanation → examples → practice → trainer → assessment → result → review`

## Current A1 architecture

- `data/curriculum-a1.json` defines the full order of modules and topics.
- `data/a1-catalog.json` is the single registry of ready lessons, their source files, cards and RU / UK / EN / ES metadata.
- `js/a1-catalog.js` loads the catalog and lesson data.
- `js/a1-curriculum-v2.js` renders Free learning and My course routes.
- `js/a1-lessons-v2.js` runs every ready lesson through the shared learning cycle.
- `js/learning-progress.js` and the existing progress/profile modules store results and weak spots.
- The catalog also initializes the sequential lesson order, so new ready lessons appear in both routes without a separate progress-list edit.

The current catalog contains **81 ready A1 lessons**, **1311 questions** and **60 source files** (checked 2026-10-10). Catalog readiness records availability; it does not certify final manual teaching review or audio quality.

The catalog alone supplies the sequential progress order. Personal review uses the shared A1 engine and resolves saved weak spots; free learning cannot alter personal results. Assessment attempts remain in the existing `esprofe_progress_v1` store alongside the current result.

## Adding a ready A1 lesson

1. Add the lesson JSON using an ID already present in `data/curriculum-a1.json`.
2. Add one entry to `data/a1-catalog.json` with `file`, `status`, `icon` and four localized cards.
3. Run `node scripts/validate-a1.mjs`.

Do not add lesson-specific loaders, card activators, navigation interceptors or DOM observers. Optional lesson data such as pronunciation supplements or reference tables belongs inside the lesson JSON.

## Validation and publication

Before every publication:

```bash
node scripts/validate-a1.mjs
node --test scripts/a1-runtime.test.mjs
git diff --check
```

GitHub Pages runs the same validation and regression checks before deployment. After the checks pass, commit and push to `main`, wait for deployment, and test the published route at https://esprofe.es/ before requesting user verification.

## Development rules

- Extend the existing platform; never rewrite it from scratch.
- Keep the four languages together: Spanish, English, Ukrainian and Russian.
- Preserve Free learning and sequential My course modes.
- Keep the interface readable, intuitive, visually consistent and attractive on desktop and mobile.
- Review learning content as both a Spanish-language specialist and a teacher: accurate forms, clear A1 explanations and purposeful exercises.
- Update `CHANGELOG.md`, `README.md` and `ROADMAP.md` at stable checkpoints.
- Keep a recoverable backup branch before architecture-level changes.

Repository: `EsProfe/EsProfe`
