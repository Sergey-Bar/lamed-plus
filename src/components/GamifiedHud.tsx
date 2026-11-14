import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n/useI18n'
import { useProgress } from '../lib/progress/ProgressProvider'
import { refillLives } from '../lib/progress/engine'
import { GAME } from '../lib/progress/config'
import { Icon } from './Icon'

function Chip({
  icon,
  value,
  label,
  tone,
}: {
  icon: 'bolt' | 'shield' | 'star' | 'medal' | 'flame'
  value: string | number
  label: string
  tone: string
}) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm ${tone}`}>
      <Icon name={icon} className="h-4 w-4" />
      <span className="tnum font-display font-bold tracking-tight">{value}</span>
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function GamifiedHud({ showLives = true }: { showLives?: boolean }) {
  const { t } = useI18n()
  const { xp, level, streak, inventory } = useProgress()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(id)
  }, [])

  const lives = refillLives(inventory, now).lives

  const hearts = Array.from({ length: GAME.maxLives }, (_, i) => (
    <span
      key={i}
      className={`transition-all duration-300 ${i < lives ? 'scale-100 text-danger' : 'scale-90 text-muted/30'}`}
    >
      <Icon name="heart" className="h-4 w-4" />
    </span>
  ))

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface/80 px-3 py-2 backdrop-blur sm:px-4">
      {showLives && (
        <div
          className="flex items-center gap-0.5 rounded-lg border border-line bg-surface-2 px-2 py-1.5"
          title={t('hud.lives')}
          aria-label={`${t('hud.lives')}: ${lives}/${GAME.maxLives}`}
        >
          {hearts}
        </div>
      )}
      <Chip icon="bolt" value={inventory.energy} label={t('hud.energy')} tone="border-accent/30 bg-accent-soft text-ink" />
      {inventory.shield > 0 && (
        <Chip
          icon="shield"
          value={inventory.shield}
          label={t('hud.shield')}
          tone="border-info/30 bg-info-soft text-info"
        />
      )}
      <Chip icon="star" value={xp} label="XP" tone="border-line bg-surface-2 text-ink" />
      <Chip icon="medal" value={level} label={t('hud.level')} tone="border-line bg-surface-2 text-ink" />
      <Chip icon="flame" value={streak.count} label={t('hud.streak')} tone="border-warning/30 bg-warning-soft text-warning" />
    </div>
  )
}
