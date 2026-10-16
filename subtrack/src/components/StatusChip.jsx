import styles from './StatusChip.module.css'
import { normalizeStatus } from '../utils/status'

const CONFIG = {
  keep:      { label: 'Keep',        cls: 'keep'      },
  cancel:    { label: 'Cancel soon', cls: 'cancel'    },
  undecided: { label: 'Undecided',   cls: 'undecided' },
  trial:     { label: 'Trial',       cls: 'trial'     },
  cancelled: { label: 'Cancelled',   cls: 'cancel'    },
}

export default function StatusChip({ status }) {
  const cfg = CONFIG[normalizeStatus(status)]
  return (
    <span className={`${styles.chip} ${styles[cfg.cls]}`}>
      {cfg.label}
    </span>
  )
}
