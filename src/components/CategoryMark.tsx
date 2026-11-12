import { Icon } from './Icon'
import type { IconName } from './Icon'

const CATEGORY_ICONS: Record<string, IconName> = {
  B: 'car',
  A: 'motorcycle',
  A3: 'motorcycle',
  C1: 'truck',
  C: 'truck',
  BUS: 'bus',
  TRACTOR: 'tractor',
}

const SIZES = {
  sm: { box: 'h-9 w-9 rounded-lg', icon: 'h-4.5 w-4.5' },
  md: { box: 'h-11 w-11 rounded-xl', icon: 'h-5 w-5' },
  lg: { box: 'h-14 w-14 rounded-2xl', icon: 'h-7 w-7' },
} as const

export function CategoryMark({
  id,
  size = 'md',
  tone = 'default',
}: {
  id: string
  size?: keyof typeof SIZES
  tone?: 'default' | 'accent' | 'muted'
}) {
  const s = SIZES[size]
  const toneClass =
    tone === 'accent'
      ? 'border-accent/40 bg-accent-soft text-ink'
      : tone === 'muted'
        ? 'border-line bg-surface-2 text-muted'
        : 'border-line bg-surface-2 text-ink'
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center border ${s.box} ${toneClass}`}
      aria-hidden="true"
    >
      <Icon name={CATEGORY_ICONS[id] ?? 'car'} className={s.icon} />
    </span>
  )
}

export function categoryIcon(id: string): IconName {
  return CATEGORY_ICONS[id] ?? 'car'
}
