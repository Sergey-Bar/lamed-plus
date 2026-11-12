import { NavLink } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from './Icon'
import type { IconName } from './Icon'

export const PRIMARY_NAV: Array<{ to: string; icon: IconName; key: string; end?: boolean }> = [
  { to: '/app', icon: 'home', key: 'nav.home', end: true },
  { to: '/learn', icon: 'study', key: 'nav.learn' },
  { to: '/exams', icon: 'exam', key: 'nav.exams' },
  { to: '/games', icon: 'play-circle', key: 'nav.games' },
  { to: '/profile', icon: 'user', key: 'nav.profile' },
]

export function MobileNav() {
  const { t } = useI18n()

  return (
    <nav className="bottom-nav" aria-label={t('nav.home')}>
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
