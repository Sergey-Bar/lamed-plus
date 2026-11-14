import { useI18n } from '../lib/i18n/useI18n'
import { GAME } from '../lib/progress/config'
import type { PowerupKind } from '../lib/progress/config'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface PowerupBarProps {
  onUse: (kind: PowerupKind) => void
  kinds?: PowerupKind[]
  disabled?: boolean
  className?: string
}

const POWERUP_ICONS: Record<PowerupKind, IconName> = {
  hint: 'hint',
  fifty: 'fifty',
  freeze: 'freeze',
  shield: 'shield',
}

export function PowerupBar({
  onUse,
  kinds = ['hint', 'fifty', 'freeze', 'shield'],
  disabled = false,
  className = '',
}: PowerupBarProps) {
  const { t } = useI18n()
  const { inventory } = useProgress()

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {kinds.map((kind) => {
        const cost = GAME.powerups[kind]
        const affordable = !disabled && inventory.energy >= cost
        const key = `powerup.${kind}`
        return (
          <button
            key={kind}
            type="button"
            disabled={!affordable}
            onClick={() => onUse(kind)}
            title={`${t(key)} — ${cost} ${t('hud.energy')}`}
            aria-label={`${t(key)} (${cost} ${t('hud.energy')})`}
            className={`press flex min-h-9 items-center gap-1 rounded-full border px-3 py-1 text-sm font-bold transition-all ${
              affordable
                ? 'border-accent/40 bg-accent-soft text-ink hover:bg-accent/20'
                : 'cursor-not-allowed border-line text-muted opacity-60'
            }`}
          >
            <Icon name={POWERUP_ICONS[kind]} className="h-4 w-4" />
            <span>{t(key)}</span>
            <span className="flex items-center gap-0.5 rounded-full bg-surface-2 px-1.5 text-xs">
              <Icon name="bolt" className="h-3 w-3" />
              {cost}
            </span>
          </button>
        )
      })}
      <span className="ms-auto flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-bold text-muted">
        <Icon name="bolt" className="h-3.5 w-3.5" />
        <span className="tnum text-ink">{inventory.energy}</span>
        <span>{t('hud.energy')}</span>
      </span>
    </div>
  )
}
