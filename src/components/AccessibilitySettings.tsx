import { useA11y } from '../lib/a11y/useA11y'
import { TEXT_SCALES } from '../lib/a11y'
import type { TextScale } from '../lib/a11y'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from './Icon'

const SIZE_LABELS: Record<TextScale, string> = {
  1: 'A',
  1.125: 'A+',
  1.25: 'A++',
  1.4: 'A+++',
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="press flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-surface px-3.5 py-3 text-start transition-colors hover:bg-surface-2"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{hint}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
          checked ? 'border-accent bg-accent' : 'border-line-strong bg-surface-3'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'start-[1.4rem]' : 'start-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export function AccessibilitySettings() {
  const { t } = useI18n()
  const { prefs, setTextScale, toggle, reset } = useA11y()

  return (
    <section id="accessibility" className="card-premium scroll-mt-24 rounded-2xl p-5">
      <h2 className="h3 flex items-center gap-2">
        <Icon name="accessibility" className="h-4 w-4 text-muted" />
        {t('a11y.title')}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{t('a11y.sub')}</p>

      <div className="mt-4">
        <p className="text-sm font-semibold text-ink">{t('a11y.textSize')}</p>
        <p className="mt-0.5 text-xs text-muted">{t('a11y.textSizeHint')}</p>
        <div
          className="mt-2 grid grid-cols-4 gap-2"
          role="radiogroup"
          aria-label={t('a11y.textSize')}
        >
          {TEXT_SCALES.map((scale) => {
            const active = prefs.textScale === scale
            return (
              <button
                key={scale}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${SIZE_LABELS[scale]} — ${Math.round(scale * 100)}%`}
                onClick={() => setTextScale(scale)}
                className={`press rounded-xl border px-2 py-3 font-display font-bold transition-colors ${
                  active
                    ? 'border-accent bg-accent-soft text-ink'
                    : 'border-line bg-surface text-muted hover:bg-surface-2 hover:text-ink'
                }`}
                style={{ fontSize: `${0.9 + (scale - 1) * 0.65}rem` }}
              >
                {SIZE_LABELS[scale]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <ToggleRow
          label={t('a11y.contrast')}
          hint={t('a11y.contrastHint')}
          checked={prefs.highContrast}
          onChange={() => toggle('highContrast')}
        />
        <ToggleRow
          label={t('a11y.motion')}
          hint={t('a11y.motionHint')}
          checked={prefs.reduceMotion}
          onChange={() => toggle('reduceMotion')}
        />
        <ToggleRow
          label={t('a11y.links')}
          hint={t('a11y.linksHint')}
          checked={prefs.underlineLinks}
          onChange={() => toggle('underlineLinks')}
        />
        <ToggleRow
          label={t('a11y.reading')}
          hint={t('a11y.readingHint')}
          checked={prefs.comfortableReading}
          onChange={() => toggle('comfortableReading')}
        />
        <ToggleRow
          label={t('a11y.speech')}
          hint={t('a11y.speechHint')}
          checked={prefs.readAloud}
          onChange={() => toggle('readAloud')}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <p className="max-w-md text-[11px] leading-relaxed text-muted">
          {t('a11y.statementBody')}
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn-ghost rounded-lg px-3 py-2 text-xs font-semibold"
        >
          <Icon name="reload" className="h-3.5 w-3.5" />
          {t('a11y.reset')}
        </button>
      </div>
    </section>
  )
}
