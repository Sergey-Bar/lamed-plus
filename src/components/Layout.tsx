import { useEffect } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { stripBidiIsolates } from '../lib/i18n/bidi'
import { useProgress } from '../lib/progress/ProgressProvider'
import { MobileNav } from './MobileNav'
import { PRIMARY_NAV } from './navItems'
import { QuotaBanner } from './QuotaBanner'
import { RouteTransition } from './RouteTransition'
import { OfflineBanner } from './OfflineBanner'
import { Icon } from './Icon'
import { Logo, LogoMark } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { LanguageMenu } from './LanguageMenu'
import { scrollToId } from '../lib/scrollTo'

const TITLE_KEYS: Array<[RegExp, string]> = [
  [/^\/practice/, 'practice.title'],
  [/^\/review/, 'review.title'],
  [/^\/exams/, 'nav.exam'],
  [/^\/exam\//, 'exam.introTitle'],
  [/^\/learn/, 'nav.study'],
  [/^\/signs/, 'nav.signs'],
  [/^\/games/, 'nav.games'],
  [/^\/stats/, 'stats.title'],
  [/^\/achievements/, 'dash.ach'],
  [/^\/profile/, 'nav.profile'],
  [/^\/settings/, 'settings.title'],
  [/^\/app/, 'nav.home'],
]

const TOOLS = [
  { to: '/practice', icon: 'practice', key: 'nav.practice' },
  { to: '/review', icon: 'review', key: 'nav.review' },
  { to: '/signs', icon: 'sign', key: 'nav.signs' },
] as const

export function Layout() {
  const { t } = useI18n()
  const { ready, onboarded, displayName, daily, dailyGoal, streak } = useProgress()
  const location = useLocation()
  const focusMode = /^\/exam\/[^/]+$/.test(location.pathname)

  // A single global document title made every tab, bookmark and history entry
  // look identical. Name the current route instead.
  useEffect(() => {
    const key = TITLE_KEYS.find(([pattern]) => pattern.test(location.pathname))?.[1]
    if (key) document.title = stripBidiIsolates(`${t(key)} · ${t('app.name')}`)
  }, [location.pathname, t])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg" role="status" aria-live="polite">
        <div className="flex w-56 flex-col items-center gap-4">
          <LogoMark size={48} />
          <span className="skeleton h-1.5 w-full rounded-full" />
          <span className="text-xs font-semibold text-muted">{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  if (!onboarded) return <Navigate to="/welcome" replace />

  if (focusMode) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="topbar">
          <div className="app-container flex h-14 items-center justify-between">
            <Logo size={32} />
            <div className="flex items-center gap-1">
              <span className="chip me-1 hidden border-accent/25 bg-accent-soft text-accent sm:inline-flex">
                {t('exam.official')}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="app-container w-full pt-4 pb-10 sm:pt-6">
          <OfflineBanner />
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
      </div>
    )
  }

  return (
    <div className="shell">
      <a
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          scrollToId('main', { focus: true })
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-bold focus:text-accent-ink"
      >
        {t('common.skipToContent')}
      </a>

      <aside className="side-rail" aria-label={t('nav.home')}>
        <div className="px-1.5">
          <Logo size={36} />
        </div>

        <nav className="mt-6 space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="sidebar-link">
              <span className="sidebar-icon">
                <Icon name={item.icon} className="h-4 w-4" />
              </span>
              <span className="truncate">{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        <p className="eyebrow mt-6 px-2.5">{t('dash.goal')}</p>
        <nav className="mt-1.5 space-y-0.5">
          {TOOLS.map((item) => (
            <NavLink key={item.to} to={item.to} className="sidebar-link">
              <span className="sidebar-icon">
                <Icon name={item.icon} className="h-4 w-4" />
              </span>
              <span className="truncate">{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2.5">
          <div className="rounded-xl border border-line bg-surface-2 p-3">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-ink-soft">
                <Icon name="target" className="h-3.5 w-3.5 text-accent" />
                {t('dash.today')}
              </span>
              <span className="tnum text-muted">
                {Math.min(daily?.answered ?? 0, dailyGoal)}/{dailyGoal}
              </span>
            </div>
            <div className="progress-track mt-2">
              <span
                className="progress-fill"
                style={{ width: `${Math.min(100, ((daily?.answered ?? 0) / Math.max(1, dailyGoal)) * 100)}%` }}
              />
            </div>
            <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-muted">
              <Icon name="flame" className="h-3.5 w-3.5 text-warning" />
              {streak.count} {t('dash.days')}
            </p>
          </div>

          <NavLink to="/profile" className="sidebar-link border border-line bg-surface">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
              {displayName ? displayName.trim().charAt(0) : <Icon name="user" className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">
                {displayName || t('profile.title')}
              </span>
              <span className="block truncate text-[11px] text-muted">{t('nav.profile')}</span>
            </span>
            <Icon name="chevron-right" className="h-4 w-4 shrink-0 text-muted rtl:rotate-180" />
          </NavLink>
        </div>
      </aside>

      <div className="lg:ps-[16.5rem]">
        <header className="topbar">
          <div className="app-container flex h-16 items-center gap-2">
            <div className="lg:hidden">
              <Logo size={34} />
            </div>
            <p className="hidden items-center gap-2 text-sm font-medium text-muted lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              {t('app.tagline')}
            </p>
            <div className="ms-auto flex items-center gap-0.5">
              <ThemeToggle />
              <LanguageMenu />
              <NavLink
                to="/settings"
                aria-label={t('a11y.title')}
                title={t('a11y.title')}
                className="btn-icon hidden sm:inline-flex"
              >
                <Icon name="accessibility" className="h-4.5 w-4.5" />
              </NavLink>
              <NavLink to="/settings" aria-label={t('nav.settings')} className="btn-icon">
                <Icon name="gear" className="h-4.5 w-4.5" />
              </NavLink>
            </div>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="app-container w-full pt-5 pb-28 sm:pt-7 lg:pb-12">
          <QuotaBanner />
          <OfflineBanner />
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
