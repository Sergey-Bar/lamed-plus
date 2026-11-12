import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { TOPICS } from '../lib/content/topics'
import { CATEGORIES, getCategory } from '../lib/content/categories'
import { masteryKey, todayKey } from '../lib/progress/engine'
import { useProgress } from '../lib/progress/ProgressProvider'
import { getReadinessReport } from '../lib/progress/readiness'
import type { ReadinessReport } from '../lib/progress/readiness'
import { all } from '../lib/store/store'
import { Icon } from '../components/Icon'
import { ProgressRing } from '../components/ui/ProgressRing'

interface HistoryEvent {
  category: string
  ts: number
}

export function Stats() {
  const { t } = useI18n()
  const { defaultCategory, mastery, exams, answeredCount } = useProgress()
  const category = getCategory(defaultCategory) ?? CATEGORIES[0]
  const topics = TOPICS.filter((topic) => topic.categories.includes(category.id))
  const [history, setHistory] = useState<HistoryEvent[]>([])
  const [report, setReport] = useState<ReadinessReport | null>(null)

  useEffect(() => {
    let cancelled = false
    void all<HistoryEvent>('history').then((rows) => {
      if (!cancelled) setHistory(rows)
    })
    void getReadinessReport({ mastery, exams }, category.id).then((next) => {
      if (!cancelled) setReport(next)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id, answeredCount, exams.length, mastery])

  const categoryEvents = history.filter((event) => event.category === category.id)
  const correct = categoryEvents.filter((event) => (event as { correct?: boolean }).correct).length
  const accuracy = categoryEvents.length ? Math.round((correct / categoryEvents.length) * 100) : 0

  const days = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(now.getTime() - (13 - index) * 86400000)
      const key = todayKey(date.getTime())
      const count = categoryEvents.filter((event) => todayKey(event.ts) === key).length
      return { key, label: date.toLocaleDateString(undefined, { weekday: 'narrow' }), count }
    })
  }, [categoryEvents])

  const max = Math.max(1, ...days.map((day) => day.count))
  const categoryExams = exams.filter((exam) => exam.category === category.id)

  return (
    <div className="animate-fade-in space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t('dash.breakdown')}</p>
          <h1 className="h1 mt-1.5">{t('stats.title')}</h1>
          <p className="legend mt-2 max-w-2xl">{t('stats.sub')}</p>
        </div>
        <span className="chip">{t(category.nameKey)}</span>
      </header>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { icon: 'clipboard' as const, value: answeredCount, label: t('stats.answered') },
          { icon: 'target' as const, value: `${accuracy}%`, label: t('stats.overall') },
          { icon: 'chart' as const, value: `${Math.round(report?.components.coverage ?? 0)}%`, label: t('stats.coverage') },
          { icon: 'exam' as const, value: categoryExams.length, label: t('exams.total') },
        ].map((stat) => (
          <div key={stat.label} className="stat-tile">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-muted">
              <Icon name={stat.icon} className="h-4 w-4" />
            </span>
            <p className="tnum mt-2.5 text-2xl font-extrabold text-ink">{stat.value}</p>
            <p className="text-[11px] font-semibold leading-tight text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <section className="card p-4 sm:p-5">
          <div className="section-head">
            <h2 className="h2">{t('stats.subject')}</h2>
            <span className="text-[11px] text-muted">{t('stats.accuracy')}</span>
          </div>
          <ul className="mt-4 space-y-3.5">
            {topics.map((topic) => {
              const record = mastery[masteryKey(category.id, topic.id)]
              const pct = record?.answered ? Math.round((record.correct / record.answered) * 100) : 0
              return (
                <li key={topic.id}>
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                    <span className="text-ink-soft">{t(topic.nameKey)}</span>
                    <span className="tnum text-muted">
                      {pct}% · {record?.answered ?? 0}
                    </span>
                  </div>
                  <div className="progress-track mt-1.5">
                    <span
                      className={`progress-fill ${pct > 0 && pct < 60 ? 'bg-danger' : pct >= 80 ? 'bg-success' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="card flex flex-col items-center justify-center p-5 text-center">
          <p className="eyebrow">{t('readiness.title')}</p>
          <div className="mt-3">
            <ProgressRing
              value={report?.score ?? 0}
              size={120}
              stroke={10}
              tone={report?.band === 'strong' ? 'success' : 'accent'}
            />
          </div>
          <p className="mt-3 text-sm font-bold text-ink">
            {!report
              ? t('common.loading')
              : report.band === 'insufficient'
                ? t('readiness.notEnough')
                : t(`readiness.${report.band === 'strong' ? 'strong' : report.band === 'building' ? 'building' : 'weak'}`)}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">{t('readiness.sub')}</p>
          <Link to="/exams" className="btn-secondary mt-4 px-3 py-2 text-xs">
            {t('exams.start')}
          </Link>
        </section>
      </div>

      <section className="card p-4 sm:p-5">
        <div className="section-head">
          <div>
            <h2 className="h2">{t('stats.activity')}</h2>
            <p className="mt-0.5 text-[11px] text-muted">{t('stats.activitySub')}</p>
          </div>
          <span className="chip">{t('stats.last14')}</span>
        </div>
        <div className="mt-4 flex h-28 items-end gap-1.5" role="img" aria-label={t('stats.activity')}>
          {days.map((day) => (
            <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="tnum text-[9px] font-semibold text-muted">{day.count || ''}</span>
              <span
                className="w-full rounded-t-[3px] bg-accent/80"
                style={{ height: `${Math.max(3, (day.count / max) * 82)}px` }}
              />
              <span className="text-[9px] font-semibold text-muted">{day.label}</span>
            </div>
          ))}
        </div>
        {categoryEvents.length === 0 && (
          <p className="mt-3 rounded-lg bg-surface-2 p-3 text-xs text-muted">{t('home.readinessEmpty')}</p>
        )}
      </section>

      <section className="space-y-2.5">
        <h2 className="h2">{t('stats.examHistory')}</h2>
        {categoryExams.length === 0 ? (
          <p className="card border-dashed p-4 text-sm text-muted">{t('stats.noExams')}</p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {categoryExams.slice(0, 8).map((exam) => (
              <li key={exam.id} className="flex items-center gap-3 p-3.5">
                <span className={`tnum grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${exam.passed ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                  {exam.score}
                </span>
                <span className="min-w-0 flex-1 text-xs text-muted">
                  {new Date(exam.ts).toLocaleDateString()} · {t(exam.passed ? 'exams.passed' : 'exams.failed')}
                </span>
                <span className="tnum text-sm font-bold text-ink">{exam.score}/{exam.total}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Stats
