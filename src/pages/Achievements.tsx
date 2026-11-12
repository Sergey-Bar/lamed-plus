import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { ACHIEVEMENTS } from '../lib/progress/achievements'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Icon } from '../components/Icon'
import { ProgressRing } from '../components/ui/ProgressRing'

export function Achievements() {
  const { t } = useI18n()
  const { achievements } = useProgress()
  const percent = Math.round((achievements.length / ACHIEVEMENTS.length) * 100)
  const next = ACHIEVEMENTS.find((achievement) => !achievements.includes(achievement.id))

  return (
    <div className="animate-fade-in space-y-5">
      <header>
        <p className="eyebrow">{t('dash.ach')}</p>
        <h1 className="h1 mt-1.5">{t('achPage.title')}</h1>
        <p className="legend mt-2 max-w-2xl">{t('achPage.sub')}</p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
        <ProgressRing value={percent} size={104} stroke={9} tone="accent" />
        <div>
          <p className="text-sm font-bold text-ink">
            {t('achPage.unlocked')}: {achievements.length} {t('achPage.total', { total: ACHIEVEMENTS.length })}
          </p>
          <div className="progress-track mt-2 max-w-sm">
            <span className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          {next && (
            <p className="mt-2 text-xs text-muted">
              {t('achPage.next')}: <span className="font-semibold text-ink">{t(next.nameKey)}</span>
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-2.5 sm:grid-cols-2">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = achievements.includes(achievement.id)
          return (
            <article
              key={achievement.id}
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                unlocked ? 'border-success/25 bg-success-soft/60' : 'border-line bg-surface'
              }`}
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                  unlocked ? 'bg-success text-white' : 'bg-surface-2 text-muted'
                }`}
              >
                <Icon name={achievement.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-ink">{t(achievement.nameKey)}</h2>
                  {unlocked ? (
                    <Icon name="check-circle" className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Icon name="lock" className="h-3.5 w-3.5 shrink-0 text-muted" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{t(achievement.descKey)}</p>
                {!unlocked && <p className="mt-1.5 text-[10px] font-semibold text-muted">{t('achPage.locked')}</p>}
              </div>
            </article>
          )
        })}
      </section>

      <Link to="/learn" className="btn-secondary inline-flex px-4 py-2.5 text-sm">
        {t('learn.title')}
        <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
      </Link>
    </div>
  )
}

export default Achievements
