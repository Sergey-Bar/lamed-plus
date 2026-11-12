import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { CATEGORIES, getCategory } from '../lib/content/categories'
import { isPlayable, loadCategoryQuestions, translate } from '../lib/content/questions'
import { assetUrl } from '../lib/content/assets'
import { answerIsCorrect } from '../lib/progress/engine'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Confetti } from '../components/Confetti'
import { Icon } from '../components/Icon'
import { QuestionRenderer } from '../components/QuestionRenderer'
import { CategoryMark } from '../components/CategoryMark'
import { ProgressRing } from '../components/ui/ProgressRing'
import { Dialog } from '../components/ui/Dialog'
import type { LanguageId, Question } from '../lib/content/schema'

type Phase = 'intro' | 'active' | 'result'

interface QuestionResult {
  question: Question
  selected: number[]
  correct: boolean
  correctIndexes: number[]
}

interface Result {
  score: number
  total: number
  passed: boolean
  threshold: number
  durationSec: number
  results: QuestionResult[]
}

interface Draft {
  category: string
  ids: string[]
  selections: number[][]
  flags: number[]
  index: number
  deadline: number
}

const DRAFT_KEY = 'theoria-exam-draft'

function shuffle<T>(items: T[]): T[] {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function readDraft(category?: string): Draft | null {
  if (!category) return null
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as Draft
    if (
      draft.category !== category ||
      !Array.isArray(draft.ids) ||
      draft.ids.length === 0 ||
      typeof draft.deadline !== 'number' ||
      draft.deadline <= Date.now()
    ) {
      return null
    }
    return draft
  } catch {
    return null
  }
}

export function Exam() {
  const { category: categoryId } = useParams<{ category: string }>()
  const { t, language } = useI18n()
  const { recordAnswer, finishExam, getReadyInfo } = useProgress()
  const category = categoryId ? getCategory(categoryId) : undefined

  const [phase, setPhase] = useState<Phase>('intro')
  const [available, setAvailable] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selections, setSelections] = useState<number[][]>([])
  const [flags, setFlags] = useState<Set<number>>(new Set())
  const [index, setIndex] = useState(0)
  const [deadline, setDeadline] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [ready, setReady] = useState<{
    recommended: boolean
    estimatedAccuracy: number
    sample: number
  } | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [burst, setBurst] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const submittedRef = useRef(false)
  const submitRef = useRef<() => void>(() => {})

  const totalSeconds = (category?.timeMinutes ?? 40) * 60

  useEffect(() => {
    if (!categoryId) return
    let cancelled = false
    setLoading(true)
    void loadCategoryQuestions(categoryId).then((all) => {
      if (cancelled) return
      setAvailable(all.filter(isPlayable))
      setDraft(readDraft(categoryId))
      setLoading(false)
    })
    void getReadyInfo(categoryId).then((info) => {
      if (!cancelled) setReady(info)
    })
    return () => {
      cancelled = true
    }
  }, [categoryId, getReadyInfo])

  useEffect(() => {
    if (phase !== 'result' || !result?.passed) return
    setBurst(true)
    const id = window.setTimeout(() => setBurst(false), 1700)
    return () => window.clearTimeout(id)
  }, [phase, result])

  useEffect(() => {
    if (phase !== 'active') return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [phase])

  useEffect(() => {
    if (phase !== 'active' || !categoryId || questions.length === 0) return
    const payload: Draft = {
      category: categoryId,
      ids: questions.map((question) => question.id),
      selections,
      flags: [...flags],
      index,
      deadline,
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
    } catch {
      // Draft autosave is best-effort.
    }
  }, [phase, categoryId, questions, selections, flags, index, deadline])

  useEffect(() => {
    if (phase !== 'active' || deadline === 0) return
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setTimeLeft(left)
      if (left <= 0) submitRef.current()
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [phase, deadline])

  const current = questions[index]
  const currentTr = current ? translate(current, language) : undefined
  const answeredCount = useMemo(
    () => selections.filter((selection) => selection.length > 0).length,
    [selections],
  )

  function begin() {
    if (!category || available.length < category.questionCount) return
    const sampled = shuffle(available).slice(0, category.questionCount)
    setQuestions(sampled)
    setSelections(sampled.map(() => []))
    setFlags(new Set())
    setIndex(0)
    const nextDeadline = Date.now() + category.timeMinutes * 60000
    setDeadline(nextDeadline)
    setTimeLeft(category.timeMinutes * 60)
    setResult(null)
    setShowReview(false)
    setPhase('active')
    submittedRef.current = false
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // Ignore storage failures.
    }
  }

  function resume() {
    if (!draft) return
    const mapped = draft.ids
      .map((id) => available.find((question) => question.id === id))
      .filter((question): question is Question => Boolean(question))
    if (mapped.length !== draft.ids.length) {
      discardDraft()
      return
    }
    setQuestions(mapped)
    setSelections(
      mapped.map((_, position) => draft.selections[position] ?? []),
    )
    setFlags(new Set(draft.flags))
    setIndex(Math.min(draft.index, mapped.length - 1))
    setDeadline(draft.deadline)
    setTimeLeft(Math.max(0, Math.ceil((draft.deadline - Date.now()) / 1000)))
    setResult(null)
    setShowReview(false)
    setPhase('active')
    submittedRef.current = false
  }

  function discardDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // Ignore storage failures.
    }
    setDraft(null)
  }

  function selectOption(optionIndex: number) {
    if (!current || !currentTr) return
    setSelections((previous) => {
      const next = [...previous]
      const currentSelection = next[index] ?? []
      if (current.type === 'multi') {
        next[index] = currentSelection.includes(optionIndex)
          ? currentSelection.filter((value) => value !== optionIndex)
          : [...currentSelection, optionIndex]
      } else {
        next[index] = [optionIndex]
      }
      return next
    })
  }

  function toggleFlag() {
    setFlags((previous) => {
      const next = new Set(previous)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function submit() {
    if (submittedRef.current || questions.length === 0 || !category) return
    submittedRef.current = true
    const questionResults: QuestionResult[] = questions.map((question, position) => {
      const translation = translate(question, 'he')
      const selection = selections[position] ?? []
      const correct = translation ? answerIsCorrect(translation.correctIndexes, selection) : false
      recordAnswer({
        category: category.id,
        topicId: question.topicId,
        questionId: question.id,
        correct,
        mode: 'exam',
      })
      return {
        question,
        selected: selection,
        correct,
        correctIndexes: translation?.correctIndexes ?? [],
      }
    })
    const score = questionResults.filter((entry) => entry.correct).length
    const passed = score >= category.passThreshold
    finishExam({
      category: category.id,
      score,
      total: questions.length,
      passed,
      durationSec: Math.max(0, totalSeconds - timeLeft),
    })
    setResult({
      score,
      total: questions.length,
      passed,
      threshold: category.passThreshold,
      durationSec: Math.max(0, totalSeconds - timeLeft),
      results: questionResults,
    })
    setConfirmOpen(false)
    setPhase('result')
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // Ignore storage failures.
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  submitRef.current = submit

  if (!categoryId) {
    return (
      <div className="animate-fade-in space-y-5">
        <header>
          <p className="eyebrow">{t('exam.official')}</p>
          <h1 className="h1 mt-1">{t('exam.introTitle')}</h1>
          <p className="legend mt-2 max-w-xl">{t('exam.introSub')}</p>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((item) => (
            <Link key={item.id} to={`/exam/${item.id}`} className="row-card lift flex items-center gap-3 rounded-2xl p-4">
              <CategoryMark id={item.id} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink">{t(item.nameKey)}</span>
                <span className="block text-xs text-muted">
                  {item.questionCount} {t('common.questions')} · {item.timeMinutes} {t('common.minutes')}
                </span>
              </span>
              <Icon name="chevron-right" className="h-4 w-4 text-muted rtl:rotate-180" />
            </Link>
          ))}
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-muted">{t('common.errorGeneric')}</p>
        <Link to="/exam" className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">
          {t('exam.introTitle')}
        </Link>
      </div>
    )
  }

  if (phase === 'intro') {
    const valid = available.length >= category.questionCount
    return (
      <div className="animate-fade-in space-y-5">
        <nav className="flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Link to="/app" className="hover:text-ink">
            {t('nav.home')}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-ink">{t(category.nameKey)}</span>
        </nav>

        <section className="cinematic-hero rounded-2xl p-5 sm:p-8">
          <div className="relative z-[1] grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <CategoryMark id={category.id} size="lg" tone="accent" />
                <div>
                  <p className="eyebrow">{t('exam.official')}</p>
                  <h1 className="h1 mt-0.5">{t('exam.introTitle')}</h1>
                </div>
              </div>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{t('exam.introSub')}</p>

              <div className="mt-6 grid max-w-md grid-cols-3 gap-2.5">
                {[
                  { value: String(category.questionCount), label: t('exam.questions') },
                  { value: `${category.timeMinutes}′`, label: t('exam.time') },
                  { value: String(category.passThreshold), label: t('exam.threshold') },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-line bg-surface/70 px-3 py-3 text-center">
                    <p className="tnum font-display text-2xl font-bold text-ink">{stat.value}</p>
                    <p className="text-[11px] font-semibold text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>

              {!valid && !loading && (
                <p className="mt-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm text-ink">
                  <Icon name="alert" className="h-5 w-5 shrink-0 text-warning" />
                  {t('exam.availableWhen', { count: category.questionCount })}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={begin}
                  disabled={!valid || loading}
                  className="btn-primary touch-target rounded-xl px-6 py-3 font-bold"
                >
                  <Icon name="flag-checkered" className="h-4 w-4" />
                  {t('exam.begin')}
                </button>
                <Link to="/learn" className="btn-secondary touch-target rounded-xl px-4 py-3 text-sm font-semibold">
                  {t('nav.study')}
                </Link>
              </div>
            </div>

            <div className="surface rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <ProgressRing
                  value={ready ? Math.round(ready.estimatedAccuracy * 100) : 0}
                  size={104}
                  stroke={9}
                  label={t('readiness.ring')}
                  tone={ready?.recommended ? 'success' : 'accent'}
                />
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-ink">
                    {ready?.recommended ? t('ready.ready') : t('ready.notReady')}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {ready && ready.sample > 0
                      ? t('home.readinessSub', { count: ready.sample })
                      : t('home.readinessEmpty')}
                  </p>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-xs font-semibold text-muted">
                <Icon name="info" className="h-4 w-4" />
                {t('exam.autosaved')}
              </p>
            </div>
          </div>
        </section>

        {draft && (
          <section className="card flex flex-wrap items-center justify-between gap-4 rounded-2xl border-warning/30 p-4 sm:p-5">
            <div className="min-w-0">
              <p className="font-display text-base font-bold text-ink">{t('exam.resumeTitle')}</p>
              <p className="mt-1 text-sm text-muted">{t('exam.resumeSub')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={resume} className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold">
                {t('exam.resume')}
              </button>
              <button type="button" onClick={discardDraft} className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">
                {t('exam.discard')}
              </button>
            </div>
          </section>
        )}
      </div>
    )
  }

  if (phase === 'result' && result) {
    return (
      <>
        <Confetti burst={burst} />
        <ResultScreen
          result={result}
          categoryName={t(category.nameKey)}
          language={language}
          showReview={showReview}
          onToggleReview={() => setShowReview((value) => !value)}
          onRetry={begin}
        />
      </>
    )
  }

  if (!current || !currentTr) {
    return <p className="py-10 text-center text-muted">{t('common.loading')}</p>
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = String(timeLeft % 60).padStart(2, '0')
  const lowTime = timeLeft <= 600
  const currentAnswered = (selections[index] ?? []).length > 0

  return (
    <div className="animate-fade-in space-y-4">
      <div
        className={`sticky top-16 z-20 -mx-1 flex flex-wrap items-center gap-2 rounded-xl border bg-surface/95 p-2.5 backdrop-blur sm:gap-3 sm:p-3 ${
          lowTime ? 'border-danger/40' : 'border-line'
        }`}
      >
        <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-sm font-bold text-ink">
          <CategoryMark id={category.id} size="sm" />
          <span className="hidden sm:inline">{t(category.nameKey)}</span>
          <span className="tnum sm:hidden">{category.id}</span>
        </span>
        <span
          className={`tnum inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-bold ${
            lowTime ? 'bg-danger-soft text-danger' : 'bg-surface-2 text-ink'
          }`}
          aria-label={t('exam.timeLeft')}
        >
          <Icon name="timer" className="h-4 w-4" />
          {mins}:{secs}
        </span>
        <span className="hidden text-xs font-semibold text-muted sm:inline">
          {t('exam.answered')} {answeredCount}/{questions.length}
        </span>
        <span className="ms-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleFlag}
            aria-pressed={flags.has(index)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors ${
              flags.has(index)
                ? 'border-warning/40 bg-warning-soft text-warning'
                : 'border-line bg-surface text-muted hover:text-ink'
            }`}
          >
            <Icon name="flag" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {flags.has(index) ? t('exam.flagged') : t('exam.flag')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="btn-primary min-h-9 rounded-lg px-3 py-1.5 text-xs font-bold sm:text-sm"
          >
            {t('exam.submit')}
          </button>
        </span>
      </div>

      {lowTime && (
        <p className="flex items-center gap-2 rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger" role="status">
          <Icon name="alert" className="h-4 w-4" />
          {t('exam.timeWarning')}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="tnum text-sm font-bold text-muted">
              {t('exam.questionShort', { current: index + 1, total: questions.length })}
            </p>
            <span className="text-xs font-semibold text-muted">{t(category.nameKey)}</span>
          </div>

          <div key={current.id} className="card-premium animate-pop-in rounded-2xl p-5 sm:p-6">
            <QuestionRenderer
              question={current}
              lang={language}
              selected={selections[index] ?? []}
              onToggle={selectOption}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
              disabled={index === 0}
              className="btn-secondary touch-target rounded-xl px-3 py-2.5 text-sm font-semibold"
            >
              <Icon name="chevron-left" className="h-4 w-4 rtl:rotate-180" />
              <span className="hidden sm:inline">{t('exam.previous')}</span>
            </button>
            {index < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))}
                className="btn-primary min-h-11 flex-1 rounded-xl px-4 py-2.5 text-sm font-bold"
              >
                {t('exam.next')}
                <Icon name="chevron-right" className="h-4 w-4 rtl:rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="btn-primary min-h-11 flex-1 rounded-xl px-4 py-2.5 text-sm font-bold"
              >
                {t('exam.submit')}
              </button>
            )}
          </div>

          {currentAnswered && index < questions.length - 1 && (
            <p className="text-center text-xs text-muted">{t('exam.autosaved')}</p>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-32 lg:self-start">
          <div className="card rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{t('exam.navGrid')}</p>
            <div className="mt-3 grid grid-cols-6 gap-1.5">
              {questions.map((_, position) => {
                const answered = (selections[position] ?? []).length > 0
                const flagged = flags.has(position)
                const active = position === index
                return (
                  <button
                    key={position}
                    type="button"
                    onClick={() => setIndex(position)}
                    aria-label={`${t('exam.questionShort', { current: position + 1, total: questions.length })}${answered ? ` · ${t('exam.legendAnswered')}` : ''}${flagged ? ` · ${t('exam.legendFlagged')}` : ''}`}
                    aria-current={active ? 'step' : undefined}
                    className={`tnum flex h-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                      active
                        ? 'border-ink bg-ink text-bg'
                        : flagged
                          ? 'border-warning/40 bg-warning-soft text-warning'
                          : answered
                            ? 'border-accent/50 bg-accent-soft text-ink'
                            : 'border-line bg-surface-2 text-muted hover:text-ink'
                    }`}
                  >
                    {position + 1}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 space-y-1.5 text-[11px] font-semibold text-muted">
              <p className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm border border-accent/50 bg-accent-soft" aria-hidden="true" />
                {t('exam.legendAnswered')}
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm border border-warning/40 bg-warning-soft" aria-hidden="true" />
                {t('exam.legendFlagged')}
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm border border-line bg-surface-2" aria-hidden="true" />
                {t('exam.legendEmpty')}
              </p>
            </div>
          </div>
          <p className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 p-3 text-[11px] font-semibold text-muted">
            <Icon name="seal" className="h-4 w-4 shrink-0" />
            {t('exam.autosaved')}
          </p>
        </aside>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('exam.submitTitle')}
        description={t('exam.submitBody', { answered: answeredCount, total: questions.length })}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              {t('exam.submitCancel')}
            </button>
            <button type="button" onClick={submit} className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold">
              {t('exam.submitConfirm')}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-xl bg-surface-2 p-3">
            <p className="tnum font-display text-xl font-bold text-ink">{answeredCount}</p>
            <p className="text-[11px] font-semibold text-muted">{t('exam.answered')}</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <p className="tnum font-display text-xl font-bold text-warning">{flags.size}</p>
            <p className="text-[11px] font-semibold text-muted">{t('exam.flaggedCount')}</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <p className="tnum font-display text-xl font-bold text-muted">{questions.length - answeredCount}</p>
            <p className="text-[11px] font-semibold text-muted">{t('exam.legendEmpty')}</p>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

function ResultScreen({
  result,
  categoryName,
  language,
  showReview,
  onToggleReview,
  onRetry,
}: {
  result: Result
  categoryName: string
  language: LanguageId
  showReview: boolean
  onToggleReview: () => void
  onRetry: () => void
}) {
  const { t } = useI18n()
  const percent = Math.round((result.score / Math.max(1, result.total)) * 100)
  const wrong = result.results.filter((entry) => !entry.correct && entry.selected.length > 0).length
  const skipped = result.results.filter((entry) => entry.selected.length === 0).length
  const minutes = Math.floor(result.durationSec / 60)
  const seconds = String(result.durationSec % 60).padStart(2, '0')

  const byTopic = new Map<string, { correct: number; total: number }>()
  for (const entry of result.results) {
    const current = byTopic.get(entry.question.topicId) ?? { correct: 0, total: 0 }
    current.total += 1
    if (entry.correct) current.correct += 1
    byTopic.set(entry.question.topicId, current)
  }
  const topicRows = [...byTopic.entries()]
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
  const weakestTopic = topicRows.find((row) => row.correct / row.total < 0.7)?.id

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
      <section
        className={`rounded-2xl border p-5 text-center sm:p-8 ${
          result.passed ? 'border-success/35 bg-success-soft' : 'border-danger/35 bg-danger-soft'
        }`}
      >
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            result.passed ? 'bg-success text-white' : 'bg-danger text-white'
          }`}
        >
          <Icon name={result.passed ? 'check' : 'x'} className="h-7 w-7" />
        </span>
        <p className="eyebrow mt-4">{t('exam.resultsTitle')} · {categoryName}</p>
        <h1 className="h1 mt-1">{result.passed ? t('exam.pass') : t('exam.fail')}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          {result.passed
            ? t('exam.passSub')
            : t(
                Math.max(0, result.threshold - result.score) === 1 ? 'exam.failSubOne' : 'exam.failSub',
                { count: Math.max(0, result.threshold - result.score) },
              )}
        </p>

        <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-5">
          <ProgressRing
            value={percent}
            size={132}
            stroke={11}
            label={t('exam.score')}
            tone={result.passed ? 'success' : 'danger'}
          />
          <div className="text-start">
            <p className="tnum font-display text-3xl font-bold text-ink">
              {result.score}
              <span className="text-lg text-muted">/{result.total}</span>
            </p>
            <p className="text-xs font-semibold text-muted">
              {t('exam.threshold')}: {result.threshold}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { value: result.score, label: t('exam.correct'), tone: 'text-success' },
            { value: wrong, label: t('exam.wrong'), tone: 'text-danger' },
            { value: skipped, label: t('exam.skipped'), tone: 'text-muted' },
            { value: `${minutes}:${seconds}`, label: t('exam.duration'), tone: 'text-ink' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-line bg-surface/80 p-3">
              <p className={`tnum font-display text-xl font-bold ${stat.tone}`}>{stat.value}</p>
              <p className="text-[11px] font-semibold text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {topicRows.length > 0 && (
          <div className="mt-5 text-start">
            <h2 className="text-sm font-bold text-ink">{t('exam.byTopic')}</h2>
            <ul className="mt-2.5 space-y-2">
              {topicRows.map((row) => {
                const topicPercent = Math.round((row.correct / row.total) * 100)
                return (
                  <li key={row.id} className="rounded-xl border border-line bg-surface/80 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-ink">{t(`topic.${row.id}`)}</span>
                      <span className="tnum text-xs font-bold text-muted">
                        {row.correct}/{row.total}
                      </span>
                    </div>
                    <span className="progress-track mt-2 block">
                      <span
                        className={`progress-fill ${topicPercent >= 70 ? 'bg-success' : 'bg-danger'}`}
                        style={{ width: `${topicPercent}%` }}
                      />
                    </span>
                  </li>
                )
              })}
            </ul>
            {weakestTopic && (
              <Link
                to={`/learn/${weakestTopic}`}
                className="btn-secondary mt-3 px-4 py-2.5 text-sm font-semibold"
              >
                <Icon name="book" className="h-4 w-4" />
                {t('exam.workOnTopic')}
              </Link>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={onToggleReview} className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Icon name={showReview ? 'chevron-down' : 'clipboard'} className="h-4 w-4" />
            {showReview ? t('exam.hideAnswers') : t('exam.reviewAnswers')}
          </button>
          <Link to="/review" className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">
            {t('exams.review')}
          </Link>
          <button type="button" onClick={onRetry} className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold">
            {t('exam.retake')}
          </button>
          <Link to="/app" className="btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold">
            {t('nav.home')}
          </Link>
        </div>
      </section>

      {showReview && (
        <section className="space-y-3">
          <h2 className="h2">{t('exam.reviewAnswers')}</h2>
          {result.results.map((entry, position) => {
            const translation = translate(entry.question, language)
            if (!translation) return null
            const image = entry.question.image ? assetUrl(entry.question.image) : undefined
            return (
              <article key={entry.question.id} className="card rounded-2xl p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="tnum chip">#{entry.question.number ?? position + 1}</span>
                  <span
                    className={`chip ${
                      entry.correct
                        ? 'border-success/30 bg-success-soft text-success'
                        : entry.selected.length === 0
                          ? 'border-line bg-surface-2 text-muted'
                          : 'border-danger/30 bg-danger-soft text-danger'
                    }`}
                  >
                    <Icon
                      name={entry.correct ? 'check' : entry.selected.length === 0 ? 'info' : 'x'}
                      className="h-3 w-3"
                    />
                    {entry.correct
                      ? t('exam.correct')
                      : entry.selected.length === 0
                        ? t('exam.noAnswer')
                        : t('exam.wrong')}
                  </span>
                </div>
                <div className="mt-2 flex gap-3">
                  {image && (
                    <img
                      src={image}
                      alt={t('question.imageAlt', { number: entry.question.number ?? '' })}
                      className="h-16 w-16 shrink-0 rounded-lg border border-line object-cover"
                    />
                  )}
                  <p className="font-display text-[15px] font-semibold leading-snug text-ink">{translation.stem}</p>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {translation.options.map((option, optionIndex) => {
                    const isCorrect = entry.correctIndexes.includes(optionIndex)
                    const isSelected = entry.selected.includes(optionIndex)
                    return (
                      <li
                        key={optionIndex}
                        className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                          isCorrect
                            ? 'border-success/35 bg-success-soft text-ink'
                            : isSelected
                              ? 'border-danger/35 bg-danger-soft text-ink'
                              : 'border-line bg-surface text-muted'
                        }`}
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-current text-[10px] font-bold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {isCorrect && <Icon name="check" className="h-4 w-4 shrink-0 text-success" />}
                        {isSelected && !isCorrect && <Icon name="x" className="h-4 w-4 shrink-0 text-danger" />}
                      </li>
                    )
                  })}
                </ul>
                {!entry.correct && (
                  <>
                    <p className="mt-2 text-xs font-semibold text-muted">
                      {t('exam.correctAnswer')}:{' '}
                      {translation.options[entry.correctIndexes[0]] ?? '—'}
                    </p>
                    <Link
                      to={`/learn/${entry.question.topicId}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      <Icon name="book" className="h-3.5 w-3.5" />
                      {t('exam.workOnTopic')}
                    </Link>
                  </>
                )}
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}

export default Exam
