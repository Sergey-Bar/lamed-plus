# Data directory

All content is static JSON, bundled at build time. Nothing is fetched at runtime, so the app works offline after the first visit.

## Structure

- `bank/*.json` — the official question bank, split into 11 files. Each question stores its licence classes once in `categories: string[]`; there is no per-category duplication.
- `explanations.json` — authored explanations for core questions, keyed by question id, with Hebrew as the source language. Questions without an entry fall back to the authored lesson point.
- `official-meta.json` — provenance and import statistics for the main bank (source URL, import date, per-topic counts).
- `official-meta-a3.json` — provenance, format and skipped-item metadata for the separate A3 electric-bicycle feed.
- `categories/*.json` — the 7 licence categories and the exam format used by the app: 30 questions, 40 minutes, 26 correct answers to pass for every class, as described by the Ministry of Transport ([gov.il](https://www.gov.il/en/service/apply_for_new_driver_drivers_license)). `src/lib/content/exam-format.test.ts` locks these numbers; change the files and the test together if the Ministry changes the format.
- `topics.json` — topic taxonomy shared by every category, including A3.
- `i18n/{he,en,ru,ar,fr,es,ro,yi,am,pl,lad,ady}.json` — UI strings. Every catalog must share an identical key set; `npm run validate:data` enforces parity. `ady.json` currently mirrors Hebrew and is not offered in the interface language picker.

Ministry question images live outside `data/`, under `public/assets/official/*.jpg` (444 unique files; 599 image questions reference them). They are static public files, not bundled modules, so they load directly and are cached on demand by the service worker's runtime cache; the offline pack warms that cache in advance. Question records reference them by relative filename, e.g. `assets/official/3132.jpg`.

## Official source

Questions and images come from the Israeli Ministry of Transport and Road Safety open-data bank published on [data.gov.il](https://data.gov.il). The importer downloads the XML feed and the official images, merges duplicate question numbers across vehicle classes, and maps class tags as follows:

| Official tag | App category |
| --- | --- |
| `B` / `В` | `B` |
| `A` | `A` |
| `C1` | `C1` |
| `C` | `C` |
| `D` | `BUS` |
| `1` | `TRACTOR` |
| `ZMAHA` | dropped |

Run `node scripts/import-official.mjs` to rebuild the bank. The importer caches the XML under `.cache/official/`; delete that folder to force a fresh download. Images are fetched with a browser User-Agent because the Ministry host rejects some automated requests.

The current import contains **1,841 playable questions** (920 traffic law, 414 safety, 391 signs, 116 vehicle) and **599 image questions across 444 unique image files**. Two source questions were dropped from the main feed because they had no complete translation set. A3 is imported separately by `scripts/import-a3.py`; 18 image/sign items were skipped because they lacked a complete five-language translation set, leaving 40 complete A3 questions.

## Explanations

`explanations.json` is deliberately separate from the bank: the importer rewrites `bank/*.json` and would drop inline explanations. Each entry holds the languages it was authored in; the app reads the requested language, then English, then Hebrew, and tells the learner when the text is not in their language. `npm run validate:data` checks that every entry points at a real question and is non-empty.

## Question shape

```json
{
  "id": "q0001",
  "number": "0001",
  "topicId": "laws",
  "categories": ["B", "A", "C1", "C", "BUS", "TRACTOR"],
  "type": "single",
  "difficulty": 2,
  "source": "official",
  "status": "published",
  "translations": {
    "he": { "stem": "…", "options": ["…"], "correctIndexes": [2], "explanation": "" }
  }
}
```

- `type` is `single`, `multi`, `boolean` or `image`.
- The official bank has four options and exactly one correct answer per question. `explanation` is optional and empty in the official data.
- `image` questions must include an `image` filename to be playable.
- Only `published` questions appear in the app.

## Validation

`npm run validate:data` checks schema shape, category/topic references, answer indexes, image files, translation coverage per category (he/en/ru/ar for B, A, C, C1, BUS and TRACTOR; he/en/ar/fr/es for A3), i18n key parity across every catalog, the authored explanations and the official counts. It runs before every production build and as part of `npm run check`.

Official questions and images are public Ministry data. LAMED+ is an independent study aid and is not affiliated with the Ministry or the licensing authority; this disclaimer is shown in Settings.
