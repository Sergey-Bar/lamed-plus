import type { ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface EmptyStateProps {
  icon: IconName
  title: string
  subtitle?: string
  children?: ReactNode
}

export function EmptyState({ icon, title, subtitle, children }: EmptyStateProps) {
  return (
    <div className="card-premium animate-pop-in flex flex-col items-center justify-center rounded-3xl border-dashed px-6 py-12 text-center">
      <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent-hi shadow-[0_0_34px_-16px_var(--color-accent-glow)]">
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent" aria-hidden="true" />
        <Icon name={icon} className="relative h-7 w-7" />
      </span>
      <p className="mt-5 font-display text-lg font-semibold tracking-tight text-ink">{title}</p>
      {subtitle && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{subtitle}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
