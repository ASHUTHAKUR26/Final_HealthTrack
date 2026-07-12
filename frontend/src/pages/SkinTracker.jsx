import { useState, useEffect } from 'react';
import API from '../utils/api';
import { formatDate } from '../utils/helpers';

const CONDITIONS = ['Acne', 'Dryness', 'Oiliness', 'Redness', 'Sensitivity', 'Hyperpigmentation', 'Wrinkles', 'Pores', 'Dark circles', 'Rash'];
const PRODUCTS = ['Cleanser', 'Toner', 'Moisturizer', 'Sunscreen', 'Serum', 'Eye cream', 'Face mask', 'Exfoliator', 'Retinol', 'Vitamin C'];

export default function SkinTracker() {
  const [products, setProducts] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [frequency, setFrequency] = useState('daily');
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = () =>
    API.get('/health/skin').then(r => setLogs(r.data.data || [])).catch(() => setLogs([]));
  useEffect(() => { fetchLogs(); }, []);

  function toggle(arr, setArr, item) {
    setArr(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      await API.post('/health/skin', { products, conditions, frequency, notes });
      setMsg('success');
      setProducts([]); setConditions([]); setFrequency('daily'); setNotes('');
      fetchLogs();
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Error'));
    } finally { setLoading(false); }
  }

  const chipStyle = (active, color = '#ec4899') => ({
    padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
    borderColor: active ? color : 'var(--color-surface-3)',
    background: active ? `${color}22` : 'var(--color-bg-2)',
    color: active ? color : 'var(--color-muted)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="fade-up">
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>🧴 Skin Tracker</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>
          Log your skincare routine and track skin conditions over time
        </p>
      </div>

      {/* Stats */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { icon: '📅', label: 'Total Logs', value: logs.length, color: '#ec4899' },
          { icon: '🧴', label: 'Products Used', value: new Set(logs.flatMap(l => l.products || [])).size, color: '#8b5cf6' },
          { icon: '⚠️', label: 'Conditions Tracked', value: new Set(logs.flatMap(l => l.conditions || [])).size, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card-hover" style={{ padding: '16px', borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(236,72,153,0.15)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '15px' }}>Log Skincare Routine</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Products */}
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>
              PRODUCTS USED ({products.length} selected)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PRODUCTS.map(p => (
                <button key={p} type="button" onClick={() => toggle(products, setProducts, p)}
                  style={chipStyle(products.includes(p), '#8b5cf6')}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>
              SKIN CONDITIONS TODAY ({conditions.length} selected)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CONDITIONS.map(c => (
                <button key={c} type="button" onClick={() => toggle(conditions, setConditions, c)}
                  style={chipStyle(conditions.includes(c), '#ec4899')}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency & Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>ROUTINE FREQUENCY</label>
              <select className="hts-input" value={frequency} onChange={e => setFrequency(e.target.value)}>
                <option value="daily">Daily (AM + PM)</option>
                <option value="morning">Morning only</option>
                <option value="evening">Evening only</option>
                <option value="weekly">Weekly treatment</option>
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>NOTES (optional)</label>
              <input className="hts-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Tried new serum, skin felt dry after..." />
            </div>
          </div>

          {msg === 'success' && (
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '13px' }}>
              ✅ Skincare routine logged!
            </div>
          )}
          {msg.startsWith('error:') && (
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', fontSize: '13px' }}>
              ❌ {msg.replace('error:', '')}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading}
            style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', boxShadow: '0 4px 14px rgba(236,72,153,0.3)' }}>
            {loading ? '⏳ Saving…' : '🧴 Save Skincare Log'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Recent Logs</h3>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🧴</div>
            <p style={{ fontSize: '13px' }}>No skincare logs yet. Start your routine today!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.slice(0, 6).map(log => (
              <div key={log._id} style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--color-bg-2)', border: '1px solid rgba(236,72,153,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{formatDate(log.date)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-muted)', padding: '3px 10px', borderRadius: '99px', background: 'var(--color-surface-2)' }}>{log.frequency}</span>
                </div>
                {log.products?.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)', marginRight: '6px', fontWeight: 600 }}>PRODUCTS:</span>
                    <span style={{ fontSize: '12px', color: '#c4b5fd' }}>{log.products.join(', ')}</span>
                  </div>
                )}
                {log.conditions?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {log.conditions.map(c => (
                      <span key={c} style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: 'rgba(236,72,153,0.1)', color: '#f9a8d4', border: '1px solid rgba(236,72,153,0.2)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                {log.notes && <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '8px', fontStyle: 'italic' }}>"{log.notes}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
