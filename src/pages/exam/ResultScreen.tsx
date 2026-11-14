import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n/useI18n'
import { translate } from '../../lib/content/questions'
import { getExplanation } from '../../lib/content/explanations'
import { assetUrl } from '../../lib/content/assets'
import { Icon } from '../../components/Icon'
import { ProgressRing } from '../../components/ui/ProgressRing'
import type { LanguageId } from '../../lib/content/schema'
import type { Result } from './examShared'

export function ResultScreen({
  result,
  categoryName,
  language,
  showReview,
  onToggleReview,
  onRetry,
}: {
  result: Result
  categoryName: string
  language: LanguageId
  showReview: boolean
  onToggleReview: () => void
  onRetry: () => void
}) {
  const { t } = useI18n()
  const percent = Math.round((result.score / Math.max(1, result.total)) * 100)
  const wrong = result.results.filter((entry) => !entry.correct && entry.selected.length > 0).length
  const skipped = result.results.filter((entry) => entry.selected.length === 0).length
  const minutes = Math.floor(result.durationSec / 60)
  const seconds = String(result.durationSec % 60).padStart(2, '0')

  const byTopic = new Map<string, { correct: number; total: number }>()
  for (const entry of result.results) {
    const current = byTopic.get(entry.question.topicId) ?? { correct: 0, total: 0 }
    current.total += 1
    if (entry.correct) current.correct += 1
    byTopic.set(entry.question.topicId, current)
  }
  const topicRows = [...byTopic.entries()]
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
  const weakestTopic = topicRows.find((row) => row.correct / row.total < 0.7)?.id

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
      <section
        className={`rounded-2xl border p-5 text-center sm:p-8 ${
          result.passed ? 'border-success/35 bg-success-soft' : 'border-danger/35 bg-danger-soft'
        }`}
      >
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            result.passed ? 'bg-success text-white' : 'bg-danger text-white'
          }`}
        >
          <Icon name={result.passed ? 'check' : 'x'} className="h-7 w-7" />
        </span>
        <p className="eyebrow mt-4">{t('exam.resultsTitle')} · {categoryName}</p>
        <h1 className="h1 mt-1">{result.passed ? t('exam.pass') : t('exam.fail')}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          {result.passed
            ? t('exam.passSub')
            : t(
                Math.max(0, result.threshold - result.score) === 1 ? 'exam.failSubOne' : 'exam.failSub',
                { count: Math.max(0, result.threshold - result.score) },
              )}
        </p>

        <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-5">
          <ProgressRing
            value={percent}
            size={132}
            stroke={11}
            label={t('exam.score')}
            tone={result.passed ? 'success' : 'danger'}
          />
          <div className="text-start">
            <p className="tnum font-display text-3xl font-bold text-ink">
              {result.score}
              <span className="text-lg text-muted">/{result.total}</span>
            </p>
            <p className="text-xs font-semibold text-muted">
              {t('exam.threshold')}: {result.threshold}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { value: result.score, label: t('exam.correct'), tone: 'text-success' },
            { value: wrong, label: t('exam.wrong'), tone: 'text-danger' },
            { value: skipped, label: t('exam.skipped'), tone: 'text-muted' },
            { value: `${minutes}:${seconds}`, label: t('exam.duration'), tone: 'text-ink' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-line bg-surface/80 p-3">
              <p className={`tnum font-display text-xl font-bold ${stat.tone}`}>{stat.value}</p>
              <p className="text-[11px] font-semibold text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {topicRows.length > 0 && (
          <div className="mt-5 text-start">
            <h2 className="text-sm font-bold text-ink">{t('exam.byTopic')}</h2>
            <ul className="mt-2.5 space-y-2">
              {topicRows.map((row) => {
                const topicPercent = Math.round((row.correct / row.total) * 100)
                return (
                  <li key={row.id} className="rounded-xl border border-line bg-surface/80 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-ink">{t(`topic.${row.id}`)}</span>
                      <span className="tnum text-xs font-bold text-muted">
                        {row.correct}/{row.total}
                      </span>
                    </div>
                    <span className="progress-track mt-2 block">
                      <span
                        className={`progress-fill ${topicPercent >= 70 ? 'bg-success' : 'bg-danger'}`}
                        style={{ width: `${topicPercent}%` }}
                      />
                    </span>
                  </li>
                )
              })}
            </ul>
            {weakestTopic && (
              <Link
                to={`/learn/${weakestTopic}`}
                className="btn-secondary mt-3 px-4 py-2.5 text-sm font-semibold"
              >
                <Icon name="book" className="h-4 w-4" />
                {t('exam.workOnTopic')}
              </Link>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={onToggleReview} className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Icon name={showReview ? 'chevron-down' : 'clipboard'} className="h-4 w-4" />
            {showReview ? t('exam.hideAnswers') : t('exam.reviewAnswers')}
          </button>
          <Link to="/review" className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">
            {t('exams.review')}
          </Link>
          <button type="button" onClick={onRetry} className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold">
            {t('exam.retake')}
          </button>
          <Link to="/app" className="btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold">
            {t('nav.home')}
          </Link>
        </div>
      </section>

      {showReview && (
        <section className="space-y-3">
          <h2 className="h2">{t('exam.reviewAnswers')}</h2>
          {result.results.map((entry, position) => {
            const translation = translate(entry.question, language)
            if (!translation) return null
            const image = entry.question.image ? assetUrl(entry.question.image) : undefined
            const explanation = getExplanation(entry.question.id, language)
            return (
              <article key={entry.question.id} className="card rounded-2xl p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="tnum chip">#{entry.question.number ?? position + 1}</span>
                  <span
                    className={`chip ${
                      entry.correct
                        ? 'border-success/30 bg-success-soft text-success'
                        : entry.selected.length === 0
                          ? 'border-line bg-surface-2 text-muted'
                          : 'border-danger/30 bg-danger-soft text-danger'
                    }`}
                  >
                    <Icon
                      name={entry.correct ? 'check' : entry.selected.length === 0 ? 'info' : 'x'}
                      className="h-3 w-3"
                    />
                    {entry.correct
                      ? t('exam.correct')
                      : entry.selected.length === 0
                        ? t('exam.noAnswer')
                        : t('exam.wrong')}
                  </span>
                </div>
                <div className="mt-2 flex gap-3">
                  {image && (
                    <img
                      src={image}
                      alt={t('question.imageAlt', { number: entry.question.number ?? '' })}
                      className="h-16 w-16 shrink-0 rounded-lg border border-line object-cover"
                    />
                  )}
                  <p className="font-display text-[15px] font-semibold leading-snug text-ink">{translation.stem}</p>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {translation.options.map((option, optionIndex) => {
                    const isCorrect = entry.correctIndexes.includes(optionIndex)
                    const isSelected = entry.selected.includes(optionIndex)
                    return (
                      <li
                        key={optionIndex}
                        className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                          isCorrect
                            ? 'border-success/35 bg-success-soft text-ink'
                            : isSelected
                              ? 'border-danger/35 bg-danger-soft text-ink'
                              : 'border-line bg-surface text-muted'
                        }`}
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-current text-[10px] font-bold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {isCorrect && <Icon name="check" className="h-4 w-4 shrink-0 text-success" />}
                        {isSelected && !isCorrect && <Icon name="x" className="h-4 w-4 shrink-0 text-danger" />}
                      </li>
                    )
                  })}
                </ul>
                {!entry.correct && (
                  <>
                    <p className="mt-2 text-xs font-semibold text-muted">
                      {t('exam.correctAnswer')}:{' '}
                      {translation.options[entry.correctIndexes[0]] ?? '—'}
                    </p>
                    {explanation && (
                      <div className="mt-2 rounded-xl border border-info/25 bg-info-soft p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-info">
                          {t('explanation.title')}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink">
                          {explanation.text}
                        </p>
                        {explanation.language !== language && (
                          <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                            {t('explanation.notLocalized')}
                          </p>
                        )}
                      </div>
                    )}
                    <Link
                      to={`/learn/${entry.question.topicId}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      <Icon name="book" className="h-3.5 w-3.5" />
                      {t('exam.workOnTopic')}
                    </Link>
                  </>
                )}
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}