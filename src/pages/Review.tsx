import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { CATEGORIES, getCategory } from '../lib/content/categories'
import { isPlayable, translate, loadCategoryQuestions } from '../lib/content/questions'
import { answerIsCorrect, isMastered } from '../lib/progress/engine'
import { useProgress } from '../lib/progress/ProgressProvider'
import { QuestionRenderer } from '../components/QuestionRenderer'
import { CategoryMark } from '../components/CategoryMark'
import { Icon } from '../components/Icon'
import type { Question } from '../lib/content/schema'

const DUE_LIMIT = 20
const NEW_LIMIT = 10

function shuffle<T>(items: T[]): T[] {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function Review() {
  const { t, language } = useI18n()
  const { defaultCategory, srs, recordAnswer, daily, answeredCount, streak } = useProgress()
  const category = getCategory(defaultCategory) ?? CATEGORIES[0]

  const [bank, setBank] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Question[] | null>(null)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    void loadCategoryQuestions(category.id).then((all) => {
      if (cancelled) return
      setBank(
        all
          .filter((q) => isPlayable(q) && q.categories.includes(category.id))
          .sort((a, b) => (a.number ?? '').localeCompare(b.number ?? '')),
      )
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [category.id])

  const { due, fresh, mastered } = useMemo(() => {
    const dueList: Question[] = []
    const freshList: Question[] = []
    let masteredCount = 0
    for (const question of bank) {
      const record = srs[question.id]
      if (!record) {
        freshList.push(question)
      } else {
        if (isMastered(record.intervalDays)) masteredCount += 1
        if (record.dueTs <= now) dueList.push(question)
      }
    }
    dueList.sort((a, b) => (srs[a.id]?.dueTs ?? 0) - (srs[b.id]?.dueTs ?? 0))
    return { due: dueList, fresh: freshList, mastered: masteredCount }
  }, [bank, srs, now])

  function startSession(questions: Question[]) {
    if (questions.length === 0) return
    setSession(questions)
    setIndex(0)
    setSelected([])
    setRevealed(false)
    setLastCorrect(false)
    setCorrectCount(0)
    setFinished(false)
  }

  function startMixed() {
    startSession(shuffle([...due.slice(0, DUE_LIMIT), ...fresh.slice(0, NEW_LIMIT)]))
  }

  function backToQueue() {
    setSession(null)
    setFinished(false)
  }

  const question = session?.[index]
  const tr = question ? translate(question, language) : undefined

  function choose(optionIndex: number) {
    if (!question || !tr || revealed) return
    const correct = answerIsCorrect(tr.correctIndexes, [optionIndex])
    setSelected([optionIndex])
    setRevealed(true)
    setLastCorrect(correct)
    if (correct) setCorrectCount((value) => value + 1)
    recordAnswer({
      category: category.id,
      topicId: question.topicId,
      questionId: question.id,
      correct,
      mode: 'review',
    })
  }

  function next() {
    if (!session) return
    if (index >= session.length - 1) {
      setFinished(true)
      return
    }
    setIndex((value) => value + 1)
    setSelected([])
    setRevealed(false)
  }

  if (session && finished) {
    const total = session.length
    return (
      <div className="animate-pop-in mx-auto max-w-xl space-y-5 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-success/40 bg-success-soft text-success">
          <Icon name="check-circle" weight="fill" className="h-8 w-8" />
        </span>
        <h1 className="h1">{t('review.queueDone')}</h1>
        <p className="font-display text-lg font-bold text-ink">
          {t('practice.correctOf', { correct: correctCount, total })}
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={backToQueue} className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold">
            {t('review.backToReview')}
          </button>
          <Link to="/learn" className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">
            {t('nav.learn')}
          </Link>
        </div>
      </div>
    )
  }

  if (session && question && tr) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={backToQueue}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
          >
            <Icon name="arrow-back" className="h-4 w-4 rtl:rotate-180" />
            {t('review.backToReview')}
          </button>
          <span className="tnum text-sm font-bold text-muted">
            {t('practice.questionOf', { current: index + 1, total: session.length })}
          </span>
          <span className="chip border-success/30 bg-success-soft text-success">
            <Icon name="check" className="h-3.5 w-3.5" />
            {correctCount}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${Math.round(((index + (revealed ? 1 : 0)) / session.length) * 100)}%` }}
          />
        </div>

        <div
          key={question.id}
          className={`card-premium rounded-2xl p-5 sm:p-6 ${
            revealed ? (lastCorrect ? 'animate-tada' : 'animate-shake') : 'animate-pop-in'
          }`}
        >
          <QuestionRenderer
            question={question}
            lang={language}
            selected={selected}
            onToggle={choose}
            reveal={revealed}
          />
        </div>

        {revealed && (
          <div
            className={`flex flex-wrap items-center gap-3 rounded-xl border p-3.5 ${
              lastCorrect ? 'border-success/30 bg-success-soft' : 'border-danger/30 bg-danger-soft'
            }`}
          >
            <Icon
              name={lastCorrect ? 'check-circle' : 'x-circle'}
              weight="fill"
              className={`h-6 w-6 shrink-0 ${lastCorrect ? 'text-success' : 'text-danger'}`}
            />
            <p className="min-w-0 flex-1 text-sm font-semibold text-ink">
              {lastCorrect ? t('practice.feedbackCorrect') : t('practice.feedbackWrong')}
            </p>
            {!lastCorrect && (
              <Link
                to={`/learn/${question.topicId}`}
                className="btn-ghost px-3 py-2 text-xs font-semibold"
              >
                <Icon name="book" className="h-4 w-4" />
                {t('practice.learnTopic')}
              </Link>
            )}
            <button
              type="button"
              onClick={next}
              className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold"
            >
              {index >= session.length - 1 ? t('common.finish') : t('practice.next')}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t('home.dailyTitle')}</p>
          <h1 className="h1 mt-1">{t('review.title')}</h1>
          <p className="legend mt-2 max-w-xl">{t('review.subtitle')}</p>
        </div>
        <span className="chip">
          <CategoryMark id={category.id} size="sm" />
          {t(category.nameKey)}
        </span>
      </header>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { value: due.length, label: t('review.statsDue'), tone: 'text-warning' },
          { value: fresh.length, label: t('review.statsNew'), tone: 'text-info' },
          { value: mastered, label: t('review.statsMastered'), tone: 'text-success' },
        ].map((stat) => (
          <div key={stat.label} className="card rounded-xl p-3 text-center sm:p-4">
            <p className={`tnum font-display text-2xl font-bold ${stat.tone}`}>{stat.value}</p>
            <p className="text-[11px] font-semibold leading-tight text-muted sm:text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {daily && (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-ink">
            <Icon name="road" className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{t('home.dailyTitle')}</p>
            <p className="text-xs text-muted">
              {t('home.dailySub', { done: daily.answered, target: daily.target })}
              {daily.topicId ? ` · ${t(`topic.${daily.topicId}`)}` : ''}
            </p>
          </div>
          <span className="tnum text-sm font-bold text-ink">
            {Math.min(100, Math.round((daily.answered / Math.max(1, daily.target)) * 100))}%
          </span>
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm font-semibold text-muted">{t('common.loading')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <QueueCard
            icon="reload"
            title={t('review.dueTitle')}
            subtitle={t('review.dueSub', { count: due.length })}
            value={due.length}
            actionLabel={t('review.startDue')}
            onStart={() => startSession(due.slice(0, DUE_LIMIT))}
            disabled={due.length === 0}
            tone="warning"
          />
          <QueueCard
            icon="sparkle"
            title={t('review.newTitle')}
            subtitle={t('review.newSub', { count: fresh.length })}
            value={fresh.length}
            actionLabel={t('review.startMixed')}
            onStart={startMixed}
            disabled={due.length === 0 && fresh.length === 0}
            tone="info"
          />
        </div>
      )}

      {!loading && due.length === 0 && fresh.length === 0 && (
        <div className="card-premium flex flex-col items-center rounded-2xl border-dashed px-5 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/40 bg-accent-soft text-ink">
            <Icon name="check-circle" className="h-6 w-6" />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-ink">{t('review.emptyTitle')}</p>
          <p className="mt-1 max-w-sm text-sm text-muted">{t('review.emptySub')}</p>
          <Link to="/practice" className="btn-primary mt-5 rounded-xl px-4 py-2.5 text-sm font-bold">
            {t('practice.startRound')}
          </Link>
        </div>
      )}

      {!loading && (due.length > 0 || fresh.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-4">
          <p className="text-sm text-muted">
            {t('home.statAnswered')}: <span className="tnum font-bold text-ink">{answeredCount}</span>
            {' · '}
            {t('home.statStreak')}: <span className="tnum font-bold text-ink">{streak.count}</span>
          </p>
          <button type="button" onClick={startMixed} className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold">
            {t('review.startMixed')}
            <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  )
}

function QueueCard({
  icon,
  title,
  subtitle,
  value,
  actionLabel,
  onStart,
  disabled,
  tone,
}: {
  icon: 'reload' | 'sparkle'
  title: string
  subtitle: string
  value: number
  actionLabel: string
  onStart: () => void
  disabled: boolean
  tone: 'warning' | 'info'
}) {
  return (
    <section className="card flex flex-col justify-between rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            tone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-info-soft text-info'
          }`}
        >
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <span className="tnum font-display text-3xl font-bold text-ink">{value}</span>
      </div>
      <div className="mt-4">
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        disabled={disabled}
        className="btn-secondary mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold"
      >
        {actionLabel}
      </button>
    </section>
  )
}

export default Review
