import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer/Footer';
import styles from './ChipsDipsPage.module.css';

const FALLBACK_IMAGE = 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775622412/dbb5_xgkexg.png';
const FALLBACK_PRICE = 120;
const FALLBACK_DIPS  = ['Guacamole', 'Queso Blanco'];

export default function ChipsDipsPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product,    setProduct]    = useState(null);
  const [dipOptions, setDipOptions] = useState(FALLBACK_DIPS);
  const [addOns,     setAddOns]     = useState([]); // { ...item, qty: 0 }
  const [loading,    setLoading]    = useState(true);
  const [selectedDip, setSelectedDip] = useState('');
  const [qty,  setQty]  = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('id, name, price, image_url')
        .ilike('name', '%chips%').eq('available', true).limit(1).maybeSingle(),
      supabase.from('chips_dips_options').select('name').eq('active', true).order('sort_order'),
      supabase.from('catering_items').select('id, name, price, image_url')
        .eq('show_on_chips_dips', true).eq('active', true).order('sort_order'),
    ]).then(([prodRes, dipsRes, addOnsRes]) => {
      if (prodRes.data) setProduct(prodRes.data);
      const dips = dipsRes.data?.map(d => d.name) || [];
      if (dips.length > 0) {
        setDipOptions(dips);
        setSelectedDip(dips[0]);
      } else {
        setSelectedDip(FALLBACK_DIPS[0]);
      }
      setAddOns((addOnsRes.data || []).map(it => ({ ...it, qty: 0 })));
    }).finally(() => setLoading(false));
  }, []);

  const price = product ? Number(product.price) : FALLBACK_PRICE;
  const image = product?.image_url || FALLBACK_IMAGE;
  const addOnsTotal = addOns.reduce((sum, a) => sum + (Number(a.price) || 0) * a.qty, 0);
  const grandTotal  = price * qty + addOnsTotal;

  function adjustAddOn(id, delta) {
    setAddOns(prev => prev.map(a => a.id === id ? { ...a, qty: Math.max(0, a.qty + delta) } : a));
  }

  function handleAdd() {
    // Main chips & dips item
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product?.id || 'chips-dips',
        name: `Chips & Dips — ${selectedDip}`,
        description: `All 4 salsas + ${selectedDip}. Serves 10–15.`,
        price,
        image,
      });
    }
    // Each selected add-on
    addOns.filter(a => a.qty > 0).forEach(a => {
      addToCart({
        id: a.id,
        name: a.name,
        description: 'Add-on for Chips & Dips',
        price: Number(a.price) || 0,
        image: a.image_url || image,
        qty: a.qty,
      });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.inner}>
          {/* Back */}
          <button className={styles.back} onClick={() => navigate(-1)}>
            <ChevronLeft size={18} /> BACK
          </button>

          <div className={styles.layout}>
            {/* ── Image ── */}
            <motion.div
              className={styles.imgWrap}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={image} alt="Chips and Dips" className={styles.img} draggable={false} />
            </motion.div>

            {/* ── Details ── */}
            <motion.div
              className={styles.details}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className={styles.serves}>Serves 10–15</p>
              <h1 className={styles.title}>CHIPS &amp; DIPS</h1>
              <p className={styles.desc}>
                A spread of house-made chips, all 4 salsas, and your choice of dip.
                Perfect for sharing at any gathering.
              </p>

              <p className={styles.price}>GHC {price} <span>per order</span></p>

              {/* Dip chooser */}
              <div className={styles.section}>
                <p className={styles.label}>CHOOSE YOUR DIP</p>
                <div className={styles.dipRow}>
                  {dipOptions.map(dip => (
                    <button
                      key={dip}
                      className={`${styles.dipBtn} ${selectedDip === dip ? styles.dipActive : ''}`}
                      onClick={() => setSelectedDip(dip)}
                    >
                      {selectedDip === dip && <Check size={14} />}
                      {dip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              {addOns.length > 0 && (
                <div className={styles.section}>
                  <p className={styles.label}>ADD-ONS</p>
                  <div className={styles.addOnList}>
                    {addOns.map(a => (
                      <div key={a.id} className={`${styles.addOnCard} ${a.qty > 0 ? styles.addOnSelected : ''}`}>
                        {a.image_url
                          ? <img src={a.image_url} alt={a.name} className={styles.addOnImg} />
                          : <div className={styles.addOnImgPlaceholder}>{a.name[0]}</div>
                        }
                        <div className={styles.addOnInfo}>
                          <p className={styles.addOnName}>{a.name}</p>
                          {a.price != null && <p className={styles.addOnPrice}>+ GHC {Number(a.price).toFixed(2)}</p>}
                        </div>
                        <div className={styles.addOnQty}>
                          <button className={styles.qtyBtn} onClick={() => adjustAddOn(a.id, -1)} disabled={a.qty === 0}>
                            <Minus size={14} />
                          </button>
                          <span className={styles.addOnQtyNum}>{a.qty}</span>
                          <button className={styles.qtyBtn} onClick={() => adjustAddOn(a.id, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className={styles.section}>
                <p className={styles.label}>QUANTITY</p>
                <div className={styles.qtyRow}>
                  <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>
                    <Minus size={16} />
                  </button>
                  <span className={styles.qtyNum}>{qty}</span>
                  <button className={styles.qtyBtn} onClick={() => setQty(q => q + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <p className={styles.subTotal}>Total: GHC {grandTotal.toFixed(2)}</p>
              </div>

              {/* Add to cart */}
              <button
                className={`${styles.addBtn} ${added ? styles.addedBtn : ''}`}
                onClick={handleAdd}
                disabled={added || loading}
              >
                {loading
                  ? 'Loading…'
                  : added
                  ? <><Check size={18} /> ADDED TO BAG!</>
                  : <><ShoppingBag size={18} /> ADD TO BAG</>}
              </button>

              <p className={styles.disclaimer}>*Pricing &amp; availability may vary by location.</p>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
