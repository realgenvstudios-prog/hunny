import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from './CartPage.module.css';

const DELIVERY_FEE = 20;
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const VERIFY_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`;

export default function CartPage() {
  const { items, loading, subtotal, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [checkingOut, setCheckingOut] = useState(false);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(null); // { code, type, value, amount }

  const discountAmount = promoDiscount?.amount ?? 0;
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0) - discountAmount;

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoDiscount(null);

    const { data } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .maybeSingle();

    if (!data) {
      setPromoError('Invalid or inactive promo code.');
      setPromoLoading(false);
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setPromoError('This promo code has expired.');
      setPromoLoading(false);
      return;
    }
    if (data.max_uses && data.uses >= data.max_uses) {
      setPromoError('This promo code has reached its limit.');
      setPromoLoading(false);
      return;
    }
    if (data.min_order && subtotal < Number(data.min_order)) {
      setPromoError(`Minimum order of GHC ${data.min_order} required for this code.`);
      setPromoLoading(false);
      return;
    }

    const amount = data.type === 'percent'
      ? subtotal * Number(data.value) / 100
      : Math.min(Number(data.value), subtotal);

    setPromoDiscount({ code: data.code, type: data.type, value: data.value, amount });
    setPromoInput('');
    setPromoLoading(false);
  }

  // Load Paystack inline script once
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  function handlePlaceOrder() {
    if (!address.trim()) { setOrderError('Please enter a delivery address.'); return; }
    setOrderError('');

    const reference = `HUNNY-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: Math.round(total * 100), // convert GHC to pesewas
      currency: 'GHS',
      ref: reference,
      callback: async (response) => {
        setOrderLoading(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch(VERIFY_FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              reference: response.reference,
              order: {
                user_id: user.id,
                subtotal,
                delivery_fee: DELIVERY_FEE,
                discount: discountAmount,
                total,
                delivery_address: address.trim(),
                notes: notes.trim() || null,
                promo_code: promoDiscount?.code || null,
              },
              items,
            }),
          });
          const result = await res.json();
          if (!res.ok || !result.success) {
            setOrderError(result.error || 'Payment verified but order failed. Contact support.');
            setOrderLoading(false);
            return;
          }
          await clearCart();
          navigate('/orders');
        } catch {
          setOrderError('Something went wrong. Contact support with reference: ' + response.reference);
          setOrderLoading(false);
        }
      },
      onClose: () => {
        setOrderError('Payment cancelled.');
      },
    });

    handler.openIframe();
  }

  return (
    <>
      <section className={styles.page}>
        <div className={styles.inner}>

          {/* Left: Items */}
          <div className={styles.left}>
            <div className={styles.headingRow}>
              <h1 className={styles.heading}>YOUR BAG</h1>
              {items.length > 0 && (
                <span className={styles.count}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {loading ? (
              <div className={styles.loadingWrap}>
                {[...Array(2)].map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : items.length === 0 ? (
              <motion.div className={styles.empty} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <ShoppingBag size={56} strokeWidth={1.2} className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>YOUR BAG IS EMPTY</p>
                <p className={styles.emptySub}>Looks like you haven't added anything yet.</p>
                <Link to="/menu" className={styles.browseBtn}>BROWSE MENU <ArrowRight size={18} /></Link>
              </motion.div>
            ) : (
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.product_id}
                    className={styles.item}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, padding: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    layout
                  >
                    <img src={item.image} alt={item.name} className={styles.itemImg} />
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemDesc}>{item.description}</p>
                      <div className={styles.itemBottom}>
                        <div className={styles.qtyControl}>
                          <button className={styles.qtyBtn} onClick={() => updateQty(item.product_id, -1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                          <span className={styles.qty}>{item.qty}</span>
                          <button className={styles.qtyBtn} onClick={() => updateQty(item.product_id, 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                        </div>
                        <p className={styles.itemPrice}>GHC {item.price * item.qty}</p>
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.product_id)} aria-label="Remove item"><Trash2 size={18} /></button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Right: Summary */}
          <div className={styles.right}>
            <div className={styles.summary}>
              <h2 className={styles.summaryHeading}>ORDER SUMMARY</h2>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}><span>Subtotal</span><span>GHC {subtotal.toFixed(2)}</span></div>
                <div className={styles.summaryRow}><span>Delivery</span><span>{items.length > 0 ? `GHC ${DELIVERY_FEE}` : '—'}</span></div>
                {promoDiscount && (
                  <div className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
                    <span>Promo ({promoDiscount.code})</span>
                    <span>−GHC {promoDiscount.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>Total</span><span>GHC {total.toFixed(2)}</span></div>
              </div>
              <button
                className={styles.checkoutBtn}
                disabled={items.length === 0}
                onClick={() => !user ? navigate('/signin') : setCheckingOut((v) => !v)}
              >
                {checkingOut ? 'CANCEL' : <>CHECKOUT <ArrowRight size={18} /></>}
              </button>

              <AnimatePresence initial={false}>
                {checkingOut && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className={styles.checkoutForm}>
                      {orderError && <p className={styles.orderError}>{orderError}</p>}
                      <div className={styles.checkoutField}>
                        <label className={styles.checkoutLabel}>Delivery Address *</label>
                        <input
                          type="text"
                          className={styles.checkoutInput}
                          placeholder="e.g. 14 Main St, Accra"
                          value={address}
                          onChange={(e) => { setAddress(e.target.value); setOrderError(''); }}
                        />
                      </div>
                      <div className={styles.checkoutField}>
                        <label className={styles.checkoutLabel}>Order Notes (optional)</label>
                        <input
                          type="text"
                          className={styles.checkoutInput}
                          placeholder="e.g. No onions, call on arrival"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                      <button
                        className={styles.placeOrderBtn}
                        onClick={handlePlaceOrder}
                        disabled={orderLoading}
                      >
                        {orderLoading ? 'SAVING ORDER…' : <><Check size={16} /> PAY WITH PAYSTACK</>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <Link to="/menu" className={styles.continueLink}>← Continue shopping</Link>
              {!promoDiscount ? (
                <div className={styles.promoWrap}>
                  <div className={styles.promo}>
                    <input
                      type="text"
                      className={styles.promoInput}
                      placeholder="Promo code"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                    />
                    <button className={styles.promoBtn} onClick={applyPromo} disabled={promoLoading || !promoInput.trim()}>
                      {promoLoading ? '…' : 'APPLY'}
                    </button>
                  </div>
                  {promoError && <p className={styles.promoError}>{promoError}</p>}
                </div>
              ) : (
                <div className={styles.promoApplied}>
                  <span className={styles.promoAppliedText}>
                    {promoDiscount.code} applied — {promoDiscount.type === 'percent' ? `${promoDiscount.value}% off` : `GHC ${promoDiscount.value} off`}
                  </span>
                  <button className={styles.promoRemove} onClick={() => setPromoDiscount(null)}>Remove</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
      <Footer />
    </>
  );
}
