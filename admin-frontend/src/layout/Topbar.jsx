import { Bell, Menu, Search } from 'lucide-react';
import styles from './Topbar.module.css';

export default function Topbar({ title, onMenuClick }) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
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
