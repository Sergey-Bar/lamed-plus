import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n/useI18n'

interface RegisterHandlers {
  onNeedRefresh?: () => void
}

type RegisterFn = (opts?: {
  immediate?: boolean
  onNeedRefresh?: () => void
}) => RegisterHandlers

export function SwUpdateBanner() {
  const { t } = useI18n()
  const [needRefresh, setNeedRefresh] = useState(false)

  useEffect(() => {
    if (!import.meta.env.PROD) return
    let stale = false
    void import('virtual:pwa-register').then((mod) => {
      if (stale) return
      const registerSW = (mod as { registerSW?: RegisterFn }).registerSW
      if (!registerSW) return
      registerSW({
        immediate: true,
        onNeedRefresh() {
          setNeedRefresh(true)
        },
      })
    })
    return () => {
      stale = true
    }
  }, [])

  if (!needRefresh) return null

  return (
    <div className="glass fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[92%] max-w-md items-center justify-between gap-3 rounded-2xl bg-surface/80 p-4 text-ink shadow-2xl">
      <p className="text-sm">{t('update.available')}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="btn-primary whitespace-nowrap rounded-full px-4 py-1 font-bold"
      >
        {t('update.reload')}
      </button>
    </div>
  )
}
