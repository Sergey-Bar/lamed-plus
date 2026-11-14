# Contributing to LAMED+

LAMED+ is an offline-first Israeli driving theory learning product. All lesson and question content lives in this repository as static JSON. The learning core needs **no server, no database and no account**; an optional Supabase project adds cross-device sync and opt-in analytics, and the app is fully usable without it (see the README).

## Ways to contribute

### 1. Submit questions (community recall)
1. Open a [new question Issue](../../issues/new/choose) using the **Question submission** template.
2. Provide the question text (in any language — canonical Hebrew is preferred), the options, the correct answer, and (if applicable) a sign/scenario image.
3. Maintainers verify the content against official Ministry materials, then add it to the official bank under `data/bank/` via a PR.

### 2. Translate questions
A published question must include every language required by its category: **he, en, ru and ar** for B, A, C, C1, BUS and TRACTOR; **he, en, ar, fr and es** for A3. The build fails otherwise. If you can translate, pick a partial question from the bank and open a PR adding the missing translations.

### 3. Fix or verify exam numbers
Questions must come from the official Ministry bank (`source: "official"`). `npm run validate:data` rejects any authored or community question, and the runtime loader skips anything that is not official and published, so a bad file cannot reach a learner.

The `questionCount`, `passThreshold`, and `timeMinutes` values in `data/categories/*.json` follow the Ministry of Transport's description of the theory test: 30 multiple-choice questions, 40 minutes, 26 correct answers to pass, for every licence class. If the Ministry changes the format, update all seven files together and adjust `src/lib/content/exam-format.test.ts`, which locks the structure (see `data/README.md`).

### 4. Code & design
This is a Vite + React + TypeScript + Tailwind + PWA app. See the README for the architecture. Run `npm run build` (includes data validation), `npm run lint`, and `npm test` before submitting.

## Rules
- **Do not copy** competitor question banks. Author from official/public Ministry materials and community recall.
- Attribute sources where possible. Community PRs are reviewed and credited.
- Keep content accurate; wrong answers mislead learners.
- Keep the learning core usable. Advertising is limited to clearly labelled placements outside active exams, with no tracking, and must never interrupt a lesson or an exam.

## PR checklist
- `npm run validate:data` passes.
- `npm run build`, `npm run lint`, `npm test` all pass.
- Every published question has all translations required by its category.
- Assets referenced by image questions exist under `public/assets/`.
