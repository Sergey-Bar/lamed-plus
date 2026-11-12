import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from '../../lib/i18n/useI18n'
import { Icon } from '../Icon'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  tone?: 'default' | 'danger'
}

export function Dialog({ open, onClose, title, description, children, footer, tone = 'default' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = useI18n()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [onClose])

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby={title ? 'dialog-title' : undefined}>
      <div className="surface overflow-hidden rounded-2xl p-0 shadow-[0_40px_100px_-30px_rgb(0_0_0/0.5)]">
        <div className="flex items-start gap-4 border-b border-line p-5">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 id="dialog-title" className={`h3 ${tone === 'danger' ? 'text-danger' : 'text-ink'}`}>
                {title}
              </h2>
            )}
            {description && <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn-icon shrink-0" aria-label={t('common.close')}>
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        {children && <div className="p-5">{children}</div>}
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface-2 p-4">{footer}</div>}
      </div>
    </dialog>
  )
}
