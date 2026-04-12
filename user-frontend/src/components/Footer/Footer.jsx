import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, ClipboardEdit } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* ── Top: tagline ── */}
      <div className={styles.top}>
        <motion.h2
          className={styles.tagline}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          We always deliver on<br />
          time and to your<br />
          satisfaction.
        </motion.h2>
      </div>

      {/* Waffle image – overlaps both top and card */}
      <img
        src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775607582/abcda10_absiu0.png"
        alt="Pancake stack"
        className={styles.foodImg}
        draggable={false}
      />

      {/* ── Bottom: cream card ── */}
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>hunny</div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <Link to="/menu" className={styles.btn}>
            <Menu size={18} />
            Menu
          </Link>
          <Link to="/order" className={styles.btn}>
            <ClipboardEdit size={18} />
            Order Now
          </Link>
        </div>

        {/* Divider */}
        <hr className={styles.divider} />

        {/* Bottom row */}
        <div className={styles.bottom}>
          <div className={styles.socials}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.social}>Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.social}>Facebook</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={styles.social}>Tiktok</a>
          </div>
          <p className={styles.copyright}>© 2026 hunny. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
