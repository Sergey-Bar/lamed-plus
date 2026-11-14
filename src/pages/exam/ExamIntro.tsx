import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n/useI18n'
import { CategoryMark } from '../../components/CategoryMark'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { Icon } from '../../components/Icon'
import type { CategoryConfig } from '../../lib/content/schema'

export interface ExamReadyInfo {
  recommended: boolean
  estimatedAccuracy: number
  sample: number
}

export function ExamIntro({
  category,
  availableCount,
  loading,
  ready,
  hasDraft,
  onBegin,
  onResume,
  onDiscard,
}: {
  category: CategoryConfig
  availableCount: number
  loading: boolean
  ready: ExamReadyInfo | null
  hasDraft: boolean
  onBegin: () => void
  onResume: () => void
  onDiscard: () => void
}) {
  const { t } = useI18n()
  const valid = availableCount >= category.questionCount

  return (
    <div className="animate-fade-in space-y-5">
      <nav className="flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/app" className="hover:text-ink">
          {t('nav.home')}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-ink">{t(category.nameKey)}</span>
      </nav>

      <section className="cinematic-hero rounded-2xl p-5 sm:p-8">
        <div className="relative z-[1] grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <CategoryMark id={category.id} size="lg" tone="accent" />
              <div>
                <p className="eyebrow">{t('exam.official')}</p>
                <h1 className="h1 mt-0.5">{t('exam.introTitle')}</h1>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{t('exam.introSub')}</p>

            <div className="mt-6 grid max-w-md grid-cols-3 gap-2.5">
              {[
                { value: String(category.questionCount), label: t('exam.questions') },
                { value: `${category.timeMinutes}′`, label: t('exam.time') },
                { value: String(category.passThreshold), label: t('exam.threshold') },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-line bg-surface/70 px-3 py-3 text-center">
                  <p className="tnum font-display text-2xl font-bold text-ink">{stat.value}</p>
                  <p className="text-[11px] font-semibold text-muted">{stat.label}</p>
                </div>
              ))}
            </div>

            {valid && availableCount < category.questionCount * 2 && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-surface-2 p-3 text-sm leading-relaxed text-muted">
                <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                {t('exam.smallBank', { count: availableCount })}
              </p>
            )}

            {!valid && !loading && (
              <p className="mt-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm text-ink">
                <Icon name="alert" className="h-5 w-5 shrink-0 text-warning" />
                {t('exam.availableWhen', { count: category.questionCount })}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onBegin}
                disabled={!valid || loading}
                className="btn-primary touch-target rounded-xl px-6 py-3 font-bold"
              >
                <Icon name="flag-checkered" className="h-4 w-4" />
                {t('exam.begin')}
              </button>
              <Link to="/learn" className="btn-secondary touch-target rounded-xl px-4 py-3 text-sm font-semibold">
                {t('nav.study')}
              </Link>
            </div>
          </div>

          <div className="surface rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <ProgressRing
                value={ready ? Math.round(ready.estimatedAccuracy * 100) : 0}
                size={104}
                stroke={9}
                label={t('readiness.ring')}
                tone={ready?.recommended ? 'success' : 'accent'}
              />
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-ink">
                  {ready?.recommended ? t('ready.ready') : t('ready.notReady')}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {ready && ready.sample > 0
                    ? t('home.readinessSub', { count: ready.sample })
                    : t('home.readinessEmpty')}
                </p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-xs font-semibold text-muted">
              <Icon name="info" className="h-4 w-4" />
              {t('exam.autosaved')}
            </p>
          </div>
        </div>
      </section>

      {hasDraft && (
        <section className="card flex flex-wrap items-center justify-between gap-4 rounded-2xl border-warning/30 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-ink">{t('exam.resumeTitle')}</p>
            <p className="mt-1 text-sm text-muted">{t('exam.resumeSub')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onResume} className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold">
              {t('exam.resume')}
            </button>
            <button type="button" onClick={onDiscard} className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">
              {t('exam.discard')}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}