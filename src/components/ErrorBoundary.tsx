import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from './Icon'

function CrashFallback() {
  const { t } = useI18n()

  function reload() {
    window.location.reload()
  }

  function goHome() {
    window.location.hash = '#/'
    window.location.reload()
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6" role="alert">
      <div className="card-premium w-full max-w-md rounded-2xl p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <Icon name="alert" className="h-6 w-6" />
        </span>
        <h1 className="h2 mt-4">{t('error.title')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t('error.body')}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reload} className="btn-primary px-4 py-2.5 text-sm">
            {t('error.reload')}
          </button>
          <button type="button" onClick={goHome} className="btn-secondary px-4 py-2.5 text-sm">
            {t('error.home')}
          </button>
        </div>
      </div>
    </main>
  )
}

interface ErrorBoundaryState {
  failed: boolean
}

/**
 * Keeps a render error in one screen instead of a blank page. The fallback
 * lives inside the i18n provider so it can still speak the user's language.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('LAMED+ crashed while rendering', error, info.componentStack)
  }

  override render() {
    if (this.state.failed) return <CrashFallback />
    return this.props.children
  }
}

export default ErrorBoundary
