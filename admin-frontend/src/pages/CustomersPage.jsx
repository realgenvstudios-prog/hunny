import { useState, useEffect } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './CustomersPage.module.css';

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    async function load() {
      // Get profiles + aggregate order data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email, created_at')
        .order('created_at', { ascending: false });

      if (!profiles) { setLoading(false); return; }

      // Get order totals per user
      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, total, created_at')
        .in('user_id', profiles.map(p => p.id));

      // Get emails from auth — we can get this from the user's profile email via orders join
      // Aggregate per user
      const orderMap = {};
      for (const o of (orders || [])) {
        if (!orderMap[o.user_id]) orderMap[o.user_id] = { count: 0, total: 0, lastOrder: null };
        orderMap[o.user_id].count++;
        orderMap[o.user_id].total += Number(o.total);
        if (!orderMap[o.user_id].lastOrder || new Date(o.created_at) > new Date(orderMap[o.user_id].lastOrder)) {
          orderMap[o.user_id].lastOrder = o.created_at;
        }
      }

      setCustomers(profiles.map(p => ({
        ...p,
        orders:    orderMap[p.id]?.count || 0,
        total:     orderMap[p.id]?.total || 0,
        lastOrder: orderMap[p.id]?.lastOrder || null,
      })));
      setLoading(false);
    }
    load();
  }, []);

  const visible = customers.filter(c =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const topSpenders = [...customers].sort((a, b) => b.total - a.total).slice(0, 3);

  return (
    <div className={styles.page}>

      {/* Top spenders */}
      {!loading && topSpenders.length > 0 && (
        <div className={styles.topRow}>
          {topSpenders.map((c, i) => (
            <div key={c.id} className={styles.topCard}>
              <div className={styles.topRank}>#{i + 1}</div>
              <div className={styles.topInfo}>
                <p className={styles.topName}>{c.full_name || 'User'}</p>
                <p className={styles.topMeta}>{c.orders} orders</p>
              </div>
              <p className={styles.topTotal}>GHC {c.total.toFixed(0)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + table */}
      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input className={styles.searchInput} placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Customer</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Last Order</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign:'center', color:'#aaa', padding:'32px' }}>Loading…</td></tr>
            ) : visible.map(c => (
              <tr key={c.id}>
                <td>
                  <p className={styles.name}>{c.full_name || 'Unknown'}</p>
                </td>
                <td className={styles.sub}>{c.email || '—'}</td>
                <td className={styles.sub}>{c.phone || '—'}</td>
                <td><span className={styles.orderCount}><ShoppingBag size={13}/>{c.orders}</span></td>
                <td className={styles.total}>GHC {c.total.toFixed(0)}</td>
                <td className={styles.sub}>{formatDate(c.created_at)}</td>
                <td className={styles.sub}>{formatDate(c.lastOrder)}</td>
                <td><button className={styles.viewBtn} onClick={() => setSelected(c)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && visible.length === 0 && <p className={styles.empty}>No customers found.</p>}
      </div>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{selected.full_name || 'User'}</h3>
            <div className={styles.modalGrid}>
              <div><p className={styles.mLabel}>Email</p><p>{selected.email || '—'}</p></div>
              <div><p className={styles.mLabel}>Phone</p><p>{selected.phone || '—'}</p></div>
              <div><p className={styles.mLabel}>Total Orders</p><p className={styles.bigStat}>{selected.orders}</p></div>
              <div><p className={styles.mLabel}>Total Spent</p><p className={styles.bigStat}>GHC {selected.total.toFixed(0)}</p></div>
              <div><p className={styles.mLabel}>Avg Order Value</p><p>GHC {selected.orders ? Math.round(selected.total / selected.orders) : 0}</p></div>
              <div><p className={styles.mLabel}>Member Since</p><p>{formatDate(selected.created_at)}</p></div>
              <div><p className={styles.mLabel}>Last Order</p><p>{formatDate(selected.lastOrder)}</p></div>
            </div>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


