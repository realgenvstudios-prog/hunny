import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './MenuGrid.module.css';

const categories = [
  {
    name: 'Our Deals',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618758/BYOC-crop_iuz0ju.png',
    link: '/',
    italic: true,
  },
  {
    name: 'SHAWARMA',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618758/burrito_b2udhd.png',
    link: '/menu/shawarma',
    orderNow: true,
  },
  {
    name: 'WAFFLES',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618760/ggs_d88rss.png',
    link: '/menu/waffles',
  },
  {
    name: 'PASTRIES',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618896/order-2_vig5xh.png',
    link: '/menu/pastries',
  },
  {
    name: 'RICE MEALS',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618768/abcda9_km6nq9.png',
    link: '/menu/rice-meals',
  },
  {
    name: 'SALADS',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618990/order_ck7iyr.png',
    link: '/menu/salads',
  },
  {
    name: 'FRESH JUICE',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578508/abcda8_dieqzj.png',
    link: '/menu/fresh-juice',
  },
  {
    name: 'ICE CREAMS',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578518/abcda7-2_uuokil.png',
    link: '/menu/ice-creams',
  },
  {
    name: 'CHICKEN WINGS',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618764/ABVFR_zqrl7g.png',
    link: '/menu/chicken-wings',
  },
  {
    name: 'FRIES',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618761/fdss_v8hfqt.png',
    link: '/menu/fries',
  },
  {
    name: 'PANCAKES',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618760/ggs_d88rss.png',
    link: '/menu/pancakes',
  },
  {
    name: 'SANDWICHES',
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618763/gggse_xhslsn.png',
    link: '/menu/sandwiches',
  },
];

export default function MenuGrid() {
  return (
    <section id="menu-section" className={styles.section}>
      {/* Heading */}
      <div className={styles.headingWrap}>
        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          OUR MENU
        </motion.h2>
        <div className={styles.headingLine} />
      </div>

      {/* Category grid */}
      <div className={styles.grid}>
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={cat.link} className={styles.cardLink}>
              <div className={styles.imageWrap}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  className={styles.image}
                  draggable={false}
                />
              </div>
              <h3 className={`${styles.name} ${cat.italic ? styles.nameItalic : ''}`}>
                {cat.name}
              </h3>
              <span className={styles.orderNow}>ORDER NOW →</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
