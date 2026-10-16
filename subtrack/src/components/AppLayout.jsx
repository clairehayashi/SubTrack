import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import styles from './AppLayout.module.css'
import ThemeToggle from './ThemeToggle'

export default function AppLayout() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.mobileToolbar}>
          <ThemeToggle />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
