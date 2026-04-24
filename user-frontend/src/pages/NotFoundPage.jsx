import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className={styles.code}>404</h1>
        <p className={styles.message}>Oops — this page doesn't exist.</p>
        <Link to="/" className={styles.btn}>Back to Home</Link>
      </motion.div>
    </div>
  );
}
