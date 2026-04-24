import { motion } from 'framer-motion';
import styles from './MenuHero.module.css';

export default function MenuHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.grid}>
        {/* ── Left column: text content ── */}
        <div className={styles.left}>
          <motion.p
            className={styles.badge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <em>ALL</em> New
          </motion.p>

          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            PINEAPPLE<br />MINT
          </motion.h1>

          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            JUICE
          </motion.p>

          <motion.div
            className={styles.pill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            A WHOLE NEW LEVEL OF FRESHNESS
          </motion.div>

          <motion.p
            className={styles.description}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Sun-ripened tropical pineapple and fresh-crushed<br />
            mint blend for a smooth, chilled balance to your<br />
            Jollof, Fried Rice, Shawarma, and Grilled Meats.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <a href="#menu-section" className={styles.orderBtn}>Order Now</a>
          </motion.div>
        </div>

        {/* ── Right column: bottle ── */}
        <div className={styles.right}>
          <motion.img
            src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578508/abcda8_dieqzj.png"
            alt="Pineapple Mint Juice bottle"
            className={styles.bottle}
            draggable={false}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </section>
  );
}
