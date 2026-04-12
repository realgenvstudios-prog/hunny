import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import styles from './AuthPage.module.css';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export default function AuthPage() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'join'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isJoin && form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    if (isJoin) {
      const { error: err } = await signUp({
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
      });
      if (err) {
        setError(err.message);
      } else {
        setError('');
        // Supabase sends a confirmation email — let the user know
        setMode('confirm');
      }
    } else {
      const { error: err } = await signIn({ email: form.email, password: form.password });
      if (err) {
        setError(err.message);
      } else {
        navigate('/');
      }
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const isJoin = mode === 'join';
  const isConfirm = mode === 'confirm';

  return (
    <>
      <section className={styles.page}>
        {/* ── Decorative blob ── */}
        <div className={styles.blob} />

        <div className={styles.card}>
          {/* Brand mark */}
          <Link to="/" className={styles.brand}>HUNNY</Link>

          {/* Confirmation screen */}
          {isConfirm ? (
            <div className={styles.confirmBox}>
              <h2 className={styles.confirmTitle}>Check your email</h2>
              <p className={styles.subtitle}>
                We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
              </p>
              <button className={styles.switchBtn} onClick={() => setMode('signin')}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
          {/* Toggle tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${!isJoin ? styles.tabActive : ''}`}
              onClick={() => { setMode('signin'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`${styles.tab} ${isJoin ? styles.tabActive : ''}`}
              onClick={() => { setMode('join'); setError(''); }}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} {...fadeUp}>
              <p className={styles.subtitle}>
                {isJoin
                  ? 'Join Hunny and start ordering fresh food today.'
                  : 'Welcome back! Sign in to your account.'}
              </p>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {/* Name — join only */}
                {isJoin && (
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
                )}

                {/* Phone — join only */}
                {isJoin && (
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={styles.input}
                      placeholder="+233 XX XXX XXXX"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                    />
                  </div>
                )}

                {/* Email */}
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

                {/* Password */}
                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label className={styles.label} htmlFor="password">Password</label>
                    {!isJoin && (
                      <Link to="/forgot-password" className={styles.forgot}>
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className={styles.inputWrap}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete={isJoin ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password — join only */}
                {isJoin && (
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="confirm">Confirm Password</label>
                    <div className={styles.inputWrap}>
                      <input
                        id="confirm"
                        name="confirm"
                        type={showConfirm ? 'text' : 'password'}
                        className={styles.input}
                        placeholder="••••••••"
                        value={form.confirm}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                <button type="submit" className={styles.submit} disabled={loading}>
                  {loading ? 'Please wait…' : (isJoin ? 'CREATE ACCOUNT' : 'SIGN IN')} {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              {/* Divider */}
              <div className={styles.divider}><span>or continue with</span></div>

              {/* Google OAuth */}
              <button className={styles.googleBtn} onClick={handleGoogle} type="button">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                  <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.9 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
                  <path d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z" fill="#FF3D00"/>
                  <path d="M24 45c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.5C29.7 35.9 27 37 24 37c-6.1 0-10.7-3.1-11.8-7.5l-7 5.4C8.1 41 15.5 45 24 45z" fill="#4CAF50"/>
                  <path d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.7-4.9 6.1l6.6 5.5C41.7 36.6 45 31 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
                </svg>
                Continue with Google
              </button>

              <p className={styles.switchText}>
                {isJoin ? 'Already have an account? ' : "Don't have an account? "}
                <button className={styles.switchBtn} onClick={() => { setMode(isJoin ? 'signin' : 'join'); setError(''); }}>
                  {isJoin ? 'Sign in' : 'Create one'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
          </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
