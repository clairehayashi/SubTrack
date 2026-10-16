import styles from './MetricCard.module.css'

export default function MetricCard({ label, value, sub, valueColor }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value} style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>
      {sub && (
        <div className={styles.sub} style={valueColor ? { color: valueColor } : {}}>
          {sub}
        </div>
      )}
    </div>
  )
}
