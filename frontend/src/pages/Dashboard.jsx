import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { formatDate, moodEmoji, getGreeting } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

function StatCard({ icon, label, value, sub, gradient, delay = '' }) {
  return (
    <div className={`card-hover fade-up ${delay}`} style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: 'var(--color-surface-2)' }}>{icon}</div>
        <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-light)', fontSize: '10px' }}>WEEK</span>
      </div>
      <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Space Grotesk', background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted-light)', letterSpacing: '0.04em' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{sub}</div>}
    </div>
  );
}

function ScoreRing({ score, label, color }) {
  const r = 38; const circ = 2 * Math.PI * r; const dash = (score / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color}66)` }} />
        <text x="48" y="53" textAnchor="middle" fill="white" fontSize="15" fontWeight="700" fontFamily="Space Grotesk">{score}%</text>
      </svg>
      <span style={{ color: 'var(--color-muted)', fontSize: '12px', fontWeight: 500 }}>{label}</span>
      <div className="progress-bar" style={{ width: '80px' }}>
        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function QuickLogCard({ to, icon, label }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className="card-hover" style={{ padding: '14px 8px', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'center' }}>
        <div style={{ fontSize: '26px' }}>{icon}</div>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted-light)' }}>{label}</span>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const user = JSON.parse(localStorage.getItem('hts_user') || '{}');

  useEffect(() => {
    // Check if already checked in today
    const lastCheckin = localStorage.getItem('hts_last_checkin');
    const today = new Date().toDateString();
    setCheckedIn(lastCheckin === today);

    API.get('/health/dashboard')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: '100px', borderRadius: '16px' }} />)}
    </div>
  );

  const summary    = data?.weekSummary || {};
  const sleepData  = data?.charts?.sleep || [];
  const moodData   = data?.charts?.mood  || [];
  const streak     = summary.sleepStreak || 0;

  const wellnessScore = Math.round((
    (summary.sleepConsistency || 0) +
    (summary.nutritionConsistency || 0) +
    Math.min((summary.activeDays || 0) * 14, 100)
  ) / 3);

  const chartBase = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#6b7280', font: { size: 11, family: 'Inter' } } },
      tooltip: { backgroundColor: '#1f2937', titleColor: '#f9fafb', bodyColor: '#9ca3af', borderColor: '#374151', borderWidth: 1 },
    },
    scales: {
      x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
    },
  };

  const sleepChart = {
    labels: sleepData.map(l => formatDate(l.date)),
    datasets: [{
      label: 'Sleep (hrs)', data: sleepData.map(l => l.hours),
      borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true, tension: 0.4, pointBackgroundColor: '#6366f1', pointRadius: 4, pointHoverRadius: 6,
    }, {
      label: 'Target (8h)', data: sleepData.map(() => 8),
      borderColor: 'rgba(16,185,129,0.35)', borderDash: [5, 5], pointRadius: 0, fill: false,
    }],
  };

  const moodChart = {
    labels: moodData.map(l => formatDate(l.date)),
    datasets: [
      { label: 'Mood',   data: moodData.map(l => l.mood),   backgroundColor: 'rgba(16,185,129,0.7)',  borderRadius: 6, borderSkipped: false },
      { label: 'Stress', data: moodData.map(l => l.stress), backgroundColor: 'rgba(239,68,68,0.55)', borderRadius: 6, borderSkipped: false },
    ],
  };

  const donutData = {
    labels: ['Sleep', 'Nutrition', 'Activity'],
    datasets: [{
      data: [summary.sleepConsistency || 0, summary.nutritionConsistency || 0, Math.min((summary.activeDays || 0) * 14, 100)],
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b'], borderWidth: 0, hoverOffset: 4,
    }],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Check-in Banner ── */}
      {!checkedIn && (
        <div className="fade-up" style={{ padding: '16px 20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.08))', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '28px' }}>☀️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'Space Grotesk' }}>Morning Check-in</div>
              <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '2px' }}>Log today's mood, sleep & energy in under 2 minutes</div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => navigate('/checkin')} style={{ padding: '10px 22px', whiteSpace: 'nowrap' }}>
            Start Check-in →
          </button>
        </div>
      )}

      {checkedIn && (
        <div className="fade-up" style={{ padding: '14px 20px', borderRadius: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px' }}>✅</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#6ee7b7' }}>Check-in complete!</div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Great job logging today. Come back tomorrow to keep your streak!</div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
            {getGreeting()}, <span className="grad-text">{user.name?.split(' ')[0] || 'there'}</span> 👋
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Here's your 7-day wellness overview</p>
        </div>

        {/* Wellness Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 600 }}>WELLNESS SCORE</div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{wellnessScore}%</div>
          </div>
          <svg width="50" height="50" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="var(--color-surface-2)" strokeWidth="5" />
            <circle cx="25" cy="25" r="20" fill="none" stroke="#6366f1" strokeWidth="5"
              strokeDasharray={`${(wellnessScore / 100) * 125.6} 125.6`}
              strokeLinecap="round" transform="rotate(-90 25 25)"
              style={{ filter: 'drop-shadow(0 0 6px #6366f188)' }} />
          </svg>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
        <StatCard icon="🛌" label="AVG SLEEP"    value={`${summary.avgSleepHours || 0}h`}   sub="Recommended: 7–9h"    gradient="linear-gradient(135deg, #6366f1, #818cf8)" delay="fade-up-1" />
        <StatCard icon="😊" label="AVG MOOD"     value={`${summary.avgMoodRating || 0}/5`}  sub={`${moodEmoji(summary.avgMoodRating)} ${['','Very sad','Sad','Neutral','Happy','Very happy'][Math.round(summary.avgMoodRating)] || ''}`} gradient="linear-gradient(135deg, #10b981, #06b6d4)" delay="fade-up-2" />
        <StatCard icon="🏃" label="ACTIVE DAYS"  value={`${summary.activeDays || 0}/7`}     sub="days this week"       gradient="linear-gradient(135deg, #f59e0b, #f97316)" delay="fade-up-3" />
        <StatCard icon="🩺" label="SYMPTOMS"     value={summary.symptomsLogged || 0}         sub="logged this week"     gradient="linear-gradient(135deg, #ef4444, #ec4899)" delay="fade-up-4" />
        <StatCard icon="🔥" label="SLEEP STREAK" value={`${streak} day${streak !== 1 ? 's' : ''}`} sub={streak >= 3 ? '🏆 On a roll!' : 'Log sleep daily'} gradient="linear-gradient(135deg, #f97316, #fbbf24)" />
      </div>

      {/* ── Quick Log ── */}
      <div className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.06em' }}>QUICK LOG</h3>
          <Link to="/checkin" style={{ fontSize: '12px', color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 600 }}>All-in-one check-in →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px' }}>
          <QuickLogCard to="/sleep"        icon="🛌"  label="Sleep" />
          <QuickLogCard to="/nutrition"    icon="🥗"  label="Nutrition" />
          <QuickLogCard to="/activity"     icon="🏃"  label="Activity" />
          <QuickLogCard to="/symptoms"     icon="🩺"  label="Symptoms" />
          <QuickLogCard to="/mood"         icon="🧠"  label="Mood" />
          <QuickLogCard to="/skin"         icon="🧴"  label="Skin" />
          <QuickLogCard to="/insights"     icon="📊"  label="Insights" />
          <QuickLogCard to="/achievements" icon="🏆"  label="Badges" />
          <QuickLogCard to="/ai"           icon="🤖"  label="AI Chat" />
        </div>
      </div>

      {/* ── Consistency + Donut ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card-hover fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px' }}>Consistency Scores</h3>
            <Link to="/insights" style={{ fontSize: '12px', color: 'var(--color-primary-light)', textDecoration: 'none' }}>Details →</Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
            <ScoreRing score={summary.sleepConsistency || 0}                   label="Sleep"     color="#6366f1" />
            <ScoreRing score={summary.nutritionConsistency || 0}               label="Nutrition" color="#10b981" />
            <ScoreRing score={Math.min((summary.activeDays || 0) * 14, 100)}  label="Activity"  color="#f59e0b" />
          </div>
        </div>

        <div className="card-hover fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px' }}>Wellness Breakdown</h3>
            <Link to="/achievements" style={{ fontSize: '12px', color: 'var(--color-primary-light)', textDecoration: 'none' }}>Badges →</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '140px', flexShrink: 0 }}>
              <Doughnut data={donutData} options={{ responsive: true, cutout: '70%', plugins: { legend: { display: false } } }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['#6366f1','Sleep',summary.sleepConsistency||0],['#10b981','Nutrition',summary.nutritionConsistency||0],['#f59e0b','Activity',Math.min((summary.activeDays||0)*14,100)]].map(([c,l,v]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--color-muted-light)' }}>{l}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, marginLeft: 'auto' }}>{v}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card-hover fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px' }}>Sleep Trend</h3>
            <Link to="/sleep" style={{ fontSize: '12px', color: 'var(--color-primary-light)', textDecoration: 'none' }}>Log →</Link>
          </div>
          {sleepData.length > 0
            ? <Line data={sleepChart} options={chartBase} />
            : <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛌</div>
                <p style={{ fontSize: '13px' }}>No sleep data yet</p>
                <Link to="/sleep" style={{ fontSize: '12px', color: 'var(--color-primary-light)', textDecoration: 'none', marginTop: '6px', display: 'inline-block' }}>Start logging →</Link>
              </div>}
        </div>

        <div className="card-hover fade-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px' }}>Mood & Stress</h3>
            <Link to="/mood" style={{ fontSize: '12px', color: '#10b981', textDecoration: 'none' }}>Log →</Link>
          </div>
          {moodData.length > 0
            ? <Bar data={moodChart} options={chartBase} />
            : <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧠</div>
                <p style={{ fontSize: '13px' }}>No mood data yet</p>
                <Link to="/mood" style={{ fontSize: '12px', color: '#10b981', textDecoration: 'none', marginTop: '6px', display: 'inline-block' }}>Start logging →</Link>
              </div>}
        </div>
      </div>

      {/* ── Feature Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { to: '/insights', icon: '📊', title: 'Insights & Reports', desc: 'See correlations between your sleep, mood, activity and more', color: '#6366f1' },
          { to: '/achievements', icon: '🏆', title: 'Achievements', desc: 'Earn badges by building consistent healthy habits', color: '#f59e0b' },
          { to: '/ai', icon: '🤖', title: 'AI Health Assistant', desc: 'Get personalized health advice powered by AI', color: '#10b981' },
        ].map(f => (
          <Link key={f.to} to={f.to} style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ padding: '20px', borderRadius: '16px', background: 'var(--color-surface)', border: `1px solid ${f.color}25`, cursor: 'pointer', height: '100%' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: f.color, marginBottom: '6px', fontFamily: 'Space Grotesk' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{f.desc}</div>
              <div style={{ fontSize: '12px', color: f.color, marginTop: '12px', fontWeight: 600 }}>Explore →</div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
