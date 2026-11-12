import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { CATEGORIES, getCategory } from '../lib/content/categories'
import { TOPICS } from '../lib/content/topics'
import { LESSONS, getSubjectLessons, localizeLesson, subjectProgress } from '../lib/content/curriculum'
import { masteryKey } from '../lib/progress/engine'
import { useProgress } from '../lib/progress/ProgressProvider'
import { getReadinessReport } from '../lib/progress/readiness'
import type { ReadinessReport } from '../lib/progress/readiness'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { ProgressRing } from '../components/ui/ProgressRing'
import { CategoryMark } from '../components/CategoryMark'
import { AdSlot } from '../components/AdSlot'

function daysUntil(date: string): number {
  const target = new Date(`${date}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function Home() {
  const { t, language } = useI18n()
  const {
    displayName,
    defaultCategory,
    testDate,
    studyStage,
    daily,
    dailyGoal,
    streak,
    mastery,
    exams,
    lessons: completedLessons,
    ensureDaily,
    answeredCount,
  } = useProgress()
  const category = getCategory(defaultCategory) ?? CATEGORIES[0]
  const topics = useMemo(
    () => TOPICS.filter((topic) => topic.categories.includes(category.id)),
    [category.id],
  )
  const topicIds = useMemo(() => topics.map((topic) => topic.id), [topics])
  const [report, setReport] = useState<ReadinessReport | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureDaily(topicIds)
  }, [ensureDaily, topicIds])

  useEffect(() => {
    let cancelled = false
    setReady(false)
    void getReadinessReport({ mastery, exams }, category.id).then((next) => {
      if (cancelled) return
      setReport(next)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
    // The report refreshes when answers or exams change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id, answeredCount, exams.length, mastery, completedLessons.length])

  const hour = new Date().getHours()
  const greeting =
    hour < 5
      ? t('dash.night')
      : hour < 12
        ? t('dash.morning')
        : hour < 18
          ? t('dash.afternoon')
          : t('dash.evening')

  const days = testDate ? daysUntil(testDate) : null
  const weakest = useMemo(() => {
    return topics
      .map((topic) => {
        const record = mastery[masteryKey(category.id, topic.id)]
        const accuracy = record && record.answered > 0 ? Math.round((record.correct / record.answered) * 100) : 0
        return { topic, accuracy, answered: record?.answered ?? 0 }
      })
      .filter((row) => row.answered > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3)
  }, [mastery, topics, category.id])

  const lastExam = exams[0]
  const nextAction = useMemo(() => {
    const firstIncompleteSource = LESSONS.find((lesson) => !completedLessons.includes(lesson.id))
    const lessonAction = firstIncompleteSource
      ? (() => {
          const firstIncomplete = localizeLesson(firstIncompleteSource, language)
          return {
            href: `/learn/${firstIncomplete.subjectId}/${firstIncomplete.id}`,
            icon: 'book' as IconName,
            title: firstIncomplete.title,
            body: firstIncomplete.summary,
            meta: `${t(`topic.${firstIncomplete.subjectId}`)} · ${t('learn.minutes', { count: firstIncomplete.minutes })}`,
            cta: t('learn.continue'),
          }
        })()
      : null
    const weakAction =
      weakest[0] && weakest[0].accuracy < 78
        ? {
            href: `/practice?topic=${weakest[0].topic.id}`,
            icon: 'target' as IconName,
            title: `${t('dash.weak')} · ${t(weakest[0].topic.nameKey)}`,
            body: t('practice.subtitle'),
            meta: `${weakest[0].accuracy}% ${t('stats.accuracy')}`,
            cta: t('practice.startRound'),
          }
        : null
    const examAction =
      !lastExam || !lastExam.passed
        ? {
            href: `/exam/${category.id}`,
            icon: 'exam' as IconName,
            title: t('exam.introTitle'),
            body: t('exam.introSub'),
            meta: `${category.questionCount} ${t('exam.questions')} · ${category.timeMinutes} ${t('common.minutes')}`,
            cta: t('exam.begin'),
          }
        : null
    const reviewAction = {
      href: '/review',
      icon: 'review' as IconName,
      title: t('review.title'),
      body: t('review.subtitle'),
      meta: t('review.startMixed'),
      cta: t('review.startMixed'),
    }

    // The onboarding answer changes the route, not just the copy: retakers go
    // straight to weak spots, and people with a test date close by start with
    // a mock exam once most lessons are behind them.
    if (studyStage === 'retake') {
      return weakAction ?? examAction ?? lessonAction ?? reviewAction
    }
    if (studyStage === 'soon') {
      const remaining = LESSONS.length - completedLessons.length
      if (remaining <= LESSONS.length / 2 && examAction) return examAction
    }
    return lessonAction ?? weakAction ?? examAction ?? reviewAction
  }, [completedLessons, weakest, lastExam, category, t, language, studyStage])

  const answeredPct = daily ? Math.min(100, Math.round((daily.answered / Math.max(1, daily.target)) * 100)) : 0
  const currentStreak = answeredCount > 0 ? streak.count : 0
  const bestStreak = answeredCount > 0 ? streak.best : 0
  const parts = [
    { key: 'dash.coverage', value: report?.components.coverage ?? 0 },
    { key: 'dash.accuracy', value: report?.components.accuracy ?? 0 },
    { key: 'dash.consistency', value: report?.components.consistency ?? 0 },
    { key: 'dash.exams', value: report?.components.exams ?? 0 },
    { key: 'dash.unseen', value: report?.components.unseen ?? 0 },
  ]

  return (
    <div className="stagger space-y-5 sm:space-y-6">
      <header className="page-head flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Icon name="seal" className="h-3.5 w-3.5 text-accent" />
            {category.questionCount} {t('common.questions')} · {t('exams.category')} {category.id}
          </p>
          <h1 className="h1 mt-1.5">
            {greeting}
            {displayName ? `, ${displayName}` : ''}
          </h1>
          <p className="legend mt-1.5">{t('dash.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {days !== null && (
            <span className={`chip ${days <= 7 && days >= 0 ? 'border-accent/30 bg-accent-soft text-accent' : ''}`}>
              <Icon name="calendar" className="h-3.5 w-3.5" />
              {days === 0 ? t('dash.todayExam') : t('dash.examIn', { days })}
            </span>
          )}
          <Link to="/settings" className="chip hover:border-line-strong">
            <CategoryMark id={category.id} size="sm" />
            {t(category.nameKey)}
          </Link>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="next-action relative overflow-hidden rounded-2xl border border-accent/25 p-4 sm:p-6">
          <span className="next-action-glow" aria-hidden="true" />
          <span className="absolute inset-y-0 start-0 w-1 bg-accent" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow text-accent">
              <Icon name="arrow-left-right" className="h-3.5 w-3.5" />
              {t('dash.next')}
            </p>
            <span className="chip">{nextAction.meta}</span>
          </div>
          <div className="mt-4 flex items-start gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icon name={nextAction.icon} className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold leading-snug text-ink sm:text-xl">{nextAction.title}</h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">{nextAction.body}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link to={nextAction.href} className="btn-primary px-5 py-2.5 text-sm">
              {nextAction.cta}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link to="/learn" className="btn-ghost px-3 py-2.5 text-sm">
              {t('learn.all')}
            </Link>
          </div>
          <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
            <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t('dash.nextSub')}
          </p>
        </section>

        <section className="card-premium readiness-panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="eyebrow">{t('readiness.title')}</p>
            <Link to="/stats" className="text-[11px] font-semibold text-accent hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <ProgressRing
              className="ring-breathe"
              value={report?.score ?? 0}
              size={104}
              stroke={9}
              label={t('readiness.ring')}
              tone={report?.band === 'strong' ? 'success' : 'accent'}
            />
            <div className="min-w-0">
              <p className="text-base font-bold text-ink">
                {!report || !ready
                  ? t('common.loading')
                  : report.band === 'insufficient'
                    ? t('readiness.notEnough')
                    : report.band === 'strong'
                      ? t('readiness.strong')
                      : report.band === 'building'
                        ? t('readiness.building')
                        : t('readiness.weak')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{t('readiness.sub')}</p>
              {report && report.sample > 0 && (
                <p className="tnum mt-1.5 text-[11px] font-semibold text-ink-soft">
                  {report.sample} / {report.totalQuestions} {t('common.questions')}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {parts.map((part) => (
              <div key={part.key} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-[10px] font-semibold text-muted">{t(part.key)}</span>
                <span className="progress-track flex-1">
                  <span className="progress-fill" style={{ width: `${part.value}%` }} />
                </span>
                <span className="tnum w-8 text-end text-[10px] font-bold text-ink-soft">{Math.round(part.value)}%</span>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-line pt-2.5 text-[10px] leading-relaxed text-muted">
            {t('readiness.disclaimer')}
          </p>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card-premium p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Icon name="target" className="h-4 w-4 text-accent" />
              {t('dash.goal')}
            </p>
            <span className="chip border-warning/30 bg-warning-soft text-warning">
              <Icon name="flame" className="h-3.5 w-3.5" />
              {currentStreak} {t('dash.days')}
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="tnum text-2xl font-extrabold text-ink">
              {daily?.answered ?? 0}
              <span className="text-sm font-semibold text-muted"> / {daily?.target ?? dailyGoal}</span>
            </p>
            <span className="text-xs font-semibold text-muted">{answeredPct}%</span>
          </div>
          <div className="progress-track mt-2">
            <span className="progress-fill" style={{ width: `${answeredPct}%` }} />
          </div>
          <Link to="/review" className="btn-secondary mt-4 w-full px-3 py-2.5 text-sm">
            {t('review.startMixed')}
            <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </section>

        <section className="card-premium p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Icon name="chart" className="h-4 w-4 text-accent" />
              {t('dash.weak')}
            </p>
            <span className="text-[11px] text-muted">{t('dash.weakSub')}</span>
          </div>
          {weakest.length > 0 ? (
            <ul className="mt-3 space-y-2.5">
              {weakest.map((row) => (
                <li key={row.topic.id}>
                  <Link to={`/practice?topic=${row.topic.id}`} className="group flex items-center gap-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-soft group-hover:text-ink">
                      {t(row.topic.nameKey)}
                    </span>
                    <span className="progress-track w-20">
                      <span
                        className={`progress-fill ${row.accuracy < 60 ? 'bg-danger' : row.accuracy < 75 ? 'bg-warning' : ''}`}
                        style={{ width: `${row.accuracy}%` }}
                      />
                    </span>
                    <span className="tnum w-8 text-end text-xs font-bold text-muted">{row.accuracy}%</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-muted">
              {t('home.readinessEmpty')}
            </p>
          )}
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card-premium p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Icon name="exam" className="h-4 w-4 text-accent" />
              {t('dash.exam')}
            </p>
            <Link to="/exams" className="text-[11px] font-semibold text-accent hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>
          {lastExam ? (
            <div className="mt-3 flex items-center gap-3">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${lastExam.passed ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                {lastExam.score}/{lastExam.total}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  {lastExam.passed ? t('exam.pass') : t('exam.fail')} · {t(category.nameKey)}
                </p>
                <p className="tnum mt-0.5 text-[11px] text-muted">
                  {new Date(lastExam.ts).toLocaleDateString()} · {Math.floor(lastExam.durationSec / 60)}:{String(lastExam.durationSec % 60).padStart(2, '0')}
                </p>
              </div>
              <Link to="/review" className="btn-ghost px-2.5 py-2 text-xs font-semibold">
                {t('exams.review')}
              </Link>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm font-semibold text-ink">{t('dash.noExam')}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{t('dash.noExamBody')}</p>
              <Link to={`/exam/${category.id}`} className="btn-secondary mt-3 px-3 py-2 text-xs">
                {t('exam.begin')}
              </Link>
            </div>
          )}
        </section>

        <section className="card-premium p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Icon name="trophy" className="h-4 w-4 text-accent-2" />
              {t('dash.ach')}
            </p>
            <Link to="/achievements" className="text-[11px] font-semibold text-accent hover:underline">
              {t('common.viewAll')}
            </Link>
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">
            {completedLessons.length} {t('learn.completed')} · {bestStreak} {t('dash.days')}
          </p>
          <div className="mt-3">
            {topics.map((topic) => {
              const subjectLessons = getSubjectLessons(topic.id)
              const pct = subjectProgress(subjectLessons, completedLessons)
              return (
                <div key={topic.id} className="mt-2 flex items-center gap-2">
                  <span className="w-20 shrink-0 truncate text-[10px] font-semibold text-muted">{t(topic.nameKey)}</span>
                  <span className="progress-track flex-1">
                    <span className="progress-fill" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="tnum w-8 text-end text-[10px] text-muted">{pct}%</span>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <AdSlot placement="home" />
    </div>
  )
}

export default Home
