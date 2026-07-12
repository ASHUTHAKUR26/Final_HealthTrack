import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import API from '../utils/api';
import { formatDate } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// ─── Correlation Engine ────────────────────────────────────────────────────────
function correlate(arr1, arr2) {
  if (arr1.length < 3 || arr2.length < 3) return null;
  const n = Math.min(arr1.length, arr2.length);
  const a = arr1.slice(0, n); const b = arr2.slice(0, n);
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  const num = a.reduce((s, v, i) => s + (v - meanA) * (b[i] - meanB), 0);
  const den = Math.sqrt(a.reduce((s, v) => s + (v - meanA) ** 2, 0) * b.reduce((s, v) => s + (v - meanB) ** 2, 0));
  return den === 0 ? 0 : Math.round((num / den) * 100) / 100;
}

function getCorrelationLabel(r) {
  if (r === null) return { label: 'Not enough data', color: '#6b7280', strength: 0 };
  const abs = Math.abs(r);
  if (abs >= 0.7) return { label: r > 0 ? 'Strong positive' : 'Strong negative', color: r > 0 ? '#10b981' : '#ef4444', strength: abs };
  if (abs >= 0.4) return { label: r > 0 ? 'Moderate positive' : 'Moderate negative', color: r > 0 ? '#06b6d4' : '#f97316', strength: abs };
  if (abs >= 0.2) return { label: r > 0 ? 'Weak positive' : 'Weak negative', color: r > 0 ? '#818cf8' : '#fbbf24', strength: abs };
  return { label: 'No significant link', color: '#6b7280', strength: abs };
}

function getInsight(key, r) {
  if (r === null || Math.abs(r) < 0.2) return null;
  const insights = {
    sleep_mood:       r > 0 ? "😊 More sleep = better mood for you. Aim for 7–9 hours consistently." : "Interesting — your mood doesn't seem to depend heavily on sleep duration.",
    sleep_stress:     r < 0 ? "😮‍💨 Less sleep = more stress in your pattern. Prioritize rest before high-pressure days." : "Your stress levels seem manageable even on lower sleep days.",
    mood_activity:    r > 0 ? "🏃 Exercise is lifting your mood! Keep moving on tough days." : "Your mood may benefit from rest rather than activity on low days.",
    water_mood:       r > 0 ? "💧 Hydration is connected to your mood. Drink more water to feel better." : "Consider other factors affecting your mood beyond hydration.",
    sleep_activity:   r > 0 ? "⚡ Activity days tend to produce better sleep for you — great pattern!" : "High-intensity exercise close to bedtime may be disrupting your sleep.",
    stress_symptoms:  r > 0 ? "🧠 Higher stress correlates with more symptoms. Stress management is key for you." : null,
  };
  return insights[key] || null;
}

export default function InsightsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('correlations');

  useEffect(() => {
    Promise.all([
      API.get('/health/sleep'),
      API.get('/health/mood'),
      API.get('/health/nutrition'),
      API.get('/health/activity'),
      API.get('/health/symptoms'),
      API.get('/health/dashboard'),
    ]).then(([sleep, mood, nutrition, activity, symptoms, dashboard]) => {
      setData({
        sleep:     sleep.data.data     || [],
        mood:      mood.data.data      || [],
        nutrition: nutrition.data.data || [],
        activity:  activity.data.data  || [],
        symptoms:  symptoms.data.data  || [],
        summary:   dashboard.data.data?.weekSummary || {},
        charts:    dashboard.data.data?.charts      || {},
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: '100px', borderRadius: '14px' }} />)}
    </div>
  );

  // Build aligned arrays by date
  const sleepByDate    = {}; const moodByDate  = {}; const waterByDate = {};
  const activityByDate = {}; const symptomCount = {};
  data.sleep.forEach(l    => { sleepByDate[formatDate(l.date)]    = l.duration; });
  data.mood.forEach(l     => { moodByDate[formatDate(l.date)]     = l.moodRating; });
  data.nutrition.forEach(l => { waterByDate[formatDate(l.date)]   = l.waterIntake || 0; });
  data.activity.forEach(l  => { activityByDate[formatDate(l.date)] = 1; });
  data.symptoms.forEach(l  => { symptomCount[formatDate(l.date)]  = (symptomCount[formatDate(l.date)] || 0) + 1; });
  const dates = [...new Set([...Object.keys(sleepByDate), ...Object.keys(moodByDate)])].sort();

  const sleepArr    = dates.map(d => sleepByDate[d]    || 0);
  const moodArr     = dates.map(d => moodByDate[d]     || 0);
  const waterArr    = dates.map(d => waterByDate[d]    || 0);
  const activityArr = dates.map(d => activityByDate[d] || 0);
  const stressArr   = dates.map(d => data.mood.find(m => formatDate(m.date) === d)?.stressLevel || 0);
  const symptomArr  = dates.map(d => symptomCount[d]   || 0);

  const correlations = [
    { key: 'sleep_mood',     label: 'Sleep → Mood',          icon: '🛌→😊', r: correlate(sleepArr, moodArr),     desc: 'Does more sleep improve your mood?' },
    { key: 'sleep_stress',   label: 'Sleep → Stress',        icon: '🛌→😰', r: correlate(sleepArr, stressArr.map(v => -v)), desc: 'Does sleep reduce your stress levels?' },
    { key: 'mood_activity',  label: 'Activity → Mood',       icon: '🏃→😊', r: correlate(activityArr, moodArr),  desc: 'Does exercise lift your mood?' },
    { key: 'water_mood',     label: 'Hydration → Mood',      icon: '💧→😊', r: correlate(waterArr, moodArr),     desc: 'Does drinking more water improve mood?' },
    { key: 'sleep_activity', label: 'Activity → Sleep',      icon: '🏃→🛌', r: correlate(activityArr, sleepArr), desc: 'Does exercise improve your sleep?' },
    { key: 'stress_symptoms',label: 'Stress → Symptoms',     icon: '😰→🩺', r: correlate(stressArr, symptomArr), desc: 'Does high stress cause more symptoms?' },
  ];

  const insights = correlations.map(c => ({ ...c, ...getCorrelationLabel(c.r), insight: getInsight(c.key, c.r) })).filter(c => c.insight);

  // Weekly Report data
  const s = data.summary;
  const wellnessScore = Math.round(((s.sleepConsistency || 0) + (s.nutritionConsistency || 0) + Math.min((s.activeDays || 0) * 14, 100)) / 3);
  const moodTrend  = data.charts?.mood  || [];
  const sleepTrend = data.charts?.sleep || [];

  const chartOpts = {
    responsive: true,
    plugins: { legend: { labels: { color: '#6b7280', font: { size: 11 } } }, tooltip: { backgroundColor: '#1f2937', titleColor: '#f9fafb', bodyColor: '#9ca3af' } },
    scales: { x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } } },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="fade-up">
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>📊 Insights & Reports</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Discover patterns in your health data and weekly summaries</p>
      </div>

      {/* Tabs */}
      <div className="fade-up" style={{ display: 'flex', gap: '8px' }}>
        {[['correlations','🔗 Correlations'],['weekly','📋 Weekly Report'],['trends','📈 Trends']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '9px 20px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
              borderColor: tab === id ? '#6366f1' : 'var(--color-surface-3)',
              background: tab === id ? 'rgba(99,102,241,0.15)' : 'var(--color-surface)',
              color: tab === id ? '#a5b4fc' : 'var(--color-muted)',
            }}>{label}</button>
        ))}
      </div>

      {/* ── Correlations Tab ── */}
      {tab === 'correlations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="fade-up">
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', padding: '12px 16px', borderRadius: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            🔬 The correlation engine analyses your logs to find real connections between your sleep, mood, activity, hydration, and symptoms. Need at least 5 entries per category for meaningful results.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {correlations.map(c => {
              const info = getCorrelationLabel(c.r);
              return (
                <div key={c.key} className="card-hover" style={{ padding: '18px', borderRadius: '16px', background: 'var(--color-surface)', border: `1px solid ${info.color}30` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{c.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{c.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>{c.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'Space Grotesk', color: info.color }}>{c.r !== null ? c.r.toFixed(2) : '—'}</div>
                      <div style={{ fontSize: '10px', color: info.color, fontWeight: 600 }}>r value</div>
                    </div>
                  </div>
                  <div style={{ height: '6px', borderRadius: '99px', background: 'var(--color-surface-2)', marginBottom: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '99px', background: info.color, width: `${(info.strength || 0) * 100}%`, transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: info.color, padding: '3px 10px', borderRadius: '99px', background: `${info.color}18` }}>{info.label}</span>
                  {getInsight(c.key, c.r) && (
                    <p style={{ fontSize: '12px', color: 'var(--color-muted-light)', marginTop: '10px', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
                      {getInsight(c.key, c.r)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Weekly Report Tab ── */}
      {tab === 'weekly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="fade-up">
          {/* Report Header */}
          <div style={{ padding: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-light)', letterSpacing: '0.07em', marginBottom: '4px' }}>WEEKLY HEALTH REPORT</div>
                <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>Week of {new Date(Date.now() - 7*86400000).toLocaleDateString('en-IN', { day:'numeric',month:'short' })} – {new Date().toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' })}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 20px', borderRadius: '14px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 600 }}>WELLNESS SCORE</div>
                <div style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Space Grotesk', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{wellnessScore}%</div>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { icon: '🛌', label: 'Avg Sleep',       val: `${s.avgSleepHours||0}h`,  sub: s.avgSleepHours >= 7 ? '✅ On track' : '⚠️ Below target',     color: '#6366f1' },
              { icon: '😊', label: 'Avg Mood',        val: `${s.avgMoodRating||0}/5`,  sub: s.avgMoodRating >= 4 ? '✅ Positive week' : '📈 Room to grow',  color: '#10b981' },
              { icon: '🏃', label: 'Active Days',     val: `${s.activeDays||0}/7`,     sub: s.activeDays >= 4 ? '✅ Active week' : '💪 Push a bit more',    color: '#f59e0b' },
              { icon: '💤', label: 'Sleep Consistency', val: `${s.sleepConsistency||0}%`, sub: s.sleepConsistency >= 70 ? '✅ Consistent' : '📊 Build streak', color: '#8b5cf6' },
              { icon: '🥗', label: 'Nutrition Consistency', val: `${s.nutritionConsistency||0}%`, sub: 'Track meals daily', color: '#ec4899' },
              { icon: '🩺', label: 'Symptoms Logged', val: s.symptomsLogged||0,        sub: s.symptomsLogged === 0 ? '✅ Symptom-free week!' : '📋 Monitored', color: '#ef4444' },
            ].map(m => (
              <div key={m.label} style={{ padding: '16px', borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{m.icon}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk', color: m.color }}>{m.val}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted)', marginTop: '2px' }}>{m.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Insights from correlations */}
          {insights.length > 0 && (
            <div style={{ padding: '20px', borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>🔍 This Week's Insights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {insights.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: 'var(--color-bg-2)' }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{c.icon}</span>
                    <p style={{ fontSize: '13px', color: 'var(--color-muted-light)', lineHeight: 1.5, margin: 0 }}>{c.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px', color: '#6ee7b7' }}>✅ Next Week's Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                s.sleepConsistency < 70  && "🛌 Log sleep every day to build a stronger consistency streak",
                s.avgSleepHours < 7      && "💤 Try going to bed 30 minutes earlier to reach 7+ hours",
                s.activeDays < 4         && "🏃 Add 1–2 more workout days to hit an active week",
                s.nutritionConsistency < 70 && "🥗 Log your meals daily — even a quick entry counts",
                s.avgMoodRating < 3      && "🧠 Consider a 5-min journaling session each morning",
              ].filter(Boolean).map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--color-muted-light)' }}>
                  <span style={{ flexShrink: 0 }}>→</span><span>{rec}</span>
                </div>
              ))}
              {[s.sleepConsistency, s.nutritionConsistency, s.activeDays * 14].every(v => v >= 70) &&
                <p style={{ fontSize: '13px', color: '#6ee7b7' }}>🎉 Excellent week! Keep up your healthy routines.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Trends Tab ── */}
      {tab === 'trends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="fade-up">
          {sleepTrend.length > 0 ? (
            <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>🛌 Sleep Duration (7 days)</h3>
              <Line data={{ labels: sleepTrend.map(l => formatDate(l.date)), datasets: [{ label: 'Sleep hrs', data: sleepTrend.map(l => l.hours), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#6366f1' }, { label: 'Target (8h)', data: sleepTrend.map(() => 8), borderColor: 'rgba(16,185,129,0.4)', borderDash: [5,5], pointRadius: 0, fill: false }] }} options={chartOpts} />
            </div>
          ) : <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)', background: 'var(--color-surface)', borderRadius: '16px' }}><div style={{ fontSize: '40px', marginBottom: '8px' }}>🛌</div><p>Log sleep entries to see your trend</p></div>}

          {moodTrend.length > 0 ? (
            <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>😊 Mood & Stress (7 days)</h3>
              <Line data={{ labels: moodTrend.map(l => formatDate(l.date)), datasets: [{ label: 'Mood', data: moodTrend.map(l => l.mood), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointRadius: 5 }, { label: 'Stress', data: moodTrend.map(l => l.stress), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)', fill: true, tension: 0.4, pointRadius: 5 }] }} options={chartOpts} />
            </div>
          ) : <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)', background: 'var(--color-surface)', borderRadius: '16px' }}><div style={{ fontSize: '40px', marginBottom: '8px' }}>😊</div><p>Log mood entries to see your trend</p></div>}
        </div>
      )}
    </div>
  );
}
