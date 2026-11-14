import type { IconName } from './Icon'

export interface NavItem {
  to: string
  icon: IconName
  key: string
  end?: boolean
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/app', icon: 'home', key: 'nav.home', end: true },
  { to: '/learn', icon: 'study', key: 'nav.learn' },
  { to: '/practice', icon: 'practice', key: 'nav.practice' },
  { to: '/exams', icon: 'exam', key: 'nav.exams' },
  { to: '/profile', icon: 'user', key: 'nav.profile' },
]