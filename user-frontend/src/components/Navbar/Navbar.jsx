import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, ChevronDown, LogOut, Package } from 'lucide-react';
import BasketIcon from '../icons/BasketIcon';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'MENU', to: '/menu' },
  { label: 'CATERING', to: '/catering' },
  { label: 'ABOUT US', to: '/about' },
  { label: 'CONTACT', to: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.nav}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <img
            src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578539/IMG-20251219-WA0000_kdwn3b.png"
            alt="Hunny"
          />
        </Link>

        {/* Desktop Nav Links */}
        <ul className={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.label}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu} ref={userMenuRef}>
              <button
                className={styles.userBtn}
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="Account menu"
              >
                <div className={styles.userAvatar}>
                  {(user.user_metadata?.full_name || user.email)?.[0].toUpperCase()}
                </div>
                <span className={styles.userName}>
                  {user.user_metadata?.full_name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className={styles.userDropdown}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <p className={styles.userEmail}>{user.email}</p>
                    <Link to="/orders" className={styles.dropdownLink} onClick={() => setUserMenuOpen(false)}>
                      <Package size={15} />
                      My Orders
                    </Link>
                    <button className={styles.signOutBtn} onClick={handleSignOut}>
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/signin" className={styles.signIn}>
              <User size={20} strokeWidth={1.8} />
              <span>SIGN IN / JOIN</span>
            </Link>
          )}

          <Link to="/cart" className={styles.cartBtn}>
            <BasketIcon />
            {cartCount > 0 && (
              <motion.span
                className={styles.cartBadge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={cartCount}
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* Mobile Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <ul>
              {navLinks.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    className={styles.mobileLink}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li>
                {user ? (
                  <button
                    className={`${styles.mobileLink} ${styles.mobileLinkBtn}`}
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  >
                    SIGN OUT
                  </button>
                ) : (
                  <Link
                    to="/signin"
                    className={styles.mobileLink}
                    onClick={() => setMobileOpen(false)}
                  >
                    SIGN IN / JOIN
                  </Link>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
