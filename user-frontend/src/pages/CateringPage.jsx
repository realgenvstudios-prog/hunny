import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Calendar, Users, Phone } from 'lucide-react';
import CateringHero from '../components/CateringHero/CateringHero';
import PopularBuilds from '../components/PopularBuilds/PopularBuilds';
import ChipsDips from '../components/ChipsDips/ChipsDips';
import JuicesBox from '../components/JuicesBox/JuicesBox';
import PerfectOccasion from '../components/PerfectOccasion/PerfectOccasion';
import Footer from '../components/Footer/Footer';
import { supabase } from '../lib/supabase';
import styles from './CateringPage.module.css';

const INITIAL = { name: '', email: '', phone: '', event_date: '', guest_count: '', message: '' };

export default function CateringPage() {
  const location = useLocation();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please fill in your name and email.');
      return;
    }
    setLoading(true);
    const { error: dbError } = await supabase.from('catering_requests').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      event_date: form.event_date || null,
      guest_count: form.guest_count ? parseInt(form.guest_count, 10) : null,
      message: form.message.trim() || null,
    });
    setLoading(false);
    if (dbError) {
      setError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
    }
  }

  return (
    <>
      <CateringHero />
      <PopularBuilds />
      <ChipsDips />
      <JuicesBox />
      <PerfectOccasion />

      {/* ── Booking Form ── */}
      <section id="booking" className={styles.booking}>
        <div className={styles.bookingInner}>

          {/* Left info */}
          <div className={styles.info}>
            <p className={styles.infoLabel}>Catering Inquiry</p>
            <h2 className={styles.infoHeading}>Let's Plan Your Event</h2>
            <p className={styles.infoSub}>
              Fill out the form and our catering team will get back to you within 24 hours to discuss your event details and custom menu.
            </p>
            <div className={styles.infoItems}>
              <div className={styles.infoItem}>
                <div className={styles.iconWrap}><Calendar size={20} /></div>
                <div>
                  <p className={styles.infoItemLabel}>Event Date</p>
                  <p className={styles.infoItemValue}>Bookings 3+ days in advance</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.iconWrap}><Users size={20} /></div>
                <div>
                  <p className={styles.infoItemLabel}>Group Size</p>
                  <p className={styles.infoItemValue}>Minimum 20 guests</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.iconWrap}><Phone size={20} /></div>
                <div>
                  <p className={styles.infoItemLabel}>Questions?</p>
                  <p className={styles.infoItemValue}>+233 20 000 0000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className={styles.formCard}>
            {submitted ? (
              <motion.div
                className={styles.success}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className={styles.successIcon}><CheckCircle size={36} /></div>
                <p className={styles.successTitle}>Request Received!</p>
                <p className={styles.successSub}>We'll reach out to you within 24 hours to confirm your booking.</p>
              </motion.div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {error && <p className={styles.errorMsg}>{error}</p>}

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="cat-name">Full Name *</label>
                    <input id="cat-name" name="name" type="text" className={styles.input} placeholder="e.g. Kofi Mensah" value={form.name} onChange={handleChange} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="cat-email">Email *</label>
                    <input id="cat-email" name="email" type="email" className={styles.input} placeholder="you@example.com" value={form.email} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="cat-phone">Phone</label>
                    <input id="cat-phone" name="phone" type="tel" className={styles.input} placeholder="+233 XX XXX XXXX" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="cat-date">Event Date</label>
                    <input id="cat-date" name="event_date" type="date" className={styles.input} value={form.event_date} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="cat-guests">Number of Guests</label>
                  <input id="cat-guests" name="guest_count" type="number" min="20" className={styles.input} placeholder="e.g. 50" value={form.guest_count} onChange={handleChange} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="cat-message">Additional Details</label>
                  <textarea id="cat-message" name="message" className={styles.textarea} rows="5" placeholder="Tell us about your event, dietary requirements, preferred menu items…" value={form.message} onChange={handleChange} />
                </div>

                <div className={styles.submitRow}>
                  <button type="submit" className={styles.submit} disabled={loading}>
                    {loading ? 'Sending…' : <><Send size={16} /> SEND REQUEST</>}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
