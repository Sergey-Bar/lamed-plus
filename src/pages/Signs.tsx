import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { getCategory } from '../lib/content/categories'
import { loadCategoryQuestions, isPlayable, translate } from '../lib/content/questions'
import { assetUrl } from '../lib/content/assets'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Icon } from '../components/Icon'
import type { Question } from '../lib/content/schema'

interface SignRow {
  image: string
  meaning: string
  number?: string
}

const PAGE = 42

export function Signs() {
  const { t, language } = useI18n()
  const { defaultCategory } = useProgress()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE)
  const [loadedCategory, setLoadedCategory] = useState<string | null>(null)
  const category = getCategory(defaultCategory)

  // Reset derived list state during render when the category changes instead
  // of syncing it inside an effect.
  if (loadedCategory !== defaultCategory) {
    setLoadedCategory(defaultCategory)
    setQuestions([])
    setLoading(true)
  }

  useEffect(() => {
    let cancelled = false
    void loadCategoryQuestions(defaultCategory).then((bank) => {
      if (cancelled) return
      setQuestions(bank.filter((question) => isPlayable(question) && question.image && question.topicId === 'signs'))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [defaultCategory])

  const signs = useMemo(() => {
    const seen = new Map<string, SignRow>()
    for (const question of questions) {
      if (!question.image || seen.has(question.image)) continue
      const tr = translate(question, language)
      if (!tr) continue
      const correct = tr.correctIndexes[0]
      const meaning = correct !== undefined ? tr.options[correct] : tr.stem
      seen.set(question.image, { image: question.image, meaning, number: question.number })
    }
    return [...seen.values()]
  }, [questions, language])

  const filtered = useMemo(() => {
    const needle = query.trim()
    if (!needle) return signs
    return signs.filter((sign) => sign.meaning.includes(needle) || sign.number?.includes(needle))
  }, [signs, query])

  return (
    <div className="animate-fade-in space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t('topic.signs')}</p>
          <h1 className="h1 mt-1.5">{t('signs.title')}</h1>
          <p className="legend mt-2 max-w-2xl">{t('signs.sub')}</p>
        </div>
        <span className="chip">
          <Icon name={category ? 'car' : 'seal'} className="h-3.5 w-3.5" />
          {category ? t(category.nameKey) : defaultCategory} · {signs.length}
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 sm:max-w-md">
          <span className="sr-only">{t('signs.search')}</span>
          <Icon name="search" className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setVisible(PAGE)
            }}
            placeholder={t('signs.search')}
            className="input ps-9"
            type="search"
          />
        </label>
        <Link to="/practice?topic=signs" className="btn-secondary px-3.5 py-2.5 text-xs font-semibold">
          {t('signs.practice')}
          <Icon name="arrow-forward" className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center border-dashed p-10 text-center">
          <Icon name="search" className="h-7 w-7 text-muted" />
          <p className="mt-3 font-bold text-ink">{t('signs.empty')}</p>
          <p className="mt-1 text-sm text-muted">{t('signs.emptySub')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {filtered.slice(0, visible).map((sign) => (
              <figure key={sign.image} className="card overflow-hidden">
                <div className="flex aspect-square items-center justify-center bg-white p-2">
                  <img
                    src={assetUrl(sign.image)}
                    alt={sign.meaning}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full w-auto object-contain"
                  />
                </div>
                <figcaption className="border-t border-line p-2.5">
                  <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-ink">{sign.meaning}</p>
                  {sign.number && <p className="tnum mt-0.5 text-[10px] text-muted">#{sign.number}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
          {visible < filtered.length && (
            <div className="text-center">
              <button type="button" onClick={() => setVisible((value) => value + PAGE)} className="btn-secondary px-4 py-2.5 text-sm">
                {t('common.more') ?? 'More'} ({filtered.length - visible})
              </button>
            </div>
          )}
        </>
      )}

      <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-2 p-3.5 text-[11px] leading-relaxed text-muted">
        <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {t('signs.source')}
      </p>
    </div>
  )
}

export default Signs
