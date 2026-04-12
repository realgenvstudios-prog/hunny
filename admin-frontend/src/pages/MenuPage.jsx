import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './MenuPage.module.css';

const CATEGORIES = ['All','Sandwiches','Salads','Shawarma','Fries','Pastries','Chicken Wings','Ice Cream','Waffles','Rice Meals','Fresh Juice'];

export default function MenuPage() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch]     = useState('');
  const [editing, setEditing]   = useState(null);

  async function load() {
    const { data } = await supabase
      .from('products')
      .select('id, name, description, price, available, image_url, categories(name)')
      .order('name');
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const visible = items.filter(i =>
    (category === 'All' || i.categories?.name === category) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleStatus(id, current) {
    await supabase.from('products').update({ available: !current }).eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !current } : i));
  }

  async function deleteItem(id) {
    if (!confirm('Delete this item?')) return;
    await supabase.from('products').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function saveItem(form) {
    // find category_id from slug
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', form.category)
      .single();

    const payload = {
      name:        form.name,
      description: form.description || null,
      price:       Number(form.price),
      image_url:   form.image_url || null,
      available:   form.available ?? true,
      category_id: cat?.id || null,
    };

    if (form.id) {
      await supabase.from('products').update(payload).eq('id', form.id);
    } else {
      await supabase.from('products').insert(payload);
    }
    setEditing(null);
    load();
  }

  return (
    <div className={styles.page}>

      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.catScroll}>
          {CATEGORIES.map(c => (
            <button key={c} className={`${styles.catBtn} ${category === c ? styles.catActive : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <button className={styles.addBtn} onClick={() => setEditing({ name:'', category:'Sandwiches', description:'', price:120, available:true, image_url:'' })}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      {loading ? (
        <p style={{ color:'#aaa', padding:'32px 0' }}>Loading…</p>
      ) : (
        <div className={styles.grid}>
          {visible.map(item => (
            <div key={item.id} className={styles.card}>
              <img src={item.image_url} alt={item.name} className={styles.img} />
              <div className={styles.info}>
                <p className={styles.name}>{item.name}</p>
                <p className={styles.cat}>{item.categories?.name || '—'}</p>
                <p className={styles.price}>GHC {Number(item.price).toFixed(0)}</p>
              </div>
              <div className={styles.actions}>
                <button
                  className={`${styles.toggle} ${item.available ? styles.active : styles.inactive}`}
                  onClick={() => toggleStatus(item.id, item.available)}
                >
                  {item.available ? 'Active' : 'Inactive'}
                </button>
                <button className={styles.iconBtn} onClick={() => setEditing({ ...item, category: item.categories?.name || '' })}><Pencil size={15}/></button>
                <button className={`${styles.iconBtn} ${styles.del}`} onClick={() => deleteItem(item.id)}><Trash2 size={15}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {editing && (
        <div className={styles.overlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editing.id ? 'Edit Item' : 'Add New Item'}</h3>
            <EditForm item={editing} onSave={saveItem} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function EditForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState(item);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    console.log('Uploading to bucket: product-images, path:', path);
    const { data, error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
    console.log('Upload result:', { data, error });
    if (error) {
      setUploadError('Upload failed: ' + error.message + ' (check console for details)');
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    set('image_url', publicUrl);
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
  }

  return (
    <div className={styles.form}>
      {/* Image upload */}
      <div className={styles.field}>
        <label className={styles.label}>Image</label>
        {form.image_url && (
          <img src={form.image_url} alt="preview" className={styles.imgPreview} />
        )}
        <label className={styles.uploadBtn}>
          {uploading ? 'Uploading…' : form.image_url ? 'Change Image' : 'Upload Image'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} disabled={uploading} />
        </label>
        {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
      </div>

      {[['name','Name'],['price','Price (GHC)'],['description','Description']].map(([k,label]) => (
        <div key={k} className={styles.field}>
          <label className={styles.label}>{label}</label>
          <input className={styles.input} value={form[k] || ''} onChange={e => set(k, e.target.value)} />
        </div>
      ))}

      <div className={styles.field}>
        <label className={styles.label}>Category</label>
        <select className={styles.input} value={form.category || ''} onChange={e => set('category', e.target.value)}>
          {CATEGORIES.filter(c => c !== 'All').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className={styles.formRow}>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving || uploading}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  );
}


