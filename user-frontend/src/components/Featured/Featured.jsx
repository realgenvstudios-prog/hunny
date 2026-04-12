import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Featured.module.css';

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 },
  },
};

export default function Featured() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>

        {/* ── Left: text ── */}
        <motion.div
          className={styles.textCol}
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className={styles.heading}>
            Savor Our Tasty<br />
            Chicken Wings
          </h2>
          <p className={styles.body}>
            These are the kind of wings that make you pause after the first bite.
            Sticky, spicy, perfectly glazed and built to satisfy cravings you didn't
            even know you had. From the heat to the sweetness to that final kick,
            every layer hits exactly where it should. You don't just eat this...
            you crave it again before you're even done.
          </p>
        </motion.div>

        {/* ── Right: image with badge ── */}
        <motion.div
          className={styles.imageCol}
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* HITS DIFFERENT sticker */}
          <img
            src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578502/abcda2_szdr0x.png"
            alt="Hits Different"
            className={styles.badge}
            draggable={false}
          />

          {/* Chicken bucket image */}
          <img
            src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578515/abcda1_uvwdqq.png"
            alt="Hunny Chicken Wings"
            className={styles.foodImg}
            draggable={false}
          />
        </motion.div>
      </div>

      {/* ── View Menu button ── */}
      <motion.div
        className={styles.btnWrap}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <Link to="/menu" className={styles.btn}>
          View Menu
        </Link>
      </motion.div>
    </section>
  );
}
