import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './CateringPage.module.css';

const SM = { confirmed:'green', pending:'orange', cancelled:'red' };
const BLANK_PKG   = { name:'', badge:'', price:'', description:'', cta:'', image_url:'', active:true, sort_order:0 };
const BLANK_BUILD = { title:'', subtitle:'', ingredients:'', price:'', image_url:'', default_people:10, active:true, sort_order:0 };
const BLANK_ITEM  = { name:'', category:'Base', image_url:'', price:'', active:true, sort_order:0 };
const BLANK_CAT   = { name:'', active:true, sort_order:0 };
const BLANK_FLAVOR = { name:'', image_url:'', active:true, sort_order:0 };

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

export default function CateringPage() {
  const [tab, setTab]           = useState('requests'); // 'requests' | 'packages' | 'builds'
  const [requests, setRequests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [builds, setBuilds]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [editingPkg,   setEditingPkg]   = useState(null);
  const [editingBuild, setEditingBuild] = useState(null);
  const [editingItem,  setEditingItem]  = useState(null);
  const [items,        setItems]        = useState([]);
  const [pkgSaving,    setPkgSaving]    = useState(false);
  const [buildSaving,  setBuildSaving]  = useState(false);
  const [itemSaving,   setItemSaving]   = useState(false);
  const [categories,   setCategories]   = useState([]);
  const [editingCat,   setEditingCat]   = useState(null);
  const [catSaving,    setCatSaving]    = useState(false);
  const [dipOptions,   setDipOptions]   = useState([]);
  const [editingDip,   setEditingDip]   = useState(null);
  const [dipSaving,    setDipSaving]    = useState(false);
  const [newDipName,   setNewDipName]   = useState('');
  const [juiceFlavors,  setJuiceFlavors]  = useState([]);
  const [juiceSettings, setJuiceSettings] = useState({ price_per_box: 120, min_bottles: 6 });
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [flavorSaving,  setFlavorSaving]  = useState(false);
  const [juiceSettingSaving, setJuiceSettingSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [reqRes, pkgRes, buildRes, itemRes, catRes, dipsRes, flavorsRes, juiceSetRes] = await Promise.all([
        supabase.from('catering_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('catering_packages').select('*').order('sort_order'),
        supabase.from('popular_builds').select('*').order('sort_order'),
        supabase.from('catering_items').select('*').order('sort_order'),
        supabase.from('catering_categories').select('*').order('sort_order'),
        supabase.from('chips_dips_options').select('*').order('sort_order'),
        supabase.from('juice_flavors').select('*').order('sort_order'),
        supabase.from('juice_box_settings').select('*').eq('id', 1).single(),
      ]);
      setRequests(reqRes.data || []);
      setPackages(pkgRes.data || []);
      setBuilds(buildRes.data || []);
      setItems(itemRes.data || []);
      setCategories(catRes.data || []);
      setDipOptions(dipsRes.data || []);
      setJuiceFlavors(flavorsRes.data || []);
      if (juiceSetRes.data) setJuiceSettings(juiceSetRes.data);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id, status) {
    await supabase.from('catering_requests').update({ status }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  }

  async function savePkg(form) {
    setPkgSaving(true);
    const payload = {
      name: form.name, badge: form.badge, price: Number(form.price),
      description: form.description, cta: form.cta, image_url: form.image_url || null,
      active: form.active, sort_order: Number(form.sort_order) || 0,
    };
    if (form.id) {
      await supabase.from('catering_packages').update(payload).eq('id', form.id);
      setPackages(prev => prev.map(p => p.id === form.id ? { ...p, ...payload } : p));
    } else {
      const { data } = await supabase.from('catering_packages').insert(payload).select().single();
      if (data) setPackages(prev => [...prev, data]);
    }
    setEditingPkg(null);
    setPkgSaving(false);
  }

  async function deletePkg(id) {
    if (!confirm('Delete this package?')) return;
    await supabase.from('catering_packages').delete().eq('id', id);
    setPackages(prev => prev.filter(p => p.id !== id));
  }

  async function togglePkg(id, current) {
    await supabase.from('catering_packages').update({ active: !current }).eq('id', id);
    setPackages(prev => prev.map(p => p.id === id ? { ...p, active: !current } : p));
  }

  async function saveBuild(form) {
    setBuildSaving(true);
    const payload = {
      title: form.title, subtitle: form.subtitle, ingredients: form.ingredients,
      price: Number(form.price), image_url: form.image_url || null,
      default_people: Number(form.default_people) || 10,
      active: form.active, sort_order: Number(form.sort_order) || 0,
    };
    if (form.id) {
      await supabase.from('popular_builds').update(payload).eq('id', form.id);
      setBuilds(prev => prev.map(b => b.id === form.id ? { ...b, ...payload } : b));
    } else {
      const { data } = await supabase.from('popular_builds').insert(payload).select().single();
      if (data) setBuilds(prev => [...prev, data]);
    }
    setEditingBuild(null);
    setBuildSaving(false);
  }

  async function deleteBuild(id) {
    if (!confirm('Delete this build?')) return;
    await supabase.from('popular_builds').delete().eq('id', id);
    setBuilds(prev => prev.filter(b => b.id !== id));
  }

  async function toggleBuild(id, current) {
    await supabase.from('popular_builds').update({ active: !current }).eq('id', id);
    setBuilds(prev => prev.map(b => b.id === id ? { ...b, active: !current } : b));
  }

  async function saveItem(form) {
    setItemSaving(true);
    const payload = {
      name: form.name, category: form.category, image_url: form.image_url || null,
      price: form.price !== '' && form.price != null ? Number(form.price) : null,
      active: form.active, sort_order: Number(form.sort_order) || 0,
    };
    if (form.id) {
      await supabase.from('catering_items').update(payload).eq('id', form.id);
      setItems(prev => prev.map(it => it.id === form.id ? { ...it, ...payload } : it));
    } else {
      const { data } = await supabase.from('catering_items').insert(payload).select().single();
      if (data) setItems(prev => [...prev, data]);
    }
    setEditingItem(null);
    setItemSaving(false);
  }

  async function deleteItem(id) {
    if (!confirm('Delete this item?')) return;
    await supabase.from('catering_items').delete().eq('id', id);
    setItems(prev => prev.filter(it => it.id !== id));
  }

  async function toggleItem(id, current) {
    await supabase.from('catering_items').update({ active: !current }).eq('id', id);
    setItems(prev => prev.map(it => it.id === id ? { ...it, active: !current } : it));
  }

  async function saveCat(form) {
    setCatSaving(true);
    const payload = { name: form.name.trim(), active: form.active, sort_order: Number(form.sort_order) || 0 };
    if (form.id) {
      await supabase.from('catering_categories').update(payload).eq('id', form.id);
      setCategories(prev => prev.map(c => c.id === form.id ? { ...c, ...payload } : c));
    } else {
      const { data } = await supabase.from('catering_categories').insert(payload).select().single();
      if (data) setCategories(prev => [...prev, data].sort((a,b) => a.sort_order - b.sort_order));
    }
    setEditingCat(null);
    setCatSaving(false);
  }

  async function toggleCat(id, current) {
    await supabase.from('catering_categories').update({ active: !current }).eq('id', id);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !current } : c));
  }

  async function deleteCat(id) {
    if (!confirm('Delete this category? Items in it will still exist but won\'t appear.')) return;
    await supabase.from('catering_categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  async function saveDip(form) {
    setDipSaving(true);
    const payload = { name: form.name.trim(), active: form.active ?? true, sort_order: Number(form.sort_order) || 0 };
    if (form.id) {
      await supabase.from('chips_dips_options').update(payload).eq('id', form.id);
      setDipOptions(prev => prev.map(d => d.id === form.id ? { ...d, ...payload } : d));
    } else {
      const { data } = await supabase.from('chips_dips_options').insert(payload).select().single();
      if (data) setDipOptions(prev => [...prev, data].sort((a,b) => a.sort_order - b.sort_order));
    }
    setEditingDip(null);
    setDipSaving(false);
  }

  async function toggleDip(id, current) {
    await supabase.from('chips_dips_options').update({ active: !current }).eq('id', id);
    setDipOptions(prev => prev.map(d => d.id === id ? { ...d, active: !current } : d));
  }

  async function deleteDip(id) {
    if (!confirm('Delete this dip option?')) return;
    await supabase.from('chips_dips_options').delete().eq('id', id);
    setDipOptions(prev => prev.filter(d => d.id !== id));
  }

  async function toggleChipsDip(id, current) {
    await supabase.from('catering_items').update({ show_on_chips_dips: !current }).eq('id', id);
    setItems(prev => prev.map(it => it.id === id ? { ...it, show_on_chips_dips: !current } : it));
  }

  async function saveJuiceSettings() {
    setJuiceSettingSaving(true);
    await supabase.from('juice_box_settings').upsert({
      id: 1,
      price_per_box: Number(juiceSettings.price_per_box),
      min_bottles:   Number(juiceSettings.min_bottles),
    });
    setJuiceSettingSaving(false);
  }

  async function saveFlavor(form) {
    setFlavorSaving(true);
    const payload = { name: form.name.trim(), image_url: form.image_url || null, active: form.active ?? true, sort_order: Number(form.sort_order) || 0 };
    if (form.id) {
      await supabase.from('juice_flavors').update(payload).eq('id', form.id);
      setJuiceFlavors(prev => prev.map(f => f.id === form.id ? { ...f, ...payload } : f));
    } else {
      const { data } = await supabase.from('juice_flavors').insert(payload).select().single();
      if (data) setJuiceFlavors(prev => [...prev, data].sort((a,b) => a.sort_order - b.sort_order));
    }
    setEditingFlavor(null);
    setFlavorSaving(false);
  }

  async function toggleFlavor(id, current) {
    await supabase.from('juice_flavors').update({ active: !current }).eq('id', id);
    setJuiceFlavors(prev => prev.map(f => f.id === id ? { ...f, active: !current } : f));
  }

  async function deleteFlavor(id) {
    if (!confirm('Delete this flavor?')) return;
    await supabase.from('juice_flavors').delete().eq('id', id);
    setJuiceFlavors(prev => prev.filter(f => f.id !== id));
  }

  return (
    <div className={styles.page}>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'requests' ? styles.tabActive : ''}`} onClick={() => setTab('requests')}>Catering Requests</button>
        <button className={`${styles.tab} ${tab === 'packages' ? styles.tabActive : ''}`} onClick={() => setTab('packages')}>Packages</button>
        <button className={`${styles.tab} ${tab === 'builds'   ? styles.tabActive : ''}`} onClick={() => setTab('builds')}>Popular Builds</button>
        <button className={`${styles.tab} ${tab === 'items'    ? styles.tabActive : ''}`} onClick={() => setTab('items')}>Build Items</button>
        <button className={`${styles.tab} ${tab === 'dips'     ? styles.tabActive : ''}`} onClick={() => setTab('dips')}>Chips &amp; Dips</button>
        <button className={`${styles.tab} ${tab === 'juices'   ? styles.tabActive : ''}`} onClick={() => setTab('juices')}>Juices Box</button>
      </div>

      {/* ── REQUESTS TAB ── */}
      {tab === 'requests' && (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead><tr><th>Ref</th><th>Client</th><th>Event Date</th><th>Guests</th><th>Submitted</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign:'center', color:'#aaa', padding:'32px' }}>Loading…</td></tr>
              ) : requests.map(r => (
                <tr key={r.id}>
                  <td className={styles.ref}>#{r.id.slice(0,8).toUpperCase()}</td>
                  <td>
                    <p className={styles.name}>{r.name}</p>
                    <p className={styles.sub}>{r.phone || r.email}</p>
                  </td>
                  <td className={styles.sub}>{r.event_date || '—'}</td>
                  <td className={styles.center}>{r.guest_count || '—'}</td>
                  <td className={styles.sub}>{formatDate(r.created_at)}</td>
                  <td><span className={`${styles.badge} ${styles[SM[r.status] || 'orange']}`}>{r.status || 'pending'}</span></td>
                  <td><button className={styles.viewBtn} onClick={() => setSelected(r)}><Eye size={14}/> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && requests.length === 0 && <p style={{ padding:'32px', color:'#aaa', textAlign:'center' }}>No catering requests yet.</p>}
        </div>
      )}

      {/* ── PACKAGES TAB ── */}
      {tab === 'packages' && (
        <>
          <div className={styles.pkgHeader}>
            <p className={styles.pkgNote}>These packages appear in the catering hero on the website.</p>
            <button className={styles.addBtn} onClick={() => setEditingPkg({ ...BLANK_PKG })}>
              <Plus size={16}/> Add Package
            </button>
          </div>
          <div className={styles.pkgGrid}>
            {packages.map(p => (
              <div key={p.id} className={`${styles.pkgCard} ${!p.active ? styles.pkgInactive : ''}`}>
                <div className={styles.pkgTop}>
                  <h3 className={styles.pkgName}>{p.name}</h3>
                  {p.badge && <span className={styles.pkgBadge}>{p.badge}</span>}
                </div>
                <p className={styles.pkgPrice}>GHC {p.price} <span>/person</span></p>
                <p className={styles.pkgDesc}>{p.description}</p>
                <div className={styles.pkgActions}>
                  <button className={`${styles.pkgToggle} ${p.active ? styles.on : styles.off}`} onClick={() => togglePkg(p.id, p.active)}>
                    {p.active ? 'Active' : 'Hidden'}
                  </button>
                  <button className={styles.iconBtn} onClick={() => setEditingPkg({ ...p })}><Pencil size={15}/></button>
                  <button className={`${styles.iconBtn} ${styles.del}`} onClick={() => deletePkg(p.id)}><Trash2 size={15}/></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Request detail modal */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>#{selected.id.slice(0,8).toUpperCase()}</h3>
            <div className={styles.grid}>
              <div><p className={styles.mLabel}>Name</p><p className={styles.name}>{selected.name}</p></div>
              <div><p className={styles.mLabel}>Email</p><p>{selected.email}</p></div>
              <div><p className={styles.mLabel}>Phone</p><p>{selected.phone || '—'}</p></div>
              <div><p className={styles.mLabel}>Event Date</p><p>{selected.event_date || '—'}</p></div>
              <div><p className={styles.mLabel}>Guests</p><p className={styles.big}>{selected.guest_count || '—'}</p></div>
              <div><p className={styles.mLabel}>Submitted</p><p>{formatDate(selected.created_at)}</p></div>
              {selected.message && (
                <div className={styles.spanFull}><p className={styles.mLabel}>Message</p><p>{selected.message}</p></div>
              )}
            </div>
            <div className={styles.btns}>
              {selected.status !== 'confirmed' && (
                <button className={`${styles.actionBtn} ${styles.confirm}`} onClick={() => updateStatus(selected.id, 'confirmed')}>
                  <CheckCircle size={16}/> Confirm
                </button>
              )}
              {selected.status !== 'cancelled' && (
                <button className={`${styles.actionBtn} ${styles.cancel}`} onClick={() => updateStatus(selected.id, 'cancelled')}>
                  <XCircle size={16}/> Cancel
                </button>
              )}
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Package edit modal */}
      {editingPkg && (
        <div className={styles.overlay} onClick={() => setEditingPkg(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingPkg.id ? 'Edit Package' : 'New Package'}</h3>
            <PkgForm item={editingPkg} onSave={savePkg} onCancel={() => setEditingPkg(null)} saving={pkgSaving} bucket="catering-images" />
          </div>
        </div>
      )}

      {/* ── POPULAR BUILDS TAB ── */}
      {tab === 'builds' && (
        <>
          <div className={styles.pkgHeader}>
            <p className={styles.pkgNote}>These appear in the "Popular Builds" section on the catering page.</p>
            <button className={styles.addBtn} onClick={() => setEditingBuild({ ...BLANK_BUILD })}>
              <Plus size={16}/> Add Build
            </button>
          </div>
          <div className={styles.pkgGrid}>
            {builds.map(b => (
              <div key={b.id} className={`${styles.pkgCard} ${!b.active ? styles.pkgInactive : ''}`}>
                {b.image_url && <img src={b.image_url} alt={b.title} className={styles.pkgImg} />}
                <div className={styles.pkgTop}>
                  <h3 className={styles.pkgName}>{b.title}</h3>
                  {b.subtitle && <span className={styles.pkgBadge}>{b.subtitle}</span>}
                </div>
                <p className={styles.pkgPrice}>GHC {b.price} <span>/person · {b.default_people} ppl min</span></p>
                <p className={styles.pkgDesc}>{b.ingredients}</p>
                <div className={styles.pkgActions}>
                  <button className={`${styles.pkgToggle} ${b.active ? styles.on : styles.off}`} onClick={() => toggleBuild(b.id, b.active)}>
                    {b.active ? 'Active' : 'Hidden'}
                  </button>
                  <button className={styles.iconBtn} onClick={() => setEditingBuild({ ...b })}><Pencil size={15}/></button>
                  <button className={`${styles.iconBtn} ${styles.del}`} onClick={() => deleteBuild(b.id)}><Trash2 size={15}/></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── BUILD ITEMS TAB ── */}
      {tab === 'items' && (
        <>
          {/* Category management strip */}
          <div className={styles.catManageBar}>
            <p className={styles.pkgNote}>Manage which ingredient categories appear on the build page.</p>
            <button className={styles.addBtn} onClick={() => setEditingCat({ ...BLANK_CAT })}>
              <Plus size={16}/> Add Category
            </button>
          </div>
          <div className={styles.catManageList}>
            {categories.map(cat => (
              <div key={cat.id} className={`${styles.catManageRow} ${!cat.active ? styles.pkgInactive : ''}`}>
                <span className={styles.catManageName}>{cat.name}</span>
                <div className={styles.pkgActions}>
                  <button className={`${styles.pkgToggle} ${cat.active ? styles.on : styles.off}`} onClick={() => toggleCat(cat.id, cat.active)}>
                    {cat.active ? 'Visible' : 'Hidden'}
                  </button>
                  <button className={styles.iconBtn} onClick={() => setEditingCat({ ...cat })}><Pencil size={14}/></button>
                  <button className={`${styles.iconBtn} ${styles.del}`} onClick={() => deleteCat(cat.id)}><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>

          {/* Items header */}
          <div className={styles.pkgHeader} style={{ marginTop: 28 }}>
            <p className={styles.pkgNote}>These are the ingredients users choose when building their catering package.</p>
            <button className={styles.addBtn} onClick={() => setEditingItem({ ...BLANK_ITEM, category: categories[0]?.name || 'Base' })}>
              <Plus size={16}/> Add Item
            </button>
          </div>

          {/* Items grouped by category */}
          {categories.map(cat => {
            const catItems = items.filter(it => it.category === cat.name);
            return (
              <div key={cat.id} style={{ marginBottom: 28 }}>
                <h4 className={`${styles.catHeading} ${!cat.active ? styles.catHidden : ''}`}>
                  {cat.name}
                  {!cat.active && <span className={styles.catHiddenBadge}>Hidden from users</span>}
                </h4>
                <div className={styles.itemsGrid}>
                  {catItems.map(it => (
                    <div key={it.id} className={`${styles.itemCard} ${!it.active ? styles.pkgInactive : ''}`}>
                      {it.image_url
                        ? <img src={it.image_url} alt={it.name} className={styles.itemImg} />
                        : <div className={styles.itemImgPlaceholder}>{it.name[0]}</div>
                      }
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{it.name}</p>
                        {it.price != null && <p className={styles.itemPrice}>+ GHC {Number(it.price).toFixed(2)}</p>}
                        <div className={styles.pkgActions}>
                          <button className={`${styles.pkgToggle} ${it.active ? styles.on : styles.off}`} onClick={() => toggleItem(it.id, it.active)}>
                            {it.active ? 'Active' : 'Hidden'}
                          </button>
                          <button className={styles.iconBtn} onClick={() => setEditingItem({ ...it })}><Pencil size={14}/></button>
                          <button className={`${styles.iconBtn} ${styles.del}`} onClick={() => deleteItem(it.id)}><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {catItems.length === 0 && <p style={{ color:'#bbb', fontSize:'0.82rem' }}>No items in this category yet.</p>}
              </div>
            );
          })}
        </>
      )}

      {/* Item edit modal */}
      {editingItem && (
        <div className={styles.overlay} onClick={() => setEditingItem(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingItem.id ? 'Edit Item' : 'New Item'}</h3>
            <ItemForm item={editingItem} onSave={saveItem} onCancel={() => setEditingItem(null)} saving={itemSaving} cats={categories.map(c => c.name)} />
          </div>
        </div>
      )}

      {editingCat && (
        <div className={styles.overlay} onClick={() => setEditingCat(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingCat.id ? 'Edit Category' : 'New Category'}</h3>
            <CategoryForm item={editingCat} onSave={saveCat} onCancel={() => setEditingCat(null)} saving={catSaving} />
          </div>
        </div>
      )}

      {/* ── CHIPS & DIPS TAB ── */}
      {tab === 'dips' && (
        <>
          <div className={styles.catManageBar}>
            <p className={styles.pkgNote}>These are the dip choices users see on the Chips &amp; Dips order page.</p>
            <button className={styles.addBtn} onClick={() => setEditingDip({ name: '', active: true, sort_order: dipOptions.length + 1 })}>
              <Plus size={16}/> Add Dip
            </button>
          </div>
          <div className={styles.catManageList}>
            {dipOptions.map(d => (
              <div key={d.id} className={`${styles.catManageRow} ${!d.active ? styles.pkgInactive : ''}`}>
                <span className={styles.catManageName}>{d.name}</span>
                <div className={styles.pkgActions}>
                  <button className={`${styles.pkgToggle} ${d.active ? styles.on : styles.off}`} onClick={() => toggleDip(d.id, d.active)}>
                    {d.active ? 'Visible' : 'Hidden'}
                  </button>
                  <button className={styles.iconBtn} onClick={() => setEditingDip({ ...d })}><Pencil size={14}/></button>
                  <button className={`${styles.iconBtn} ${styles.del}`} onClick={() => deleteDip(d.id)}><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
            {dipOptions.length === 0 && !loading && (
              <p style={{ color:'#bbb', fontSize:'0.85rem', padding:'12px 0' }}>No dip options yet. Add one above.</p>
            )}
          </div>

          {/* Add-on Items */}
          <div className={styles.pkgHeader} style={{ marginTop: 32 }}>
            <div>
              <h3 className={styles.sectionHeading} style={{ margin: 0 }}>Add-on Items</h3>
              <p className={styles.pkgNote} style={{ marginTop: 4 }}>Items shown here appear on the Chips &amp; Dips page. Users can add them for an extra charge (set the price on the item in Build Items).</p>
            </div>
          </div>
          <div className={styles.itemsGrid}>
            {items.filter(it => it.active).map(it => (
              <div key={it.id} className={`${styles.itemCard} ${!it.show_on_chips_dips ? styles.pkgInactive : ''}`}>
                {it.image_url
                  ? <img src={it.image_url} alt={it.name} className={styles.itemImg} />
                  : <div className={styles.itemImgPlaceholder}>{it.name[0]}</div>
                }
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{it.name}</p>
                  {it.price != null && <p className={styles.itemPrice}>+ GHC {Number(it.price).toFixed(2)}</p>}
                  {it.price == null && <p style={{ fontSize:'0.75rem', color:'#bbb', margin:'2px 0 6px' }}>No price set</p>}
                  <button
                    className={`${styles.pkgToggle} ${it.show_on_chips_dips ? styles.on : styles.off}`}
                    onClick={() => toggleChipsDip(it.id, it.show_on_chips_dips)}
                  >
                    {it.show_on_chips_dips ? 'Shown' : 'Hidden'}
                  </button>
                </div>
              </div>
            ))}
            {items.filter(it => it.active).length === 0 && (
              <p style={{ color:'#bbb', fontSize:'0.85rem' }}>No active build items yet. Add them in the Build Items tab first.</p>
            )}
          </div>
        </>
      )}

      {/* Dip edit modal */}
      {editingDip && (
        <div className={styles.overlay} onClick={() => setEditingDip(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingDip.id ? 'Edit Dip Option' : 'New Dip Option'}</h3>
            <div className={styles.field} style={{ marginBottom: 16 }}>
              <label className={styles.mLabel}>Name</label>
              <input className={styles.pkgInput} value={editingDip.name} onChange={e => setEditingDip(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className={styles.field} style={{ marginBottom: 24 }}>
              <label className={styles.mLabel}>Sort Order</label>
              <input className={styles.pkgInput} type="number" value={editingDip.sort_order} onChange={e => setEditingDip(p => ({ ...p, sort_order: e.target.value }))} />
            </div>
            <div className={styles.formRow}>
              <button className={styles.closeBtn} onClick={() => setEditingDip(null)}>Cancel</button>
              <button className={`${styles.actionBtn} ${styles.confirm}`} style={{ flex:1 }} onClick={() => saveDip(editingDip)} disabled={dipSaving || !editingDip.name?.trim()}>
                {dipSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── JUICES BOX TAB ── */}
      {tab === 'juices' && (
        <>
          {/* Settings */}
          <div className={styles.catManageBar}>
            <p className={styles.pkgNote}>Configure the Juices by the Box offering on the user site.</p>
          </div>
          <div className={styles.grid} style={{ maxWidth: 480, marginBottom: 24 }}>
            <div className={styles.field}>
              <label className={styles.mLabel}>Price per Box (GHC)</label>
              <input
                className={styles.pkgInput}
                type="number"
                value={juiceSettings.price_per_box}
                onChange={e => setJuiceSettings(p => ({ ...p, price_per_box: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.mLabel}>Min Bottles per Box</label>
              <input
                className={styles.pkgInput}
                type="number"
                min="1"
                value={juiceSettings.min_bottles}
                onChange={e => setJuiceSettings(p => ({ ...p, min_bottles: e.target.value }))}
              />
            </div>
          </div>
          <button
            className={`${styles.actionBtn} ${styles.confirm}`}
            style={{ marginBottom: 32, minWidth: 180 }}
            onClick={saveJuiceSettings}
            disabled={juiceSettingSaving}
          >
            {juiceSettingSaving ? 'Saving…' : 'Save Settings'}
          </button>

          {/* Flavors */}
          <div className={styles.pkgHeader}>
            <p className={styles.pkgNote}>Juice flavors users can choose when ordering a box.</p>
            <button className={styles.addBtn} onClick={() => setEditingFlavor({ ...BLANK_FLAVOR, sort_order: juiceFlavors.length + 1 })}>
              <Plus size={16}/> Add Flavor
            </button>
          </div>
          <div className={styles.catManageList}>
            {juiceFlavors.map(f => (
              <div key={f.id} className={`${styles.catManageRow} ${!f.active ? styles.pkgInactive : ''}`}>
                <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                  {f.image_url
                    ? <img src={f.image_url} alt={f.name} style={{ width:44, height:44, borderRadius:8, objectFit:'cover' }} />
                    : <div style={{ width:44, height:44, borderRadius:8, background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', color:'#aaa' }}>{f.name[0]}</div>
                  }
                  <span className={styles.catManageName}>{f.name}</span>
                </div>
                <div className={styles.pkgActions}>
                  <button className={`${styles.pkgToggle} ${f.active ? styles.on : styles.off}`} onClick={() => toggleFlavor(f.id, f.active)}>
                    {f.active ? 'Visible' : 'Hidden'}
                  </button>
                  <button className={styles.iconBtn} onClick={() => setEditingFlavor({ ...f })}><Pencil size={14}/></button>
                  <button className={`${styles.iconBtn} ${styles.del}`} onClick={() => deleteFlavor(f.id)}><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
            {juiceFlavors.length === 0 && !loading && (
              <p style={{ color:'#bbb', fontSize:'0.85rem', padding:'12px 0' }}>No flavors yet. Add one above.</p>
            )}
          </div>
        </>
      )}

      {/* Flavor edit modal */}
      {editingFlavor && (
        <div className={styles.overlay} onClick={() => setEditingFlavor(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingFlavor.id ? 'Edit Flavor' : 'New Flavor'}</h3>
            <ImageUpload value={editingFlavor.image_url} onChange={v => setEditingFlavor(p => ({ ...p, image_url: v }))} bucket="catering-images" />
            <div className={styles.field} style={{ marginBottom: 16 }}>
              <label className={styles.mLabel}>Name</label>
              <input className={styles.pkgInput} value={editingFlavor.name} onChange={e => setEditingFlavor(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className={styles.field} style={{ marginBottom: 24 }}>
              <label className={styles.mLabel}>Sort Order</label>
              <input className={styles.pkgInput} type="number" value={editingFlavor.sort_order} onChange={e => setEditingFlavor(p => ({ ...p, sort_order: e.target.value }))} />
            </div>
            <div className={styles.formRow}>
              <button className={styles.closeBtn} onClick={() => setEditingFlavor(null)}>Cancel</button>
              <button className={`${styles.actionBtn} ${styles.confirm}`} style={{ flex:1 }} onClick={() => saveFlavor(editingFlavor)} disabled={flavorSaving || !editingFlavor.name?.trim()}>
                {flavorSaving ? 'Saving…' : 'Save Flavor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Build edit modal */}
      {editingBuild && (
        <div className={styles.overlay} onClick={() => setEditingBuild(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{editingBuild.id ? 'Edit Build' : 'New Build'}</h3>
            <BuildForm item={editingBuild} onSave={saveBuild} onCancel={() => setEditingBuild(null)} saving={buildSaving} />
          </div>
        </div>
      )}
    </div>
  );
}

function ImageUpload({ value, onChange, bucket = 'catering-images' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (upErr) { setError('Upload failed: ' + upErr.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(publicUrl);
    setUploading(false);
  }

  return (
    <div className={styles.field}>
      <label className={styles.mLabel}>Image</label>
      {value && <img src={value} alt="preview" className={styles.imgPreview} />}
      <label className={styles.uploadBtn}>
        {uploading ? 'Uploading…' : value ? 'Change Image' : 'Upload Image'}
        <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} disabled={uploading} />
      </label>
      {error && <p style={{ color:'var(--red)', fontSize:'0.8rem' }}>{error}</p>}
    </div>
  );
}

function PkgForm({ item, onSave, onCancel, saving, bucket }) {
  const [form, setForm] = useState(item);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className={styles.pkgForm}>
      <ImageUpload value={form.image_url} onChange={v => set('image_url', v)} bucket={bucket} />
      {[['name','Package Name (e.g. SINGLE)'],['badge','Badge Text (e.g. BEST VALUE)'],['price','Price per Person (GHC)'],['cta','Button Text (e.g. BUILD YOUR SINGLE)'],['sort_order','Sort Order (1, 2, 3…)']].map(([k, label]) => (
        <div key={k} className={styles.field}>
          <label className={styles.mLabel}>{label}</label>
          <input className={styles.pkgInput} value={form[k] || ''} onChange={e => set(k, e.target.value)} />
        </div>
      ))}
      <div className={styles.field}>
        <label className={styles.mLabel}>Description</label>
        <textarea className={styles.pkgInput} rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} style={{ resize:'vertical' }} />
      </div>
      <div className={styles.formRow}>
        <button className={styles.closeBtn} onClick={onCancel}>Cancel</button>
        <button className={`${styles.actionBtn} ${styles.confirm}`} style={{ flex:1 }} onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Saving…' : 'Save Package'}
        </button>
      </div>
    </div>
  );
}

function BuildForm({ item, onSave, onCancel, saving }) {
  const [form, setForm] = useState(item);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className={styles.pkgForm}>
      <ImageUpload value={form.image_url} onChange={v => set('image_url', v)} bucket="catering-images" />
      {[['title','Title (e.g. WORK ANYWHERE)'],['subtitle','Subtitle (e.g. DOUBLE PROTEIN)'],['price','Price per Person (GHC)'],['default_people','Min People (e.g. 10)'],['sort_order','Sort Order (1, 2, 3…)']].map(([k, label]) => (
        <div key={k} className={styles.field}>
          <label className={styles.mLabel}>{label}</label>
          <input className={styles.pkgInput} value={form[k] || ''} onChange={e => set(k, e.target.value)} />
        </div>
      ))}
      <div className={styles.field}>
        <label className={styles.mLabel}>Ingredients (pipe-separated)</label>
        <textarea className={styles.pkgInput} rows={3} value={form.ingredients || ''} onChange={e => set('ingredients', e.target.value)} style={{ resize:'vertical' }} />
      </div>
      <div className={styles.formRow}>
        <button className={styles.closeBtn} onClick={onCancel}>Cancel</button>
        <button className={`${styles.actionBtn} ${styles.confirm}`} style={{ flex:1 }} onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Saving…' : 'Save Build'}
        </button>
      </div>
    </div>
  );
}

function CategoryForm({ item, onSave, onCancel, saving }) {
  const [form, setForm] = useState(item);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className={styles.pkgForm}>
      <div className={styles.field}>
        <label className={styles.mLabel}>Category Name</label>
        <input className={styles.pkgInput} value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Sauces" />
      </div>
      <div className={styles.field}>
        <label className={styles.mLabel}>Sort Order</label>
        <input className={styles.pkgInput} type="number" value={form.sort_order || 0} onChange={e => set('sort_order', e.target.value)} />
      </div>
      <div className={styles.formRow}>
        <button className={styles.closeBtn} onClick={onCancel}>Cancel</button>
        <button className={`${styles.actionBtn} ${styles.confirm}`} style={{ flex:1 }} onClick={() => onSave(form)} disabled={saving || !form.name?.trim()}>
          {saving ? 'Saving…' : 'Save Category'}
        </button>
      </div>
    </div>
  );
}

function ItemForm({ item, onSave, onCancel, saving, cats = [] }) {
  const [form, setForm] = useState(item);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className={styles.pkgForm}>
      <ImageUpload value={form.image_url} onChange={v => set('image_url', v)} bucket="catering-images" />
      <div className={styles.field}>
        <label className={styles.mLabel}>Item Name</label>
        <input className={styles.pkgInput} value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Cilantro-Lime White Rice" />
      </div>
      <div className={styles.field}>
        <label className={styles.mLabel}>Category</label>
        <select className={styles.pkgInput} value={form.category || cats[0] || 'Base'} onChange={e => set('category', e.target.value)}>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.mLabel}>Extra Price per Unit (GHC) — leave blank if included in package</label>
        <input className={styles.pkgInput} type="number" min="0" step="0.01" value={form.price ?? ''} onChange={e => set('price', e.target.value)} placeholder="e.g. 15 for a drink" />
      </div>
      <div className={styles.field}>
        <label className={styles.mLabel}>Sort Order</label>
        <input className={styles.pkgInput} type="number" value={form.sort_order || 0} onChange={e => set('sort_order', e.target.value)} />
      </div>
      <div className={styles.formRow}>
        <button className={styles.closeBtn} onClick={onCancel}>Cancel</button>
        <button className={`${styles.actionBtn} ${styles.confirm}`} style={{ flex:1 }} onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Saving…' : 'Save Item'}
        </button>
      </div>
    </div>
  );
}

