import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { TOPICS } from '../lib/content/topics'
import { masteryKey } from '../lib/progress/engine'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { AdSlot } from '../components/AdSlot'

const games: Array<{ href: string; icon: IconName; name: string; desc: string; purpose: string; best: string }> = [
  {
    href: '/games/sign-sprint',
    icon: 'sign',
    name: 'games.signSprint.name',
    desc: 'games.signSprint.desc',
    purpose: 'gamesPage.purposeSprint',
    best: 'sprint-best',
  },
  {
    href: '/games/blitz',
    icon: 'bolt',
    name: 'games.blitz.name',
    desc: 'games.blitz.desc',
    purpose: 'gamesPage.purposeBlitz',
    best: 'blitz-best',
  },
]

export function Games() {
  const { t } = useI18n()
  const { defaultCategory, mastery } = useProgress()
  const topics = TOPICS.filter((topic) => topic.categories.includes(defaultCategory))
  const weak = topics
    .map((topic) => {
      const record = mastery[masteryKey(defaultCategory, topic.id)]
      return { topic, answered: record?.answered ?? 0, accuracy: record?.answered ? record.correct / record.answered : 1 }
    })
    .filter((row) => row.answered > 0)
    .sort((a, b) => a.accuracy - b.accuracy)[0]

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <p className="eyebrow">{t('games.title')}</p>
        <h1 className="h1 mt-1.5">{t('gamesPage.title')}</h1>
        <p className="legend mt-2 max-w-2xl">{t('gamesPage.sub')}</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {games.map((game) => {
          const best = typeof window !== 'undefined' ? localStorage.getItem(game.best) : null
          return (
            <Link key={game.href} to={game.href} className="row-card lift group p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon name={game.icon} className="h-6 w-6" />
                </span>
                <span className="chip">
                  {t('gamesPage.best')}: <span className="tnum font-bold text-ink">{best ?? '—'}</span>
                </span>
              </div>
              <h2 className="mt-4 text-base font-bold text-ink">{t(game.name)}</h2>
              <p className="mt-1 text-sm text-muted">{t(game.desc)}</p>
              <p className="mt-3 flex items-start gap-1.5 border-t border-line pt-2.5 text-[11px] leading-relaxed text-muted">
                <Icon name="brain" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                {t(game.purpose)}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent">
                {t('gamesPage.play')}
                <Icon name="arrow-forward" className="h-3.5 w-3.5 rtl:rotate-180" />
              </span>
            </Link>
          )
        })}
      </section>

      <section className="grid gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning">
            <Icon name="flame" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{t('gamesPage.challenge')}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">
              {weak ? `${t(weak.topic.nameKey)} · ${Math.round(weak.accuracy * 100)}%` : t('gamesPage.challengeSub')}
            </p>
          </div>
        </div>
        <Link
          to={weak ? `/practice?topic=${weak.topic.id}` : '/practice'}
          className="btn-secondary px-4 py-2.5 text-sm lg:justify-self-end"
        >
          {t('gamesPage.challengeCta')}
          <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </section>

      <section className="rounded-xl border border-dashed border-line-strong bg-surface p-4">
        <p className="text-sm font-bold text-ink">{t('gamesPage.moreTitle')}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{t('gamesPage.moreSub')}</p>
      </section>

      <AdSlot placement="games" />
    </div>
  )
}

export default Games
