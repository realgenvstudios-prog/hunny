import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

/* Curved arrow SVGs matching the Figma design */
function ArrowLeft() {
  return (
    <svg
      className={styles.arrowLeft}
      viewBox="0 0 140 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Curving down then sweeping right with arrowhead */}
      <path
        d="M20 8 C 10 25, 15 55, 50 62 C 75 66, 110 55, 130 50"
        stroke="#2D2D2D"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M122 44 L132 50 L122 56"
        stroke="#2D2D2D"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      className={styles.arrowRight}
      viewBox="0 0 140 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Curving from top-left down then sweeping to the left */}
      <path
        d="M120 8 C 130 25, 125 55, 90 62 C 65 66, 30 55, 10 50"
        stroke="#E91E8C"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M18 44 L8 50 L18 56"
        stroke="#E91E8C"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>

        {/* Left annotation */}
        <motion.div
          className={styles.annotationLeft}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
        >
          <p className={styles.annotationTitle}>The Lift-Off</p>
          <p className={styles.annotationBody}>
            One bite of our mouthwatering shawarma and the world below
            just.... disappears
          </p>
          <ArrowLeft />
        </motion.div>

        {/* Central plate image */}
        <motion.div
          className={styles.plateWrap}
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          <img
            src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578508/abcda-2_ndwhfq.png"
            alt="Hunny Shawarma"
            className={styles.plateImg}
            draggable={false}
          />
        </motion.div>

        {/* Right annotation */}
        <motion.div
          className={styles.annotationRight}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
        >
          <p className={styles.annotationTitlePink}>Outer Space</p>
          <p className={styles.annotationBodyPink}>
            Navigate through tender meat, crisp salad, and golden fries all
            tucked into one perfect shawarma
          </p>
          <ArrowRight />
        </motion.div>
      </div>

      {/* Headline */}
      <motion.div
        className={styles.headline}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.55}
      >
        <span className={styles.headlineDark}>HUNGRY?</span>
        <span className={styles.headlinePink}>&nbsp;HUNNY!</span>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.72}
        className={styles.ctaWrap}
      >
        <Link to="/menu" className={styles.ctaBtn}>
          Get Hunny
        </Link>
      </motion.div>
    </section>
  );
}
