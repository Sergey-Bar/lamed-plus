import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { stripBidiIsolates } from '../lib/i18n/bidi'
import { LEGAL_DOCS, legalDoc } from '../lib/product/content'
import type { LegalDocId } from '../lib/product/content'
import { Logo } from '../components/Logo'
import { Icon } from '../components/Icon'

const DOCS: LegalDocId[] = ['privacy', 'terms', 'accessibility']

const LABEL_KEYS: Record<LegalDocId, string> = {
  privacy: 'legal.privacy',
  terms: 'legal.terms',
  accessibility: 'legal.accessibility',
}

export function Legal({ doc }: { doc: LegalDocId }) {
  const { language, t } = useI18n()
  const copy = legalDoc(doc, language)
  const needsEnglish = !LEGAL_DOCS[doc][language]

  useEffect(() => {
    document.title = stripBidiIsolates(`${copy.title} · ${t('app.name')}`)
    document.documentElement.lang = language
  }, [copy.title, language, t])

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="app-container flex h-16 items-center justify-between gap-3">
          {/* The logo already renders its own link; wrapping it nested two anchors. */}
          <Logo size={32} />
          <Link to="/" className="btn-ghost px-3 py-2 text-xs font-semibold">
            <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            {t('legal.back')}
          </Link>
        </div>
      </header>

      <main className="app-container max-w-3xl py-10">
        <p className="eyebrow">{t('app.name')}</p>
        <h1 className="h1 mt-1.5">{copy.title}</h1>
        <p className="mt-2 text-xs text-muted">{t('legal.updated', { date: copy.updated })}</p>

        {needsEnglish && (
          <p className="mt-4 rounded-xl border border-line bg-surface-2 p-3 text-xs leading-relaxed text-muted">
            {t('legal.englishNote')}
          </p>
        )}

        <p className="mt-6 text-sm leading-relaxed text-ink-soft">{copy.intro}</p>

        <div className="mt-8 space-y-6">
          {copy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="h2">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-2 text-sm leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 space-y-1.5 ps-5 text-sm leading-relaxed text-muted">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="list-disc">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <nav className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
          {DOCS.filter((id) => id !== doc).map((id) => (
            <Link key={id} to={`/${id}`} className="btn-secondary px-4 py-2.5 text-sm font-semibold">
              {t(LABEL_KEYS[id])}
            </Link>
          ))}
          <Link to="/settings" className="btn-ghost px-4 py-2.5 text-sm font-semibold">
            {t('settings.title')}
          </Link>
        </nav>
      </main>
    </div>
  )
}

export default Legal
