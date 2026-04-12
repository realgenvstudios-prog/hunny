import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Star, ShoppingBag, Check } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../context/CartContext';
import styles from './CategoryPage.module.css';

const sidebarCategories = [
  { name: 'Shawarma', path: '/menu/shawarma' },
  { name: 'Sandwiches', path: '/menu/sandwiches' },
  { name: 'Salads', path: '/menu/salads' },
  { name: 'Pastries', path: '/menu/pastries' },
  { name: 'Chicken Wings', path: '/menu/chicken-wings' },
  { name: 'Ice Cream', path: '/menu/ice-creams' },
  { name: 'Waffles', path: '/menu/waffles' },
  { name: 'Rice Meals', path: '/menu/rice-meals' },
  { name: 'Fresh Juice', path: '/menu/fresh-juice' },
];

export default function CategoryPage({ title, categorySlug }) {
  const location = useLocation();
  const { products, loading, error } = useProducts(categorySlug);
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState({});

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.ingredients,
      price: product.rawPrice,
      image: product.image,
    });
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds((prev) => ({ ...prev, [product.id]: false })), 1500);
  };

  return (
    <section className={styles.page}>
      {/* ── Page heading ── */}
      <h1 className={styles.pageTitle}>HUNNY MENU</h1>

      <div className={styles.layout}>
        {/* ── Left sidebar ── */}
        <aside className={styles.sidebar}>
          <Link to="/menu" className={styles.back}>
            <ChevronLeft size={20} />
            BACK
          </Link>

          <nav className={styles.navScroll}>
            <div className={styles.nav}>
            {sidebarCategories.map((cat) => (
              <Link
                to={cat.path}
                key={cat.name}
                className={`${styles.navItem} ${location.pathname === cat.path ? styles.navActive : ''}`}
              >
                {cat.name}
              </Link>
            ))}
            </div>
          </nav>
        </aside>

        {/* ── Right content ── */}
        <div className={styles.content}>
          <h2 className={styles.contentTitle}>{title}</h2>

          {loading && (
            <div className={styles.loadingGrid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          )}

          {error && (
            <p className={styles.errorMsg}>Failed to load products. Please try again.</p>
          )}

          {!loading && !error && (
            <div className={styles.grid}>
              {products.map((product, i) => (
                <motion.div
                  key={product.id || product.name}
                  className={styles.card}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={styles.imageWrap}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.productImage}
                      draggable={false}
                    />
                  </div>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.ingredients}>{product.ingredients}</p>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={18} fill="#F5A623" stroke="#F5A623" />
                    ))}
                  </div>
                  <p className={styles.price}>{product.price}</p>
                  <button
                    className={`${styles.orderBtn} ${addedIds[product.id] ? styles.orderBtnAdded : ''}`}
                    onClick={() => handleAddToCart(product)}
                  >
                    {addedIds[product.id]
                      ? <><Check size={16} /> Added!</>
                      : <><ShoppingBag size={16} /> Add to Bag</>
                    }
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

