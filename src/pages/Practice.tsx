import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { CATEGORIES, getCategory } from '../lib/content/categories'
import { isPlayable, loadCategoryQuestions, loadTopicQuestions, translate } from '../lib/content/questions'
import { answerIsCorrect } from '../lib/progress/engine'
import { pickAdaptive } from '../lib/progress/adaptive'
import { useProgress } from '../lib/progress/ProgressProvider'
import { QuestionRenderer } from '../components/QuestionRenderer'
import { CategoryMark } from '../components/CategoryMark'
import { ProgressRing } from '../components/ui/ProgressRing'
import { Confetti } from '../components/Confetti'
import { Icon } from '../components/Icon'
import type { Question } from '../lib/content/schema'

type Phase = 'setup' | 'round' | 'summary'

const ROUND_SIZE = 10

export function Practice() {
  const { t, language } = useI18n()
  const { defaultCategory, setDefaultCategory, recordAnswer, mastery } = useProgress()
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

  const category = getCategory(categoryId) ?? CATEGORIES[0]
  const question = questions[index]
  const tr = question ? translate(question, language) : undefined

  const lifetime = useMemo(() => {
    let correct = 0
    let answered = 0
    for (const record of Object.values(mastery)) {
      if (record.category !== category.id) continue
      correct += record.correct
      answered += record.answered
    }
    return answered > 0 ? Math.round((correct / answered) * 100) : 0
  }, [mastery, category.id])

  useEffect(() => {
    if (phase !== 'summary') return
    const accuracy = questions.length > 0 ? correctCount / questions.length : 0
    if (accuracy >= 0.8) {
      setBurst(true)
      const id = window.setTimeout(() => setBurst(false), 1500)
      return () => window.clearTimeout(id)
    }
  }, [phase, questions.length, correctCount])

  async function startRound(source?: Question[]) {
    setStarting(true)
    const loaded =
      source ??
      (topicFilter
        ? await loadTopicQuestions(category.id, topicFilter)
        : await loadCategoryQuestions(category.id))
    const pool = source ?? loaded.filter(isPlayable)
    const deck = source ?? pickAdaptive(pool, mastery, category.id, ROUND_SIZE)
    setQuestions(deck)
    setIndex(0)
    setSelected([])
    setRevealed(false)
    setLastCorrect(false)
    setCorrectCount(0)
    setWrong([])
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
      return
    }
    setIndex((value) => value + 1)
    setSelected([])
    setRevealed(false)
  }

  if (phase === 'setup') {
    return (
      <div className="animate-fade-in space-y-6">
        <header>
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1 className="h1 mt-1">{t('practice.title')}</h1>
          <p className="legend mt-2 max-w-xl">{t('practice.subtitle')}</p>
          {topicFilter && (
            <span className="chip mt-2 border-accent/25 bg-accent-soft text-accent">
              <Icon name="book" className="h-3.5 w-3.5" />
              {t(`topic.${topicFilter}`)}
            </span>
          )}
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
          <section className="card-premium rounded-2xl p-5 sm:p-6">
            <p className="text-sm font-bold text-ink">{t('practice.chooseCategory')}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('practice.chooseCategory')}>
              {CATEGORIES.map((item) => {
                const active = item.id === category.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => changeCategory(item.id)}
                    className={`press flex items-center gap-3 rounded-xl border p-3 text-start transition-colors ${
                      active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-surface-2'
                    }`}
                  >
                    <CategoryMark id={item.id} tone={active ? 'accent' : 'default'} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {t(item.nameKey)}
                      </span>
                      <span className="block text-xs text-muted">
                        {item.questionCount} {t('common.questions')}
                      </span>
                    </span>
                    {active && <Icon name="check-circle" weight="fill" className="h-5 w-5 text-ink" />}
                  </button>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div>
                <p className="text-sm font-semibold text-ink">{t('practice.roundSize', { count: ROUND_SIZE })}</p>
                <p className="text-xs text-muted">{t('home.officialBank', { count: category.questionCount })}</p>
              </div>
              <button
                type="button"
                onClick={() => void startRound()}
                disabled={starting}
                className="btn-primary touch-target rounded-xl px-5 py-3 font-bold"
              >
                <Icon name="play" weight="fill" className="h-4 w-4" />
                {t('practice.startRound')}
              </button>
            </div>
          </section>

          <aside className="card rounded-2xl p-5">
            <p className="eyebrow">{t('home.statsTitle')}</p>
            <div className="mt-4 flex items-center gap-4">
              <ProgressRing value={lifetime} size={88} stroke={8} label={t('practice.accuracy')} />
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-ink">{t(category.nameKey)}</p>
                <p className="text-xs text-muted">{t('home.categoriesSub')}</p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-muted">
              <Icon name="seal" className="h-4 w-4 shrink-0" />
              {t('exam.official')}
            </p>
          </aside>
        </div>
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
    </div>
  )
}

export default Practice
