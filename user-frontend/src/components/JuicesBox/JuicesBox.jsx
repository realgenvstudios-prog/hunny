import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './JuicesBox.module.css';

export default function JuicesBox() {
  const navigate = useNavigate();
  return (
    <section className={styles.section}>
      <div className={styles.grid}>

        {/* ── Left: 6-pack box image ── */}
        <motion.div
          className={styles.leftImg}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618768/azs1_bcljlh.png"
            alt="Juices 6-pack box"
            className={styles.boxImage}
            draggable={false}
          />
        </motion.div>

        {/* ── Center: Text ── */}
        <motion.div
          className={styles.center}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className={styles.heading}>JUICES<br />BY THE BOX</h2>
          <p className={styles.minimum}>Minimum 6 bottles</p>
          <p className={styles.description}>
            Pick your favorite flavors or let us curate a refreshing<br />
            assortment of cold-pressed, 100% natural fruit juices <br />
            packed fresh daily with no additives, no preservatives,<br />
            just pure fruit goodness in every sip.
          </p>
          <p className={styles.price}>GHC120 *</p>

          <div className={styles.ctaRow}>
            <button className={styles.cta} onClick={() => navigate('/juices-box')}>
              GET JUICES BOX <ArrowRight size={20} />
            </button>
            <p className={styles.ctaNote}>
              Please place your order at least 24 hours in advance,<br />
              so we can coordinate making it along with all of the food<br />
              we prepare fresh every day.
            </p>
          </div>

          <p className={styles.disclaimer}>*Pricing &amp; availability vary by location.</p>
        </motion.div>

        {/* ── Right: Two bottles ── */}
        <motion.div
          className={styles.rightImgs}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775622411/abzw1_hnf2nj.png"
            alt="Mango juice bottle"
            className={styles.bottle}
            draggable={false}
          />
          <img
            src="https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578508/abcda8_dieqzj.png"
            alt="Pineapple mint juice bottle"
            className={styles.bottle}
            draggable={false}
          />
        </motion.div>

      </div>
    </section>
  );
}
