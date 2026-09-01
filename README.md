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

The current catalog contains 27 ready lessons, including the complete six-lesson **Ser / estar / hay** module and the five-lesson **Regular present tense** module.

## Adding a ready A1 lesson

1. Add the lesson JSON using an ID already present in `data/curriculum-a1.json`.
2. Add one entry to `data/a1-catalog.json` with `file`, `status`, `icon` and four localized cards.
3. Run `node scripts/validate-a1.mjs`.

Do not add lesson-specific loaders, card activators, navigation interceptors or DOM observers. Optional lesson data such as pronunciation supplements or reference tables belongs inside the lesson JSON.

## Validation and publication

Before every publication:

```bash
node scripts/validate-a1.mjs
git diff --check
```

After the checks pass, commit and push to `main`, wait for GitHub Pages deployment, and test the published route before requesting user verification.

## Development rules

- Extend the existing platform; never rewrite it from scratch.
- Keep the four languages together: Spanish, English, Ukrainian and Russian.
- Preserve Free learning and sequential My course modes.
- Keep the interface readable, intuitive, visually consistent and attractive on desktop and mobile.
- Review learning content as both a Spanish-language specialist and a teacher: accurate forms, clear A1 explanations and purposeful exercises.
- Update `CHANGELOG.md`, `README.md` and `ROADMAP.md` at stable checkpoints.
- Keep a recoverable backup branch before architecture-level changes.

Repository: `EsProfe/EsProfe`
