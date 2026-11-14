import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../lib/i18n/useI18n'
import { canShowAd, registerAdShown } from '../lib/ads/config'
import { Icon } from './Icon'
import { track } from '../lib/analytics/track'

interface AdSlotProps {
  placement: 'home' | 'lesson' | 'exam-results' | 'games'
  className?: string
}

/**
 * A reserved, clearly labelled ad surface. It is never rendered inside an
 * active exam, answer options, or adjacent to exam controls.
 */
export function AdSlot({ placement, className = '' }: AdSlotProps) {
  const { t } = useI18n()
  const [visible] = useState(() => canShowAd())
  const [dismissed, setDismissed] = useState(false)
  const shownRef = useRef(false)

  useEffect(() => {
    if (!visible || shownRef.current) return
    shownRef.current = true
    registerAdShown()
    track('ad_impression', { placement })
  }, [visible, placement])

  if (!visible || dismissed) return null

  return (
    <aside
      className={`ad-slot ${className}`}
      data-ad-slot={placement}
      aria-label={t('ads.label')}
    >
      <span className="ad-label">{t('ads.label')}</span>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent">
        <Icon name="car" className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1 pe-6">
        <p className="text-sm font-semibold text-ink">{t('ads.title')}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">{t('ads.body')}</p>
        <p className="mt-1.5 text-[10px] font-medium text-muted/90">{t('ads.disclosure')}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 self-start">
        <span className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
          {t('ads.cta')}
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="btn-icon h-7 w-7"
          aria-label={t('common.close')}
        >
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  )
}
