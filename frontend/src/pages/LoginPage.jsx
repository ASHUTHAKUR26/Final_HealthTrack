import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  }

  const features = ['🛌 Sleep Tracking', '🥗 Nutrition Log', '🏃 Activity Tracker', '🩺 Symptom Checker', '🧠 Mood Journal'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)' }}>
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-between p-12" style={{
        width: '45%',
        background: 'linear-gradient(160deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.05) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>H</div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '18px', background: 'linear-gradient(135deg, #818cf8, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HealthTrack</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1.15, fontFamily: 'Space Grotesk' }}>
            Your wellness,<br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              all in one place.
            </span>
          </h1>
          <p style={{ color: 'var(--color-muted)', marginTop: '16px', fontSize: '15px', lineHeight: 1.7, maxWidth: '340px' }}>
            A science-backed wellness platform built for students. Track every aspect of your health in one dashboard.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '28px' }}>
            {features.map(f => (
              <span key={f} style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>{f}</span>
            ))}
          </div>
        </div>

        <p style={{ color: 'var(--color-muted)', fontSize: '12px', position: 'relative', zIndex: 1 }}>
          B.Tech CSE Project · Techno Bengal Institute of Technology
        </p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ width: '100%', maxWidth: '360px' }} className="fade-up">
          {/* Mobile logo */}
          <div className="md:hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>H</div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, background: 'linear-gradient(135deg, #818cf8, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HealthTrack</span>
          </div>

          <h2 style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginBottom: '32px' }}>Sign in to continue your wellness journey</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.07em' }}>EMAIL ADDRESS</label>
              <input className="hts-input" type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.07em' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input className="hts-input" type={showPass ? 'text' : 'password'} required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" autoComplete="current-password" style={{ paddingRight: '46px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '17px', lineHeight: 1 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '8px', fontSize: '15px', padding: '14px' }}>
              {loading ? '⏳  Signing in…' : 'Sign In  →'}
            </button>
          </form>

          <p style={{ color: 'var(--color-muted)', fontSize: '13px', marginTop: '28px', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
