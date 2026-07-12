import { useState, useEffect } from 'react';
import API from '../utils/api';
import { formatDate } from '../utils/helpers';

const DOMAINS = ['Skin', 'Gut', 'Stress', 'Sleep', 'Other'];
const DOMAIN_META = {
  Skin:   { icon: '🧴', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
  Gut:    { icon: '🫁', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  Stress: { icon: '😰', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  Sleep:  { icon: '🛌', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
  Other:  { icon: '🩺', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
};

export default function SymptomChecker() {
  const [form, setForm] = useState({ domain: 'Skin', symptom: '', severity: 3, duration: '', trigger: '' });
  const [logs, setLogs] = useState([]);
  const [latestSuggestion, setLatestSuggestion] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = () => API.get('/health/symptoms').then(r => setLogs(r.data.data)).catch(console.error);
  useEffect(() => { fetchLogs(); }, []);

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setMsg(''); setLatestSuggestion('');
    try {
      const res = await API.post('/health/symptoms', form);
      setLatestSuggestion(res.data.data.suggestion || '');
      setMsg('success');
      setForm({ domain: 'Skin', symptom: '', severity: 3, duration: '', trigger: '' });
      fetchLogs();
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Error'));
    } finally { setLoading(false); }
  }

  const severityMeta = ['', { label: 'Very Mild', color: '#10b981' }, { label: 'Mild', color: '#06b6d4' }, { label: 'Moderate', color: '#f59e0b' }, { label: 'Severe', color: '#f97316' }, { label: 'Very Severe', color: '#ef4444' }];
  const dm = DOMAIN_META[form.domain];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="fade-up">
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>🩺 Symptom Checker</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Log symptoms and get rule-based wellness guidance</p>
      </div>

      {/* Domain Tabs */}
      <div className="fade-up" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {DOMAINS.map(d => {
          const m = DOMAIN_META[d];
          const active = form.domain === d;
          return (
            <button key={d} onClick={() => setForm({ ...form, domain: d })}
              style={{ padding: '10px 18px', borderRadius: '12px', border: '1px solid', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px',
                borderColor: active ? m.color : 'var(--color-surface-3)',
                background: active ? m.bg : 'var(--color-surface)',
                color: active ? m.color : 'var(--color-muted)',
                boxShadow: active ? `0 0 12px ${m.color}44` : 'none',
              }}>
              <span>{m.icon}</span> {d}
            </button>
          );
        })}
      </div>

      {/* Suggestion (if any) */}
      {latestSuggestion && (
        <div className="fade-up" style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>💡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#6ee7b7', marginBottom: '4px' }}>Wellness Suggestion</div>
              <p style={{ fontSize: '13px', color: 'var(--color-muted-light)', lineHeight: 1.6 }}>{latestSuggestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: `1px solid ${dm.border}`, boxShadow: `0 0 20px ${dm.color}11` }}>
        <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{dm.icon}</span> Log {form.domain} Symptom
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>DESCRIBE YOUR SYMPTOM *</label>
            <input className="hts-input" required value={form.symptom} onChange={e => setForm({ ...form, symptom: e.target.value })}
              placeholder={{ Skin: 'e.g. acne breakout, dryness, redness', Gut: 'e.g. bloating, nausea, cramps', Stress: 'e.g. anxiety, headache, irritability', Sleep: 'e.g. insomnia, oversleeping, nightmares', Other: 'Describe your symptom...' }[form.domain]} />
          </div>

          {/* Severity */}
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>
              SEVERITY — <span style={{ color: severityMeta[form.severity]?.color }}>{severityMeta[form.severity]?.label}</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setForm({ ...form, severity: s })}
                  style={{ padding: '12px 6px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    borderColor: form.severity === s ? severityMeta[s].color : 'var(--color-surface-3)',
                    background: form.severity === s ? `${severityMeta[s].color}22` : 'var(--color-bg-2)',
                    color: form.severity === s ? severityMeta[s].color : 'var(--color-muted)',
                    fontSize: '11px', fontWeight: 600,
                  }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{['','😌','🙁','😟','😣','😫'][s]}</div>
                  {severityMeta[s]?.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>DURATION</label>
              <input className="hts-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2 days" />
            </div>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>POSSIBLE TRIGGER</label>
              <input className="hts-input" value={form.trigger} onChange={e => setForm({ ...form, trigger: e.target.value })} placeholder="e.g. stress, bad food" />
            </div>
          </div>

          {msg === 'success' && <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '13px' }}>✅ Symptom logged!</div>}
          {msg.startsWith('error:') && <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', fontSize: '13px' }}>❌ {msg.replace('error:', '')}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ background: `linear-gradient(135deg, ${dm.color}, ${dm.color}cc)`, boxShadow: `0 4px 14px ${dm.color}44` }}>
            {loading ? '🔍 Analyzing…' : `${dm.icon} Log & Get Suggestion`}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Recent Symptoms</h3>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🩺</div>
            <p style={{ fontSize: '13px' }}>No symptoms logged yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.slice(0, 8).map(log => {
              const m = DOMAIN_META[log.domain] || DOMAIN_META.Other;
              return (
                <div key={log._id} style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--color-bg-2)', border: `1px solid ${m.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: log.suggestion ? '10px' : '0' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px' }}>{m.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{log.symptom}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>{log.domain} • {formatDate(log.date)}</div>
                      </div>
                    </div>
                    <span className="badge" style={{ background: `${severityMeta[log.severity]?.color}22`, color: severityMeta[log.severity]?.color, border: `1px solid ${severityMeta[log.severity]?.color}44`, flexShrink: 0 }}>
                      {severityMeta[log.severity]?.label}
                    </span>
                  </div>
                  {log.suggestion && (
                    <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}>
                      <span style={{ fontSize: '14px', flexShrink: 0 }}>💡</span>
                      <p style={{ fontSize: '12px', color: 'var(--color-muted-light)', lineHeight: 1.5 }}>{log.suggestion}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
