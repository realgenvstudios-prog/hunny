import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer/Footer';
import styles from './JuicesBoxPage.module.css';

const BOX_IMAGE = 'https://res.cloudinary.com/dp3nduhuz/image/upload/v1775618768/azs1_bcljlh.png';
const FALLBACK_SETTINGS = { price_per_box: 120, min_bottles: 6 };

export default function JuicesBoxPage() {
  const navigate  = useNavigate();
  const { addToCart } = useCart();

  const [flavors,  setFlavors]  = useState([]);
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [loading,  setLoading]  = useState(true);
  const [added,    setAdded]    = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('juice_flavors').select('*').eq('active', true).order('sort_order'),
      supabase.from('juice_box_settings').select('*').eq('id', 1).single(),
    ]).then(([flavorsRes, settingsRes]) => {
      setFlavors((flavorsRes.data || []).map(f => ({ ...f, qty: 0 })));
      if (settingsRes.data) setSettings(settingsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const { price_per_box, min_bottles } = settings;
  const totalBottles = flavors.reduce((sum, f) => sum + f.qty, 0);
  // Boxes are always full — total must be an exact multiple of min_bottles
  const remainder    = totalBottles % min_bottles;
  const shortfall    = remainder === 0 ? 0 : min_bottles - remainder;
  const boxCount     = totalBottles > 0 ? Math.floor(totalBottles / min_bottles) : 1;
  const totalPrice   = totalBottles > 0 && remainder === 0 ? boxCount * price_per_box : price_per_box;
  const canAdd       = totalBottles > 0 && remainder === 0;

  function adjustFlavor(id, delta) {
    setFlavors(prev => prev.map(f => f.id === id ? { ...f, qty: Math.max(0, f.qty + delta) } : f));
  }

  function handleAdd() {
    const selected   = flavors.filter(f => f.qty > 0);
    const flavorList = selected.map(f => `${f.name} ×${f.qty}`).join(', ');
    addToCart({
      id:          'juices-box',
      name:        `Juices Box — ${flavorList}`,
      description: `${totalBottles} bottles: ${flavorList}`,
      price:       totalPrice,
      image:       BOX_IMAGE,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.inner}>
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
              <img src={BOX_IMAGE} alt="Juices 6-pack box" className={styles.img} draggable={false} />
            </motion.div>

            {/* ── Details ── */}
            <motion.div
              className={styles.details}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className={styles.serves}>Minimum {min_bottles} bottles per box</p>
              <h1 className={styles.title}>JUICES<br />BY THE BOX</h1>
              <p className={styles.desc}>
                Pick your favourite flavors or mix and match. Cold-pressed,
                100% natural fruit juices packed fresh daily — no additives,
                no preservatives, just pure fruit goodness.
              </p>
              <p className={styles.price}>GHC {price_per_box} <span>per {min_bottles}-bottle box</span></p>

              {/* Flavor picker */}
              <div className={styles.section}>
                <p className={styles.label}>CHOOSE YOUR FLAVORS</p>
                {loading ? (
                  <p style={{ color:'#aaa', fontSize:'0.85rem' }}>Loading flavors…</p>
                ) : (
                  <div className={styles.flavorGrid}>
                    {flavors.map(f => (
                      <div key={f.id} className={`${styles.flavorCard} ${f.qty > 0 ? styles.flavorSelected : ''}`}>
                        {f.image_url
                          ? <img src={f.image_url} alt={f.name} className={styles.flavorImg} />
                          : <div className={styles.flavorImgPlaceholder}>{f.name[0]}</div>
                        }
                        <p className={styles.flavorName}>{f.name}</p>
                        <div className={styles.flavorQty}>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => adjustFlavor(f.id, -1)}
                            disabled={f.qty === 0}
                          >
                            <Minus size={13} />
                          </button>
                          <span className={styles.qtyNum}>{f.qty}</span>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => adjustFlavor(f.id, 1)}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span>Bottles selected</span>
                  <strong>
                    {totalBottles}
                    {remainder > 0 && <span className={styles.partialNote}> ({shortfall} more to fill box)</span>}
                  </strong>
                </div>
                {remainder === 0 && totalBottles > 0 && (
                  <div className={styles.summaryRow}>
                    <span>Boxes ({min_bottles} bottles each)</span>
                    <strong>{boxCount}</strong>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <strong>GHC {totalPrice.toFixed(2)}</strong>
                </div>
                {shortfall > 0 && (
                  <p className={styles.shortfall}>
                    Add {shortfall} more bottle{shortfall > 1 ? 's' : ''} to complete this box
                    — boxes come in multiples of {min_bottles}
                  </p>
                )}
              </div>

              {/* Add to cart */}
              <button
                className={`${styles.addBtn} ${added ? styles.addedBtn : ''} ${!canAdd ? styles.addBtnDisabled : ''}`}
                onClick={handleAdd}
                disabled={added || loading || !canAdd}
              >
                {loading
                  ? 'Loading…'
                  : added
                  ? <><Check size={18} /> ADDED TO BAG!</>
                  : <><ShoppingBag size={18} /> ADD TO BAG</>
                }
              </button>

              <p className={styles.disclaimer}>
                *Please order at least 24 hours in advance. Pricing &amp; availability may vary.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
