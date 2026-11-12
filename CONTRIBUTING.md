# Contributing to LAMED+

LAMED+ is an offline-first Israeli driving theory learning product. All content lives in this repository as static JSON — **no server, no database, no accounts**.

## Ways to contribute

### 1. Submit questions (community recall)
1. Open a [new question Issue](https://github.com/your-org/lamed-plus/issues/new/choose) using the **Question submission** template.
2. Provide the question text (in any language — canonical Hebrew is preferred), the options, the correct answer, and (if applicable) a sign/scenario image.
3. Maintainers verify the content against official Ministry materials, then add it to `data/questions/<category>/<topic>.json` via a PR.

### 2. Translate questions
A published question must include every language required by its category: **he, en, ru and ar** for B, A, C, C1, BUS and TRACTOR; **he, en, ar, fr and es** for A3. The build fails otherwise. If you can translate, pick a partial question from the bank and open a PR adding the missing translations.

### 3. Fix or verify exam numbers
The `questionCount`, `passThreshold`, and `timeMinutes` values in `data/categories/*.json` are placeholders. If you know the **current** Israeli Ministry rules for a category, open a PR to update them (see `data/README.md`).

### 4. Code & design
This is a Vite + React + TypeScript + Tailwind + PWA app. See `README` (if present) or the plan for the architecture. Run `npm run build` (includes data validation), `npm run lint`, and `npm test` before submitting.

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
