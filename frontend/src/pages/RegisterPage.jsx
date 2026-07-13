import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuthContext } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [form, setForm] = useState({ name: '', email: '', password: '', gender: 'prefer-not-to-say', age: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  const perks = [
    { icon: '📊', text: 'Visual analytics dashboard' },
    { icon: '🔐', text: 'Secure JWT authentication' },
    { icon: '💡', text: 'AI-powered symptom guidance' },
    { icon: '📱', text: 'Mobile-friendly design' },
    { icon: '🎯', text: 'Habit consistency tracking' },
    { icon: '📝', text: 'Daily wellness journal' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)' }}>
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-between p-12" style={{
        width: '42%',
        background: 'linear-gradient(160deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.05) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>H</div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '18px', background: 'linear-gradient(135deg, #6ee7b7, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HealthTrack</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.2, fontFamily: 'Space Grotesk', marginBottom: '16px' }}>
            Start your<br />
            <span style={{ background: 'linear-gradient(135deg, #6ee7b7, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              wellness journey.
            </span>
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
            Join students who are taking charge of their health — one log at a time. Free forever, no credit card.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {perks.map(p => (
              <div key={p.text} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '16px' }}>{p.icon}</span>
                <span style={{ color: 'var(--color-muted-light)', fontSize: '12px', lineHeight: 1.3 }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'var(--color-muted)', fontSize: '12px', position: 'relative', zIndex: 1 }}>
          B.Tech CSE Project · Techno Bengal Institute of Technology
        </p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '380px' }} className="fade-up">
          <h2 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: '6px' }}>Create account</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginBottom: '28px' }}>Free forever. No credit card needed.</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', display: 'flex', gap: '8px' }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.07em' }}>FULL NAME</label>
              <input className="hts-input" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name" autoComplete="name" />
            </div>
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
                  placeholder="Min. 6 characters" autoComplete="new-password" style={{ paddingRight: '46px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '17px', lineHeight: 1 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.07em' }}>AGE</label>
                <input className="hts-input" type="number" min="10" max="100"
                  value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="20" />
              </div>
              <div>
                <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.07em' }}>GENDER</label>
                <select className="hts-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', marginTop: '10px', fontSize: '15px', padding: '14px', background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 4px 18px rgba(16,185,129,0.35)' }}>
              {loading ? '⏳  Creating account…' : 'Create Account  →'}
            </button>
          </form>

          <p style={{ color: 'var(--color-muted)', fontSize: '13px', marginTop: '24px', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6ee7b7', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
