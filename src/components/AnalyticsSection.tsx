import { useState } from 'react'
import { analyticsConsent, setAnalyticsConsent } from '../lib/analytics/track'
import { useCloud } from '../lib/cloud/useCloud'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from './Icon'

export function AnalyticsSection() {
  const { t } = useI18n()
  const { enabled } = useCloud()
  const [consent, setConsent] = useState<boolean | null>(() => analyticsConsent())

  if (!enabled) return null

  function decide(value: boolean) {
    setAnalyticsConsent(value)
    setConsent(value)
  }

  return (
    <section className="card-premium rounded-2xl p-5">
      <h2 className="h3 flex items-center gap-2">
        <Icon name="chart" className="h-4 w-4 text-muted" />
        {t('analytics.title')}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{t('analytics.body')}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {consent === true ? (
          <button
            type="button"
            onClick={() => decide(false)}
            className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-muted hover:text-ink"
          >
            {t('analytics.stop')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => decide(true)}
            className="btn-secondary rounded-xl px-3 py-2 text-xs font-semibold"
          >
            {t('analytics.allow')}
          </button>
        )}
      </div>
    </section>
  )
}
