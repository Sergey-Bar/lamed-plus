import { useI18n } from '../lib/i18n/useI18n'
import { GAME } from '../lib/progress/config'
import type { PowerupKind } from '../lib/progress/config'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface PowerupBarProps {
  onUse: (kind: PowerupKind) => void
}

const POWERUP_ICONS: Record<PowerupKind, IconName> = {
  hint: 'hint',
  fifty: 'fifty',
  freeze: 'freeze',
  shield: 'shield',
}

export function PowerupBar({ onUse }: PowerupBarProps) {
  const { t } = useI18n()
  const { inventory } = useProgress()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(Object.keys(GAME.powerups) as PowerupKind[]).map((kind) => {
        const cost = GAME.powerups[kind]
        const affordable = inventory.energy >= cost
        const key = `powerup.${kind}`
        return (
          <button
            key={kind}
            type="button"
            disabled={!affordable}
            onClick={() => onUse(kind)}
            aria-label={`${t(key)} (${cost} ${t('hud.energy')})`}
            className={`press flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-bold transition-all ${
              affordable
                ? 'border-accent/40 bg-accent-soft text-ink hover:bg-accent/20'
                : 'cursor-not-allowed border-line text-muted opacity-60'
            }`}
          >
            <Icon name={POWERUP_ICONS[kind]} className="h-4 w-4" />
            <span>{t(key)}</span>
            <span className="rounded-full bg-surface-2 px-1.5 text-xs flex items-center gap-0.5">
              <Icon name="bolt" className="h-3 w-3" />
              {cost}
            </span>
          </button>
        )
      })}
    </div>
  )
}
