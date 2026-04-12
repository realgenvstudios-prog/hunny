import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './CateringBuildPage.module.css';

/* ── helpers ── */
function generateSlots(startHour = 10, startMin = 45, endHour = 21, endMin = 0) {
  const slots = [];
  let h = startHour, m = startMin;
  while (h < endHour || (h === endHour && m <= endMin)) {
    const period = h < 12 ? 'AM' : 'PM';
    const display = `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${period}`;
    slots.push(display);
    m += 15;
    if (m >= 60) { m -= 60; h += 1; }
  }
  return slots;
}
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
function todayString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}
function formatDisplayDate(iso) {
  if (!iso) return '';
  const [y, mo, d] = iso.split('-').map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const TIME_SLOTS   = generateSlots();
const COLUMNS      = chunkArray(TIME_SLOTS, 4);
const COLS_VISIBLE = 5;
const CATEGORIES   = ['Base', 'Protein', 'Toppings', 'Salsas', 'Tortilla']; // fallback

/* ── main component ── */
export default function CateringBuildPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const pkgName   = params.get('pkg')   || '';
  const pkgPrice  = params.get('price') || '';

  // Step 1 state
  const [step, setStep]             = useState(1);
  const [mode, setMode]             = useState('pickup');
  const [date, setDate]             = useState('');
  const [time, setTime]             = useState('');
  const [eventType, setEventType]   = useState('');
  const [address, setAddress]       = useState('');
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [guests, setGuests]         = useState('');
  const [colOffset, setColOffset]   = useState(0);
  const dateRef = useRef(null);

  // Step 2 state
  const [allItems, setAllItems]       = useState([]);
  const [categories, setCategories]   = useState(CATEGORIES); // seeded from DB on step 2
  const [selections, setSelections]   = useState({});

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error, setError]           = useState('');

  // Pre-fill email
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  // Load items + categories when moving to step 2
  useEffect(() => {
    if (step === 2 && allItems.length === 0) {
      Promise.all([
        supabase.from('catering_items').select('*').eq('active', true).order('sort_order'),
        supabase.from('catering_categories').select('name').eq('active', true).order('sort_order'),
      ]).then(([itemRes, catRes]) => {
        if (itemRes.data) setAllItems(itemRes.data);
        if (catRes.data && catRes.data.length > 0)
          setCategories(catRes.data.map(c => c.name));
      });
    }
  }, [step]);

  /* ── helpers ── */
  const visibleCols    = COLUMNS.slice(colOffset, colOffset + COLS_VISIBLE);
  const canScrollLeft  = colOffset > 0;
  const canScrollRight = colOffset + COLS_VISIBLE < COLUMNS.length;
  const step1Valid     = date && time && name.trim() && email.trim();

  function toggleItem(id) {
    setSelections(prev => {
      const cur = prev[id] || 0;
      if (cur === 0) return { ...prev, [id]: 1 };
      return { ...prev, [id]: 0 };
    });
  }

  function changeQty(id, delta) {
    setSelections(prev => {
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [id]: next };
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');

    // Build selections summary
    const selectionLines = allItems
      .filter(it => (selections[it.id] || 0) > 0)
      .map(it => `${it.category}: ${it.name} x${selections[it.id]}`)
      .join('\n');

    const notes = [
      pkgName ? `Package: ${pkgName}${pkgPrice ? ` (GHC ${pkgPrice}/person)` : ''}` : '',
      mode === 'pickup' ? 'Order type: Pickup' : `Order type: Delivery — ${address}`,
      `Time: ${time}`,
      eventType ? `Event type: ${eventType}` : '',
      selectionLines ? `\nSelections:\n${selectionLines}` : '',
    ].filter(Boolean).join('\n');

    const { error: dbErr } = await supabase.from('catering_requests').insert({
      name:        name.trim(),
      email:       email.trim(),
      phone:       phone.trim() || null,
      event_date:  date || null,
      guest_count: guests ? parseInt(guests, 10) : null,
      message:     notes,
      status:      'pending',
    });
    setSubmitting(false);
    if (dbErr) { setError('Something went wrong. Please try again.'); return; }
    setSubmitted(true);
  }

  /* ── success screen ── */
  if (submitted) {
    return (
      <div className={styles.successWrap}>
        <CheckCircle size={56} className={styles.successIcon} />
        <h2 className={styles.successTitle}>You're all set!</h2>
        <p className={styles.successSub}>
          Your catering request has been received. Our team will reach out within 24 hours to confirm details.
        </p>
        <button className={styles.backBtn} onClick={() => navigate('/catering')}>Back to Catering</button>
      </div>
    );
  }

  /* ── step 1: event details ── */
  if (step === 1) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <h1 className={styles.title}>EVENT DETAILS</h1>
            <p className={styles.subtitle}>We'll need some info before you can build your order.</p>
          </div>

          {/* Pickup / Delivery */}
          <div className={styles.modeTabs}>
            <button className={`${styles.modeTab} ${mode === 'pickup' ? styles.modeActive : ''}`} onClick={() => setMode('pickup')}>
              <span className={styles.modeIcon}>🛵</span> PICKUP
            </button>
            <button className={`${styles.modeTab} ${mode === 'delivery' ? styles.modeActive : ''}`} onClick={() => setMode('delivery')}>
              <span className={styles.modeIcon}>🚗</span> DELIVERY
            </button>
          </div>

          <div className={styles.formBody}>
            {/* Restaurant / Address */}
            {mode === 'pickup' ? (
              <div className={styles.field}>
                <label className={styles.label}>Pickup Restaurant</label>
                <div className={styles.addressRow}>
                  <span className={styles.addressText}>111 Fulton St, Accra</span>
                  <a href="https://maps.google.com/?q=111+Fulton+St" target="_blank" rel="noreferrer" className={styles.goBtn}>
                    GO <ChevronRight size={16} />
                  </a>
                </div>
                <div className={styles.divider} />
              </div>
            ) : (
              <div className={styles.field}>
                <label className={styles.label}>Delivery Address</label>
                <input className={styles.textInput} placeholder="Enter your full address" value={address} onChange={e => setAddress(e.target.value)} />
                <div className={styles.divider} />
              </div>
            )}

            {/* Date */}
            <div className={styles.field}>
              <label className={styles.label}>{mode === 'pickup' ? 'Pickup Date' : 'Delivery Date'}</label>
              <div className={styles.addressRow}>
                <span className={styles.addressText} style={{ color: date ? '#2D2D2D' : '#bbb' }}>
                  {date ? formatDisplayDate(date) : 'Select a date'}
                </span>
                <button className={styles.calBtn} onClick={() => dateRef.current?.showPicker?.() || dateRef.current?.click()}>
                  <Calendar size={20} />
                </button>
                <input ref={dateRef} type="date" min={todayString()} value={date} onChange={e => setDate(e.target.value)} className={styles.hiddenInput} />
              </div>
              <div className={styles.divider} />
            </div>

            {/* Time slots */}
            <div className={styles.field}>
              <label className={styles.label}>{mode === 'pickup' ? 'Pickup Time' : 'Delivery Time'}</label>
              <div className={styles.timeWrap}>
                {canScrollLeft && (
                  <button className={`${styles.scrollBtn} ${styles.scrollLeft}`} onClick={() => setColOffset(o => o - 1)}>
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div className={styles.timeGrid}>
                  {visibleCols.map((col, ci) => (
                    <div key={ci} className={styles.timeCol}>
                      {col.map(slot => (
                        <button key={slot} className={`${styles.timeSlot} ${time === slot ? styles.timeSelected : ''}`} onClick={() => setTime(slot)}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                {canScrollRight && (
                  <button className={`${styles.scrollBtn} ${styles.scrollRight}`} onClick={() => setColOffset(o => o + 1)}>
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
              {time && <p className={styles.selectedTime}>Selected: <strong>{time}</strong></p>}
            </div>

            {/* Event Type */}
            <div className={styles.field}>
              <label className={styles.label}>Event Type</label>
              <input className={styles.textInput} placeholder="Event Type (optional)" value={eventType} onChange={e => setEventType(e.target.value)} />
              <div className={styles.divider} />
            </div>

            {/* Contact */}
            <div className={styles.sectionLabel}>YOUR DETAILS</div>
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name *</label>
                <input className={styles.textInput} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                <div className={styles.divider} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email *</label>
                <input className={styles.textInput} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                <div className={styles.divider} />
              </div>
            </div>
            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input className={styles.textInput} placeholder="+233 ..." value={phone} onChange={e => setPhone(e.target.value)} />
                <div className={styles.divider} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Number of Guests</label>
                <input className={styles.textInput} type="number" min="10" placeholder="Min. 10" value={guests} onChange={e => setGuests(e.target.value)} />
                <div className={styles.divider} />
              </div>
            </div>

            <button
              className={`${styles.submitBtn} ${!step1Valid ? styles.disabled : ''}`}
              onClick={() => step1Valid && setStep(2)}
              disabled={!step1Valid}
            >
              SAVE & BUILD YOUR ORDER
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── step 2: build your package ── */
  const totalSelected = Object.values(selections).filter(v => v > 0).length;

  return (
    <div className={styles.builderPage}>
      {/* Sticky top bar */}
      <div className={styles.builderBar}>
        <div className={styles.builderBarLeft}>
          <span className={styles.builderBarMode}>{mode.toUpperCase()}</span>
          <span className={styles.builderBarSub}>{formatDisplayDate(date)} at {time}</span>
        </div>
        <button className={styles.builderBarEdit} onClick={() => setStep(1)}>EDIT</button>
      </div>

      <div className={styles.builderLayout}>
        {/* Left: categories + items */}
        <div className={styles.builderMain}>
          <h1 className={styles.builderTitle}>BUILD YOUR OWN</h1>
          {pkgName && (
            <div className={styles.builderPkg}>
              <strong>{pkgName}</strong>{pkgPrice ? ` — GHC ${pkgPrice}/person` : ''}
            </div>
          )}

          {allItems.length === 0 && <p style={{ color:'#aaa', padding:'40px 0' }}>Loading items…</p>}

          {categories.map(cat => {
            const catItems = allItems.filter(it => it.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className={styles.catSection}>
                <h2 className={styles.catTitle}>CHOOSE {cat.toUpperCase()}</h2>
                <div className={styles.itemsGrid}>
                  {catItems.map(it => {
                    const qty = selections[it.id] || 0;
                    const selected = qty > 0;
                    const hasPrice = it.price != null;
                    return (
                      <div
                        key={it.id}
                        className={`${styles.itemCard} ${selected ? styles.itemSelected : ''}`}
                        onClick={() => !selected && toggleItem(it.id)}
                      >
                        {it.image_url
                          ? <img src={it.image_url} alt={it.name} className={styles.itemImg} draggable={false} />
                          : <div className={styles.itemImgPlaceholder}>{it.name[0]}</div>
                        }
                        {hasPrice && (
                          <span className={styles.itemPriceBadge}>GHC {Number(it.price).toFixed(2)}</span>
                        )}
                        {selected && (
                          <div className={styles.itemQtyRow}>
                            <button className={styles.qtyBtn} onClick={e => { e.stopPropagation(); changeQty(it.id, -1); }}>−</button>
                            <span className={styles.qtyNum}>{qty}</span>
                            <button className={styles.qtyBtn} onClick={e => { e.stopPropagation(); changeQty(it.id, 1); }}>+</button>
                          </div>
                        )}
                        <p className={styles.itemName}>{it.name.toUpperCase()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: order summary sidebar */}
        <div className={styles.builderSidebar}>
          <h3 className={styles.sidebarTitle}>BUILD YOUR OWN</h3>
          <div className={styles.sidebarRow}>
            <span>Serves {guests || 10} (GHC {pkgPrice}/person)</span>
            <span>GHC {((Number(pkgPrice) || 0) * (Number(guests) || 10)).toFixed(2)}</span>
          </div>
          <div className={styles.sidebarCategories}>
            {categories.map(cat => {
              const picked = allItems.filter(it => it.category === cat && (selections[it.id] || 0) > 0);
              return (
                <div key={cat} className={styles.sidebarCat}>
                  <div className={styles.sidebarCatRow}>
                    <span className={`${styles.sidebarDot} ${picked.length > 0 ? styles.dotFilled : ''}`} />
                    <span className={styles.sidebarCatName}>{cat.toUpperCase()}</span>
                  </div>
                  {picked.map(it => (
                    <p key={it.id} className={styles.sidebarItem}>
                      {it.name}{it.price != null ? ` × ${selections[it.id]} — GHC ${(Number(it.price) * selections[it.id]).toFixed(2)}` : ''}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
          <div className={styles.sidebarDivider} />
          {/* Extras line (drinks / add-ons with individual prices) */}
          {(() => {
            const extrasTotal = allItems
              .filter(it => it.price != null && (selections[it.id] || 0) > 0)
              .reduce((sum, it) => sum + Number(it.price) * selections[it.id], 0);
            return extrasTotal > 0 ? (
              <div className={styles.sidebarRow}>
                <span>Drinks &amp; Add-ons</span>
                <span>GHC {extrasTotal.toFixed(2)}</span>
              </div>
            ) : null;
          })()
          }
          <div className={styles.sidebarTotal}>
            <span>Order Total</span>
            <span>GHC {(
              ((Number(pkgPrice) || 0) * (Number(guests) || 10)) +
              allItems.filter(it => it.price != null && (selections[it.id] || 0) > 0)
                .reduce((sum, it) => sum + Number(it.price) * selections[it.id], 0)
            ).toFixed(2)}</span>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={`${styles.addToBagBtn} ${totalSelected === 0 ? styles.disabled : ''}`}
            onClick={handleSubmit}
            disabled={totalSelected === 0 || submitting}
          >
            {submitting ? 'SUBMITTING…' : `SUBMIT ORDER`}
          </button>
        </div>
      </div>
    </div>
  );
}

