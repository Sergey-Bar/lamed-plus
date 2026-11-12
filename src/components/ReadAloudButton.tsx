import { useEffect, useState } from 'react'
import type { LanguageId } from '../lib/content/schema'
import { useA11y } from '../lib/a11y/useA11y'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from './Icon'

const SPEECH_LANG: Record<LanguageId, string> = {
  he: 'he-IL',
  en: 'en-US',
  ru: 'ru-RU',
  ar: 'ar-SA',
  fr: 'fr-FR',
  es: 'es-ES',
}

interface ReadAloudButtonProps {
  text: string
  lang?: LanguageId
  labelKey?: string
  className?: string
}

export function ReadAloudButton({
  text,
  lang,
  labelKey = 'a11y.readQuestion',
  className = '',
}: ReadAloudButtonProps) {
  const { prefs } = useA11y()
  const { language, t } = useI18n()
  const [speaking, setSpeaking] = useState(false)
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return
    return () => window.speechSynthesis.cancel()
  }, [supported])

  if (!prefs.readAloud || !supported || !text.trim()) return null

  function toggle() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = SPEECH_LANG[lang ?? language]
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  const label = speaking ? t('a11y.stop') : t(labelKey)

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={speaking}
      title={label}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-2 ${className}`}
    >
      <Icon name={speaking ? 'pause' : 'volume'} className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
