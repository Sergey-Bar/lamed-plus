import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { CATEGORIES, getCategory } from '../lib/content/categories'
import { availableQuestionCount, totalQuestionCount } from '../lib/content/bankStats'
import { TOPICS } from '../lib/content/topics'
import { isPlayable, loadCategoryQuestions, loadTopicQuestions, translate } from '../lib/content/questions'
import { findRelatedPoint } from '../lib/content/related'
import { getExplanation } from '../lib/content/explanations'
import { buildQuestionReport, sendQuestionReport } from '../lib/product/report'
import type { ReportResult } from '../lib/product/report'
import { answerIsCorrect } from '../lib/progress/engine'
import { pickAdaptive } from '../lib/progress/adaptive'
import type { PowerupKind } from '../lib/progress/config'
import { useProgress } from '../lib/progress/ProgressProvider'
import { QuestionRenderer } from '../components/QuestionRenderer'
import { CategoryMark } from '../components/CategoryMark'
import { categoryIcon } from '../components/categoryIcon'
import { ProgressRing } from '../components/ui/ProgressRing'
import { PowerupBar } from '../components/PowerupBar'
import { Confetti } from '../components/Confetti'
import { Icon } from '../components/Icon'
import type { Question } from '../lib/content/schema'

type Phase = 'setup' | 'round' | 'summary'

const ROUND_SIZE = 10

/** Each category gets its own soft tile, the way the reference art uses colour. */
const CATEGORY_TINT: Record<string, string> = {
  B: 'tint-teal',
  A: 'tint-amber',
  A3: 'tint-sage',
  C1: 'tint-blue',
  C: 'tint-violet',
  BUS: 'tint-rose',
  TRACTOR: 'tint-stone',
}

export function Practice() {
  const { t, language } = useI18n()
  const {
    defaultCategory,
    setDefaultCategory,
    recordAnswer,
    mastery,
    srs,
    spendPowerup,
    displayName,
  } = useProgress()
  const [searchParams] = useSearchParams()
  const topicFilter = searchParams.get('topic')

  const [phase, setPhase] = useState<Phase>('setup')
  const [categoryId, setCategoryId] = useState(defaultCategory)
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrong, setWrong] = useState<Question[]>([])
  const [burst, setBurst] = useState(false)
  const [starting, setStarting] = useState(false)
  const [hidden, setHidden] = useState<number[]>([])
  const [reportResult, setReportResult] = useState<ReportResult | null>(null)

  const category = getCategory(categoryId) ?? CATEGORIES[0]
  const question = questions[index]
  const tr = question ? translate(question, language) : undefined
  // Authored lesson line that explains the concept behind this question. The
  // bank ships no explanations, so pointing at real course material is the
  // only honest "why" available.
  const related = useMemo(
    () => (question ? findRelatedPoint(question, language) : null),
    [question, language],
  )
  // Authored explanation for the core questions. When it exists it replaces
  // the lesson line; the lesson stays as the next step either way.
  const explanation = useMemo(
    () => (question ? getExplanation(question.id, language) : null),
    [question, language],
  )

  // Clear the celebration flag after the confetti animation finishes.
  useEffect(() => {
    if (!burst) return
    const id = window.setTimeout(() => setBurst(false), 1500)
    return () => window.clearTimeout(id)
  }, [burst])

  async function startRound(source?: Question[]) {
    setStarting(true)
    const loaded =
      source ??
      (topicFilter
        ? await loadTopicQuestions(category.id, topicFilter)
        : await loadCategoryQuestions(category.id))
    const pool = source ?? loaded.filter(isPlayable)
    const deck = source ?? pickAdaptive(pool, mastery, category.id, ROUND_SIZE, Math.random, srs)
    setQuestions(deck)
    setIndex(0)
    setSelected([])
    setRevealed(false)
    setLastCorrect(false)
    setCorrectCount(0)
    setWrong([])
    setHidden([])
    setBurst(false)
    setPhase(deck.length > 0 ? 'round' : 'summary')
    setStarting(false)
  }

  function changeCategory(nextId: string) {
    setCategoryId(nextId)
    setDefaultCategory(nextId)
  }

  function choose(optionIndex: number) {
    if (!question || !tr || revealed) return
    const correct = answerIsCorrect(tr.correctIndexes, [optionIndex])
    setSelected([optionIndex])
    setRevealed(true)
    setLastCorrect(correct)
    if (correct) setCorrectCount((value) => value + 1)
    else setWrong((list) => [...list, question])
    recordAnswer({
      category: category.id,
      topicId: question.topicId,
      questionId: question.id,
      correct,
      mode: 'practice',
    })
  }

  function next() {
    if (index >= questions.length - 1) {
      setPhase('summary')
      if (questions.length > 0 && correctCount / questions.length >= 0.8) setBurst(true)
      return
    }
    setIndex((value) => value + 1)
    setSelected([])
    setRevealed(false)
    setHidden([])
    setReportResult(null)
  }

  async function reportQuestion() {
    if (!question) return
    setReportResult(
      await sendQuestionReport(
        buildQuestionReport({ question, language, category: categoryId, selected }),
      ),
    )
  }

  async function applyPowerup(kind: PowerupKind) {
    if (!question || !tr || revealed) return
    if (kind !== 'hint' && kind !== 'fifty') return
    const wrongIndexes = tr.options
      .map((_, optionIndex) => optionIndex)
      .filter((optionIndex) => !tr.correctIndexes.includes(optionIndex) && !hidden.includes(optionIndex))
    // Nothing left to hide: never charge energy for a no-op.
    if (wrongIndexes.length === 0) return
    const used = await spendPowerup(kind)
    if (!used) return
    // Hint removes one wrong option, 50/50 removes two. Both are spent from the
    // same energy pool, so a hint is the cheaper, smaller nudge.
    const remove = kind === 'hint' ? 1 : 2
    setHidden((current) => [...current, ...wrongIndexes.slice(0, remove)])
  }

  if (phase === 'setup') {
    const totalQuestions = totalQuestionCount()
    const seenCount = Object.keys(srs).length
    const tiles = [
      { label: t('practice.statTopics'), value: TOPICS.length },
      { label: t('practice.statQuestions'), value: totalQuestions },
      { label: t('practice.statSeen'), value: seenCount },
      { label: t('practice.statUnseen'), value: Math.max(0, totalQuestions - seenCount) },
    ]

    return (
      <div className="animate-fade-in space-y-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="h1">{t('practice.title')}</h1>
            <p className="legend mt-1.5 max-w-xl">{t('practice.subtitle')}</p>
            {topicFilter && (
              <span className="chip mt-2 border-accent/25 bg-accent-soft text-accent">
                <Icon name="book" className="h-3.5 w-3.5" />
                {t(`topic.${topicFilter}`)}
              </span>
            )}
          </div>
          <Link
            to="/profile"
            aria-label={t('nav.profile')}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-base font-bold text-accent-ink"
          >
            {displayName.trim() ? (
              displayName.trim().charAt(0)
            ) : (
              <Icon name="user" className="h-5 w-5" />
            )}
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="stat-tile">
              <p className="stat-tile-label">{tile.label}</p>
              <p className="stat-tile-value">{tile.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void startRound()}
          disabled={starting}
          className="card flex w-full items-center gap-3.5 p-4 text-start disabled:opacity-60"
        >
          <span className="icon-tile tint-amber shrink-0">
            <Icon name="sparkle" className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-ink">{t('practice.startRound')}</span>
            <span className="mt-0.5 block text-xs text-muted">
              {t('practice.roundSize', { count: ROUND_SIZE })} ·{' '}
              {t('home.officialBank', { count: availableQuestionCount(category.id) })}
            </span>
          </span>
          <Icon name="chevron-right" className="h-5 w-5 shrink-0 text-muted rtl:rotate-180" />
        </button>

        <section>
          <h2 className="text-[15px] font-bold text-ink">{t('practice.chooseCategory')}</h2>
          <div
            className="mt-2.5 space-y-2.5"
            role="radiogroup"
            aria-label={t('practice.chooseCategory')}
          >
            {CATEGORIES.map((item) => {
              const active = item.id === category.id
              const records = Object.values(mastery).filter((record) => record.category === item.id)
              const answered = records.reduce((sum, record) => sum + record.answered, 0)
              const correct = records.reduce((sum, record) => sum + record.correct, 0)
              const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => changeCategory(item.id)}
                  className={`row-card flex w-full items-center gap-3.5 p-4 text-start ${
                    active ? 'border-accent/45' : ''
                  }`}
                >
                  <span className={`icon-tile ${CATEGORY_TINT[item.id] ?? 'tint-stone'} shrink-0`}>
                    <Icon name={categoryIcon(item.id)} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold text-ink">
                      {t(item.nameKey)}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      {answered > 0 ? (
                        <>
                          <Icon
                            name="check-circle"
                            weight="fill"
                            className="h-3.5 w-3.5 text-success"
                          />
                          <span className="tnum">{accuracy}%</span>
                          <span aria-hidden="true">·</span>
                          <span className="tnum">{answered}</span>
                          {t('exam.answered')}
                        </>
                      ) : (
                        <>
                          <Icon name="book" className="h-3.5 w-3.5" />
                          <span className="tnum">{availableQuestionCount(item.id)}</span>
                          {t('common.questions')}
                        </>
                      )}
                    </span>
                  </span>
                  {active ? (
                    <Icon
                      name="check-circle"
                      weight="fill"
                      className="h-5 w-5 shrink-0 text-accent"
                    />
                  ) : (
                    <Icon
                      name="chevron-right"
                      className="h-5 w-5 shrink-0 text-muted rtl:rotate-180"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </section>
      </div>
    )
  }

  if (phase === 'summary') {
    const accuracy =
      questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
    return (
      <div className="animate-fade-in mx-auto max-w-xl space-y-5 text-center">
        <Confetti burst={burst} />
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/40 bg-accent-soft text-ink">
          <Icon name={accuracy >= 80 ? 'sparkle' : 'target'} className="h-8 w-8" />
        </span>
        <h1 className="h1">{t('practice.summaryTitle')}</h1>
        <p className="text-sm text-muted">{t('practice.summarySub')}</p>
        <ProgressRing
          value={accuracy}
          size={132}
          stroke={11}
          label={t('practice.accuracy')}
          tone={accuracy >= 80 ? 'success' : 'accent'}
          className="mx-auto"
        />
        <p className="font-display text-lg font-bold text-ink">
          {t('practice.correctOf', { correct: correctCount, total: questions.length })}
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {wrong.length > 0 && (
            <button
              type="button"
              onClick={() => void startRound(wrong)}
              className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              <Icon name="reload" className="h-4 w-4" />
              {t('practice.reviewMistakes')} ({wrong.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => void startRound()}
            className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold"
          >
            {t('practice.newRound')}
          </button>
          <Link to="/app" className="btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold">
            {t('nav.home')}
          </Link>
        </div>
      </div>
    )
  }

  if (!question || !tr) {
    return <p className="py-10 text-center text-muted">{t('common.loading')}</p>
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-muted">
          <CategoryMark id={category.id} size="sm" />
          {t(category.nameKey)}
        </span>
        <span className="tnum text-sm font-bold text-muted">
          {t('practice.questionOf', { current: index + 1, total: questions.length })}
        </span>
        <span className="chip border-success/30 bg-success-soft text-success">
          <Icon name="check" className="h-3.5 w-3.5" />
          {correctCount}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${Math.round(((index + (revealed ? 1 : 0)) / questions.length) * 100)}%` }}
        />
      </div>

      <PowerupBar
        kinds={['hint', 'fifty']}
        onUse={(kind) => void applyPowerup(kind)}
        disabled={revealed}
      />

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
          hidden={hidden}
        />
      </div>

      {revealed && (
        <div
          role="status"
          aria-live="polite"
          className={`flex flex-wrap items-center gap-3 rounded-xl border p-3.5 ${
            lastCorrect
              ? 'border-success/30 bg-success-soft'
              : 'border-danger/30 bg-danger-soft'
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
            {index >= questions.length - 1 ? t('common.finish') : t('practice.next')}
            <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      )}

      {revealed && !lastCorrect && (explanation || related) && (
        <section className="rounded-xl border border-info/25 bg-info-soft p-4">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-info">
            <Icon name="brain" className="h-4 w-4" />
            {explanation ? t('explanation.title') : t('learn.keyPoints')}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            {explanation?.text ?? related?.point}
          </p>
          {explanation && explanation.language !== language && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              {t('explanation.notLocalized')}
            </p>
          )}
          {related && (
            <Link
              to={`/learn/${related.subjectId}/${related.lessonId}`}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
            >
              {related.title}
              <Icon name="arrow-forward" className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          )}
        </section>
      )}

      {revealed && question && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted">
            {reportResult === 'copied' && t('report.copied')}
            {reportResult === 'mailed' && t('report.mailed')}
            {reportResult === 'failed' && t('report.failed')}
          </span>
          <button
            type="button"
            onClick={() => void reportQuestion()}
            className="inline-flex items-center gap-1.5 font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            <Icon name="info" className="h-3.5 w-3.5" />
            {t('report.action')}
          </button>
        </div>
      )}
    </div>
  )
}

export default Practice
