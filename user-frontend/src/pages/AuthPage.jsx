import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import { useAuth } from '../context/AuthContext';
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
