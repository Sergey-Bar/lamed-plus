import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from './Icon'

export function QuotaBanner() {
  const { t } = useI18n()
  const [warn, setWarn] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (navigator.storage?.persist) {
      void navigator.storage.persist()
    }
    if (!navigator.storage?.estimate) return
    void navigator.storage.estimate().then(({ usage, quota }) => {
      if (!cancelled && quota && usage !== undefined && usage / quota > 0.9) {
        setWarn(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!warn) return null

  return (
    <div className="mx-auto mb-4 flex max-w-4xl items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm font-semibold text-ink">
      <span className="flex items-center gap-2">
        <Icon name="alert" className="h-5 w-5 text-warning" />
        {t('storage.quota')}
      </span>
      <Link
        to="/settings"
        className="btn-primary whitespace-nowrap rounded-full px-3 py-1 font-bold"
      >
        {t('nav.settings')}
      </Link>
    </div>
  )
}
