import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { TOPIC_MAP } from '../lib/content/topics'
import { getLesson, getSubjectLessons, localizeLesson } from '../lib/content/curriculum'
import { isSelectionCorrect, loadTopicQuestions, translate } from '../lib/content/questions'
import { rankByRelevance } from '../lib/content/relevance'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Icon } from '../components/Icon'
import { QuestionRenderer } from '../components/QuestionRenderer'
import { ReadAloudButton } from '../components/ReadAloudButton'
import type { Question } from '../lib/content/schema'

const CHECK_COUNT = 2

/**
 * Stable shuffle so a lesson always shows the same knowledge check while its
 * questions are spread across the topic.
 */
function seededPick<T>(items: T[], seed: string, count: number): T[] {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    hash = (hash * 1103515245 + 12345) >>> 0
    const j = hash % (i + 1)
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}

export function Lesson() {
  const { t, language } = useI18n()
  const { topicId = '', lessonId = '' } = useParams<{ topicId: string; lessonId: string }>()
  const { defaultCategory, lessons: completed, completeLesson, recordAnswer } = useProgress()
  const navigate = useNavigate()
  const [finishing, setFinishing] = useState(false)
  const [checks, setChecks] = useState<Question[]>([])
  const [checkIndex, setCheckIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const topic = TOPIC_MAP[topicId]
  const lessonSource = getLesson(lessonId)
  const lesson = lessonSource ? localizeLesson(lessonSource, language) : undefined
  const subjectLessons = getSubjectLessons(topicId)
  const index = subjectLessons.findIndex((entry) => entry.id === lessonId)
  const prev = index > 0 ? subjectLessons[index - 1] : undefined
  const next = index >= 0 ? subjectLessons[index + 1] : undefined
  const done = completed.includes(lessonId)
  const check = checks[checkIndex]
  const checksReady = checks.length === 0 || answers.length >= checks.length
  // A stable string keeps the effect from re-running on every render.
  const lessonText = lesson
    ? [lesson.title, lesson.summary, ...lesson.keyPoints].join(' ')
    : ''

  // Reset the retrieval-check state during render when the lesson or language
  // changes, instead of syncing it inside the loading effect.
  const resetKey = `${defaultCategory}|${topicId}|${lessonId}|${language}|${lessonText}`
  const [loadedKey, setLoadedKey] = useState('')
  if (loadedKey !== resetKey) {
    setLoadedKey(resetKey)
    setChecks([])
    setCheckIndex(0)
    setAnswers([])
    setSelected([])
    setRevealed(false)
  }

  // Reading alone is not learning: every lesson ends with a short retrieval
  // check built from the official questions of the same topic.
  useEffect(() => {
    if (!TOPIC_MAP[topicId]) return
    let cancelled = false
    void loadTopicQuestions(defaultCategory, topicId)
      .then((pool) => {
        if (cancelled) return
        const relevant = rankByRelevance(
          pool,
          (question) => translate(question, language)?.stem ?? '',
          lessonText,
        ).slice(0, CHECK_COUNT * 20)
        setChecks(seededPick(relevant, lessonId, CHECK_COUNT))
      })
      .catch(() => {
        if (!cancelled) setChecks([])
      })
    return () => {
      cancelled = true
    }
  }, [defaultCategory, topicId, lessonId, language, lessonText])

  function chooseCheck(optionIndex: number) {
    if (!check || revealed) return
    const correct = isSelectionCorrect(check, language, [optionIndex])
    setSelected([optionIndex])
    setRevealed(true)
    setAnswers((list) => [...list, correct])
    recordAnswer({
      category: defaultCategory,
      topicId: check.topicId,
      questionId: check.id,
      correct,
      mode: 'study',
    })
  }

  function nextCheck() {
    if (checkIndex >= checks.length - 1) return
    setCheckIndex((value) => value + 1)
    setSelected([])
    setRevealed(false)
  }

  if (!topic || !lesson || index < 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-lg font-bold text-ink">{t('state.notFoundTitle')}</p>
        <p className="mt-1 text-sm text-muted">{t('state.notFoundBody')}</p>
        <Link to="/learn" className="btn-primary mt-5 px-4 py-2.5 text-sm">
          {t('learn.back')}
        </Link>
      </div>
    )
  }

  const speechText = [
    lesson.title,
    lesson.summary,
    ...lesson.blocks.flatMap((block) => [
      block.heading ?? '',
      block.body,
      ...(block.bullets ?? []),
    ]),
    ...lesson.keyPoints,
  ]
    .filter(Boolean)
    .join('. ')

  async function finish() {
    setFinishing(true)
    completeLesson(lesson!.id)
    setFinishing(false)
  }

  async function finishAndNext() {
    await finish()
    if (next) navigate(`/learn/${topicId}/${next.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to={`/learn/${topicId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
        >
          <Icon name="arrow-back" className="h-4 w-4 rtl:rotate-180" />
          {t(topic.nameKey)}
        </Link>
        <span className="tnum text-xs font-semibold text-muted">
          {t('learn.lesson', { current: index + 1, total: subjectLessons.length })}
        </span>
      </div>

      <div className="flex gap-1" aria-hidden="true">
        {subjectLessons.map((entry, position) => (
          <span
            key={entry.id}
            className={`h-1 flex-1 rounded-full ${
              completed.includes(entry.id) ? 'bg-success' : position === index ? 'bg-accent' : 'bg-line'
            }`}
          />
        ))}
      </div>

      <article className="card overflow-hidden">
        <header className="border-b border-line p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip border-accent/25 bg-accent-soft text-accent">{t(topic.nameKey)}</span>
            <span className="chip">
              <Icon name="clock" className="h-3 w-3" />
              {t('learn.minutes', { count: lesson.minutes })}
            </span>
            {done && (
              <span className="chip border-success/25 bg-success-soft text-success">
                <Icon name="check" className="h-3 w-3" />
                {t('learn.completed')}
              </span>
            )}
          </div>
          <h1 className="h1 mt-3">{lesson.title}</h1>
          <p className="legend mt-2">{lesson.summary}</p>
          <div className="mt-3">
            <ReadAloudButton text={speechText} lang={language} labelKey="a11y.readLesson" />
          </div>
        </header>

        <div className="lesson-body p-5 sm:p-7">
          {lesson.blocks.map((block, blockIndex) => (
            <section key={blockIndex} className={blockIndex > 0 ? 'mt-6' : ''}>
              {block.heading && <h2 className="h3 mb-2 text-ink">{block.heading}</h2>}
              <p>{block.body}</p>
              {block.bullets && (
                <ul>
                  {block.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <aside className="mx-5 mb-5 rounded-xl border border-accent/25 bg-accent-soft/50 p-4 sm:mx-7 sm:mb-7">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
            <Icon name="target" className="h-4 w-4" />
            {t('learn.keyPoints')}
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {lesson.keyPoints.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {point}
              </li>
            ))}
          </ul>
        </aside>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/50 p-4 sm:px-7">
          {prev ? (
            <Link
              to={`/learn/${topicId}/${prev.id}`}
              className="btn-ghost px-2.5 py-2 text-xs font-semibold"
            >
              <Icon name="chevron-right" className="h-4 w-4 rtl:rotate-180" />
              {t('learn.prev')}
            </Link>
          ) : (
            <span />
          )}
          {!done ? (
            <button
              type="button"
              onClick={() => void finish()}
              disabled={finishing || !checksReady}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              {t('learn.finish')}
              <Icon name="check" className="h-4 w-4" />
            </button>
          ) : next ? (
            <Link to={`/learn/${topicId}/${next.id}`} className="btn-primary px-5 py-2.5 text-sm">
              {t('learn.next')}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </Link>
          ) : (
            <Link to={`/practice?topic=${topicId}`} className="btn-primary px-5 py-2.5 text-sm">
              {t('learn.startPractice')}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </Link>
          )}
        </footer>
      </article>

      {check && (
        <section className="card overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4 sm:px-5">
            <div>
              <h2 className="text-sm font-bold text-ink">{t('learn.checkTitle')}</h2>
            </div>
            <span className="tnum chip">
              {Math.min(checkIndex + 1, checks.length)} / {checks.length}
            </span>
          </header>
          <div className="p-4 sm:p-5">
            <QuestionRenderer
              question={check}
              lang={language}
              selected={selected}
              onToggle={chooseCheck}
              reveal={revealed}
            />
            {revealed && (
              <div
                role="status"
                aria-live="polite"
                className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4"
              >
                <Icon
                  name={answers[answers.length - 1] ? 'check-circle' : 'x-circle'}
                  weight="fill"
                  className={`h-5 w-5 shrink-0 ${
                    answers[answers.length - 1] ? 'text-success' : 'text-danger'
                  }`}
                />
                <p className="min-w-0 flex-1 text-sm font-semibold text-ink">
                  {answers[answers.length - 1]
                    ? t('practice.feedbackCorrect')
                    : t('practice.feedbackWrong')}
                </p>
                {checkIndex < checks.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextCheck}
                    className="btn-primary rounded-xl px-4 py-2 text-sm font-bold"
                  >
                    {t('practice.next')}
                    <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
                  </button>
                ) : (
                  !done && (
                    <button
                      type="button"
                      onClick={() => void finish()}
                      disabled={finishing}
                      className="btn-primary rounded-xl px-4 py-2 text-sm font-bold"
                    >
                      {t('learn.finish')}
                      <Icon name="check" className="h-4 w-4" />
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {done && (
        <section className="animate-pop-in grid gap-3 rounded-2xl border border-success/25 bg-success-soft p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success text-white">
              <Icon name="check" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{t('learn.done')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{t('learn.doneSub')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/practice?topic=${topicId}`} className="btn-primary px-4 py-2.5 text-sm">
              {t('learn.startPractice')}
            </Link>
            {next && (
              <button type="button" onClick={() => void finishAndNext()} className="btn-secondary px-4 py-2.5 text-sm">
                {t('learn.next')}
              </button>
            )}
          </div>
        </section>
      )}

      <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-2 p-3.5 text-[11px] leading-relaxed text-muted">
        <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {t('learn.note')} · {lesson.reviewedAt}
      </p>
    </div>
  )
}

export default Lesson
