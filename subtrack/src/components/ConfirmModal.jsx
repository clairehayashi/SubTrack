import { useEffect, useId, useRef, useState } from 'react'
import styles from './ConfirmModal.module.css'
import LoadingWave from './LoadingWave'
import ModalPortal from './ModalPortal'

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'neutral',
  loading = false,
  onConfirm,
  onCancel
}) {
  const confirmRef = useRef(null),
    modalRef = useRef(null)
  const titleId = useId(),
    messageId = useId()
  const [submitting, setSubmitting] = useState(false),
    [error, setError] = useState('')
  const busy = loading || submitting
  useEffect(() => {
    if (!open) return
    setError('')
    setSubmitting(false)
    const previousFocus = document.activeElement
    confirmRef.current?.focus()
    return () => {
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [open])
  if (!open) return null
  const confirm = async () => {
    if (busy) return
    setSubmitting(true)
    setError('')
    try {
      await onConfirm()
    } catch (err) {
      setError(
        err.message || 'Unable to complete this action. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }
  const handleKeys = (event) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      if (!busy) onCancel()
    }
    if (event.key === 'Tab') {
      const buttons = [
        ...modalRef.current.querySelectorAll('button:not(:disabled)')
      ]
      const first = buttons[0],
        last = buttons[buttons.length - 1]
      if (!first) {
        event.preventDefault()
        return
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }
  return (
    <ModalPortal>
      <div
        className={styles.overlay}
        onClick={(event) => {
          if (event.target === event.currentTarget && !busy) onCancel()
        }}
      >
        <div
          className={styles.modal}
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={message ? messageId : undefined}
          onKeyDown={handleKeys}
        >
          <div id={titleId} className={styles.title}>
            {title}
          </div>
          {message && (
            <div id={messageId} className={styles.message}>
              {message}
            </div>
          )}
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}
          <div className={styles.actions}>
            <button
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={busy}
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmRef}
              className={`${styles.confirmBtn} ${variant === 'danger' ? styles.danger : ''}`}
              disabled={busy}
              onClick={confirm}
            >
              {busy ? (
                <LoadingWave compact label="Saving changes…" />
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
