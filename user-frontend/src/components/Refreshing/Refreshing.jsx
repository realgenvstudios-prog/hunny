import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Refreshing.module.css';

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 } },
};

export default function Refreshing() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>

        {/* ── Left: vertical text ── */}
        <motion.div
          className={styles.leftCol}
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className={styles.verticalHeading}>Refreshing&rsquo;</h2>
          <p className={styles.verticalSub}>never tasted so good</p>
        </motion.div>

        {/* ── Center: lady image ── */}
        <motion.div
          className={styles.centerCol}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <img
            src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578510/abcda5_kur6ns.png"
            alt="Woman holding fresh juice"
            className={styles.ladyImg}
            draggable={false}
          />
        </motion.div>

        {/* ── Right: description + button ── */}
        <motion.div
          className={styles.rightCol}
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className={styles.description}>
            Fresh pineapple mint juice.
            No preservatives. Clean
            refreshment you can
            actually feel good about
          </p>

          <Link to="/menu" className={styles.btn}>
            View Juices
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
