import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from './Icon'

export function useIsOnline(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  return online
}

export function OfflineBanner() {
  const { t } = useI18n()
  const online = useIsOnline()
  const [wasOffline, setWasOffline] = useState(false)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    if (!online) {
      setWasOffline(true)
      setShowRestored(false)
      return
    }
    if (!wasOffline) return
    setShowRestored(true)
    const id = window.setTimeout(() => setShowRestored(false), 3200)
    setWasOffline(false)
    return () => window.clearTimeout(id)
  }, [online, wasOffline])

  if (online && !showRestored) return null

  return (
    <div
      role="status"
      className={`mb-4 flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${
        online
          ? 'border-success/30 bg-success-soft text-ink'
          : 'border-warning/40 bg-warning-soft text-ink'
      }`}
    >
      <Icon
        name={online ? 'check-circle' : 'wifi-off'}
        className={`h-4.5 w-4.5 shrink-0 ${online ? 'text-success' : 'text-warning'}`}
      />
      <p className="min-w-0 flex-1 text-xs font-semibold sm:text-sm">
        {online ? t('offline.ready') : t('offline.banner')}
      </p>
      {!online && (
        <a href="#main" className="text-xs font-bold text-ink underline underline-offset-2">
          {t('common.continue')}
        </a>
      )}
    </div>
  )
}
