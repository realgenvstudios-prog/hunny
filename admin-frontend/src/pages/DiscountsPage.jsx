import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './DiscountsPage.module.css';

const blank = { code:'', type:'percent', value:'', minOrder:'', maxUses:'', expires:'' };

export default function DiscountsPage() {
  const [codes, setCodes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState(blank);
  const [copied, setCopied]   = useState(null);
  const [saving, setSaving]   = useState(false);

  async function load() {
    const { data } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    setCodes(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  async function add() {
    if (!form.code) return;
    setSaving(true);
    await supabase.from('discount_codes').insert({
      code:       form.code.toUpperCase().trim(),
      type:       form.type,
      value:      Number(form.value),
      min_order:  Number(form.minOrder) || 0,
      max_uses:   Number(form.maxUses) || 100,
      expires_at: form.expires || null,
      active:     true,
    });
    setForm(blank);
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function del(id) {
    if (!confirm('Delete this code?')) return;
    await supabase.from('discount_codes').delete().eq('id', id);
    setCodes(prev => prev.filter(c => c.id !== id));
  }

  async function toggle(id, current) {
    await supabase.from('discount_codes').update({ active: !current }).eq('id', id);
    setCodes(prev => prev.map(c => c.id === id ? { ...c, active: !current } : c));
  }

  const copy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const formatExpiry = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—';

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div className={styles.summaryCards}>
          <div className={styles.sCard}><p className={styles.sVal}>{codes.filter(c=>c.active).length}</p><p className={styles.sLabel}>Active Codes</p></div>
          <div className={styles.sCard}><p className={styles.sVal}>{codes.reduce((s,c)=>s+(c.uses||0),0)}</p><p className={styles.sLabel}>Total Uses</p></div>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          <Plus size={16}/> New Code
        </button>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Uses</th><th>Expires</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign:'center', color:'#aaa', padding:'32px' }}>Loading…</td></tr>
            ) : codes.map(c => (
              <tr key={c.id}>
                <td>
                  <div className={styles.codeWrap}>
                    <span className={styles.code}>{c.code}</span>
                    <button className={styles.copyBtn} onClick={() => copy(c.code)} title="Copy">
                      {copied === c.code ? '✓' : <Copy size={13}/>}
                    </button>
                  </div>
                </td>
                <td className={styles.sub}>{c.type === 'percent' ? 'Percentage' : 'Fixed Amount'}</td>
                <td className={styles.value}>{c.type === 'percent' ? `${c.value}%` : `GHC ${c.value}`}</td>
                <td className={styles.sub}>{c.min_order > 0 ? `GHC ${c.min_order}` : 'None'}</td>
                <td><span className={styles.uses}>{c.uses}/{c.max_uses}</span></td>
                <td className={styles.sub}>{formatExpiry(c.expires_at)}</td>
                <td>
                  <button className={`${styles.toggle} ${c.active ? styles.on : styles.off}`} onClick={() => toggle(c.id, c.active)}>
                    {c.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td><button className={styles.delBtn} onClick={() => del(c.id)}><Trash2 size={15}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>New Discount Code</h3>
            <div className={styles.form}>
              {[['code','Code (e.g. SAVE10)'],['value','Discount Value'],['minOrder','Minimum Order (GHC)'],['maxUses','Max Uses'],['expires','Expiry Date (YYYY-MM-DD)']].map(([k,label]) => (
                <div key={k} className={styles.field}>
                  <label className={styles.label}>{label}</label>
                  <input className={styles.input} value={form[k]} onChange={e => set(k, e.target.value)} />
                </div>
              ))}
              <div className={styles.field}>
                <label className={styles.label}>Type</label>
                <select className={styles.input} value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (GHC)</option>
                </select>
              </div>
            </div>
            <div className={styles.formRow}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={add} disabled={saving}>{saving ? 'Creating…' : 'Create Code'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

