import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { TOPIC_MAP } from '../lib/content/topics'
import { getSubjectInsight, getSubjectLessons, localizeLesson, subjectProgress } from '../lib/content/curriculum'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Icon } from '../components/Icon'
import { ProgressRing } from '../components/ui/ProgressRing'

export function Subject() {
  const { t, language } = useI18n()
  const { topicId = '' } = useParams<{ topicId: string }>()
  const { lessons: completed } = useProgress()
  const topic = TOPIC_MAP[topicId]
  const lessons = getSubjectLessons(topicId)

  if (!topic || lessons.length === 0) {
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

  const percent = subjectProgress(lessons, completed)

  return (
    <div className="animate-fade-in space-y-5">
      <Link to="/learn" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <Icon name="arrow-back" className="h-4 w-4 rtl:rotate-180" />
        {t('learn.back')}
      </Link>

      <header className="grid gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="eyebrow">{t('learn.lessons')}</p>
          <h1 className="h1 mt-1.5">{t(topic.nameKey)}</h1>
          <p className="legend mt-2 max-w-xl">{getSubjectInsight(topic.id, language)}</p>
          <p className="mt-2 text-xs font-semibold text-muted">
            {t('learn.progress', {
              done: lessons.filter((lesson) => completed.includes(lesson.id)).length,
              total: lessons.length,
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 lg:flex-col lg:items-end">
          <ProgressRing
            value={percent}
            size={84}
            stroke={7}
            label={t('learn.progress', { done: completed.filter((id) => lessons.some((lesson) => lesson.id === id)).length, total: lessons.length })}
          />
          <Link
            to={`/practice?topic=${topic.id}`}
            className="btn-secondary px-3 py-2 text-xs font-semibold"
          >
            {t('learn.startPractice')}
          </Link>
        </div>
      </header>

      <ol className="space-y-2.5">
        {lessons.map((lessonSource, index) => {
          const lesson = localizeLesson(lessonSource, language)
          const done = completed.includes(lesson.id)
          return (
            <li key={lesson.id}>
              <Link
                to={`/learn/${topic.id}/${lesson.id}`}
                className="row-card lift flex items-center gap-3.5 p-4"
              >
                <span
                  className={`tnum grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${
                    done ? 'bg-success text-white' : 'bg-surface-2 text-muted'
                  }`}
                >
                  {done ? <Icon name="check" className="h-4 w-4" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink sm:text-[15px]">{lesson.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">{lesson.summary}</span>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-muted">
                    <Icon name="clock" className="h-3 w-3" />
                    {t('learn.minutes', { count: lesson.minutes })}
                    {done ? ` · ${t('learn.completed')}` : ''}
                  </span>
                </span>
                <Icon name="chevron-right" className="h-4 w-4 shrink-0 text-muted rtl:rotate-180" />
              </Link>
            </li>
          )
        })}
      </ol>

      <section className="rounded-xl border border-line bg-surface-2 p-4 text-xs leading-relaxed text-muted">
        <p className="flex items-start gap-2">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
          {t('learn.note')}
        </p>
      </section>
    </div>
  )
}

export default Subject
