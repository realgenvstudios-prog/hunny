import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

import styles from './SettingsPage.module.css';

const DEFAULTS = {
  store_name: 'Hunny Fast Food',
  email: 'hello@hunny.com',
  phone: '+233 24 000 0000',
  address: '14 Cantonments Rd, Accra, Ghana',
  currency: 'GHC',
  delivery_fee: '20',
  min_order: '50',
  open_time: '08:00',
  close_time: '22:00',
  delivery_zones: ['Accra Central', 'Cantonments', 'East Legon', 'Osu', 'Airport'],
};

export default function SettingsPage() {
  const [store, setStore]     = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [newZone, setNewZone] = useState('');

  const set = (k, v) => setStore(p => ({ ...p, [k]: v }));

  useEffect(() => {
    async function load() {
      const settingsRes = await supabase.from('store_settings').select('*').eq('id', 1).single();
      if (settingsRes.data) {
        const data = settingsRes.data;
        setStore({
          store_name:     data.store_name,
          email:          data.email,
          phone:          data.phone,
          address:        data.address,
          currency:       data.currency,
          delivery_fee:   String(data.delivery_fee),
          min_order:      String(data.min_order),
          open_time:      data.open_time?.slice(0,5) || '08:00',
          close_time:     data.close_time?.slice(0,5) || '22:00',
          delivery_zones: data.delivery_zones || [],
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    await supabase.from('store_settings').upsert({
      id:             1,
      store_name:     store.store_name,
      email:          store.email,
      phone:          store.phone,
      address:        store.address,
      currency:       store.currency,
      delivery_fee:   Number(store.delivery_fee),
      min_order:      Number(store.min_order),
      open_time:      store.open_time,
      close_time:     store.close_time,
      delivery_zones: store.delivery_zones,
      updated_at:     new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const addZone = () => {
    if (newZone.trim()) { set('delivery_zones', [...store.delivery_zones, newZone.trim()]); setNewZone(''); }
  };

  if (loading) return <p style={{ color:'#aaa', padding:'32px 0' }}>Loading…</p>;

  return (
    <div className={styles.page}>

      {/* Store Info */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Store Information</h2>
        <div className={styles.grid2}>
          {[['store_name','Store Name'],['email','Email'],['phone','Phone'],['address','Address'],['currency','Currency']].map(([k,label]) => (
            <div key={k} className={styles.field}>
              <label className={styles.label}>{label}</label>
              <input className={styles.input} value={store[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      {/* Order Settings */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Order Settings</h2>
        <div className={styles.grid3}>
          <div className={styles.field}>
            <label className={styles.label}>Delivery Fee (GHC)</label>
            <input className={styles.input} type="number" value={store.delivery_fee} onChange={e => set('delivery_fee', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Minimum Order (GHC)</label>
            <input className={styles.input} type="number" value={store.min_order} onChange={e => set('min_order', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Opening Time</label>
            <input className={styles.input} type="time" value={store.open_time} onChange={e => set('open_time', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Closing Time</label>
            <input className={styles.input} type="time" value={store.close_time} onChange={e => set('close_time', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Delivery Zones */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Delivery Zones</h2>
        <div className={styles.zones}>
          {store.delivery_zones.map((z, i) => (
            <div key={i} className={styles.zone}>
              <span>{z}</span>
              <button className={styles.removeZone} onClick={() => set('delivery_zones', store.delivery_zones.filter((_,idx) => idx !== i))}>×</button>
            </div>
          ))}
          <div className={styles.addZone}>
            <input className={styles.input} placeholder="Add zone…" value={newZone} onChange={e => setNewZone(e.target.value)} onKeyDown={e => e.key === 'Enter' && addZone()} />
            <button className={styles.addZoneBtn} onClick={addZone}>Add</button>
          </div>
        </div>
      </div>

      <button className={styles.saveBtn} onClick={save} disabled={saving}>
        {saving ? 'SAVING…' : saved ? '✓ SAVED' : 'SAVE CHANGES'}
      </button>
    </div>
  );
}

