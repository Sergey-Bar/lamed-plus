import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA = path.join(ROOT, 'data')
const PUBLIC = path.join(ROOT, 'public')

const CONTENT_LANGS = ['he', 'en', 'ru', 'ar', 'fr', 'es']
const UI_LANGS = ['he', 'en', 'ru', 'ar', 'fr', 'es']
const QUESTION_TYPES = ['single', 'multi', 'boolean', 'image']
const STATUSES = ['draft', 'reviewed', 'published']
const SOURCES = ['official', 'authored', 'community']

const errors = []
const fail = (message) => errors.push(message)

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (err) {
    fail(`${path.relative(ROOT, file)}: invalid JSON (${err.message})`)
    return null
  }
}

const walkJson = (dir, out = []) => {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      walkJson(full, out)
    } else if (entry.endsWith('.json') && !entry.startsWith('.')) {
      out.push(full)
    }
  }
  return out
}

// --- categories ---
const categoryFiles = walkJson(path.join(DATA, 'categories'))
const categories = new Map()
for (const file of categoryFiles) {
  const id = path.basename(file, '.json')
  const cfg = readJson(file)
  if (!cfg) continue
  const rel = path.relative(ROOT, file)
  if (cfg.id !== id) fail(`${rel}: id "${cfg.id}" does not match filename "${id}"`)
  if (categories.has(cfg.id)) fail(`duplicate category id "${cfg.id}"`)
  if (!Number.isInteger(cfg.questionCount) || cfg.questionCount <= 0)
    fail(`${rel}: questionCount must be a positive integer`)
  if (!Number.isInteger(cfg.passThreshold) || cfg.passThreshold <= 0)
    fail(`${rel}: passThreshold must be a positive integer`)
  if (cfg.passThreshold > cfg.questionCount)
    fail(`${rel}: passThreshold (${cfg.passThreshold}) exceeds questionCount (${cfg.questionCount})`)
  if (!Number.isInteger(cfg.timeMinutes) || cfg.timeMinutes <= 0)
    fail(`${rel}: timeMinutes must be a positive integer`)
  if (!Array.isArray(cfg.languages) || cfg.languages.length === 0)
    fail(`${rel}: languages must be a non-empty array`)
  for (const lang of cfg.languages) {
    if (!CONTENT_LANGS.includes(lang)) fail(`${rel}: unsupported language "${lang}"`)
  }
  if (typeof cfg.nameKey !== 'string' || cfg.nameKey.length === 0)
    fail(`${rel}: nameKey must be a non-empty string`)
  categories.set(cfg.id, cfg)
}

// --- topics ---
const topics = readJson(path.join(DATA, 'topics.json'))
const topicIds = new Map()
if (topics) {
  for (const topic of topics) {
    if (topicIds.has(topic.id)) fail(`topics.json: duplicate topic id "${topic.id}"`)
    topicIds.set(topic.id, topic)
    if (typeof topic.nameKey !== 'string' || !topic.nameKey)
      fail(`topics.json: topic "${topic.id}" missing nameKey`)
    if (!Array.isArray(topic.categories) || topic.categories.length === 0)
      fail(`topics.json: topic "${topic.id}" must list at least one category`)
    for (const cat of topic.categories) {
      if (!categories.has(cat))
        fail(`topics.json: topic "${topic.id}" references unknown category "${cat}"`)
    }
  }
}

// --- i18n ---
const i18nDir = path.join(DATA, 'i18n')
const catalogs = {}
let keySet = null
for (const lang of UI_LANGS) {
  const file = path.join(i18nDir, `${lang}.json`)
  if (!existsSync(file)) {
    fail(`i18n/${lang}.json is missing`)
    continue
  }
  const catalog = readJson(file)
  if (!catalog) continue
  const keys = Object.keys(catalog)
  if (keySet === null) {
    keySet = new Set(keys)
  } else {
    for (const key of keys) {
      if (!keySet.has(key)) fail(`i18n/${lang}.json has key not present in all catalogs: "${key}"`)
    }
    for (const key of keySet) {
      if (!(key in catalog)) fail(`i18n/${lang}.json is missing key "${key}"`)
    }
  }
  for (const [key, value] of Object.entries(catalog)) {
    if (typeof value !== 'string' || value.trim().length === 0)
      fail(`i18n/${lang}.json: key "${key}" must be a non-empty string`)
  }
  catalogs[lang] = catalog
}

// --- question bank ---
const bankFiles = walkJson(path.join(DATA, 'bank'))
const questionIds = new Set()
const perTopic = {}
const perCategory = Object.fromEntries([...categories.keys()].map((id) => [id, 0]))
const perCategoryPlayable = Object.fromEntries([...categories.keys()].map((id) => [id, 0]))
let questionsChecked = 0
let imageQuestions = 0
let officialQuestions = 0
let playableQuestions = 0

for (const file of bankFiles) {
  const rel = path.relative(ROOT, file)
  const items = readJson(file)
  if (!items) continue
  if (!Array.isArray(items)) {
    fail(`${rel}: expected an array of questions`)
    continue
  }
  for (const q of items) {
    questionsChecked++
    const where = `${rel}: question "${q.id}"`
    if (typeof q.id !== 'string' || !q.id) fail(`${where}: missing id`)
    if (q.id && questionIds.has(q.id)) fail(`duplicate question id "${q.id}"`)
    if (q.id) questionIds.add(q.id)

    if (!Array.isArray(q.categories) || q.categories.length === 0) {
      fail(`${where}: categories must be a non-empty array`)
    } else {
      for (const category of q.categories) {
        if (!categories.has(category)) fail(`${where}: unknown category "${category}"`)
      }
    }
    const topic = topicIds.get(q.topicId)
    if (!topic) fail(`${where}: unknown topicId "${q.topicId}"`)
    else if (Array.isArray(q.categories)) {
      for (const category of q.categories) {
        if (!topic.categories.includes(category))
          fail(`${where}: topic "${q.topicId}" does not apply to category "${category}"`)
      }
    }

    if (!QUESTION_TYPES.includes(q.type)) fail(`${where}: invalid type "${q.type}"`)
    if (!SOURCES.includes(q.source)) fail(`${where}: invalid source "${q.source}"`)
    if (!STATUSES.includes(q.status)) fail(`${where}: invalid status "${q.status}"`)
    if (!Number.isInteger(q.difficulty) || q.difficulty < 1 || q.difficulty > 5)
      fail(`${where}: difficulty must be an integer 1..5`)
    if (q.source === 'official') officialQuestions++
    if (q.type === 'image') imageQuestions++

    if (q.type === 'image') {
      if (typeof q.image !== 'string' || !q.image) {
        fail(`${where}: image type requires an image reference`)
      } else if (!existsSync(path.join(PUBLIC, q.image))) {
        fail(`${where}: referenced asset not found: public/${q.image}`)
      }
    } else if (q.image && !existsSync(path.join(PUBLIC, q.image))) {
      fail(`${where}: referenced asset not found: public/${q.image}`)
    }

    const translations = q.translations ?? {}
    if (!translations.he) fail(`${where}: missing canonical Hebrew translation`)

    if (q.status === 'published' && Array.isArray(q.categories)) {
      for (const category of q.categories) {
        const cfg = categories.get(category)
        for (const lang of cfg?.languages ?? []) {
          if (!translations[lang])
            fail(
              `${where}: published question missing "${lang}" translation required by category ${category}`,
            )
        }
      }
    }

    for (const [lang, tr] of Object.entries(translations)) {
      if (typeof tr.stem !== 'string' || !tr.stem.trim())
        fail(`${where} [${lang}]: stem must be a non-empty string`)
      if (!Array.isArray(tr.options) || tr.options.length < 2)
        fail(`${where} [${lang}]: options must contain at least two entries`)
      if (tr.options?.some((option) => typeof option !== 'string' || !option.trim()))
        fail(`${where} [${lang}]: every option must be a non-empty string`)
      if (tr.explanation !== undefined && typeof tr.explanation !== 'string')
        fail(`${where} [${lang}]: explanation must be a string when present`)
      if (!Array.isArray(tr.correctIndexes) || tr.correctIndexes.length === 0)
        fail(`${where} [${lang}]: correctIndexes must be a non-empty array`)
      for (const idx of tr.correctIndexes ?? []) {
        if (!Number.isInteger(idx) || idx < 0 || idx >= (tr.options?.length ?? 0))
          fail(`${where} [${lang}]: correctIndex ${idx} out of range`)
      }
      if (q.type === 'boolean') {
        if (tr.options?.length !== 2) fail(`${where} [${lang}]: boolean questions need 2 options`)
        if (tr.correctIndexes?.length !== 1)
          fail(`${where} [${lang}]: boolean questions need one correct index`)
      } else if (q.type === 'single' || q.type === 'image') {
        if (tr.correctIndexes?.length !== 1)
          fail(`${where} [${lang}]: ${q.type} questions need exactly one correct index`)
      } else if (q.type === 'multi') {
        if ((tr.correctIndexes?.length ?? 0) < 2)
          fail(`${where} [${lang}]: multi questions need at least two correct indexes`)
      }
    }

    perTopic[q.topicId] = (perTopic[q.topicId] ?? 0) + 1
    for (const category of q.categories ?? []) {
      if (category in perCategory) perCategory[category]++
    }

    const playable = q.status === 'published' && (q.type !== 'image' || Boolean(q.image))
    if (playable) {
      playableQuestions++
      for (const category of q.categories ?? []) {
        if (category in perCategoryPlayable) perCategoryPlayable[category]++
      }
    }
  }
}

// --- report ---
console.log('--- LAMED+ data validation ---')
console.log(`Categories:       ${categories.size}`)
console.log(`Topics:           ${topics ? topics.length : 0}`)
console.log(`Bank files:       ${bankFiles.length}`)
console.log(`Questions:        ${questionsChecked}`)
console.log(`Official:         ${officialQuestions}`)
console.log(`Image questions:  ${imageQuestions}`)
console.log(`i18n catalogs:    ${Object.keys(catalogs).join(', ')}`)
console.log('By topic:', perTopic)
console.log('By category:', perCategory)

if (errors.length > 0) {
  console.log(`\n${errors.length} error(s):`)
  for (const error of errors) console.log(`  ✗ ${error}`)
  process.exit(1)
}

writeFileSync(
  path.join(DATA, 'bank-manifest.json'),
  `${JSON.stringify({ totalQuestions: playableQuestions, byCategory: perCategoryPlayable }, null, 2)}\n`,
)

console.log(`\nPlayable questions: ${playableQuestions}`)
console.log('Wrote data/bank-manifest.json')
console.log('All data valid ✓')
