import { useState } from 'react'
import { useI18n } from '../lib/i18n/useI18n'
import { isLanguageId, LANGUAGES, LANGUAGE_ORDER } from '../lib/i18n/languages'
import { CATEGORIES } from '../lib/content/categories'
import { DAILY_GOAL_OPTIONS } from '../lib/progress/onboarding'
import { useTheme } from '../lib/theme/useTheme'
import type { ThemeChoice } from '../lib/theme/context'
import { clearAll, dumpAll } from '../lib/store/store'
import { useProgress } from '../lib/progress/ProgressProvider'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { AccessibilitySettings } from '../components/AccessibilitySettings'

const THEMES: Array<{ id: ThemeChoice; icon: IconName; key: string }> = [
  { id: 'light', icon: 'sun', key: 'settings.themeLight' },
  { id: 'dark', icon: 'moon', key: 'settings.themeDark' },
  { id: 'system', icon: 'monitor', key: 'settings.themeSystem' },
]

export function Settings() {
  const { t, language, setLanguage } = useI18n()
  const { theme, setTheme } = useTheme()
  const {
    testDate,
    setTestDate,
    defaultCategory,
    setDefaultCategory,
    dailyGoal,
    setDailyGoal,
  } = useProgress()
  const [notice, setNotice] = useState<string | null>(null)

  async function handleExport() {
    const data = await dumpAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `lamed-progress-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setNotice(t('common.exportDone'))
  }

  async function handleClear() {
    const ok = window.confirm(`${t('common.confirmClear')} ${t('settings.clearWarning')}`)
    if (!ok) return
    await clearAll()
    setNotice(t('common.clearDone'))
  }

  return (
    <div className="settings-page mx-auto max-w-3xl space-y-5">
      <header>
        <p className="eyebrow">{t('app.name')}</p>
        <h1 className="h1 mt-1">{t('settings.title')}</h1>
      </header>

      <section className="card-premium rounded-2xl p-5">
        <h2 className="h3 flex items-center gap-2">
          <Icon name="sun" className="h-4 w-4 text-muted" />
          {t('settings.appearance')}
        </h2>
        <p className="mt-1 text-sm text-muted">{t('settings.theme')}</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t('settings.theme')}>
          {THEMES.map((item) => {
            const active = theme === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(item.id)}
                className={`press flex items-center gap-2.5 rounded-xl border px-3 py-3 text-start text-sm font-semibold transition-colors ${
                  active ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface text-ink-soft hover:bg-surface-2'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    active ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-muted'
                  }`}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                <span className="flex-1">{t(item.key)}</span>
                {active && <Icon name="check" className="h-4 w-4" />}
              </button>
            )
          })}
        </div>
      </section>

      <AccessibilitySettings />

      <section className="card-premium rounded-2xl p-5">
        <h2 className="h3 flex items-center gap-2">
          <Icon name="calendar" className="h-4 w-4 text-muted" />
          {t('settings.planTitle')}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="settings-test-date" className="block text-sm font-semibold text-ink">
              {t('settings.testDateLabel')}
            </label>
            <p className="mt-0.5 text-xs text-muted">{t('settings.testDateHint')}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                id="settings-test-date"
                type="date"
                value={testDate ?? ''}
                onChange={(event) => setTestDate(event.target.value || null)}
                className="input max-w-48 py-2"
              />
              {testDate && (
                <button
                  type="button"
                  onClick={() => setTestDate(null)}
                  className="btn-ghost rounded-lg px-2.5 py-2 text-xs font-semibold"
                >
                  {t('settings.clearTestDate')}
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="settings-category" className="block text-sm font-semibold text-ink">
              {t('settings.categoryLabel')}
            </label>
            <p className="mt-0.5 text-xs text-muted">{t('home.categoriesSub')}</p>
            <select
              id="settings-category"
              value={defaultCategory}
              onChange={(event) => setDefaultCategory(event.target.value)}
              className="input mt-2 py-2"
            >
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {t(item.nameKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <p className="text-sm font-semibold text-ink">{t('settings.goalLabel')}</p>
          <p className="mt-0.5 text-xs text-muted">{t('settings.goalHint')}</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t('settings.goalLabel')}>
            {DAILY_GOAL_OPTIONS.map((goal) => {
              const active = dailyGoal === goal
              return (
                <button
                  key={goal}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDailyGoal(goal)}
                  className={`press rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                    active ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface text-muted hover:text-ink'
                  }`}
                >
                  {goal} {t('welcome.perDay')}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="card-premium rounded-2xl p-5">
        <h2 className="h3 flex items-center gap-2">
          <Icon name="globe" className="h-4 w-4 text-muted" />
          {t('settings.languageSection')}
        </h2>
        <select
          aria-label={t('common.language')}
          value={language}
          onChange={(event) => {
            const next = event.target.value
            if (isLanguageId(next)) void setLanguage(next)
          }}
          className="input mt-3 max-w-xs py-2"
        >
          {LANGUAGE_ORDER.map((id) => (
            <option key={id} value={id}>
              {LANGUAGES[id].label}
            </option>
          ))}
        </select>
        <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted">{t('settings.languageSub')}</p>
      </section>

      <section className="card-premium rounded-2xl p-5">
        <h2 className="h3 flex items-center gap-2">
          <Icon name="shield-check" className="h-4 w-4 text-muted" />
          {t('settings.privacyTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t('settings.privacyBody')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleExport()}
            className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <Icon name="download" className="h-4 w-4" />
            {t('settings.exportLabel')}
          </button>
          <button
            type="button"
            onClick={() => void handleClear()}
            className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/15"
          >
            <Icon name="trash" className="h-4 w-4" />
            {t('settings.clearLabel')}
          </button>
        </div>
        {notice && <p className="mt-3 text-sm font-semibold text-success">{notice}</p>}
      </section>

      <section className="card-premium rounded-2xl p-5">
        <h2 className="h3 flex items-center gap-2">
          <Icon name="seal" className="h-4 w-4 text-muted" />
          {t('settings.disclaimerTitle')}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">{t('settings.disclaimerBody')}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
          <span>
            {t('settings.aboutTitle')} · {t('app.name')}
          </span>
          <span className="tnum">{t('settings.versionLabel')} 1.0</span>
        </div>
      </section>
    </div>
  )
}

export default Settings
