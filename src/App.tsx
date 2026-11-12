import { HashRouter } from 'react-router-dom'
import { I18nProvider } from './lib/i18n/I18nProvider'
import { ThemeProvider } from './lib/theme/ThemeProvider'
import { A11yProvider } from './lib/a11y'
import { ProgressProvider } from './lib/progress/ProgressProvider'
import { ToastProvider } from './components/Toast'
import { AppRoutes } from './router'

export default function App() {
  return (
    <A11yProvider>
      <ThemeProvider>
        <I18nProvider>
        <ToastProvider>
          <ProgressProvider>
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </ProgressProvider>
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </A11yProvider>
  )
}
