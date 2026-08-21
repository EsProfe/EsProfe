# A1 audit — reusable EsProfe components

Branch: `feature/a1-curriculum-foundation`

## Reuse, do not replace

- `js/progress.js`: keep `localStorage` key `esprofe_progress_v1`, existing verb/test/grammar history, weak spots and progress events. Extend it with lesson-level records instead of creating a second progress store.
- `js/learning-route.js`: keep it as the dispatcher for the “Continue learning” action. Extend it to route into A1 lessons.
- `js/b1-lessons.js`: useful proof of the lesson-flow concept, but it is B1-specific and partly hard-coded. Reuse the concept, not the B1 implementation.
- `js/b1-curriculum.js`: useful proof of a route view. A1 gets its own data-driven route because A1 is now the primary course and includes grammar, vocabulary and skills, not only grammar.
- Existing grammar modules (`grammar.js`, `ser-estar-hay.js`, `articles-grammar.js`, `gender-number-grammar.js`, `adjectives-grammar.js`, `possessives-grammar.js`, `irregular-grammar.js`, `stem-diagram.js`) remain available for later A1 lessons. Do not duplicate their working logic.
- `js/section-workspace.js`: keep current vocabulary/listening/exam workspaces; later A1 lessons can reuse or migrate their content into the common lesson architecture.
- Existing RU / UK / EN / ES locale mechanism remains the interface language base.

## Gaps found

1. Existing progress routing was hard-coded to `Presente -AR`, so it could not lead a new learner through A1 from the beginning.
2. Existing grammar lesson files use several separate mini-architectures. They should be migrated gradually, not rewritten all at once.
3. The B1 lesson engine has only a shortened flow and Russian hard-coded UI strings; it is not suitable as the A1 foundation unchanged.
4. There was no shared A1 lesson engine for explanation → examples → practice → trainer → assessment → result → review.
5. There was no lesson-level progress structure compatible with a future Student ID/account.

## A1 foundation decision

The first A1 lesson uses a shared, data-driven architecture:

`curriculum-a1.json` → `a1-curriculum.js` → `a1-lessons.json` → `a1-lessons.js` → `progress.js`

Lesson progress is stored under:

`progress.lessons.A1[lessonId]`

This keeps the existing `localStorage` mechanism compatible while creating a clean migration path to:

`Student ID → level → lesson → result → weak spots → next step`.

## First reference lesson

`alphabet-pronunciation`

Full flow:

1. explanation
2. examples
3. practice
4. trainer
5. assessment
6. result
7. review

The lesson is multilingual, responsive, uses randomized question selection, records weak tags, and can use browser Spanish speech synthesis for pronunciation examples.
