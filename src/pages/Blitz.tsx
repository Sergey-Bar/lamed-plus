import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { getCategory } from '../lib/content/categories'
import { isPlayable, loadCategoryQuestions, translate } from '../lib/content/questions'
import { assetUrl } from '../lib/content/assets'
import { answerIsCorrect } from '../lib/progress/engine'
import { useProgress } from '../lib/progress/ProgressProvider'
import { shuffle } from '../lib/utils'
import { Confetti } from '../components/Confetti'
import { Icon } from '../components/Icon'
import type { Question } from '../lib/content/schema'

type Phase = 'ready' | 'play' | 'over'

interface DeckItem {
  question: Question
  optionIndex: number
}

const ROUND_SIZE = 20

export function Blitz() {
  const { t, language } = useI18n()
  const { defaultCategory } = useProgress()
  const category = getCategory(defaultCategory)
  const [phase, setPhase] = useState<Phase>('ready')
  const [base, setBase] = useState<Question[]>([])
  const [deck, setDeck] = useState<DeckItem[]>([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [burst, setBurst] = useState(false)
  const [best, setBest] = useState(() => Number(localStorage.getItem('blitz-best') ?? 0))

  useEffect(() => {
    let cancelled = false
    void loadCategoryQuestions(defaultCategory).then((questions) => {
      if (!cancelled) setBase(questions.filter(isPlayable))
    })
    return () => {
      cancelled = true
    }
  }, [defaultCategory])

  const item = deck[index]
  const translation = item ? translate(item.question, language) : undefined

  function makeDeck(): DeckItem[] {
    return shuffle(base)
      .slice(0, ROUND_SIZE)
      .map((question) => {
        const tr = translate(question, 'he')
        const optionCount = tr?.options.length ?? 4
        return { question, optionIndex: Math.floor(Math.random() * optionCount) }
      })
  }

  function start() {
    const next = makeDeck()
    setDeck(next)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setIndex(0)
    setAnswer(null)
    setPhase(next.length > 0 ? 'play' : 'ready')
  }

  function finishScore(finalScore: number) {
    setPhase('over')
    setBurst(true)
    window.setTimeout(() => setBurst(false), 1500)
    if (finalScore > best) {
      setBest(finalScore)
      localStorage.setItem('blitz-best', String(finalScore))
    }
  }

  function choose(value: boolean) {
    if (!item || !translation || answer !== null) return
    const isCorrectOption = answerIsCorrect(translation.correctIndexes, [item.optionIndex])
    const right = value === isCorrectOption
    setAnswer(value)
    if (right) {
      const nextStreak = streak + 1
      const bonus = nextStreak >= 3 && nextStreak % 3 === 0 ? 2 : 0
      const nextScore = score + 1 + bonus
      setStreak(nextStreak)
      setBestStreak((value) => Math.max(value, nextStreak))
      setScore(nextScore)
    } else {
      setStreak(0)
    }
  }

  useEffect(() => {
    if (phase !== 'play' || answer === null) return
    const id = window.setTimeout(() => {
      if (index >= deck.length - 1) {
        finishScore(score)
        return
      }
      setIndex((value) => value + 1)
      setAnswer(null)
    }, 900)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer, phase, index, deck.length, score])

  if (phase === 'over') {
    return (
      <div className="animate-pop-in mx-auto max-w-xl space-y-5 text-center">
        <Confetti burst={burst} />
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/40 bg-accent-soft text-ink">
          <Icon name="bolt" className="h-8 w-8" />
        </span>
        <h1 className="h1">{t('blitz.over')}</h1>
        <p className="tnum font-display text-4xl font-bold text-ink">{score}</p>
        <p className="text-sm text-muted">
          {t('blitz.best')}: {best} · {t('blitz.bestStreak')}: {bestStreak}
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={start} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-bold">
            {t('common.retry')}
          </button>
          <Link to="/app" className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">
            {t('nav.home')}
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'ready') {
    return (
      <div className="animate-fade-in mx-auto max-w-xl space-y-5">
        <div className="card-premium rounded-2xl p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-ink">
            <Icon name="bolt" className="h-6 w-6" />
          </span>
          <h1 className="h1 mt-5">{t('games.blitz.name')}</h1>
          <p className="legend mt-2">{t('games.blitz.desc')}</p>
          <p className="mt-4 text-sm text-muted">
            {t('blitz.best')}: <span className="tnum font-bold text-ink">{best}</span>
            {category && ` · ${t(category.nameKey)}`}
          </p>
          <button
            type="button"
            onClick={start}
            disabled={base.length === 0}
            className="btn-primary mt-6 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            {t('blitz.start')}
          </button>
        </div>
      </div>
    )
  }

  if (!item || !translation) {
    return <p className="py-10 text-center text-muted">{t('common.loading')}</p>
  }

  const image = item.question.image ? assetUrl(item.question.image) : undefined
  const isCorrectOption = answerIsCorrect(translation.correctIndexes, [item.optionIndex])
  const revealed = answer !== null
  const right = revealed && answer === isCorrectOption

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="tnum text-sm font-bold text-muted">
          {index + 1} / {deck.length}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ink">
          <Icon name="star" className="h-4 w-4" />
          {score}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-sm font-bold ${
            streak >= 3 ? 'text-danger' : 'text-muted'
          }`}
        >
          <Icon name="flame" className="h-4 w-4" />
          {streak}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${Math.round(((index + (revealed ? 1 : 0)) / deck.length) * 100)}%` }}
        />
      </div>

      <div
        key={index}
        className={`card-premium rounded-2xl p-5 sm:p-6 ${
          revealed ? (right ? 'animate-tada' : 'animate-shake') : 'animate-pop-in'
        }`}
      >
        {image && (
          <div className="mb-4 flex justify-center rounded-xl border border-line bg-surface-2 p-3">
            <img
              src={image}
              alt={t('question.imageAlt', { number: item.question.number ?? '' })}
              className="max-h-48 w-auto rounded-lg object-contain"
            />
          </div>
        )}
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
          {t('blitz.isCorrect')}
        </p>
        <p className="mt-2 font-display text-lg font-semibold leading-snug text-ink">
          {translation.stem}
        </p>
        <p className="mt-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[15px] font-semibold text-ink">
          {translation.options[item.optionIndex]}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => choose(true)}
            disabled={revealed}
            className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
              revealed && isCorrectOption
                ? 'border-success/50 bg-success text-white'
                : revealed
                  ? 'border-line bg-surface-2 text-muted'
                  : 'border-success/40 bg-success-soft text-success hover:bg-success/20'
            }`}
          >
            <Icon name="check" className="me-1.5 inline h-4 w-4" />
            {t('blitz.true')}
          </button>
          <button
            type="button"
            onClick={() => choose(false)}
            disabled={revealed}
            className={`min-h-12 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
              revealed && !isCorrectOption
                ? 'border-success/50 bg-success text-white'
                : revealed
                  ? 'border-line bg-surface-2 text-muted'
                  : 'border-danger/40 bg-danger-soft text-danger hover:bg-danger/20'
            }`}
          >
            <Icon name="x" className="me-1.5 inline h-4 w-4" />
            {t('blitz.false')}
          </button>
        </div>

        {revealed && (
          <p
            role="status"
            className={`mt-3 flex items-center gap-2 text-sm font-semibold ${
              right ? 'text-success' : 'text-danger'
            }`}
          >
            <Icon name={right ? 'check-circle' : 'x-circle'} weight="fill" className="h-5 w-5" />
            {right ? t('practice.feedbackCorrect') : t('practice.feedbackWrong')}
          </p>
        )}
      </div>
    </div>
  )
}

export default Blitz
