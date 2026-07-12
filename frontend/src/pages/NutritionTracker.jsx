import { useState, useEffect } from 'react';
import API from '../utils/api';
import { formatDate } from '../utils/helpers';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const mealIcons  = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };

export default function NutritionTracker() {
  const [meals,           setMeals]           = useState([{ type: 'Breakfast', description: '', calories: '' }]);
  const [waterIntake,     setWaterIntake]     = useState(0);
  const [nutritionRating, setNutritionRating] = useState(3);
  const [logs,            setLogs]            = useState([]);
  const [msg,             setMsg]             = useState('');
  const [loading,         setLoading]         = useState(false);

  const fetchLogs = () =>
    API.get('/health/nutrition').then(r => setLogs(r.data.data)).catch(console.error);

  useEffect(() => { fetchLogs(); }, []);

  function addMeal()  { setMeals([...meals, { type: 'Snack', description: '', calories: '' }]); }
  function removeMeal(i) { setMeals(meals.filter((_, idx) => idx !== i)); }
  function updateMeal(i, field, val) {
    const u = [...meals]; u[i][field] = val; setMeals(u);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      // Clean meals — ensure type is plain string (no emoji prefix)
      const cleanMeals = meals.map(m => ({
        type:        m.type,          // already clean — value={t} ensures this
        description: m.description,
        calories:    m.calories ? Number(m.calories) : undefined,
      }));
      await API.post('/health/nutrition', {
        meals: cleanMeals,
        waterIntake,
        nutritionRating,
      });
      setMsg('success');
      setMeals([{ type: 'Breakfast', description: '', calories: '' }]);
      setWaterIntake(0); setNutritionRating(3);
      fetchLogs();
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Error saving log'));
    } finally { setLoading(false); }
  }

  const totalCalories = meals.reduce((s, m) => s + (Number(m.calories) || 0), 0);
  const waterGlasses  = Math.round(waterIntake / 0.25);
  const ratingColors  = ['', '#ef4444', '#f59e0b', '#6b7280', '#10b981', '#06b6d4'];
  const inputStyle    = { background: 'var(--color-bg-2)', border: '1px solid var(--color-surface-3)', color: 'var(--color-text)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="fade-up">
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>🥗 Nutrition Tracker</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Log meals, track calories and stay hydrated</p>
      </div>

      {/* Water Intake Widget */}
      <div className="fade-up" style={{ padding: '20px 24px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(99,102,241,0.05))', border: '1px solid rgba(6,182,212,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '15px' }}>💧 Water Intake</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '12px', marginTop: '2px' }}>Goal: 2.5L / day</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk', color: '#06b6d4' }}>{waterIntake}L</span>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>~{waterGlasses} glasses</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <button key={i} type="button"
              onClick={() => setWaterIntake(Number(((i + 1) * 0.25).toFixed(2)))}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s',
                borderColor: waterIntake >= (i + 1) * 0.25 ? '#06b6d4' : 'var(--color-surface-3)',
                background:  waterIntake >= (i + 1) * 0.25 ? 'rgba(6,182,212,0.2)' : 'var(--color-bg-2)',
              }}>💧</button>
          ))}
        </div>
        <input type="range" min="0" max="4" step="0.25" value={waterIntake}
          onChange={e => setWaterIntake(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#06b6d4' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>
          <span>0L</span><span>4L</span>
        </div>
      </div>

      {/* Meal Form */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '15px' }}>Today's Meals</h3>
          {totalCalories > 0 && (
            <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
              🔥 {totalCalories} kcal total
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {meals.map((meal, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>

              {/* ── KEY FIX: value={t} ensures only "Lunch" not "☀️ Lunch" is stored ── */}
              <select
                className="hts-input"
                value={meal.type}
                onChange={e => updateMeal(i, 'type', e.target.value)}
                style={{ width: '140px', ...inputStyle }}
              >
                {MEAL_TYPES.map(t => (
                  <option key={t} value={t}>
                    {mealIcons[t]} {t}
                  </option>
                ))}
              </select>

              <input className="hts-input" placeholder="What did you eat?"
                value={meal.description} onChange={e => updateMeal(i, 'description', e.target.value)}
                style={inputStyle} />
              <input className="hts-input" type="number" placeholder="Calories"
                value={meal.calories} onChange={e => updateMeal(i, 'calories', e.target.value)}
                style={inputStyle} />
              {i > 0 && (
                <button type="button" onClick={() => removeMeal(i)}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addMeal}
            style={{ background: 'none', border: '1px dashed var(--color-surface-3)', color: 'var(--color-muted)', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.color = 'var(--color-primary-light)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--color-surface-3)'; e.target.style.color = 'var(--color-muted)'; }}>
            + Add another meal
          </button>

          {/* Nutrition Quality Rating */}
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>
              NUTRITION QUALITY
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} type="button" onClick={() => setNutritionRating(r)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontSize: '18px', transition: 'all 0.15s',
                    borderColor: nutritionRating === r ? ratingColors[r] : 'var(--color-surface-3)',
                    background:  nutritionRating === r ? `${ratingColors[r]}22` : 'var(--color-bg-2)',
                  }}>
                  {'⭐'.repeat(r)}
                </button>
              ))}
            </div>
          </div>

          {msg === 'success' && (
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '13px' }}>
              ✅ Nutrition logged successfully!
            </div>
          )}
          {msg.startsWith('error:') && (
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', fontSize: '13px' }}>
              ❌ {msg.replace('error:', '')}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading}
            style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
            {loading ? '⏳ Saving…' : '🥗 Save Nutrition Log'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Recent Logs</h3>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🥗</div>
            <p style={{ fontSize: '13px' }}>No nutrition logs yet. Start tracking today!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.slice(0, 5).map(log => (
              <div key={log._id} style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--color-bg-2)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{formatDate(log.date)}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge" style={{ background: 'rgba(6,182,212,0.1)', color: '#67e8f9' }}>💧 {log.waterIntake || 0}L</span>
                    <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>🔥 {log.meals?.reduce((s, m) => s + (m.calories || 0), 0)} kcal</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {log.meals?.map((m, i) => (
                    <span key={i} className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted-light)', border: '1px solid var(--color-surface-3)' }}>
                      {mealIcons[m.type] || '🍽'} {m.description || m.type} {m.calories ? `(${m.calories} kcal)` : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
