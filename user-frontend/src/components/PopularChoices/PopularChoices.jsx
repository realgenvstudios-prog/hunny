import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import styles from './PopularChoices.module.css';

const products = [
  {
    id: 1,
    name: 'Ham Sandwich',
    description: 'Ham, Cheese, Cripsy bread',
    price: 'GHC120',
    rating: 5,
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578508/cb4_ixxrij.png',
  },
  {
    id: 2,
    name: 'Pineapple Mint Juice',
    description: 'Pineapple, Mint',
    price: 'GHC120',
    rating: 5,
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578508/abcda8_dieqzj.png',
  },
  {
    id: 3,
    name: 'Oreo Ice cream',
    description: 'Oreo, Vanilla',
    price: 'GHC120',
    rating: 5,
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775578518/abcda7-2_uuokil.png',
  },
  {
    id: 4,
    name: 'Steak Sandwich',
    description: 'Beef steak, Fresh veggies, Toasted bread',
    price: 'GHC150',
    rating: 5,
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775605542/bas1_jenwu1.png',
  },
  {
    id: 5,
    name: 'Fries & Chicken',
    description: 'Crispy fries, Fried chicken',
    price: 'GHC130',
    rating: 5,
    image: 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775605641/dbb2_y5bm0q.png',
  },
];

function Stars({ count }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={i < count ? styles.starFilled : styles.starEmpty}
          viewBox="0 0 20 20"
          width="18"
          height="18"
          fill="currentColor"
        >
          <path d="M10 1l2.39 4.84 5.34.78-3.86 3.76.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
        </svg>
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function PopularChoices() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* ── Header row ── */}
        <div className={styles.header}>
          <h2 className={styles.heading}>
            Popular Choices <span className={styles.emoji}>🔥</span>
          </h2>
          <Link to="/menu" className={styles.viewMenu}>
            View Menu <ChevronRight size={16} />
          </Link>
        </div>

        {/* ── Product grid ── */}
        <div className={styles.gridWrapper}>
        <div className={styles.grid}>
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            >
              <div className={styles.imageWrap}>
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className={styles.image}
                  draggable={false}
                  whileHover={{ scale: 1.08, y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                />
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{product.name}</h3>
                <p className={styles.description}>{product.description}</p>
                <Stars count={product.rating} />
                <p className={styles.price}>{product.price}</p>
                <button className={styles.btn}>Order Now</button>
              </div>
            </motion.div>
          ))}
        </div>
        </div>

      </div>
    </section>
  );
}
