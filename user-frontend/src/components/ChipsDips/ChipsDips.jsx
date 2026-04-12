import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ChipsDips.module.css';

export default function ChipsDips() {
  const navigate = useNavigate();
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {/* ── Left: Text ── */}
        <motion.div
          className={styles.left}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className={styles.heading}>CHIPS &amp; DIPS</h2>
          <p className={styles.serves}>Serves 10-15 each</p>
          <p className={styles.description}>
            Order Chips &amp; Dips for a spread of house-made Chips,
            all 4 salsas, and your choice of Guacamole or Queso
            Blanco.
          </p>
          <p className={styles.price}>GHC120 *</p>

          <button className={styles.cta} onClick={() => navigate('/chips-dips')}>
            GET CHIPS &amp; DIPS <ArrowRight size={20} />
          </button>

          <p className={styles.disclaimer}>*Pricing &amp; availability vary by location.</p>
        </motion.div>

        {/* ── Right: Image ── */}
        <motion.div
          className={styles.right}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775622412/dbb5_xgkexg.png"
            alt="Chips and Dips platter"
            className={styles.image}
            draggable={false}
          />
        </motion.div>
      </div>
    </section>
  );
}
