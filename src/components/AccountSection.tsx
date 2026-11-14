import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCloud } from '../lib/cloud/useCloud'
import { useI18n } from '../lib/i18n/useI18n'
import { Icon } from './Icon'

export function AccountSection() {
  const { t } = useI18n()
  const { enabled, email, busy, signIn, signOut, sync, deleteAccount } = useCloud()
  const [address, setAddress] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Nothing is advertised until the cloud project is actually connected.
  if (!enabled) return null

  async function handleSignIn(event: FormEvent) {
    event.preventDefault()
    const value = address.trim()
    if (!value || sending) return
    setSending(true)
    setError(null)
    const result = await signIn(value)
    setSending(false)
    if (result.ok) setNotice(t('account.sent', { email: value }))
    else setError(t('account.error'))
  }

  return (
    <section className="card-premium rounded-2xl p-5">
      <h2 className="h3 flex items-center gap-2">
        <Icon name="shield-check" className="h-4 w-4 text-muted" />
        {t('account.title')}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{t('account.body')}</p>

      {!email && (
        <form onSubmit={handleSignIn} className="mt-4 space-y-2">
          <label htmlFor="account-email" className="block text-sm font-semibold text-ink">
            {t('account.emailLabel')}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="account-email"
              type="email"
              required
              autoComplete="email"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              disabled={sending}
              className="btn-primary touch-target rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-60"
            >
              {t('account.sendLink')}
            </button>
          </div>
        </form>
      )}

      {email && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-ink">{t('account.signedIn', { email })}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setNotice(null)
                setError(null)
                void sync().then((result) => {
                  if (result.ok) setNotice(t('account.synced'))
                  else setError(t('account.error'))
                })
              }}
              className="btn-secondary touch-target rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              <Icon name="reload" className="h-4 w-4" />
              {busy ? t('account.syncing') : t('account.syncNow')}
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:text-ink"
            >
              {t('account.signOut')}
            </button>
          </div>

          <div className="rounded-xl border border-line bg-surface-2 p-3">
            <p className="text-xs leading-relaxed text-muted">{t('account.deleteHint')}</p>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-2 text-xs font-bold text-danger hover:underline"
              >
                {t('account.delete')}
              </button>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setError(null)
                    setNotice(null)
                    void deleteAccount().then((result) => {
                      setConfirmDelete(false)
                      if (result.ok) setNotice(t('account.deleted'))
                      else setError(t('account.error'))
                    })
                  }}
                  className="rounded-xl bg-danger px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {t('account.deleteConfirm')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs font-semibold text-muted hover:text-ink"
                >
                  {t('common.cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {notice && (
        <p className="mt-3 text-xs font-semibold text-success" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs font-semibold text-danger" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
