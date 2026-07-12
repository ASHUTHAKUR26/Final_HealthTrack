export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem('hts_user') || '{}');
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'HT';

  const stats = [
    { label: 'Member Since', value: 'This session', icon: '📅' },
    { label: 'Data Privacy', value: 'JWT Secured', icon: '🔐' },
    { label: 'Platform', value: 'HealthTrack v1.0', icon: '💚' },
  ];

  const features = [
    { icon: '🛌', label: 'Sleep Tracking', desc: 'Monitor duration, quality & consistency' },
    { icon: '🥗', label: 'Nutrition Log', desc: 'Track meals, calories & hydration' },
    { icon: '🏃', label: 'Activity Tracker', desc: 'Log workouts & estimate calories burned' },
    { icon: '🩺', label: 'Symptom Checker', desc: 'Rule-based wellness guidance' },
    { icon: '🧠', label: 'Mood & Journal', desc: 'Track emotions and write freely' },
    { icon: '📊', label: 'Analytics Dashboard', desc: 'Visual insights & trend analysis' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="fade-up">
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>My Profile</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Your account details and platform overview</p>
      </div>

      {/* Profile Card */}
      <div className="fade-up" style={{ padding: '28px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, color: 'white', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)', flexShrink: 0 }}>{initials}</div>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{user.name || 'User'}</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '2px' }}>{user.email || 'No email'}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary-light)', border: '1px solid rgba(99,102,241,0.2)' }}>✅ Active User</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '24px' }}>
          {stats.map(s => (
            <div key={s.label} style={{ padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Platform Features</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {features.map(f => (
            <div key={f.label} style={{ display: 'flex', gap: '12px', padding: '14px', borderRadius: '12px', background: 'var(--color-bg-2)', border: '1px solid rgba(255,255,255,0.03)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{f.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Tech Stack</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['React.js','Node.js','Express.js','MongoDB','Mongoose','JWT','Bcrypt.js','Chart.js','Tailwind CSS','Vite'].map(t => (
            <span key={t} className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted-light)', border: '1px solid var(--color-surface-3)', padding: '5px 12px' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
