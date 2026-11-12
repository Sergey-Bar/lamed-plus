/**
 * Import the official Israeli Ministry of Transport theory question bank.
 *
 * Source: data.gov.il open-data RSS/XML exports (Hebrew, English, Arabic, Russian).
 * Images: the legacy tqpic.mot.gov.il host is dead; the same assets are served by
 * www.gov.il under BlobFolder/generalpage/tq_pic_01|02.
 *
 * Usage:
 *   node scripts/import-official.mjs            # use cached XML, download images
 *   node scripts/import-official.mjs --refresh  # re-download XML and images
 *   node scripts/import-official.mjs --no-images
 */

import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = path.join(ROOT, '.cache', 'official')
const XML_DIR = path.join(CACHE, 'xml')
const IMAGE_DIR = path.join(ROOT, 'public', 'assets', 'official')
const BANK_DIR = path.join(ROOT, 'data', 'bank')
const META_FILE = path.join(ROOT, 'data', 'official-meta.json')

const REFRESH = process.argv.includes('--refresh')
const SKIP_IMAGES = process.argv.includes('--no-images')
const CHUNK_SIZE = 200
const IMAGE_CONCURRENCY = 6

const SOURCES = {
  he: 'https://data.gov.il/dataset/618dd157-8df3-43e7-bf9a-00974b4919e9/resource/8c0f314f-583d-48b6-9f5f-4483d95f6848/download/theoryexamhe-data.xml',
  en: 'https://data.gov.il/dataset/98e9fc82-6035-4f6c-9160-ed7d254da78f/resource/93319b59-3ffd-424e-9e76-e938a3aa0cd6/download/theoryexamen_data_yellow.xml',
  ar: 'https://data.gov.il/dataset/5f5341c0-db5f-4f1a-b647-e27c0f6b2d90/resource/eee39927-cb2c-48ee-b688-84856785bfaa/download/theoryexamar_data_yellow.xml',
  ru: 'https://data.gov.il/dataset/606c6ab9-a46e-401b-85d0-1d6167a93720/resource/015277d8-e3d7-4de0-b62b-d3e7eb1fea03/download/theoryexamru_data_yellow.xml',
}

const TOPIC_BY_CATEGORY = new Map([
  ['חוקי התנועה', 'laws'],
  ['תמרורים', 'signs'],
  ['בטיחות', 'safety'],
  ['הכרת הרכב', 'vehicle'],
  ['Rules and Regulations', 'laws'],
  ['Traffic Signs', 'signs'],
  ['Safety', 'safety'],
  ['Know Your Vehicle', 'vehicle'],
  ['قوانين المرور', 'laws'],
  ['إشارات المرور', 'signs'],
  ['السلامة على الطرق', 'safety'],
  ['معرفة المركبة', 'vehicle'],
  ['Правила', 'laws'],
  ['Знаки и Разметка', 'signs'],
  ['Безопасность', 'safety'],
  ['Элементы Конструкции T.C', 'vehicle'],
])

// Official licence-class tag → app category id.
const CLASS_BY_TAG = new Map([
  ['B', 'B'],
  ['В', 'B'], // Cyrillic Ve is used by the official export for private car.
  ['A', 'A'],
  ['C1', 'C1'],
  ['C', 'C'],
  ['D', 'BUS'],
  ['1', 'TRACTOR'],
])

const CATEGORY_ORDER = ['B', 'A', 'C1', 'C', 'BUS', 'TRACTOR']

const decodeEntities = (value) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')

const clean = (value) =>
  decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()

function parseItems(xml) {
  const items = []
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const body = match[1]
    const rawTitle = (body.match(/<title>([\s\S]*?)<\/title>/) || [])[1] ?? ''
    const title = clean(rawTitle)
    const numberMatch = title.match(/^\s*(\d{1,5})\.\s*/)
    if (!numberMatch) continue
    const number = String(Number(numberMatch[1])).padStart(4, '0')
    const stem = title.slice(numberMatch[0].length).trim()

    const rawCategory = (body.match(/<category>([\s\S]*?)<\/category>/) || [])[1] ?? ''
    const category = clean(rawCategory)
    const topicId = TOPIC_BY_CATEGORY.get(category)
    if (!topicId) continue

    const description = (body.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || [])[1] ?? ''

    const options = []
    let correctIndex = -1
    for (const li of description.matchAll(/<li>([\s\S]*?)<\/li>/g)) {
      const liBody = li[1]
      const text = clean(liBody)
      if (!text) continue
      if (/id=["']correctAnswer\d+["']/.test(liBody)) correctIndex = options.length
      options.push(text)
    }
    if (options.length < 2 || correctIndex < 0) continue

    const imageMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i)
    let imageName = ''
    if (imageMatch) {
      const fileName = imageMatch[1].split('/').pop() ?? ''
      if (/\.(jpe?g|png|gif|webp)$/i.test(fileName)) imageName = fileName
    }

    const tagMatch = description.match(/float:\s*left;?[^>]*>\|([\s\S]*?)<\/span>/i)
    const tags = tagMatch
      ? [...tagMatch[1].matchAll(/«([^»]+)»/g)].map((m) => m[1].trim())
      : []

    items.push({ number, stem, category, topicId, options, correctIndex, imageName, tags })
  }
  return items
}

function imageFolder(name) {
  const numeric = Number.parseInt(name.replace(/\D/g, ''), 10)
  if (Number.isFinite(numeric) && numeric >= 3974 && numeric < 5000) return 'tq_pic_03'
  if (Number.isFinite(numeric) && numeric >= 3500 && numeric < 3974) return 'tq_pic_02'
  return 'tq_pic_01'
}

async function download(url, file) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
      Referer: 'https://www.gov.il/',
    },
  })
  if (!response.ok) return false
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 512) return false
  await writeFile(file, buffer)
  return true
}

async function ensureXml(lang) {
  await mkdir(XML_DIR, { recursive: true })
  const file = path.join(XML_DIR, `${lang}.xml`)
  if (existsSync(file) && !REFRESH) return readFile(file, 'utf8')
  console.log(`↓ downloading ${lang}.xml`)
  const response = await fetch(SOURCES[lang], {
    headers: { 'User-Agent': 'LAMED+ importer (offline exam prep)' },
  })
  if (!response.ok) throw new Error(`${lang}.xml: HTTP ${response.status}`)
  const text = await response.text()
  await writeFile(file, text, 'utf8')
  return text
}

async function downloadImages(names) {
  if (SKIP_IMAGES) return new Map()
  await mkdir(IMAGE_DIR, { recursive: true })
  const resolved = new Map()
  const queue = [...names]
  let done = 0
  let failed = 0

  async function worker() {
    while (queue.length > 0) {
      const name = queue.shift()
      if (!name) return
      const target = path.join(IMAGE_DIR, name)
      if (existsSync(target) && !REFRESH) {
        resolved.set(name, name)
        done++
        continue
      }
      const primary = imageFolder(name)
      const folders = [primary, ...['tq_pic_01', 'tq_pic_02', 'tq_pic_03'].filter((f) => f !== primary)]
      let ok = false
      for (const folder of folders) {
        const url = `https://www.gov.il/BlobFolder/generalpage/${folder}/he/TQ_PIC_${name}`
        try {
          if (await download(url, target)) {
            ok = true
            break
          }
        } catch {
          // try the next mirror
        }
      }
      if (ok) {
        resolved.set(name, name)
        done++
      } else {
        failed++
        console.warn(`  ! image missing: ${name}`)
      }
      if ((done + failed) % 50 === 0) {
        console.log(`  images ${done + failed}/${names.length} (${failed} missing)`)
      }
    }
  }

  await Promise.all(Array.from({ length: IMAGE_CONCURRENCY }, () => worker()))
  console.log(`Images: ${done} ready, ${failed} missing`)
  return resolved
}

async function main() {
  console.log('LAMED+ — official bank importer')
  const byLang = {}
  for (const lang of Object.keys(SOURCES)) {
    const xml = await ensureXml(lang)
    byLang[lang] = parseItems(xml)
    console.log(`${lang}: ${byLang[lang].length} items`)
  }

  // Index each language by question number.
  const indexes = {}
  for (const [lang, items] of Object.entries(byLang)) {
    const map = new Map()
    for (const item of items) {
      if (!map.has(item.number)) map.set(item.number, item)
    }
    indexes[lang] = map
  }

  const allNumbers = new Set(Object.values(indexes).flatMap((map) => [...map.keys()]))
  const imageNames = new Set()
  for (const map of Object.values(indexes)) {
    for (const item of map.values()) if (item.imageName) imageNames.add(item.imageName)
  }
  console.log(`Unique questions: ${allNumbers.size}; unique images: ${imageNames.size}`)

  const imageResolution = await downloadImages([...imageNames])

  const questions = []
  let skippedIncomplete = 0
  let skippedImage = 0
  const perTopic = { laws: 0, signs: 0, safety: 0, vehicle: 0 }
  const perCategory = Object.fromEntries(CATEGORY_ORDER.map((id) => [id, 0]))

  for (const number of [...allNumbers].sort()) {
    const he = indexes.he.get(number)
    const en = indexes.en.get(number)
    const ar = indexes.ar.get(number)
    const ru = indexes.ru.get(number)
    if (!he || !en || !ar || !ru) {
      skippedIncomplete++
      continue
    }

    const categories = new Set()
    for (const item of [he, en, ar, ru]) {
      for (const tag of item.tags) {
        const category = CLASS_BY_TAG.get(tag)
        if (category) categories.add(category)
      }
    }
    if (categories.size === 0) categories.add('B')

    const imageName = [he, en, ar, ru].map((x) => x.imageName).find(Boolean) ?? ''
    const hasImage = imageName && imageResolution.has(imageName)
    if (imageName && !hasImage) {
      skippedImage++
      continue
    }

    const translations = {}
    for (const [lang, item] of Object.entries({ he, en, ar, ru })) {
      const explanation = ''
      translations[lang] = {
        stem: item.stem,
        options: item.options,
        correctIndexes: [item.correctIndex],
        explanation,
      }
    }

    // Keep only consistent four-option questions. The official exam is always 4-way single choice.
    const fourOptions = Object.values(translations).every(
      (tr) => tr.options.length === 4 && tr.correctIndexes.length === 1,
    )
    if (!fourOptions) continue

    const question = {
      id: `q${number}`,
      number,
      topicId: he.topicId,
      categories: CATEGORY_ORDER.filter((id) => categories.has(id)),
      type: hasImage ? 'image' : 'single',
      ...(hasImage ? { image: `assets/official/${imageName}` } : {}),
      difficulty: 2,
      source: 'official',
      status: 'published',
      translations,
    }
    questions.push(question)
    perTopic[he.topicId]++
    for (const category of question.categories) perCategory[category]++
  }

  console.log(
    `Merged: ${questions.length} questions (${skippedIncomplete} missing a translation, ${skippedImage} missing images)`,
  )
  console.log('By topic:', perTopic)
  console.log('By category:', perCategory)

  // Write the bank, chunked by topic.
  await rm(BANK_DIR, { recursive: true, force: true })
  await mkdir(BANK_DIR, { recursive: true })
  const files = []
  for (const topicId of Object.keys(perTopic)) {
    const topicQuestions = questions.filter((q) => q.topicId === topicId)
    const chunks = Math.max(1, Math.ceil(topicQuestions.length / CHUNK_SIZE))
    for (let i = 0; i < chunks; i++) {
      const slice = topicQuestions.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      if (slice.length === 0) continue
      const name = `${topicId}-${String(i + 1).padStart(2, '0')}.json`
      await writeFile(path.join(BANK_DIR, name), `${JSON.stringify(slice)}\n`, 'utf8')
      files.push(name)
    }
  }

  const meta = {
    source: 'Israel Ministry of Transport and Road Safety — official theory question bank',
    portal: 'https://data.gov.il',
    importedAt: new Date().toISOString(),
    questionCount: questions.length,
    imageQuestionCount: questions.filter((q) => q.type === 'image').length,
    imageCount: imageResolution.size,
    topics: perTopic,
    categories: perCategory,
    files,
    checksum: createHash('sha256')
      .update(questions.map((q) => q.id).join(','))
      .digest('hex')
      .slice(0, 16),
  }
  await writeFile(META_FILE, `${JSON.stringify(meta, null, 2)}\n`, 'utf8')

  // Drop now-unused legacy authored bank folders.
  for (const legacy of ['A', 'B']) {
    const dir = path.join(ROOT, 'data', 'questions', legacy)
    if (existsSync(dir)) await rm(dir, { recursive: true, force: true })
  }
  const legacyRoot = path.join(ROOT, 'data', 'questions')
  if (existsSync(legacyRoot) && (await readdir(legacyRoot)).length === 0) {
    await rm(legacyRoot, { recursive: true, force: true })
  }

  console.log(`Wrote ${files.length} bank files and data/official-meta.json`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
