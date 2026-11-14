import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { useProgress } from '../lib/progress/ProgressProvider'
import { CATEGORIES } from '../lib/content/categories'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { Logo, LogoMark } from '../components/Logo'
import { Logo as Brand } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageMenu } from '../components/LanguageMenu'
import { ProgressRing } from '../components/ui/ProgressRing'
import { totalQuestionCount } from '../lib/content/bankStats'
import { scrollToId } from '../lib/scrollTo'
import { FULL_LANDING } from '../lib/i18n/full'
import { COPY, LANDING_PARTIALS, FEATURES, WHY_COPY } from './landing/copy'
import type { WhyLanguage } from './landing/copy'


export function Landing() {
  const { language, t } = useI18n()
  const { onboarded } = useProgress()
  const landing = FULL_LANDING[language]
  const copy = {
    ...COPY.he,
    ...(COPY as Record<string, typeof COPY.en>)[language],
    ...LANDING_PARTIALS[language],
    ...landing?.copy,
  }
  const dynamic = copy as Record<string, string>
  const why = (landing?.why ?? WHY_COPY[language as WhyLanguage] ?? WHY_COPY.he) as (typeof WHY_COPY)['he']
  const startHref = onboarded ? '/app' : '/welcome'
  const totalQuestions = totalQuestionCount()

  function jumpTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault()
    scrollToId(id, { focus: id === 'main' })
  }

  return (
    <div className="min-h-screen bg-bg">
      <a
        href="#main"
        onClick={(event) => jumpTo(event, 'main')}
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-bold focus:text-accent-ink"
      >
        {t('common.skipToContent')}
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-xl">
        <div className="app-container flex h-16 items-center gap-3">
          <Logo size={36} />
          <nav className="ms-6 hidden items-center gap-5 text-sm font-semibold text-muted md:flex" aria-label={copy.navFeatures}>
            <a href="#how" onClick={(event) => jumpTo(event, 'how')} className="hover:text-ink">{copy.navHow}</a>
            <a href="#features" onClick={(event) => jumpTo(event, 'features')} className="hover:text-ink">{copy.navFeatures}</a>
            <a href="#faq" onClick={(event) => jumpTo(event, 'faq')} className="hover:text-ink">{copy.navFaq}</a>
          </nav>
          <div className="ms-auto flex items-center gap-1">
            <ThemeToggle />
            <LanguageMenu />
            <Link to={startHref} className="btn-primary ms-1 px-4 py-2.5 text-sm">
              {onboarded ? copy.continueApp : copy.cta}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="hero-surface app-container grid gap-10 pb-16 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(330px,0.95fr)] lg:items-center lg:gap-14 lg:pb-24">
          <div className="hero-ambient" aria-hidden="true" />
          <div className="hero-copy">
            <p className="hero-badge inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft">
              <Icon name="seal" className="h-3.5 w-3.5 text-accent" />
              {copy.heroBadge}
            </p>
            <h1 className="display mt-5 max-w-[19ch] text-ink">
              {copy.heroTitleA}
              <span className="mt-1 block text-accent">{copy.heroTitleB}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-muted sm:text-lg">
              {copy.heroBody}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Link to={startHref} className="btn-primary touch-target px-5 py-3 text-[15px]">
                {onboarded ? copy.continueApp : copy.cta}
                <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <a href="#how" onClick={(event) => jumpTo(event, 'how')} className="btn-secondary touch-target px-5 py-3 text-sm">
                {copy.ctaSecond}
              </a>
            </div>
            <ul className="mt-8 grid gap-2 text-[13px] font-medium text-muted sm:grid-cols-3">
              <li className="flex items-center gap-1.5">
                <Icon name="check-circle" className="h-4 w-4 shrink-0 text-success" />
                {copy.trustOfficial}
              </li>
              <li className="flex items-center gap-1.5">
                <Icon name="globe" className="h-4 w-4 shrink-0 text-accent" />
                {copy.trustLang}
              </li>
              <li className="flex items-center gap-1.5">
                <Icon name="download" className="h-4 w-4 shrink-0 text-accent-2" />
                {copy.trustOffline}
              </li>
            </ul>
          </div>

          <div className="preview-stage relative">
            <div className="preview-halo" aria-hidden="true" />
            <div className="hero-preview relative z-[1] rounded-[1.4rem] border border-line bg-surface p-4 shadow-[var(--shadow-md)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <LogoMark size={26} className="rounded-lg" />
                  <span className="text-sm font-bold text-ink">{copy.previewTitle}</span>
                </span>
                <span className="chip border-accent/25 bg-accent-soft text-accent">{t('category.B')}</span>
              </div>
              <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-xl border border-line bg-surface-2 p-3.5">
                <ProgressRing className="ring-breathe" value={78} size={86} stroke={8} label={t('readiness.ring')} tone="accent" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{copy.demo}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-ink">
                    {t('readiness.strong')}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">
                    {copy.r1} · {copy.r2}
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-accent/25 bg-accent-soft/50 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent">{copy.previewNext}</p>
                <p className="mt-1 text-sm font-bold text-ink">{copy.previewLesson}</p>
                <p className="mt-0.5 text-[11px] text-muted">{copy.previewLessonMeta}</p>
                <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink">
                  {copy.previewContinue}
                  <Icon name="arrow-forward" className="h-3.5 w-3.5 rtl:rotate-180" />
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-line p-3">
                <Icon name="target" className="h-4 w-4 text-accent" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                    <span className="text-ink-soft">{copy.previewGoal}</span>
                    <span className="tnum text-muted">{copy.previewGoalMeta}</span>
                  </div>
                  <div className="progress-track mt-1.5">
                    <span className="progress-fill" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-[10px] font-medium text-muted">{copy.previewLabel}</p>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="app-container grid grid-cols-3 divide-x divide-line divide-x-reverse py-6">
            {[
              { value: totalQuestions.toLocaleString(language === 'he' ? 'he-IL' : language), label: copy.statQuestions },
              { value: '4', label: copy.statSubjects },
              { value: '30 · 40 · 26', label: copy.statFormat },
            ].map((stat) => (
              <div key={stat.label} className="px-3 text-center">
                <p className="tnum text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{stat.value}</p>
                <p className="mt-1 text-[11px] font-semibold leading-tight text-muted sm:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="app-container scroll-mt-20 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">{copy.navHow}</p>
            <h2 className="h1 mt-2">{copy.howTitle}</h2>
            <p className="legend mt-3 max-w-xl">{copy.howSub}</p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              { n: '01', title: copy.how1, body: copy.how1b },
              { n: '02', title: copy.how2, body: copy.how2b },
              { n: '03', title: copy.how3, body: copy.how3b },
            ].map((step) => (
              <article key={step.n} className="border-t-2 border-accent/30 pt-4">
                <p className="tnum text-xs font-bold text-accent">{step.n}</p>
                <h3 className="h3 mt-2">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="scroll-mt-20 bg-surface-2/60 py-16 sm:py-20">
          <div className="app-container">
            <div className="max-w-2xl">
              <p className="eyebrow">{copy.navFeatures}</p>
              <h2 className="h1 mt-2">{copy.featuresTitle}</h2>
              <p className="legend mt-3">{copy.featuresSub}</p>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="card-premium p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon name={feature.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="h3 mt-4">{dynamic[feature.title]}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{dynamic[feature.body]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="app-container py-16 sm:py-20">
          <div className="exam-panel overflow-hidden rounded-2xl bg-[#172433] text-[#F5F7FA]">
            <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8B64C]">{t('exam.official')}</p>
                <h2 className="mt-3 text-[1.7rem] font-bold leading-tight sm:text-[2rem]">{copy.examTitle}</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">{copy.examBody}</p>
                <ul className="mt-5 space-y-2 text-sm text-white/85">
                  {[copy.exam1, copy.exam2, copy.exam3].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-[#E8B64C]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to={onboarded ? '/exams' : startHref}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E8B64C] px-4 py-2.5 text-sm font-bold text-[#172433] transition hover:brightness-105"
                >
                  {copy.examCta}
                  <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>
              <div className="rounded-xl border border-white/12 bg-white/[0.06] p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-white/60">
                  <span>{copy.examTitle}</span>
                  <span className="tnum">34:12</span>
                </div>
                <div className="mt-3 rounded-lg bg-white/[0.06] p-3">
                  <p className="text-[11px] font-semibold text-[#E8B64C]">26 / 30</p>
                  <p className="mt-1 text-sm font-bold text-white">{copy.exam1}</p>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 30 }, (_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < 26 ? 'bg-[#4FA8A4]' : 'bg-white/15'}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-white/45">{t('readiness.disclaimer')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="app-container grid gap-6 pb-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
          <div>
            <p className="eyebrow">{t('readiness.title')}</p>
            <h2 className="h1 mt-2">{copy.readinessTitle}</h2>
            <p className="legend mt-3 max-w-lg">{copy.readinessBody}</p>
            <Link to={startHref} className="btn-secondary mt-5 px-4 py-2.5 text-sm">
              {copy.cta}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="card-premium p-5">
            <div className="space-y-3.5">
              {[
                { label: copy.r1, weight: '25%' },
                { label: copy.r2, weight: '30%' },
                { label: copy.r3, weight: '15%' },
                { label: copy.r4, weight: '15%' },
                { label: copy.r5, weight: '15%' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                    <span className="text-ink-soft">{row.label}</span>
                    <span className="tnum text-muted">{row.weight}</span>
                  </div>
                  <div className="progress-track mt-1.5">
                    <span className="progress-fill opacity-70" style={{ width: row.weight }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
              {t('readiness.disclaimer')}
            </p>
          </div>
        </section>

        <section id="why" className="border-y border-line bg-surface py-16 sm:py-20">
          <div className="app-container">
            <div className="max-w-2xl">
              <p className="eyebrow">LAMED+</p>
              <h2 className="h1 mt-2">{why.title}</h2>
              <p className="legend mt-3">{why.sub}</p>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {why.items.map((item) => (
                <article key={item.title} className="card-premium p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="h3 mt-4">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="app-container pb-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{t('category.B')} · {t('category.A')} · {t('category.A3')} · {t('category.C1')}</p>
              <h2 className="h2 mt-2">{copy.categoriesTitle}</h2>
            </div>
            <p className="text-sm text-muted">{copy.categoriesSub}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={startHref}
                className="row-card flex items-center gap-2.5 p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-soft">
                  <Icon name={category.id === 'A' || category.id === 'A3' ? 'motorcycle' : category.id === 'BUS' ? 'bus' : category.id === 'TRACTOR' ? 'tractor' : category.id === 'C' || category.id === 'C1' ? 'truck' : 'car'} className="h-4 w-4" />
                </span>
                <span className="min-w-0 truncate text-xs font-semibold text-ink">{t(category.nameKey)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="app-container pb-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <p className="eyebrow">{t('nav.games')}</p>
              <h2 className="h1 mt-2">{copy.gamesTitle}</h2>
              <p className="legend mt-3">{copy.gamesBody}</p>
              <Link to={onboarded ? '/games' : startHref} className="btn-primary mt-5 px-4 py-2.5 text-sm">
                {copy.gamesCta}
                <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: 'sign' as IconName, title: t('games.signSprint.name'), body: t('gamesPage.purposeSprint'), time: '45s' },
                { icon: 'bolt' as IconName, title: t('games.blitz.name'), body: t('gamesPage.purposeBlitz'), time: '20Q' },
              ].map((game) => (
                <div key={game.title} className="card p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Icon name={game.icon} className="h-5 w-5" />
                    </span>
                    <span className="chip">{game.time}</span>
                  </div>
                  <h3 className="h3 mt-4">{game.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{game.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="app-container scroll-mt-20 pb-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)]">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 className="h1 mt-2">{copy.faqTitle}</h2>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {[1, 2, 3, 4, 5].map((n) => (
                <details key={n} className="faq-item group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink">
                    {dynamic[`q${n}`]}
                    <Icon name="chevron-down" className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{dynamic[`a${n}`]}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="app-container pb-20">
          <div className="final-cta rounded-2xl border border-line p-6 text-center sm:p-10">
            <LogoMark size={44} className="mx-auto rounded-xl" />
            <h2 className="h1 mx-auto mt-4 max-w-2xl">{copy.finalTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">{copy.finalBody}</p>
            <Link to={startHref} className="btn-primary mt-6 px-6 py-3 text-[15px]">
              {copy.finalCta}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="app-container grid gap-6 py-9 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))]">
          <div>
            <Brand size={32} />
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted">{copy.footerNote}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink">{copy.footerProduct}</p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted">
              <li><Link to={startHref} className="hover:text-ink">{copy.cta}</Link></li>
              <li><Link to="/welcome" className="hover:text-ink">{copy.footerLearn}</Link></li>
              <li><Link to="/welcome" className="hover:text-ink">{copy.footerExams}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-ink">{copy.footerInfo}</p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted">
              <li><Link to="/accessibility" className="hover:text-ink">{t('legal.accessibility')}</Link></li>
              <li><Link to="/privacy" className="hover:text-ink">{t('legal.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-ink">{t('legal.terms')}</Link></li>
              <li><Link to="/settings" className="hover:text-ink">{copy.footerSettings}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-ink">LAMED+</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{t('app.tagline')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
