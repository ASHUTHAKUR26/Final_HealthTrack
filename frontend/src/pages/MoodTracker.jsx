import { useState, useEffect } from 'react';
import API from '../utils/api';
import { formatDate } from '../utils/helpers';

const moods = [
  { val: 1, emoji: '😞', label: 'Very Sad', color: '#ef4444' },
  { val: 2, emoji: '😕', label: 'Sad', color: '#f97316' },
  { val: 3, emoji: '😐', label: 'Neutral', color: '#6b7280' },
  { val: 4, emoji: '😊', label: 'Happy', color: '#10b981' },
  { val: 5, emoji: '😄', label: 'Very Happy', color: '#06b6d4' },
];
const stressLabels = ['', 'Calm', 'Low', 'Moderate', 'High', 'Very High'];
const stressColors = ['', '#10b981', '#06b6d4', '#f59e0b', '#f97316', '#ef4444'];

export default function MoodTracker() {
  const [form, setForm] = useState({ moodRating: 3, stressLevel: 2, journal: '' });
  const [logs, setLogs] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = () => API.get('/health/mood').then(r => setLogs(r.data.data)).catch(console.error);
  useEffect(() => { fetchLogs(); }, []);

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      await API.post('/health/mood', form);
      setMsg('success');
      setForm({ moodRating: 3, stressLevel: 2, journal: '' });
      fetchLogs();
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Error'));
    } finally { setLoading(false); }
  }

  const currentMood = moods.find(m => m.val === form.moodRating);
  const avgMood = logs.length ? (logs.reduce((s,l) => s+l.moodRating,0)/logs.length).toFixed(1) : 0;
  const avgStress = logs.length ? (logs.reduce((s,l) => s+l.stressLevel,0)/logs.length).toFixed(1) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="fade-up">
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>🧠 Mood & Wellness</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Track your emotional health and journal your thoughts</p>
      </div>

      {/* Stats */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Avg Mood', value: `${avgMood}/5`, icon: '😊', color: '#10b981' },
          { label: 'Avg Stress', value: `${avgStress}/5`, icon: '😰', color: '#f59e0b' },
          { label: 'Entries', value: logs.length, icon: '📝', color: '#6366f1' },
        ].map(s => (
          <div key={s.label} className="card-hover" style={{ padding: '16px', borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mood Selector */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: `linear-gradient(135deg, ${currentMood?.color}11, transparent)`, border: `1px solid ${currentMood?.color}33` }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px', textAlign: 'center' }}>How are you feeling right now?</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          {moods.map(m => (
            <button key={m.val} type="button" onClick={() => setForm({ ...form, moodRating: m.val })}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px 16px', borderRadius: '14px', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                borderColor: form.moodRating === m.val ? m.color : 'var(--color-surface-3)',
                background: form.moodRating === m.val ? `${m.color}22` : 'var(--color-bg-2)',
                transform: form.moodRating === m.val ? 'scale(1.1)' : 'scale(1)',
                boxShadow: form.moodRating === m.val ? `0 4px 16px ${m.color}44` : 'none',
              }}>
              <span style={{ fontSize: '32px' }}>{m.emoji}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: form.moodRating === m.val ? m.color : 'var(--color-muted)' }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stress Level */}
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>
              STRESS LEVEL — <span style={{ color: stressColors[form.stressLevel] }}>{stressLabels[form.stressLevel]}</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setForm({ ...form, stressLevel: s })}
                  style={{ padding: '10px 6px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    borderColor: form.stressLevel === s ? stressColors[s] : 'var(--color-surface-3)',
                    background: form.stressLevel === s ? `${stressColors[s]}22` : 'var(--color-bg-2)',
                    color: form.stressLevel === s ? stressColors[s] : 'var(--color-muted)',
                    fontSize: '11px', fontWeight: 600,
                  }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{['','😌','🙂','😐','😤','🤯'][s]}</div>
                  {stressLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Journal */}
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>JOURNAL (optional)</label>
            <textarea className="hts-input" value={form.journal} onChange={e => setForm({ ...form, journal: e.target.value })}
              rows={4} placeholder="Write freely... What's on your mind today? What went well? What challenged you?"
              style={{ resize: 'vertical', lineHeight: 1.6 }} />
            <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>{form.journal.length} characters</p>
          </div>

          {msg === 'success' && <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '13px' }}>✅ Mood logged!</div>}
          {msg.startsWith('error:') && <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', fontSize: '13px' }}>❌ {msg.replace('error:', '')}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ background: `linear-gradient(135deg, ${currentMood?.color}, ${currentMood?.color}cc)`, boxShadow: `0 4px 14px ${currentMood?.color}44` }}>
            {loading ? '⏳ Saving…' : `${currentMood?.emoji} Save Mood`}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Mood History</h3>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🧠</div>
            <p style={{ fontSize: '13px' }}>No mood entries yet. How are you feeling?</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.slice(0, 8).map(log => {
              const m = moods.find(x => x.val === log.moodRating) || moods[2];
              return (
                <div key={log._id} style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--color-bg-2)', border: `1px solid ${m.color}22` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px', flexShrink: 0 }}>{m.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: m.color }}>{m.label}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span className="badge" style={{ background: `${stressColors[log.stressLevel]}22`, color: stressColors[log.stressLevel] }}>
                            😰 {stressLabels[log.stressLevel]}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{formatDate(log.date)}</span>
                        </div>
                      </div>
                      {log.journal && (
                        <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '6px', lineHeight: 1.5, fontStyle: 'italic', borderLeft: `2px solid ${m.color}44`, paddingLeft: '10px' }}>
                          "{log.journal.slice(0, 120)}{log.journal.length > 120 ? '…' : ''}"
                        </p>
                      )}
                    </div>
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
