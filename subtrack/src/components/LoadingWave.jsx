import styles from './LoadingWave.module.css'

export default function LoadingWave({ label = 'Loading…', compact = false, fullscreen = false }) {
  return (
    <span className={`${styles.loader} ${compact ? styles.compact : ''} ${fullscreen ? styles.fullscreen : ''}`} role="status" aria-live="polite" aria-label={label}>
      <span className={styles.boxes} aria-hidden="true"><span /><span /><span /><span /></span>
      {!compact && <span className={styles.label}>{label}</span>}
    </span>
  )
}
