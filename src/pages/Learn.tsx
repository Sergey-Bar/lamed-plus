import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { TOPICS } from '../lib/content/topics'
import { CATEGORIES, getCategory } from '../lib/content/categories'
import { LESSONS, getSubjectLessons, getSubjectInsight, localizeLesson, subjectProgress } from '../lib/content/curriculum'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { CategoryMark } from '../components/CategoryMark'

const TOPIC_ICONS: Record<string, IconName> = {
  laws: 'book',
  signs: 'sign',
  safety: 'shield-check',
  vehicle: 'steering',
}

export function Learn() {
  const { t, language } = useI18n()
  const { defaultCategory, lessons: completed } = useProgress()
  const category = getCategory(defaultCategory) ?? CATEGORIES[0]
  const topics = TOPICS.filter((topic) => topic.categories.includes(category.id))
  const nextLessonSource = LESSONS.find((lesson) => !completed.includes(lesson.id))
  const nextLesson = nextLessonSource ? localizeLesson(nextLessonSource, language) : undefined
  const done = LESSONS.filter((lesson) => completed.includes(lesson.id)).length
  const total = LESSONS.length

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t('study.selectTopic')}</p>
          <h1 className="h1 mt-1.5">{t('learn.title')}</h1>
          <p className="legend mt-2 max-w-2xl">{t('learn.sub')}</p>
        </div>
        <Link to="/settings" className="chip hover:border-line-strong">
          <CategoryMark id={category.id} size="sm" />
          {t(category.nameKey)}
        </Link>
      </header>

      {nextLesson ? (
        <section className="grid gap-4 rounded-2xl border border-accent/25 bg-surface p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icon name="book" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="eyebrow text-accent">{t('learn.continue')}</p>
              <h2 className="mt-1 text-base font-bold text-ink sm:text-lg">{nextLesson.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {t(`topic.${nextLesson.subjectId}`)} · {t('learn.minutes', { count: nextLesson.minutes })} ·{' '}
                {t('learn.progress', { done, total })}
              </p>
            </div>
          </div>
          <Link
            to={`/learn/${nextLesson.subjectId}/${nextLesson.id}`}
            className="btn-primary px-4 py-2.5 text-sm lg:justify-self-end"
          >
            {t('learn.continue')}
            <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </section>
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-success/25 bg-success-soft p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-success text-white">
              <Icon name="check" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{t('learn.done')}</p>
              <p className="text-xs text-muted">{t('learn.doneSub')}</p>
            </div>
          </div>
          <Link to="/practice" className="btn-primary px-4 py-2.5 text-sm">
            {t('learn.startPractice')}
          </Link>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((topic) => {
          const subjectLessons = getSubjectLessons(topic.id)
          const percent = subjectProgress(subjectLessons, completed)
          const completedCount = subjectLessons.filter((lesson) => completed.includes(lesson.id)).length
          return (
            <Link key={topic.id} to={`/learn/${topic.id}`} className="row-card lift group p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-ink-soft transition-colors group-hover:bg-accent-soft group-hover:text-accent">
                  <Icon name={TOPIC_ICONS[topic.id] ?? 'book'} className="h-5 w-5" />
                </span>
                <span className="tnum text-xs font-semibold text-muted">
                  {completedCount}/{subjectLessons.length}
                </span>
              </div>
              <h2 className="mt-4 text-base font-bold text-ink">{t(topic.nameKey)}</h2>
              <p className="mt-1 min-h-10 text-xs leading-relaxed text-muted">
                {getSubjectInsight(topic.id, language)}
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="progress-track flex-1">
                  <span className="progress-fill" style={{ width: `${percent}%` }} />
                </span>
                <span className="tnum text-[11px] font-semibold text-muted">{percent}%</span>
              </div>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                {percent > 0 ? t('learn.continue') : t('learn.start')}
                <Icon name="arrow-forward" className="h-3.5 w-3.5 rtl:rotate-180" />
              </p>
            </Link>
          )
        })}
      </div>

      <section className="rounded-xl border border-line bg-surface-2 p-4 text-xs leading-relaxed text-muted">
        <p className="flex items-start gap-2">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
          {t('learn.note')}
        </p>
      </section>
    </div>
  )
}

export default Learn
