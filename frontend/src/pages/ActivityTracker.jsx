import { useState, useEffect } from 'react';
import API from '../utils/api';
import { formatDate } from '../utils/helpers';

export default function ActivityTracker() {
  const [form, setForm] = useState({ exerciseType: '', duration: '', intensity: 'moderate', notes: '' });
  const [logs, setLogs] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = () => API.get('/health/activity').then(r => setLogs(r.data.data || [])).catch(() => setLogs([]));
  useEffect(() => { fetchLogs(); }, []);

  const presets = [
    { label: 'Running', icon: '🏃', cal: 8 },
    { label: 'Walking', icon: '🚶', cal: 4 },
    { label: 'Cycling', icon: '🚴', cal: 7 },
    { label: 'Swimming', icon: '🏊', cal: 9 },
    { label: 'Yoga', icon: '🧘', cal: 3 },
    { label: 'Gym', icon: '🏋️', cal: 6 },
    { label: 'Dancing', icon: '💃', cal: 5 },
    { label: 'Cricket', icon: '🏏', cal: 5 },
  ];

  const intensityColors = { low: '#10b981', moderate: '#f59e0b', high: '#ef4444' };

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      await API.post('/health/activity', form);
      setMsg('✅ Activity logged!');
      setForm({ exerciseType: '', duration: '', intensity: 'moderate', notes: '' });
      fetchLogs();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error'));
    } finally { setLoading(false); }
  }

  const totalMinutes = logs.reduce((s, l) => s + (l.duration || 0), 0);
  const totalDays = new Set(logs.map(l => new Date(l.date).toDateString())).size;
  const estCalories = logs.reduce((s, l) => {
    const preset = presets.find(p => p.label.toLowerCase() === l.exerciseType?.toLowerCase());
    return s + (preset ? preset.cal * (l.duration || 0) : 5 * (l.duration || 0));
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="fade-up">
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>🏃 Activity Tracker</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Log workouts and stay on top of your fitness goals</p>
      </div>

      {/* Summary */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Total Minutes', value: totalMinutes, icon: '⏱️', color: '#6366f1' },
          { label: 'Active Days', value: totalDays, icon: '📅', color: '#10b981' },
          { label: 'Est. Calories', value: `~${estCalories}`, icon: '🔥', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card-hover" style={{ padding: '16px', borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Log Activity</h3>

        {/* Exercise Presets */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>QUICK SELECT</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {presets.map(p => (
              <button key={p.label} type="button" onClick={() => setForm({ ...form, exerciseType: p.label })}
                style={{
                  padding: '10px 8px', borderRadius: '10px', border: '1px solid',
                  borderColor: form.exerciseType === p.label ? 'var(--color-primary)' : 'var(--color-surface-3)',
                  background: form.exerciseType === p.label ? 'rgba(99,102,241,0.15)' : 'var(--color-bg-2)',
                  color: form.exerciseType === p.label ? 'var(--color-primary-light)' : 'var(--color-muted)',
                  cursor: 'pointer', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: '20px' }}>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>EXERCISE TYPE *</label>
              <input className="hts-input" required value={form.exerciseType} onChange={e => setForm({ ...form, exerciseType: e.target.value })} placeholder="e.g. Running" />
            </div>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>DURATION (mins) *</label>
              <input className="hts-input" type="number" min="1" max="600" required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="30" />
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>INTENSITY</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {['low', 'moderate', 'high'].map(level => (
                <button key={level} type="button" onClick={() => setForm({ ...form, intensity: level })}
                  style={{
                    padding: '10px', borderRadius: '10px', border: '1px solid',
                    borderColor: form.intensity === level ? intensityColors[level] : 'var(--color-surface-3)',
                    background: form.intensity === level ? `${intensityColors[level]}22` : 'var(--color-bg-2)',
                    color: form.intensity === level ? intensityColors[level] : 'var(--color-muted)',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s', textTransform: 'capitalize',
                  }}>
                  {level === 'low' ? '🟢' : level === 'moderate' ? '🟡' : '🔴'} {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>NOTES (optional)</label>
            <input className="hts-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Morning run in the park" />
          </div>

          {msg && <p style={{ fontSize: '13px', padding: '10px 14px', borderRadius: '8px', background: msg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: msg.startsWith('✅') ? '#6ee7b7' : '#fca5a5' }}>{msg}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}>
            {loading ? '⏳ Saving…' : '💪 Log Activity'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Recent Activity</h3>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏃</div>
            <p style={{ fontSize: '13px' }}>No activities logged yet. Get moving!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.slice(0, 8).map(log => {
              const preset = presets.find(p => p.label.toLowerCase() === log.exerciseType?.toLowerCase());
              const calories = preset ? preset.cal * (log.duration || 0) : 5 * (log.duration || 0);
              return (
                <div key={log._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', background: 'var(--color-bg-2)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {preset?.icon || '🏃'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{log.exerciseType}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>{formatDate(log.date)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-light)' }}>⏱ {log.duration}m</span>
                    <span className="badge" style={{ background: `${intensityColors[log.intensity]}22`, color: intensityColors[log.intensity] }}>{log.intensity}</span>
                    <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>🔥~{calories}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
