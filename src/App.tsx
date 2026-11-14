import { HashRouter } from 'react-router-dom'
import { I18nProvider } from './lib/i18n/I18nProvider'
import { ThemeProvider } from './lib/theme/ThemeProvider'
import { A11yProvider } from './lib/a11y'
import { ProgressProvider } from './lib/progress/ProgressProvider'
import { CloudProvider } from './lib/cloud/CloudProvider'
import { AnalyticsBoot } from './lib/analytics/AnalyticsBoot'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppRoutes } from './router'
import { SwUpdateBanner } from './components/SwUpdateBanner'

export default function App() {
  return (
    <A11yProvider>
      <ThemeProvider>
        <I18nProvider>
          <ErrorBoundary>
            <ToastProvider>
              <ProgressProvider>
                <CloudProvider>
                  <AnalyticsBoot />
                  <HashRouter>
                    <AppRoutes />
                    {/* Registered here, not inside the app shell: a visitor who
                        never finishes onboarding still gets the service worker. */}
                    <SwUpdateBanner />
                  </HashRouter>
                </CloudProvider>
              </ProgressProvider>
            </ToastProvider>
          </ErrorBoundary>
        </I18nProvider>
      </ThemeProvider>
    </A11yProvider>
  )
}
