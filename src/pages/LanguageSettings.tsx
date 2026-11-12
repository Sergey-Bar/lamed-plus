import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { LANGUAGES, LANGUAGE_ORDER } from '../lib/i18n/languages'
import { Icon } from '../components/Icon'

export function LanguageSettings() {
  const { t, language, setLanguage } = useI18n()

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-5">
      <Link to="/settings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <Icon name="arrow-back" className="h-4 w-4 rtl:rotate-180" />
        {t('settings.title')}
      </Link>

      <header>
        <p className="eyebrow">{t('common.language')}</p>
        <h1 className="h1 mt-1.5">{t('settings.languageTitle')}</h1>
        <p className="legend mt-2">{t('settings.languageSub')}</p>
      </header>

      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('common.language')}>
        {LANGUAGE_ORDER.map((id) => {
          const active = language === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => void setLanguage(id)}
              className={`press flex min-h-16 items-center justify-between rounded-xl border px-4 py-3 text-start ${
                active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-surface-2'
              }`}
            >
              <span className="min-w-0">
                <span className="block text-base font-bold text-ink">{LANGUAGES[id].label}</span>
                <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide text-muted">
                  {LANGUAGES[id].dir.toUpperCase()}
                </span>
              </span>
              <span className={`grid h-6 w-6 place-items-center rounded-full border ${active ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong text-transparent'}`}>
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
            </button>
          )
        })}
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-2 p-3.5 text-xs leading-relaxed text-muted">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
        {t('settings.languageSub')}
      </p>
    </div>
  )
}

export default LanguageSettings
