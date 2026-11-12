import { useI18n } from '../lib/i18n/useI18n'
import { isLanguageId, LANGUAGES, LANGUAGE_ORDER } from '../lib/i18n/languages'

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()

  return (
    <select
      aria-label="Language"
      value={language}
      onChange={(event) => {
        const next = event.target.value
        if (isLanguageId(next)) void setLanguage(next)
      }}
      className="rounded-lg border border-line bg-surface-hi/80 px-2.5 py-1.5 text-xs font-semibold tracking-[0.02em] text-ink transition-all hover:border-line-strong hover:bg-surface-raised focus:border-accent-hi/40"
    >
      {LANGUAGE_ORDER.map((id) => (
        <option key={id} value={id}>
          {LANGUAGES[id].label}
        </option>
      ))}
    </select>
  )
}
