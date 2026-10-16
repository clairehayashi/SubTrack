import { useState, useEffect, useRef } from 'react'
import styles from './Dropdown.module.css'

/**
 * Soft dropdown to replace native <select>.
 *
 * Props:
 *  - value             — currently selected value
 *  - onChange(value)   — called when user picks an option
 *  - options           — [{ value, label }]
 *  - placeholder       — shown when no value is selected (default 'Select...')
 *  - triggerLabel      — explicit override for the trigger's displayed text
 *  - triggerLabelPrefix — string prefix (e.g. 'Sort: ') prepended to the selected label
 *  - size              — 'sm' | 'md' (default 'md')
 *  - align             — 'left' | 'right' — menu alignment (default 'left')
 *  - disabled          — boolean
 *  - className         — pass-through for parent style hooks
 */
export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  triggerLabel,
  triggerLabelPrefix,
  size = 'md',
  align = 'left',
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClickOut = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOut)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOut)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)
  const baseLabel = selected ? selected.label : placeholder
  const displayLabel = triggerLabel !== undefined
    ? triggerLabel
    : (triggerLabelPrefix && selected)
      ? `${triggerLabelPrefix}${baseLabel}`
      : baseLabel

  return (
    <div className={`${styles.dropdown} ${className}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        className={`
          ${styles.trigger}
          ${styles[size]}
          ${open ? styles.triggerOpen : ''}
          ${!selected ? styles.triggerPlaceholder : ''}
        `}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className={styles.value}>{displayLabel}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          viewBox="0 0 10 6"
          fill="none"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className={`${styles.menu} ${align === 'right' ? styles.menuRight : ''}`}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.option} ${value === opt.value ? styles.optionActive : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              <span className={styles.optionLabel}>{opt.label}</span>
              {value === opt.value && (
                <svg className={styles.check} viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}