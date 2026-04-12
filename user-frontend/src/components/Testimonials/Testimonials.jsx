import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    id: 1,
    quote: '"Once You Find Something You\'re Passionate About, You Will Enjoy It And It Will Come Easy To You".',
    name: 'Kwesi',
    avatar: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775607464/Ellipse_192_igxrir.png',
    rating: 5,
  },
  {
    id: 2,
    quote: '"The food here is absolutely incredible. Every bite feels like it was made with real love and care. I keep coming back every week!"',
    name: 'Ama',
    avatar: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775607962/aaapoo-2_t4oswm.png',
    rating: 5,
  },
  {
    id: 3,
    quote: '"Best fast food experience I\'ve ever had. Fresh ingredients, amazing flavors, and the service is always top notch. Highly recommend!"',
    name: 'Esi',
    avatar: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775607963/aaaqaq-2_ltmdtg.png',
    rating: 5,
  },
];

function Stars({ count }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={i < count ? styles.starFilled : styles.starEmpty}
          viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
          <path d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
        </svg>
      ))}
    </div>
  );
}

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 100 : -100 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -100 : 100 }),
};

export default function Testimonials() {
  const [[active, direction], setPage] = useState([0, 0]);

  const paginate = (dir) => {
    setPage([(active + dir + testimonials.length) % testimonials.length, dir]);
  };

  const prevIdx = (active - 1 + testimonials.length) % testimonials.length;
  const nextIdx = (active + 1) % testimonials.length;

  return (
    <section className={styles.section}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        Our Customers Are Saying
      </motion.h2>

      <div className={styles.carouselOuter}>
        <div className={styles.carousel}>

          {/* Left side card */}
          <div className={`${styles.card} ${styles.sideCard}`}>
            <div className={styles.quoteIcon}>
              <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
                <path d="M0 32V19.2C0 8.533 5.333 2.133 16 0l2.4 4C13.067 5.333 10.4 8.267 10.4 12.8H18V32H0ZM22 32V19.2C22 8.533 27.333 2.133 38 0l2.4 4C35.067 5.333 32.4 8.267 32.4 12.8H40V32H22Z" fill="rgba(0,0,0,0.15)"/>
              </svg>
            </div>
            <Stars count={testimonials[prevIdx].rating} />
            <p className={styles.ghostQuote}>{testimonials[prevIdx].quote}</p>
            <div className={styles.sideAuthor}>
              <img src={testimonials[prevIdx].avatar} alt={testimonials[prevIdx].name} className={styles.sideAvatar} />
              <span className={styles.sideName}>{testimonials[prevIdx].name}</span>
            </div>
          </div>

          {/* Active center card */}
          <div className={styles.activeWrap}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active}
                className={`${styles.card} ${styles.activeCard}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.quoteIcon}>
                  <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
                    <path d="M0 32V19.2C0 8.533 5.333 2.133 16 0l2.4 4C13.067 5.333 10.4 8.267 10.4 12.8H18V32H0ZM22 32V19.2C22 8.533 27.333 2.133 38 0l2.4 4C35.067 5.333 32.4 8.267 32.4 12.8H40V32H22Z" fill="white" fillOpacity="0.7"/>
                  </svg>
                </div>
                <Stars count={testimonials[active].rating} />
                <p className={styles.activeQuote}>{testimonials[active].quote}</p>
                <div className={styles.author}>
                  <img src={testimonials[active].avatar} alt={testimonials[active].name} className={styles.avatar} />
                  <span className={styles.name}>{testimonials[active].name}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right side card */}
          <div className={`${styles.card} ${styles.sideCard}`}>
            <div className={styles.quoteIcon}>
              <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
                <path d="M0 32V19.2C0 8.533 5.333 2.133 16 0l2.4 4C13.067 5.333 10.4 8.267 10.4 12.8H18V32H0ZM22 32V19.2C22 8.533 27.333 2.133 38 0l2.4 4C35.067 5.333 32.4 8.267 32.4 12.8H40V32H22Z" fill="rgba(0,0,0,0.15)"/>
              </svg>
            </div>
            <Stars count={testimonials[nextIdx].rating} />
            <p className={styles.ghostQuote}>{testimonials[nextIdx].quote}</p>
            <div className={styles.sideAuthor}>
              <img src={testimonials[nextIdx].avatar} alt={testimonials[nextIdx].name} className={styles.sideAvatar} />
              <span className={styles.sideName}>{testimonials[nextIdx].name}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Dots — always rendered as [prev, active, next] so green is always center */}
      <div className={styles.dots}>
        {[prevIdx, active, nextIdx].map((idx, pos) => (
          <button
            key={pos}
            className={`${styles.dot} ${pos === 1 ? styles.dotActive : ''}`}
            onClick={() => setPage([idx, idx > active ? 1 : -1])}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
