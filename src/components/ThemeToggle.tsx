import { useI18n } from '../lib/i18n/useI18n'
import { useTheme } from '../lib/theme/useTheme'
import { Icon } from './Icon'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { t } = useI18n()
  const { resolved, setTheme } = useTheme()
  const next = resolved === 'dark' ? 'light' : 'dark'
  const label = resolved === 'dark' ? t('theme.toLight') : t('theme.toDark')

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={`btn-icon ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon name={resolved === 'dark' ? 'sun' : 'moon'} className="h-4.5 w-4.5" />
    </button>
  )
}
