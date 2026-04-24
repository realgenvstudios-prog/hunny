import { useState } from 'react';
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
  '/contacts':  'Contact Msgs',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'Admin';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className={styles.shell}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
      <div className={styles.main}>
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
