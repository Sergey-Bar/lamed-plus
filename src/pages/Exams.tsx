import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { CATEGORIES, getCategory } from '../lib/content/categories'
import { TOPICS } from '../lib/content/topics'
import { masteryKey } from '../lib/progress/engine'
import { useProgress } from '../lib/progress/ProgressProvider'
import { getReadinessReport } from '../lib/progress/readiness'
import type { ReadinessReport } from '../lib/progress/readiness'
import { Icon } from '../components/Icon'
import { CategoryMark } from '../components/CategoryMark'
import { ProgressRing } from '../components/ui/ProgressRing'

export function Exams() {
  const { t } = useI18n()
  const { defaultCategory, setDefaultCategory, mastery, exams, answeredCount } = useProgress()
  const category = getCategory(defaultCategory) ?? CATEGORIES[0]
  const [report, setReport] = useState<ReadinessReport | null>(null)

  useEffect(() => {
    void getReadinessReport({ mastery, exams }, category.id).then(setReport)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id, exams.length, answeredCount])

  const categoryExams = exams.filter((exam) => exam.category === category.id)
  const lastThree = [...categoryExams].slice(0, 3)
  const average = lastThree.length
    ? Math.round((lastThree.reduce((sum, exam) => sum + exam.score / exam.total, 0) / lastThree.length) * 100)
    : null
  const best = categoryExams.length ? Math.max(...categoryExams.map((exam) => exam.score)) : null
  const weakestTopic = TOPICS.filter((topic) => topic.categories.includes(category.id))
    .map((topic) => {
      const record = mastery[masteryKey(category.id, topic.id)]
      return { topic, accuracy: record?.answered ? record.correct / record.answered : 0, answered: record?.answered ?? 0 }
    })
    .filter((row) => row.answered > 0)
    .sort((a, b) => a.accuracy - b.accuracy)[0]

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <p className="eyebrow">{t('exam.official')}</p>
        <h1 className="h1 mt-1.5">{t('exams.title')}</h1>
        <p className="legend mt-2 max-w-2xl">{t('exams.sub')}</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <div className="card p-4 sm:p-5">
          <p className="text-sm font-bold text-ink">{t('exams.selectCategory')}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((item) => {
              const active = item.id === category.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDefaultCategory(item.id)}
                  className={`press flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-start ${
                    active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-surface-2'
                  }`}
                >
                  <CategoryMark id={item.id} size="sm" tone={active ? 'accent' : 'default'} />
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">{t(item.nameKey)}</span>
                  {active && <Icon name="check" className="h-3.5 w-3.5 shrink-0 text-accent" />}
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
            <div>
              <p className="font-bold text-ink">{t(category.nameKey)}</p>
              <p className="text-xs text-muted">{t('home.categoriesSub')}</p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-center">
                <p className="tnum text-lg font-bold text-ink">{category.questionCount}</p>
                <p className="text-[10px] font-semibold text-muted">{t('exam.questions')}</p>
              </div>
              <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-center">
                <p className="tnum text-lg font-bold text-ink">{category.timeMinutes}</p>
                <p className="text-[10px] font-semibold text-muted">{t('common.minutes')}</p>
              </div>
              <div className="rounded-lg border border-accent/25 bg-accent-soft px-3 py-2 text-center">
                <p className="tnum text-lg font-bold text-accent">{category.passThreshold}</p>
                <p className="text-[10px] font-semibold text-muted">{t('exam.threshold')}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {lastThree.length > 0 && (
              <span className="chip">
                {t('exams.best')}: <span className="tnum font-bold text-ink">{best}/{category.questionCount}</span>
              </span>
            )}
            {average !== null && (
              <span className="chip">
                {t('exams.average')}: <span className="tnum font-bold text-ink">{average}%</span>
              </span>
            )}
            <span className="chip">
              {t('exams.total')}: <span className="tnum font-bold text-ink">{categoryExams.length}</span>
            </span>
          </div>

          <Link to={`/exam/${category.id}`} className="btn-primary mt-4 w-full px-4 py-3 text-sm sm:w-auto">
            <Icon name="flag-checkered" className="h-4 w-4" />
            {t('exams.start')}
          </Link>
        </div>

        <aside className="card p-4 sm:p-5">
          <p className="eyebrow">{t('exams.readiness')}</p>
          <div className="mt-3 flex items-center gap-4">
            <ProgressRing
              value={report?.score ?? 0}
              size={96}
              stroke={8}
              tone={report?.band === 'strong' ? 'success' : 'accent'}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">
                {!report
                  ? t('common.loading')
                  : report.band === 'insufficient'
                    ? t('readiness.notEnough')
                    : t(`readiness.${report.band === 'strong' ? 'strong' : report.band === 'building' ? 'building' : 'weak'}`)}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{t('readiness.sub')}</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">{t('readiness.disclaimer')}</p>
          {weakestTopic && weakestTopic.accuracy < 0.78 && (
            <Link
              to={`/practice?topic=${weakestTopic.topic.id}`}
              className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs font-semibold text-ink hover:border-line-strong"
            >
              <span className="truncate">{t('dash.weak')}: {t(weakestTopic.topic.nameKey)}</span>
              <Icon name="arrow-forward" className="h-3.5 w-3.5 shrink-0 text-muted rtl:rotate-180" />
            </Link>
          )}
          <Link to="/review" className="btn-secondary mt-3 w-full px-3 py-2 text-xs">
            {t('exams.review')}
          </Link>
        </aside>
      </section>

      <section className="space-y-3">
        <div className="section-head">
          <h2 className="h2">{t('exams.history')}</h2>
          <Link to="/stats" className="text-xs font-semibold text-accent hover:underline">
            {t('common.viewAll')}
          </Link>
        </div>
        {categoryExams.length === 0 ? (
          <div className="card flex items-start gap-3 border-dashed p-4 text-sm">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted">
              <Icon name="exam" className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">{t('exams.noHistory')}</p>
              <p className="mt-0.5 text-xs text-muted">{t('exams.noHistorySub')}</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {categoryExams.slice(0, 6).map((exam) => (
              <li key={exam.id} className="flex items-center gap-3 p-3.5">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${exam.passed ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
                  <Icon name={exam.passed ? 'check' : 'x'} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-ink">
                    {new Date(exam.ts).toLocaleDateString()} · {Math.floor(exam.durationSec / 60)}:{String(exam.durationSec % 60).padStart(2, '0')}
                  </p>
                  <p className="text-[11px] text-muted">{exam.passed ? t('exams.passed') : t('exams.failed')}</p>
                </div>
                <span className="tnum text-sm font-bold text-ink">{exam.score}/{exam.total}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-[11px] leading-relaxed text-muted">
          <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t('exams.note')}
        </p>
      </section>
    </div>
  )
}

export default Exams
