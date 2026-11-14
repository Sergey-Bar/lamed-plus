import { useEffect, useRef, useState } from 'react'
import { isLanguageId, LANGUAGES, LANGUAGE_ORDER } from '../lib/i18n/languages'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from './Icon'

export function LanguageMenu() {
  const { language, setLanguage, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn-icon gap-1.5 px-2.5"
        aria-label={`${t('common.language')}: ${LANGUAGES[language].label}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Icon name="globe" className="h-4.5 w-4.5" />
        <span className="hidden text-xs font-bold text-ink-soft sm:inline">
          {LANGUAGES[language].label}
        </span>
        <Icon name="chevron-down" className="hidden h-3 w-3 text-muted sm:block" />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={t('common.language')}
          className="animate-pop-in absolute end-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70vh,28rem)] w-44 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-[var(--shadow-lg)]"
        >
          {LANGUAGE_ORDER.map((id) => {
            const active = id === language
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  if (isLanguageId(id)) void setLanguage(id)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm font-semibold transition-colors ${
                  active ? 'bg-accent-soft text-ink' : 'text-ink-soft hover:bg-surface-2'
                }`}
              >
                <span>{LANGUAGES[id].label}</span>
                {active && <Icon name="check" className="h-4 w-4 text-ink" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
