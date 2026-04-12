import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './PerfectOccasion.module.css';

const ROW1 = ['PTA meetings', 'Teacher Appreciation Week', 'Holidays', 'Corporate events', 'Easter'];
const ROW2_LEFT = ['Funeral', 'Graduation Parties'];
const ROW2_RIGHT = ['Employee appreciation', 'Swim meets'];
const ROW3 = ['Team events', 'Hospital Week', 'On-site lunches', "Mother's Day", "Father's Day"];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const tagVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function PerfectOccasion() {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        PERFECT FOR ANY OCCASION
      </motion.h2>

      <motion.div
        className={styles.tags}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Row 1 */}
        <div className={styles.row}>
          {ROW1.map((label) => (
            <motion.span key={label} className={styles.tag} variants={tagVariants}>
              {label}
            </motion.span>
          ))}
        </div>

        {/* Row 2 — CTA in the middle */}
        <div className={styles.row}>
          {ROW2_LEFT.map((label) => (
            <motion.span key={label} className={styles.tag} variants={tagVariants}>
              {label}
            </motion.span>
          ))}
          <motion.button
            className={styles.ctaTag}
            variants={tagVariants}
            onClick={() => navigate('/catering#booking')}
          >
            ORDER CATERING
          </motion.button>
          {ROW2_RIGHT.map((label) => (
            <motion.span key={label} className={styles.tag} variants={tagVariants}>
              {label}
            </motion.span>
          ))}
        </div>

        {/* Row 3 */}
        <div className={styles.row}>
          {ROW3.map((label) => (
            <motion.span key={label} className={styles.tag} variants={tagVariants}>
              {label}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
