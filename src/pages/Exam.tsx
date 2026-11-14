import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { CATEGORIES, getCategory } from '../lib/content/categories'
import { isPlayable, isSelectionCorrect, loadCategoryQuestions, translate } from '../lib/content/questions'
import { useProgress } from '../lib/progress/ProgressProvider'
import { track } from '../lib/analytics/track'
import { Confetti } from '../components/Confetti'
import { Icon } from '../components/Icon'
import { QuestionRenderer } from '../components/QuestionRenderer'
import { CategoryMark } from '../components/CategoryMark'
import { Dialog } from '../components/ui/Dialog'
import { ExamIntro } from './exam/ExamIntro'
import { ResultScreen } from './exam/ResultScreen'
import type { ExamReadyInfo } from './exam/ExamIntro'
import { DRAFT_KEY, LEGACY_DRAFT_KEY, readDraft, shuffle } from './exam/examShared'
import type { Draft, Phase, QuestionResult, Result } from './exam/examShared'
import type { Question } from '../lib/content/schema'

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
  const [ready, setReady] = useState<ExamReadyInfo | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [burst, setBurst] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [loadedCategory, setLoadedCategory] = useState<string | null>(null)
  const submittedRef = useRef(false)
  const submitRef = useRef<() => void>(() => {})

  const totalSeconds = (category?.timeMinutes ?? 40) * 60

  // Reset category-scoped state during render when the category changes,
  // instead of syncing it inside the loading effect.
  if (loadedCategory !== (categoryId ?? null)) {
    setLoadedCategory(categoryId ?? null)
    setLoading(true)
    setAvailable([])
    setDraft(null)
    setReady(null)
  }

  useEffect(() => {
    if (!categoryId) return
    let cancelled = false
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

  // Clear the celebration flag after the confetti animation finishes.
  useEffect(() => {
    if (!burst) return
    const id = window.setTimeout(() => setBurst(false), 1700)
    return () => window.clearTimeout(id)
  }, [burst])

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
      localStorage.removeItem(LEGACY_DRAFT_KEY)
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
    track('exam_start', { category: category.id })
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
    setBurst(false)
    setPhase('active')
    submittedRef.current = false
    try {
      localStorage.removeItem(DRAFT_KEY)
      localStorage.removeItem(LEGACY_DRAFT_KEY)
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
      localStorage.removeItem(LEGACY_DRAFT_KEY)
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
      // Grade against the translation the learner is actually reading: the
      // official bank reorders options per language, so the Hebrew answer key
      // is wrong for every other language.
      const translation = translate(question, language)
      const selection = selections[position] ?? []
      const correct = isSelectionCorrect(question, language, selection)
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
    if (passed) setBurst(true)
    finishExam({
      category: category.id,
      score,
      total: questions.length,
      passed,
      durationSec: Math.max(0, totalSeconds - timeLeft),
    })
    track('exam_finish', { category: category.id, score, total: questions.length, passed })
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
      localStorage.removeItem(LEGACY_DRAFT_KEY)
    } catch {
      // Ignore storage failures.
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Keep the timeout handler pointing at the latest submit without mutating a
  // ref during render.
  useEffect(() => {
    submitRef.current = submit
  })

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
    return (
      <ExamIntro
        category={category}
        availableCount={available.length}
        loading={loading}
        ready={ready}
        hasDraft={draft !== null}
        onBegin={begin}
        onResume={resume}
        onDiscard={discardDraft}
      />
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


export default Exam
