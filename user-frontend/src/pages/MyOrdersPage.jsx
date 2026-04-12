import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ShoppingBag, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer/Footer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from './MyOrdersPage.module.css';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#f97316',
  ready: '#10b981',
  delivered: '#4a463d',
  cancelled: '#ef4444',
};

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(data || []);
      setLoading(false);
    }

    fetchOrders();
  }, [user]);

  function toggleExpand(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (authLoading) return null;

  if (!user) {
    return (
      <>
        <section className={styles.page}>
          <div className={styles.signInPrompt}>
            <Package size={56} strokeWidth={1.2} className={styles.promptIcon} />
            <p className={styles.promptTitle}>SIGN IN TO VIEW YOUR ORDERS</p>
            <p className={styles.promptSub}>Track your deliveries and see your full order history.</p>
            <Link to="/signin" className={styles.promptBtn}>SIGN IN <ArrowRight size={18} /></Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className={styles.page}>
        <div className={styles.inner}>

          <div className={styles.headerRow}>
            <h1 className={styles.heading}>MY ORDERS</h1>
            {!loading && orders.length > 0 && (
              <span className={styles.count}>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {loading ? (
            <div className={styles.skeletons}>
              {[...Array(2)].map((_, i) => <div key={i} className={styles.skeleton} />)}
            </div>

          ) : orders.length === 0 ? (
            <motion.div className={styles.empty} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <ShoppingBag size={56} strokeWidth={1.2} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>NO ORDERS YET</p>
              <p className={styles.emptySub}>You haven't placed any orders yet.</p>
              <Link to="/menu" className={styles.browseBtn}>BROWSE MENU <ArrowRight size={18} /></Link>
            </motion.div>

          ) : (
            <div className={styles.list}>
              {orders.map((order, i) => {
                const stepIndex = STATUS_STEPS.indexOf(order.status);
                const isCancelled = order.status === 'cancelled';
                const isExpanded = expanded[order.id];

                return (
                  <motion.div
                    key={order.id}
                    className={styles.card}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Top row */}
                    <div className={styles.cardTop}>
                      <div>
                        <p className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className={styles.orderDate}>{formatDate(order.created_at)}</p>
                      </div>
                      <div className={styles.cardTopRight}>
                        <span
                          className={styles.statusBadge}
                          style={{
                            backgroundColor: STATUS_COLORS[order.status] + '20',
                            color: STATUS_COLORS[order.status],
                          }}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                        <p className={styles.orderTotal}>GHC {Number(order.total).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Progress tracker */}
                    {!isCancelled && (
                      <div className={styles.progress}>
                        {STATUS_STEPS.map((step, si) => (
                          <div key={step} className={styles.progressStep}>
                            <div className={styles.progressDotRow}>
                              {si > 0 && (
                                <div className={`${styles.progressLine} ${si <= stepIndex ? styles.progressLineFilled : ''}`} />
                              )}
                              <div className={`${styles.progressDot} ${si <= stepIndex ? styles.progressDotFilled : ''}`} />
                              {si < STATUS_STEPS.length - 1 && (
                                <div className={`${styles.progressLine} ${si < stepIndex ? styles.progressLineFilled : ''}`} />
                              )}
                            </div>
                            <p className={`${styles.progressLabel} ${si <= stepIndex ? styles.progressLabelActive : ''}`}>
                              {STATUS_LABELS[step]}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Items accordion trigger */}
                    <button className={styles.toggleBtn} onClick={() => toggleExpand(order.id)}>
                      <span>{order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}</span>
                      <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} />
                      </motion.span>
                    </button>

                    {/* Items list */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="items"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className={styles.itemsList}>
                            {order.order_items?.map((item) => (
                              <div key={item.id} className={styles.orderItem}>
                                {item.image_url && (
                                  <img src={item.image_url} alt={item.name} className={styles.orderItemImg} />
                                )}
                                <div className={styles.orderItemInfo}>
                                  <p className={styles.orderItemName}>{item.name}</p>
                                  <p className={styles.orderItemQty}>x{item.quantity}</p>
                                </div>
                                <p className={styles.orderItemPrice}>
                                  GHC {(Number(item.price) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                            <div className={styles.itemsFooter}>
                              {order.delivery_address && (
                                <p className={styles.deliveryAddr}>📍 {order.delivery_address}</p>
                              )}
                              <div className={styles.itemsFooterRow}>
                                <span>Delivery</span>
                                <span>GHC {Number(order.delivery_fee).toFixed(2)}</span>
                              </div>
                              <div className={`${styles.itemsFooterRow} ${styles.itemsFooterTotal}`}>
                                <span>Total</span>
                                <span>GHC {Number(order.total).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </section>
      <Footer />
    </>
  );
}
