import { useState, useEffect } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './OrdersPage.module.css';

const STATUSES = ['all','pending','confirmed','preparing','ready','delivered','cancelled'];

const STATUS_COLOR = {
  delivered: 'green', preparing: 'orange', pending: 'blue',
  confirmed: 'blue', ready: 'green', cancelled: 'red',
};

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

export default function OrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('*, profiles(full_name, phone), order_items(name, quantity, price)')
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id, status) {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  }

  const visible = orders.filter(o =>
    (filter === 'all' || o.status === filter) &&
    (
      (o.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={styles.page}>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search order ID or customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <Filter size={15} />
          {STATUSES.map(s => (
            <button
              key={s}
              className={`${styles.filterBtn} ${filter === s ? styles.filterActive : ''}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th><th>Customer</th><th>Items</th>
              <th>Total</th><th>Status</th><th>Date</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign:'center', color:'#aaa', padding:'32px' }}>Loading…</td></tr>
            ) : visible.map(o => {
              const itemSummary = o.order_items?.map(i => `${i.name} × ${i.quantity}`).join(', ') || '—';
              return (
                <tr key={o.id}>
                  <td className={styles.orderId}>#{o.id.slice(0,8).toUpperCase()}</td>
                  <td>
                    <p className={styles.name}>{o.profiles?.full_name || 'Unknown'}</p>
                    <p className={styles.sub}>{o.profiles?.phone || ''}</p>
                  </td>
                  <td className={styles.items}>{itemSummary}</td>
                  <td className={styles.total}>GHC {Number(o.total).toFixed(2)}</td>
                  <td>
                    <select
                      className={`${styles.statusSelect} ${styles[STATUS_COLOR[o.status]]}`}
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                    >
                      {STATUSES.filter(s => s !== 'all').map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className={styles.sub}>{formatDate(o.created_at)}<br />{formatTime(o.created_at)}</td>
                  <td>
                    <button className={styles.viewBtn} onClick={() => setSelected(o)}>
                      <Eye size={15} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && visible.length === 0 && <p className={styles.empty}>No orders found.</p>}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>#{selected.id.slice(0,8).toUpperCase()}</h3>
            <div className={styles.modalGrid}>
              <div><p className={styles.modalLabel}>Customer</p><p>{selected.profiles?.full_name || 'Unknown'}</p></div>
              <div><p className={styles.modalLabel}>Phone</p><p>{selected.profiles?.phone || '—'}</p></div>
              <div><p className={styles.modalLabel}>Items</p><p>{selected.order_items?.map(i => `${i.name} × ${i.quantity}`).join(', ')}</p></div>
              <div><p className={styles.modalLabel}>Total</p><p className={styles.total}>GHC {Number(selected.total).toFixed(2)}</p></div>
              <div>
                <p className={styles.modalLabel}>Status</p>
                <select
                  className={`${styles.statusSelect} ${styles[STATUS_COLOR[selected.status]]}`}
                  value={selected.status}
                  onChange={e => updateStatus(selected.id, e.target.value)}
                >
                  {STATUSES.filter(s => s !== 'all').map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div><p className={styles.modalLabel}>Date</p><p>{formatDate(selected.created_at)} — {formatTime(selected.created_at)}</p></div>
              {selected.delivery_address && (
                <div><p className={styles.modalLabel}>Delivery Address</p><p>{selected.delivery_address}</p></div>
              )}
              {selected.notes && (
                <div><p className={styles.modalLabel}>Notes</p><p>{selected.notes}</p></div>
              )}
            </div>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


