import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './DashboardPage.module.css';

const STATUS_META = {
  delivered:  { label: 'Delivered',  icon: CheckCircle,  cls: 'green'  },
  preparing:  { label: 'Preparing',  icon: Clock,        cls: 'orange' },
  confirmed:  { label: 'Confirmed',  icon: CheckCircle,  cls: 'blue'   },
  ready:      { label: 'Ready',      icon: CheckCircle,  cls: 'green'  },
  pending:    { label: 'Pending',    icon: AlertCircle,  cls: 'blue'   },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      cls: 'red'    },
};

function formatTime(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} min ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

export default function DashboardPage() {
  const [stats, setStats]         = useState({ revenue: 0, orders: 0, customers: 0, avg: 0 });
  const [recentOrders, setRecent] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ordersRes, customersRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total, created_at').gte('created_at', today.toISOString()),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('orders')
          .select('id, total, status, created_at, profiles(full_name)')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      const todayOrders = ordersRes.data || [];
      const totalRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0);
      const avgOrder = todayOrders.length ? totalRevenue / todayOrders.length : 0;

      setStats({
        revenue:   totalRevenue,
        orders:    todayOrders.length,
        customers: customersRes.count || 0,
        avg:       avgOrder,
      });
      setRecent(recentRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const STAT_CARDS = [
    { label: "Today's Revenue",  value: `GHC ${stats.revenue.toFixed(0)}`,  icon: DollarSign,  color: 'green'  },
    { label: 'Orders Today',     value: String(stats.orders),                icon: ShoppingBag, color: 'blue'   },
    { label: 'Total Customers',  value: String(stats.customers),             icon: Users,       color: 'pink'   },
    { label: 'Avg Order Value',  value: `GHC ${stats.avg.toFixed(0)}`,       icon: TrendingUp,  color: 'orange' },
  ];

  return (
    <div className={styles.page}>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={styles.statCard}>
              <div className={`${styles.iconBox} ${styles[s.color]}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className={styles.statLabel}>{s.label}</p>
                <p className={styles.statValue}>{loading ? '—' : s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Recent Orders</h2>
          <a href="/orders" className={styles.viewAll}>View all →</a>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign:'center', color:'#aaa', padding:'32px' }}>Loading…</td></tr>
            ) : recentOrders.map((o) => {
              const meta = STATUS_META[o.status] || STATUS_META.pending;
              const StatusIcon = meta.icon;
              return (
                <tr key={o.id}>
                  <td className={styles.orderId}>#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td>{o.profiles?.full_name || 'Unknown'}</td>
                  <td className={styles.total}>GHC {Number(o.total).toFixed(2)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[meta.cls]}`}>
                      <StatusIcon size={13} />
                      {meta.label}
                    </span>
                  </td>
                  <td className={styles.time}>{formatTime(o.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}


