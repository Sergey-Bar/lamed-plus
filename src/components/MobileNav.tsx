import { NavLink } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from './Icon'
import { PRIMARY_NAV } from './navItems'

export function MobileNav() {
  const { t } = useI18n()

  return (
    <nav className="bottom-nav" aria-label={t('nav.primary')}>
      <div className="safe-bottom mx-auto flex w-full max-w-xl items-stretch gap-0.5 px-1.5 pt-1.5">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="bottom-nav-item">
            <span className="bottom-nav-icon">
              <Icon name={item.icon} className="h-[1.15rem] w-[1.15rem]" />
            </span>
            <span className="max-w-full truncate">{t(item.key)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
