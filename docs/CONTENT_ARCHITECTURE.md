# Architecture of EsProfe content and accounts

## One learning core, two learner experiences

Every lesson is stored once in a level catalogue and lesson JSON. It can appear in several navigation routes without copying its content.

- **Free Learning** gives open access to published lessons, topics and search.
- **My Course** uses the same lessons and adds an account, history, recommendations, review and a guided route.

A learner's progress is always associated with `level + lessonId`. Stable lesson IDs must never be renamed after publication.

## Content contract

A new level has one catalogue: `data/a2-catalog.json`, `data/b1-catalog.json` or `data/b2-catalog.json`. A published lesson entry includes:

- stable `id`, `status` and lesson `file`;
- four localised card labels: `ru`, `uk`, `en`, `es`;
- thematic metadata: tracks, topic, subtopic, content type and tags;
- search terms in Spanish and the four interface languages.

The universal platform configuration lives in `data/course-structure.json`.
`js/course-catalog.js` is a read-only adapter for thematic routes and search. It does not replace the stable A1 loader.

## Navigation model

A single lesson may be reached from:

1. its CEFR route (A1 → A2 → B1 → B2);
2. Verbs;
3. Grammar;
4. Vocabulary;
5. Communication;
6. Skills;
7. Exams.

This is alternative navigation, not duplicated material.

## Account-ready data model

The future server stores separate entities:

- **Student profile:** `studentId`, display name, email, language, current level, goals;
- **Consent:** newsletter, product updates and analytics — each voluntary and revocable;
- **Progress:** student, level, lesson ID, attempts, score, weak spots and timestamp;
- **Subscription:** plan and access status, independent of registration.

Until account sync is released, the browser retains local progress. The later migration maps it to the same stable lesson IDs.

## Monetisation boundary

Payments are deliberately not connected now. Future paid services can include teacher feedback, speaking practice, advanced analytics, structured exam preparation and premium learning plans. Basic lesson files remain shared and are never forked per tariff.

## Required checks for every new level

- JSON parses correctly;
- every lesson ID is unique and stable;
- all four interface labels are present;
- every published lesson has search metadata;
- a lesson works from its level route and any thematic route;
- progress remains keyed by its level and lesson ID.
