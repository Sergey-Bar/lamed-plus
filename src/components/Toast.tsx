import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { ToastContext } from './toastContext'
import type { ToastItem, ToastKind } from './toastContext'

const KIND_STYLES: Record<ToastKind, { wrap: string; icon: string }> = {
  success: { wrap: 'border-success/30', icon: 'bg-success-soft text-success' },
  level: { wrap: 'border-accent/40', icon: 'bg-accent-soft text-ink' },
  achievement: { wrap: 'border-warning/35', icon: 'bg-warning-soft text-warning' },
  info: { wrap: 'border-line', icon: 'bg-surface-2 text-ink' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const show = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = ++counter.current
    setToasts((prev) => [...prev.slice(-2), { ...toast, id }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 3400)
  }, [])

  const api = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:top-5">
        {toasts.map((toast) => {
          const styles = KIND_STYLES[toast.kind]
          return (
            <div
              key={toast.id}
              role="status"
              className={`animate-pop-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border bg-surface px-4 py-3 shadow-[var(--shadow-md)] ${styles.wrap}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                <Icon name={toast.icon} className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display font-semibold tracking-tight text-ink">{toast.title}</p>
                {toast.subtitle && <p className="truncate text-sm text-muted">{toast.subtitle}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
