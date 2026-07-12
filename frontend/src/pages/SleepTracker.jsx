import { useState, useEffect } from 'react';
import API from '../utils/api';
import { formatDate } from '../utils/helpers';

const qualityLabels = ['', '😞 Poor', '😕 Fair', '😐 Okay', '😊 Good', '😄 Great'];
const qualityColors = ['', '#ef4444', '#f59e0b', '#6b7280', '#10b981', '#06b6d4'];

export default function SleepTracker() {
  const [form, setForm] = useState({ duration: '', bedtime: '', wakeTime: '', quality: 3 });
  const [logs, setLogs] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = () => API.get('/health/sleep').then(r => setLogs(r.data.data)).catch(console.error);
  useEffect(() => { fetchLogs(); }, []);

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      await API.post('/health/sleep', form);
      setMsg('success');
      setForm({ duration: '', bedtime: '', wakeTime: '', quality: 3 });
      fetchLogs();
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Error saving log'));
    } finally { setLoading(false); }
  }

  const avgDuration = logs.length ? (logs.reduce((s,l) => s+l.duration,0)/logs.length).toFixed(1) : 0;
  const avgQuality = logs.length ? (logs.reduce((s,l) => s+(l.quality||0),0)/logs.length).toFixed(1) : 0;
  const bestSleep = logs.length ? Math.max(...logs.map(l => l.duration)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="fade-up">
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>🛌 Sleep Tracker</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Track sleep patterns and build healthy rest habits</p>
      </div>

      {/* Stats */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Avg Duration', value: `${avgDuration}h`, icon: '⏱️', color: '#6366f1' },
          { label: 'Avg Quality', value: `${avgQuality}/5`, icon: '⭐', color: '#f59e0b' },
          { label: 'Best Sleep', value: `${bestSleep}h`, icon: '🏆', color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="card-hover" style={{ padding: '16px', borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '15px' }}>Log Tonight's Sleep</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>BEDTIME</label>
              <input className="hts-input" type="time" value={form.bedtime} onChange={e => setForm({ ...form, bedtime: e.target.value })} />
            </div>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>WAKE TIME</label>
              <input className="hts-input" type="time" value={form.wakeTime} onChange={e => setForm({ ...form, wakeTime: e.target.value })} />
            </div>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>DURATION (hrs) *</label>
              <input className="hts-input" type="number" min="0" max="24" step="0.5" required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="7.5" />
            </div>
          </div>

          {/* Quality Selector */}
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '12px', letterSpacing: '0.05em' }}>
              SLEEP QUALITY — <span style={{ color: qualityColors[form.quality] }}>{qualityLabels[form.quality]}</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {[1,2,3,4,5].map(q => (
                <button key={q} type="button" onClick={() => setForm({ ...form, quality: q })}
                  style={{
                    padding: '12px 8px', borderRadius: '12px', border: '1px solid',
                    borderColor: form.quality === q ? qualityColors[q] : 'var(--color-surface-3)',
                    background: form.quality === q ? `${qualityColors[q]}22` : 'var(--color-bg-2)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    transition: 'all 0.15s',
                  }}>
                  <span style={{ fontSize: '20px' }}>{['','😞','😕','😐','😊','😄'][q]}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: form.quality === q ? qualityColors[q] : 'var(--color-muted)' }}>{['','Poor','Fair','Okay','Good','Great'][q]}</span>
                </button>
              ))}
            </div>
          </div>

          {msg === 'success' && <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '13px' }}>✅ Sleep logged successfully!</div>}
          {msg.startsWith('error:') && <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '13px' }}>❌ {msg.replace('error:', '')}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? '⏳ Saving…' : '🛌 Save Sleep Log'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Recent Logs</h3>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛌</div>
            <p style={{ fontSize: '13px' }}>No sleep logs yet. Log your first night!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {logs.slice(0, 7).map(log => (
              <div key={log._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', background: 'var(--color-bg-2)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🛌</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{formatDate(log.date)}</div>
                  {log.bedtime && <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>{log.bedtime} → {log.wakeTime}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-light)', fontSize: '12px', fontWeight: 700 }}>⏱ {log.duration}h</span>
                  {log.quality && <span className="badge" style={{ background: `${qualityColors[log.quality]}22`, color: qualityColors[log.quality] }}>{qualityLabels[log.quality]}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
