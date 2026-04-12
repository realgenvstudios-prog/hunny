import { Bell, Search } from 'lucide-react';
import styles from './Topbar.module.css';

export default function Topbar({ title }) {
  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>
        <div className={styles.search}>
          <Search size={16} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search…" />
        </div>
        <button className={styles.notifBtn} aria-label="Notifications">
          <Bell size={20} />
          <span className={styles.badge} />
        </button>
        <div className={styles.avatar}>A</div>
      </div>
    </header>
  );
}
