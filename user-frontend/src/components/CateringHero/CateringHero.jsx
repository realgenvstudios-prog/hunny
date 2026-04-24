import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './CateringHero.module.css';
import { supabase } from '../../lib/supabase';

export default function CateringHero() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('catering_packages')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setTiers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className={styles.hero}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonTitle} style={{ width: '60%' }} />
          <div className={styles.skeletonTitle} style={{ width: '40%' }} />
        </div>
      </section>
    );
  }

  if (tiers.length === 0) {
    return null;
  }

  const active = tiers[activeIdx];

  return (
    <section className={styles.hero}>
      <div className={styles.grid}>
        {/* ── Left: Big heading ── */}
        <motion.div
          className={styles.left}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className={styles.heading}>
            BUILD<br />YOUR<br />OWN
          </h1>
          <p className={styles.minimum}>Minimum 10 people</p>
        </motion.div>

        {/* ── Middle: Pricing tiers ── */}
        <motion.div
          className={styles.middle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {tiers.map((tier, i) => (
            <div
              key={tier.id}
              className={`${styles.tier} ${i === activeIdx ? styles.tierActive : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <h3 className={styles.tierName}>
                {tier.name}
              </h3>
              <span className={styles.badge} style={{ backgroundColor: '#D4920A' }}>
                {tier.badge}
              </span>
              <p className={styles.tierPrice}>
                <strong>GHC {tier.price}</strong> /Person *
              </p>
            </div>
          ))}
          <p className={styles.note}>*Pricing &amp; availability<br />vary by location.</p>
        </motion.div>

        {/* ── Right: Image + CTA (changes with selected tier) ── */}
        <div className={styles.right}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={styles.rightInner}
            >
              <img
                src={active.image_url || 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618758/BYOC-crop_iuz0ju.png'}
                alt="Catering trays"
                className={styles.image}
                draggable={false}
              />
              <p className={styles.description}>
                {active.description}
              </p>
              <button
                className={styles.cta}
                onClick={() => navigate(`/catering/build?pkg=${encodeURIComponent(active.name)}&price=${encodeURIComponent(active.price)}`)}
              >
                {active.cta} <ArrowRight size={20} />
              </button>
              <p className={styles.disclaimer}>
                Please place your order at least 24 hours in advance, so we can coordinate making it along with all of the food we prepare fresh every day.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
