import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from './AdminLayout.module.css';

const TITLES = {
  '/':          'Dashboard',
  '/orders':    'Orders',
  '/menu':      'Menu Management',
  '/customers': 'Customers',
  '/catering':  'Catering Requests',
  '/discounts': 'Discount Codes',
  '/settings':  'Settings',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Admin';
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar title={title} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
