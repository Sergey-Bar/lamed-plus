import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { CATEGORIES, getCategory } from '../lib/content/categories'
import { availableQuestionCount } from '../lib/content/bankStats'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'

const LINKS: Array<{ to: string; icon: IconName; label: string; body: string }> = [
  { to: '/stats', icon: 'chart', label: 'profile.stats', body: 'stats.sub' },
  { to: '/achievements', icon: 'trophy', label: 'profile.achievements', body: 'achPage.sub' },
  { to: '/games', icon: 'play', label: 'nav.games', body: 'gamesPage.sub' },
  { to: '/settings/language', icon: 'globe', label: 'profile.language', body: 'settings.languageSub' },
  { to: '/settings', icon: 'gear', label: 'profile.settings', body: 'settings.privacyBody' },
]

export function Profile() {
  const { t } = useI18n()
  const {
    displayName,
    setDisplayName,
    defaultCategory,
    setDefaultCategory,
    dailyGoal,
    answeredCount,
    exams,
    achievements,
    lessons,
    streak,
    mastery,
  } = useProgress()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(displayName)
  const [saved, setSaved] = useState(false)
  const category = getCategory(defaultCategory) ?? CATEGORIES[0]
  const correct = Object.values(mastery)
    .filter((record) => record.category === category.id)
    .reduce((sum, record) => sum + record.correct, 0)
  const answered = Object.values(mastery)
    .filter((record) => record.category === category.id)
    .reduce((sum, record) => sum + record.answered, 0)
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0
  const currentStreak = answeredCount > 0 ? streak.count : 0

  function saveName() {
    setDisplayName(draft)
    setEditing(false)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2400)
  }

  return (
    <div className="animate-fade-in space-y-5">
      <header>
        <p className="eyebrow">{t('nav.profile')}</p>
        <h1 className="h1 mt-1.5">{t('profile.title')}</h1>
        <p className="legend mt-2">{t('profile.sub')}</p>
      </header>

      <section className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent-soft text-2xl font-extrabold text-accent">
            {displayName.trim() ? displayName.trim().charAt(0) : <Icon name="user" className="h-7 w-7" />}
          </span>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex max-w-md flex-wrap items-end gap-2">
                <label className="min-w-0 flex-1">
                  <span className="mb-1 block text-xs font-semibold text-muted">{t('profile.name')}</span>
                  <input
                    value={draft}
                    maxLength={40}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') saveName()
                    }}
                    className="input"
                    autoFocus
                  />
                </label>
                <button type="button" onClick={saveName} className="btn-primary px-4 py-2.5 text-sm">
                  {t('common.save')}
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-ink">{displayName || t('profile.title')}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(displayName)
                      setEditing(true)
                    }}
                    className="btn-ghost px-2 py-1 text-[11px] font-semibold"
                  >
                    <Icon name="edit" className="h-3.5 w-3.5" />
                    {t('profile.edit')}
                  </button>
                  {saved && <span className="chip border-success/25 bg-success-soft text-success">{t('profile.saved')}</span>}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                  <Icon name="lock" className="h-3.5 w-3.5" />
                  {t('profile.local')}
                </p>
              </>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="chip">
                <Icon name="seal" className="h-3 w-3" />
                {t(category.nameKey)}
              </span>
              <span className="chip">
                <Icon name="target" className="h-3 w-3" />
                {dailyGoal} {t('welcome.perDay')}
              </span>
              <span className="chip border-warning/30 bg-warning-soft text-warning">
                <Icon name="flame" className="h-3 w-3" />
                {currentStreak} {t('dash.days')}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { value: answeredCount, label: t('profile.answered'), icon: 'clipboard' as IconName },
          { value: `${accuracy}%`, label: t('profile.accuracy'), icon: 'target' as IconName },
          { value: exams.length, label: t('profile.exams'), icon: 'exam' as IconName },
          { value: `${achievements.length}`, label: t('profile.achievements'), icon: 'trophy' as IconName },
        ].map((stat) => (
          <div key={stat.label} className="stat-tile">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-muted">
              <Icon name={stat.icon} className="h-4 w-4" />
            </span>
            <p className="tnum mt-2.5 text-2xl font-extrabold text-ink">{stat.value}</p>
            <p className="text-[11px] font-semibold text-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-ink">{t('exams.category')}</p>
            <p className="mt-0.5 text-xs text-muted">{t('home.categoriesSub')}</p>
          </div>
          <span className="text-xs font-semibold text-muted">{lessons.length} {t('learn.completed')}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((item) => {
            const active = item.id === category.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setDefaultCategory(item.id)}
                className={`press rounded-lg border px-3 py-2 text-start text-xs font-semibold ${
                  active ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface text-ink-soft hover:bg-surface-2'
                }`}
              >
                <span className="block truncate">{t(item.nameKey)}</span>
                <span className="mt-0.5 block text-[10px] font-normal text-muted">
                  {availableQuestionCount(item.id)} {t('common.questions')}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="h2">{t('profile.links')}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="row-card flex items-center gap-3 p-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-accent">
                <Icon name={link.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{t(link.label)}</span>
                <span className="block truncate text-[11px] text-muted">{t(link.body)}</span>
              </span>
              <Icon name="chevron-right" className="h-4 w-4 shrink-0 text-muted rtl:rotate-180" />
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface-2 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon name="shield-check" className="h-4 w-4 text-accent" />
          {t('profile.dataTitle')}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{t('profile.dataBody')}</p>
        <Link to="/settings" className="btn-secondary mt-3 px-3 py-2 text-xs">
          {t('profile.settings')}
        </Link>
      </section>
    </div>
  )
}

export default Profile
