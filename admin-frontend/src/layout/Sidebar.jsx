import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed,
  Users, CalendarCheck, Tag, MessageSquare, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/orders',       icon: ShoppingBag,     label: 'Orders'         },
  { to: '/menu',         icon: UtensilsCrossed, label: 'Menu'           },
  { to: '/customers',    icon: Users,           label: 'Customers'      },
  { to: '/catering',     icon: CalendarCheck,   label: 'Catering'       },
  { to: '/discounts',    icon: Tag,             label: 'Discount Codes' },
  { to: '/contacts',     icon: MessageSquare,   label: 'Contact Msgs'   },
  { to: '/settings',     icon: Settings,        label: 'Settings'       },
];

export default function Sidebar({ isOpen, onClose }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.brand}>
        <span className={styles.brandText}>HUNNY</span>
        <span className={styles.brandTag}>Admin</span>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className={styles.logout} onClick={handleLogout}>
        <LogOut size={18} />
        <span>Log Out</span>
      </button>
    </aside>
  );
}
