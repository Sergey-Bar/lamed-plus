import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { LANGUAGES, LANGUAGE_ORDER } from '../lib/i18n/languages'
import { CATEGORIES } from '../lib/content/categories'
import { DAILY_GOAL_OPTIONS } from '../lib/progress/onboarding'
import { useProgress } from '../lib/progress/ProgressProvider'
import { availableQuestionCount, totalQuestionCount } from '../lib/content/bankStats'
import { Icon } from '../components/Icon'
import { LogoMark } from '../components/Logo'
import { CategoryMark } from '../components/CategoryMark'
import type { LanguageId } from '../lib/content/schema'

const TOTAL = 5
const STAGES = [
  { id: 'starting', title: 'ob.stage1', body: 'ob.stage1d', icon: 'play-circle' },
  { id: 'studying', title: 'ob.stage2', body: 'ob.stage2d', icon: 'book' },
  { id: 'soon', title: 'ob.stage3', body: 'ob.stage3d', icon: 'timer' },
  { id: 'retake', title: 'ob.stage4', body: 'ob.stage4d', icon: 'reload' },
] as const

function todayIso() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function Onboarding() {
  const { t, language, setLanguage } = useI18n()
  const { completeOnboarding } = useProgress()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [lang, setLang] = useState<LanguageId>(language)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('B')
  const [stage, setStage] = useState('starting')
  const [goal, setGoal] = useState(20)
  const [testDate, setTestDate] = useState('')
  const minDate = useMemo(() => todayIso(), [])
  const totalQuestions = totalQuestionCount()

  const headings = [
    t('welcome.languageTitle'),
    t('ob.nameTitle'),
    t('welcome.categoryTitle'),
    t('ob.stageTitle'),
    t('welcome.goalTitle'),
  ]
  const subs = [
    t('welcome.languageSub'),
    t('ob.nameSub'),
    t('welcome.categorySub'),
    t('ob.stageSub'),
    t('welcome.goalSub'),
  ]

  async function next() {
    if (step === 0) {
      if (lang !== language) await setLanguage(lang)
      setStep(1)
      return
    }
    if (step < TOTAL - 1) {
      setStep((value) => value + 1)
      return
    }
    completeOnboarding(category, goal, testDate || null, name, stage)
    navigate('/app', { replace: true })
  }

  const activeCategory = CATEGORIES.find((item) => item.id === category)
  const activeStage = STAGES.find((item) => item.id === stage)

  return (
    <div className="min-h-screen bg-bg">
      <div className="app-container grid min-h-screen gap-8 py-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-14 lg:py-10">
        <aside className="hidden flex-col lg:flex">
          <div className="flex items-center gap-2.5">
            <LogoMark size={38} className="rounded-xl" />
            <span className="text-xl font-extrabold tracking-tight text-ink">LAMED+</span>
          </div>
          <h1 className="display mt-10 max-w-md text-ink">{t('app.tagline')}</h1>
          <p className="legend mt-4 max-w-sm">{t('home.subtitle')}</p>
          <ul className="mt-8 space-y-3 text-sm text-ink-soft">
            {[
              { icon: 'book' as const, text: t('learn.sub') },
              { icon: 'target' as const, text: t('readiness.sub') },
              {
                icon: 'seal' as const,
                text: t('home.officialBank', {
                  count: totalQuestions.toLocaleString(language === 'he' ? 'he-IL' : language),
                }),
              },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                <span className="leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-10">
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: TOTAL }, (_, index) => (
                <span key={index} className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-accent' : 'bg-line'}`} />
              ))}
            </div>
            <p className="mt-2 text-[11px] font-semibold text-muted">
              {t('welcome.step', { current: step + 1, total: TOTAL })}
            </p>
          </div>
        </aside>

        <section className="card-premium onboarding-card mx-auto w-full max-w-xl p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <div className="flex items-center gap-2">
              <LogoMark size={30} className="rounded-lg" />
              <span className="font-extrabold tracking-tight text-ink">LAMED+</span>
            </div>
            <span className="text-[11px] font-semibold text-muted">
              {t('welcome.step', { current: step + 1, total: TOTAL })}
            </span>
          </div>
          <div className="mt-3 flex gap-1.5 lg:hidden" aria-hidden="true">
            {Array.from({ length: TOTAL }, (_, index) => (
              <span key={index} className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-accent' : 'bg-line'}`} />
            ))}
          </div>

          <div key={step} className="step-enter mt-5 lg:mt-0">
            <p className="eyebrow">{t('welcome.step', { current: step + 1, total: TOTAL })}</p>
            <h2 className="h2 mt-2">{headings[step]}</h2>
            <p className="legend mt-1.5 text-sm">{subs[step]}</p>

            {step === 0 && (
              <div className="mt-5 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('common.language')}>
                {LANGUAGE_ORDER.map((id) => {
                  const active = lang === id
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setLang(id)}
                      className={`press flex min-h-14 items-center justify-between rounded-xl border px-4 py-3 text-start ${
                        active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-surface-2'
                      }`}
                    >
                      <span className="font-semibold text-ink">{LANGUAGES[id].label}</span>
                      <span className={`grid h-5 w-5 place-items-center rounded-full border ${active ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong text-transparent'}`}>
                        <Icon name="check" className="h-3 w-3" />
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {step === 1 && (
              <div className="mt-5">
                <label htmlFor="ob-name" className="text-sm font-semibold text-ink">
                  {t('profile.name')} <span className="font-normal text-muted">({t('common.optional')})</span>
                </label>
                <input
                  id="ob-name"
                  value={name}
                  maxLength={40}
                  autoComplete="given-name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t('ob.namePlaceholder')}
                  className="input mt-2"
                />
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-muted">
                  <Icon name="shield-check" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t('profile.local')}
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="mt-5 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('practice.chooseCategory')}>
                {CATEGORIES.map((item) => {
                  const active = category === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setCategory(item.id)}
                      className={`press flex items-center gap-3 rounded-xl border px-3.5 py-3 text-start ${
                        active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-surface-2'
                      }`}
                    >
                      <CategoryMark id={item.id} tone={active ? 'accent' : 'default'} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{t(item.nameKey)}</span>
                        <span className="block text-[11px] text-muted">
                          {availableQuestionCount(item.id)} {t('common.questions')}
                        </span>
                      </span>
                      {active && <Icon name="check-circle" className="h-5 w-5 shrink-0 text-accent" />}
                    </button>
                  )
                })}
              </div>
            )}

            {step === 3 && (
              <div className="mt-5 space-y-2" role="radiogroup" aria-label={t('ob.stageTitle')}>
                {STAGES.map((item) => {
                  const active = stage === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setStage(item.id)}
                      className={`press flex w-full items-start gap-3 rounded-xl border p-3.5 text-start ${
                        active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-surface-2'
                      }`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-muted'}`}>
                        <Icon name={item.icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink">{t(item.title)}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{t(item.body)}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {step === 4 && (
              <div className="mt-5">
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('settings.goalLabel')}>
                  {DAILY_GOAL_OPTIONS.map((value) => {
                    const active = goal === value
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setGoal(value)}
                        className={`press rounded-xl border py-4 text-center ${active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-surface-2'}`}
                      >
                        <span className="tnum block text-2xl font-bold text-ink">{value}</span>
                        <span className="mt-0.5 block text-[10px] font-semibold text-muted">{t('welcome.perDay')}</span>
                      </button>
                    )
                  })}
                </div>
                <label htmlFor="ob-date" className="mt-5 block text-sm font-semibold text-ink">
                  {t('settings.testDateLabel')} <span className="font-normal text-muted">({t('common.optional')})</span>
                </label>
                <input
                  id="ob-date"
                  type="date"
                  value={testDate}
                  min={minDate}
                  onChange={(event) => setTestDate(event.target.value)}
                  className="input mt-2 max-w-48 text-sm"
                />
                <dl className="mt-5 space-y-2 rounded-xl border border-line bg-surface-2 p-3.5 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{t('exams.category')}</dt>
                    <dd className="font-semibold text-ink">{activeCategory ? t(activeCategory.nameKey) : category}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{t('ob.stageTitle')}</dt>
                    <dd className="font-semibold text-ink">{activeStage ? t(activeStage.title) : ''}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{t('dash.goal')}</dt>
                    <dd className="font-semibold text-ink">{goal} {t('welcome.perDay')}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-4">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((value) => value - 1)} className="btn-ghost px-3 py-2.5 text-sm">
                <Icon name="arrow-back" className="h-4 w-4 rtl:rotate-180" />
                {t('welcome.back')}
              </button>
            ) : (
              <span />
            )}
            <button type="button" onClick={() => void next()} className="btn-primary px-5 py-2.5 text-sm">
              {step === TOTAL - 1 ? t('ob.finish') : t('welcome.continue')}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Onboarding
