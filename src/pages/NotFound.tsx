import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from '../components/Icon'

export function NotFound() {
  const { t } = useI18n()
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-muted">
        <Icon name="help" className="h-7 w-7" />
      </span>
      <h1 className="h2 mt-4">{t('state.notFoundTitle')}</h1>
      <p className="mt-1.5 text-sm text-muted">{t('state.notFoundBody')}</p>
      <Link to="/app" className="btn-primary mt-5 px-4 py-2.5 text-sm">
        {t('state.backHome')}
      </Link>
    </div>
  )
}

export default NotFound
