import styles from './SubTrackLogo.module.css'

/**
 * SubTrack logo — the 4-square brand mark on an indigo tile.
 * Optionally shows "SubTrack" wordmark text beside it.
 *
 * Props:
 *  - size:     tile size in px (default 28)
 *  - showText: if true, renders "SubTrack" beside the mark
 *  - textSize: font size for the text (defaults proportional to size)
 */
export default function SubTrackLogo({ size = 28, showText = false, textSize }) {
  const fontSize = textSize ?? Math.round(size * 0.65)

  return (
    <div className={styles.logo}>
      <div
        className={styles.mark}
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
        }}
      >
        <svg viewBox="0 0 14 14" fill="none" style={{ width: '72%', height: '72%' }}>
          <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" opacity=".95" />
          <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity=".6" />
          <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".6" />
          <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".3" />
        </svg>
      </div>
      {showText && (
        <span className={styles.text} style={{ fontSize }}>
          SubTrack
        </span>
      )}
    </div>
  )
}