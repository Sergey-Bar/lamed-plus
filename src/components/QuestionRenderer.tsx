import { useEffect, useId } from 'react'
import { assetUrl } from '../lib/content/assets'
import type { Question } from '../lib/content/schema'
import type { LanguageId } from '../lib/content/schema'
import { contentLanguage, translate } from '../lib/content/questions'
import { useI18n } from '../lib/i18n/useI18n'
import { LANGUAGES } from '../lib/i18n/languages'
import { Icon } from './Icon'
import { ReadAloudButton } from './ReadAloudButton'

interface QuestionRendererProps {
  question: Question
  lang: LanguageId
  selected: number[]
  onToggle: (index: number) => void
  reveal?: boolean
  disabled?: boolean
  hintIndex?: number | null
  hidden?: number[]
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E']

export function QuestionRenderer({
  question,
  lang,
  selected,
  onToggle,
  reveal = false,
  disabled = false,
  hintIndex = null,
  hidden = [],
}: QuestionRendererProps) {
  const { t } = useI18n()
  const headingId = useId()
  const tr = translate(question, lang)
  const shownLanguage = contentLanguage(question, lang)
  const isFallback = Boolean(shownLanguage && shownLanguage !== lang)
  const optionCount = tr?.options.length ?? 0
  const isMulti = question.type === 'multi'
  const speechText = tr
    ? `${tr.stem}. ${tr.options
        .map((option, index) => `${OPTION_LABELS[index] ?? index + 1}. ${option}`)
        .join('. ')}`
    : ''

  useEffect(() => {
    if (disabled || optionCount === 0) return
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      // A modal dialog owns the keyboard while it is open.
      if (document.querySelector('dialog[open]')) return
      const n = Number(event.key)
      if (Number.isInteger(n) && n >= 1 && n <= optionCount) {
        event.preventDefault()
        onToggle(n - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled, optionCount, onToggle])

  if (!tr) return null

  const imageUrl = question.image ? assetUrl(question.image) : undefined
  const correct = new Set(tr.correctIndexes)
  const correctIndex = tr.correctIndexes[0]
  const correctText = correctIndex !== undefined ? tr.options[correctIndex] : ''

  function optionClass(index: number): string {
    const isSelected = selected.includes(index)
    let cls =
      'group relative flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-start text-[15px] font-medium leading-snug transition-all duration-200 ease-out sm:text-base'
    if (disabled || hidden.includes(index)) {
      cls += ' cursor-default'
    } else {
      cls += ' cursor-pointer hover:-translate-y-px hover:border-line-strong active:scale-[0.995]'
    }
    if (hintIndex === index) {
      cls += ' ring-2 ring-accent/70'
    }
    if (hidden.includes(index)) {
      cls += ' pointer-events-none opacity-25 blur-[0.5px]'
    }
    if (reveal) {
      if (correct.has(index)) cls += ' border-success/50 bg-success-soft text-ink'
      else if (isSelected) cls += ' border-danger/50 bg-danger-soft text-ink'
      else cls += ' border-line bg-surface-2/60 text-muted opacity-60'
    } else if (isSelected) {
      cls += ' border-accent bg-accent-soft text-ink shadow-[0_0_0_1px_var(--accent-soft)_inset]'
    } else {
      cls += ' border-line bg-surface text-ink hover:bg-surface-2'
    }
    return cls
  }

  function labelClass(index: number): string {
    if (reveal && correct.has(index)) return 'border-success/40 bg-success text-white'
    if (reveal && selected.includes(index)) return 'border-danger/40 bg-danger text-white'
    if (selected.includes(index)) return 'border-accent bg-accent text-accent-ink'
    return 'border-line bg-surface-2 text-muted group-hover:text-ink'
  }

  return (
    <div className="space-y-5">
      {imageUrl && (
        <figure className="overflow-hidden rounded-2xl border border-line bg-surface-2">
          <div className="flex items-center justify-center p-4 sm:p-6">
            <img
              src={imageUrl}
              alt={t('question.imageAlt', { number: question.number ?? '' })}
              loading="lazy"
              decoding="async"
              className="max-h-64 w-auto rounded-lg object-contain"
            />
          </div>
          {question.number && (
            <figcaption className="border-t border-line px-4 py-2 text-center text-xs font-semibold text-muted">
              {t('question.imageCaption', { number: question.number })}
            </figcaption>
          )}
        </figure>
      )}

      <div>
        {question.number && (
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
            <span className="tnum rounded-md border border-line bg-surface-2 px-1.5 py-0.5">
              #{question.number}
            </span>
            <span>{t(`topic.${question.topicId}`)}</span>
          </p>
        )}
        <h2
          id={headingId}
          className="font-display text-[1.15rem] font-semibold leading-[1.4] tracking-tight text-ink sm:text-[1.3rem]"
        >
          {tr.stem}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ReadAloudButton text={speechText} lang={shownLanguage} />
          {isFallback && shownLanguage && (
            <span className="rounded-lg border border-warning/25 bg-warning-soft px-2.5 py-1.5 text-[11px] font-semibold leading-snug text-warning">
              {t('question.fallback', { language: LANGUAGES[shownLanguage].label })}
            </span>
          )}
        </div>
      </div>

      <div
        className="stagger space-y-2.5"
        role={isMulti ? 'group' : 'radiogroup'}
        aria-labelledby={headingId}
      >
        {tr.options.map((option, index) => {
          const isSelected = selected.includes(index)
          const stateClass = optionClass(index)
          return (
            <button
              key={index}
              type="button"
              role={isMulti ? 'checkbox' : 'radio'}
              aria-checked={isSelected}
              aria-keyshortcuts={String(index + 1)}
              disabled={disabled}
              aria-label={`${OPTION_LABELS[index] ?? index + 1}. ${option}${isSelected ? ` — ${t('common.selected')}` : ''}`}
              onClick={() => onToggle(index)}
              className={stateClass}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[13px] font-bold transition-all ${labelClass(index)}`}
              >
                {OPTION_LABELS[index] ?? index + 1}
              </span>
              <span className="flex-1">{option}</span>
              {reveal && correct.has(index) && (
                <Icon name="check-circle" className="h-5 w-5 shrink-0 text-success" weight="fill" />
              )}
              {reveal && !correct.has(index) && isSelected && (
                <Icon name="x-circle" className="h-5 w-5 shrink-0 text-danger" weight="fill" />
              )}
            </button>
          )
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {reveal
          ? `${t('exam.correctAnswer')}: ${OPTION_LABELS[correctIndex] ?? ''}. ${correctText}`
          : ''}
      </p>

      {reveal && tr.explanation && (
        <div className="animate-pop-in flex gap-3 rounded-xl border border-info/25 bg-info-soft p-4 text-sm leading-relaxed text-ink">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/15 text-info">
            <Icon name="hint" className="h-4 w-4" />
          </span>
          <span className="pt-1">{tr.explanation}</span>
        </div>
      )}
    </div>
  )
}
