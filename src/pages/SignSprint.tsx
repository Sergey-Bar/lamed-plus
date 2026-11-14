import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { getCategory } from '../lib/content/categories'
import { useProgress } from '../lib/progress/ProgressProvider'
import { isPlayable, loadCategoryQuestions, translate } from '../lib/content/questions'
import { answerIsCorrect } from '../lib/progress/engine'
import { GAME } from '../lib/progress/config'
import type { PowerupKind } from '../lib/progress/config'
import { formatClock, shuffle } from '../lib/utils'
import { Confetti } from '../components/Confetti'
import { GamifiedHud } from '../components/GamifiedHud'
import { PowerupBar } from '../components/PowerupBar'
import { Icon } from '../components/Icon'
import { QuestionRenderer } from '../components/QuestionRenderer'
import type { Question } from '../lib/content/schema'

type Phase = 'ready' | 'play' | 'over'

const GAME_TIME = 45

export function SignSprint() {
  const { t, language } = useI18n()
  const { defaultCategory, recordAnswer, loseLife, spendPowerup } = useProgress()
  const category = getCategory(defaultCategory)
  const [phase, setPhase] = useState<Phase>('ready')
  const [deck, setDeck] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [burst, setBurst] = useState(false)
  const [reason, setReason] = useState<'time' | 'deck' | 'lives'>('time')
  const [best, setBest] = useState(() => Number(localStorage.getItem('sprint-best') ?? 0))

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const images = (await loadCategoryQuestions(defaultCategory)).filter(
        (q) => isPlayable(q) && q.type === 'image',
      )
      if (cancelled) return
      const base = shuffle(images)
      let expanded: Question[] = []
      while (expanded.length < 14 && base.length > 0) expanded = expanded.concat(base)
      setDeck(expanded.slice(0, 14))
    })()
    return () => {
      cancelled = true
    }
  }, [defaultCategory])

  function start() {
    setScore(0)
    setStreak(0)
    setIndex(0)
    setSelected([])
    setRevealed(false)
    setTimeLeft(GAME_TIME)
    setReason('time')
    setPhase('play')
  }

  function end(why: 'time' | 'deck' | 'lives' = 'time') {
    setPhase('over')
    setReason(why)
    setBurst(true)
    window.setTimeout(() => setBurst(false), 1400)
    if (score > best) {
      setBest(score)
      localStorage.setItem('sprint-best', String(score))
    }
  }

  useEffect(() => {
    if (phase !== 'play') return
    if (timeLeft <= 0) {
      end()
      return
    }
    const id = window.setInterval(() => setTimeLeft((s) => s - 1), 1000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft])

  useEffect(() => {
    if (phase !== 'play' || !revealed) return
    const id = window.setTimeout(() => {
      if (index >= deck.length - 1) {
        end('deck')
        return
      }
      setIndex((i) => i + 1)
      setRevealed(false)
      setSelected([])
      setCorrect(false)
    }, 900)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, phase, index, deck.length])

  if (phase === 'over') {
    return (
      <div className="animate-pop-in space-y-6 text-center">
        <Confetti burst={burst} />
        <Icon name="flag" className="animate-tada mx-auto h-12 w-12 text-info" />
        <h1 className="h1">{t('sprint.over')}</h1>
        <p className="text-3xl font-extrabold text-success">{score}</p>
        {reason === 'lives' && (
          <p className="text-sm font-semibold text-danger">{t('game.outOfLives')}</p>
        )}
        <p className="text-sm text-muted">{t('sprint.best')}: {best}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={start} className="btn-primary press rounded-2xl px-6 py-3 font-bold">
            {t('common.retry')}
          </button>
          <Link to="/games" className="btn-secondary rounded-2xl px-5 py-3 text-sm font-semibold">
            {t('nav.games')}
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'ready') {
    return (
      <div className="animate-fade-in space-y-5">
        <GamifiedHud />
        <div className="card-premium rounded-[1.75rem] p-7">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/12 text-accent">
            <Icon name="sign" className="h-6 w-6" />
          </span>
          <h1 className="h1 mt-5">{t('games.signSprint.name')}</h1>
          <p className="legend mt-1">{t('games.signSprint.desc')}</p>
          <p className="mt-4 text-sm text-muted">
            {t('sprint.best')}: <span className="font-bold text-ink">{best}</span>
            {category && ` · ${t(category.nameKey)}`}
          </p>
          <button type="button" onClick={start} className="btn-primary press mt-6 rounded-xl px-6 py-3 font-bold">
            {t('sprint.start')}
          </button>
        </div>
      </div>
    )
  }

  const q = deck[index]
  const tr = q ? translate(q, language) : undefined

  if (!q || !tr) return <p className="text-muted">{t('common.loading')}</p>

  function choose(i: number) {
    if (revealed) return
    const ok = answerIsCorrect(tr!.correctIndexes, [i])
    setCorrect(ok)
    setSelected([i])
    setRevealed(true)
    recordAnswer({
      category: category?.id ?? defaultCategory,
      topicId: q!.topicId,
      questionId: q!.id,
      correct: ok,
      mode: 'game',
    })
    if (ok) {
      setScore((s) => s + 1)
      setStreak((x) => x + 1)
    } else {
      setStreak(0)
      void loseLife().then(({ lives }) => {
        if (lives <= 0) end('lives')
      })
    }
  }

  async function applyPowerup(kind: PowerupKind) {
    if (revealed) return
    if (kind === 'freeze') {
      const used = await spendPowerup('freeze')
      if (!used) return
      setTimeLeft((s) => s + GAME.freezeSeconds)
      return
    }
    if (kind === 'shield') {
      await spendPowerup('shield')
    }
  }

  return (
    <div className="animate-fade-in space-y-4">
      <GamifiedHud />
      <PowerupBar
        kinds={['freeze', 'shield']}
        onUse={(kind) => void applyPowerup(kind)}
        disabled={revealed}
      />
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-sm font-bold flex items-center gap-1 ${timeLeft <= 10 ? 'bg-danger-soft text-danger animate-pulse-soft' : 'bg-surface-2 text-muted'}`}>
          <Icon name="timer" className="h-4 w-4" />
          {formatClock(timeLeft)}
        </span>
        <span className="text-sm font-bold text-success">
          {t('sprint.score')}: {score}
        </span>
        <span className="text-sm font-bold text-danger flex items-center gap-1">
          <Icon name="flame" className="h-4 w-4" />
          {streak}
        </span>
      </div>
      <div
        key={q.id}
        className={`card-premium rounded-3xl p-5 ${
          revealed ? (correct ? 'animate-tada' : 'animate-shake') : 'animate-pop-in'
        }`}
      >
        <QuestionRenderer
          question={q}
          lang={language}
          selected={selected}
          onToggle={choose}
          reveal={revealed}
        />
      </div>
    </div>
  )
}

export default SignSprint
