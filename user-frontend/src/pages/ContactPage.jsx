import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer/Footer';
import { supabase } from '../lib/supabase';
import styles from './ContactPage.module.css';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await supabase
      .from('contact_messages')
      .insert({ name: form.name, email: form.email, message: `[${form.subject}] ${form.message}` });

    setLoading(false);
    if (err) {
      setError('Something went wrong. Please try again.');
    } else {
      setSent(true);
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <motion.p className={styles.heroLabel} {...fadeUp(0)}>
          GET IN TOUCH
        </motion.p>
        <motion.h1 className={styles.heroHeading} {...fadeUp(0.08)}>
          WE'D LOVE TO<br />HEAR FROM YOU
        </motion.h1>
        <motion.p className={styles.heroSub} {...fadeUp(0.16)}>
          Questions, feedback, catering inquiries — we're always happy to chat.
        </motion.p>
      </section>

      {/* ── Body ── */}
      <section className={styles.body}>
        <div className={styles.inner}>

          {/* Left info */}
          <motion.div className={styles.info} {...fadeUp(0)}>
            <h2 className={styles.infoHeading}>REACH US</h2>

            <div className={styles.infoItem}>
              <span className={styles.iconWrap}><MapPin size={20} /></span>
              <div>
                <p className={styles.infoLabel}>Our Location</p>
                <p className={styles.infoValue}>14 Cantonments Rd, Accra, Ghana</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.iconWrap}><Phone size={20} /></span>
              <div>
                <p className={styles.infoLabel}>Call Us</p>
                <p className={styles.infoValue}>+233 24 000 0000</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.iconWrap}><Mail size={20} /></span>
              <div>
                <p className={styles.infoLabel}>Email Us</p>
                <p className={styles.infoValue}>hello@hunny.com</p>
              </div>
            </div>

            <div className={styles.hours}>
              <p className={styles.infoLabel}>Opening Hours</p>
              <p className={styles.infoValue}>Mon – Fri &nbsp;8:00am – 10:00pm</p>
              <p className={styles.infoValue}>Sat – Sun &nbsp;9:00am – 11:00pm</p>
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div className={styles.formWrap} {...fadeUp(0.1)}>
            {sent ? (
              <div className={styles.thankYou}>
                <h3 className={styles.thankHeading}>MESSAGE SENT!</h3>
                <p className={styles.thankText}>
                  Thanks for reaching out — we'll get back to you within 24 hours.
                </p>
                <button className={styles.resetBtn} onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                  Send another
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={styles.input}
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={styles.input}
                      placeholder="jane@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    className={styles.input}
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    className={styles.textarea}
                    placeholder="Tell us anything..."
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}

                <button type="submit" className={styles.submit} disabled={loading}>
                  {loading ? 'Sending…' : <> SEND MESSAGE <ArrowRight size={18} /> </>}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </section>

      <Footer />
    </>
  );
}
