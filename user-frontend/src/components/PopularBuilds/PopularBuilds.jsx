import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './PopularBuilds.module.css';
import { supabase } from '../../lib/supabase';

export default function PopularBuilds() {
  const [builds, setBuilds] = useState([]);

  useEffect(() => {
    supabase
      .from('popular_builds')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .then(({ data }) => { if (data) setBuilds(data); });
  }, []);

  if (builds.length === 0) return null;

  return (
    <section className={styles.section}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        POPULAR BUILDS
      </motion.h2>
      <motion.p
        className={styles.subtitle}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        Plan a winning feast for your next get-together.
      </motion.p>
      <motion.p
        className={styles.notice}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        24 hours advance notice to order
      </motion.p>

      <div className={styles.grid}>
        {builds.map((build, i) => (
          <motion.div
            key={build.id}
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.imageWrap}>
              <img
                src={build.image_url}
                alt={build.title}
                className={styles.image}
                draggable={false}
              />
            </div>

            <h3 className={styles.cardTitle}>{build.title}</h3>
            <p className={styles.cardSubtitle}>{build.subtitle}</p>

            <p className={styles.ingredients}>{build.ingredients}</p>

            <div className={styles.priceRow}>
              <p className={styles.price}>
                <strong>GHC {build.price}</strong> <span>/Person *</span>
              </p>
              <div className={styles.peopleSelect}>
                {build.default_people} People ↕
              </div>
            </div>

            <button className={styles.addBtn}>ADD TO BAG</button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
