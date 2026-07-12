import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const STEPS = [
  {
    id: 'sleep',
    question: "How many hours did you sleep last night?",
    icon: '🛌', color: '#6366f1', type: 'slider',
    min: 0, max: 12, step: 0.5, unit: 'hrs',
    labels: ['0h', '6h', '12h'],
    emoji: v => v >= 8 ? '😄' : v >= 6 ? '😊' : v >= 4 ? '😐' : '😞',
  },
  {
    id: 'mood',
    question: "How are you feeling right now?",
    icon: '😊', color: '#10b981', type: 'emoji_select',
    options: [
      { val: 1, emoji: '😞', label: 'Very Sad' },
      { val: 2, emoji: '😕', label: 'Sad' },
      { val: 3, emoji: '😐', label: 'Neutral' },
      { val: 4, emoji: '😊', label: 'Happy' },
      { val: 5, emoji: '😄', label: 'Great' },
    ],
  },
  {
    id: 'energy',
    question: "What's your energy level today?",
    icon: '⚡', color: '#f59e0b', type: 'emoji_select',
    options: [
      { val: 1, emoji: '🪫', label: 'Drained' },
      { val: 2, emoji: '😴', label: 'Low' },
      { val: 3, emoji: '🙂', label: 'Okay' },
      { val: 4, emoji: '💪', label: 'Good' },
      { val: 5, emoji: '⚡', label: 'Energised' },
    ],
  },
  {
    id: 'water',
    question: "How much water did you drink yesterday?",
    icon: '💧', color: '#06b6d4', type: 'slider',
    min: 0, max: 4, step: 0.25, unit: 'L',
    labels: ['0L', '2L', '4L'],
    emoji: v => v >= 2.5 ? '😄' : v >= 1.5 ? '😊' : v >= 0.5 ? '😐' : '😞',
  },
  {
    id: 'stress',
    question: "How stressed are you feeling?",
    icon: '😰', color: '#8b5cf6', type: 'emoji_select',
    options: [
      { val: 1, emoji: '😌', label: 'Calm' },
      { val: 2, emoji: '🙂', label: 'Low' },
      { val: 3, emoji: '😐', label: 'Moderate' },
      { val: 4, emoji: '😤', label: 'High' },
      { val: 5, emoji: '🤯', label: 'Overwhelmed' },
    ],
  },
];

export default function DailyCheckIn() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({ sleep: 7, mood: null, energy: null, water: 2, stress: null });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;
  const canNext = current.type === 'slider' || answers[current.id] !== null;

  function setAnswer(key, val) {
    setAnswers(prev => ({ ...prev, [key]: val }));
  }

  async function handleNext() {
    if (!isLast) { setStep(s => s + 1); return; }
    setSubmitting(true);
    try {
      const promises = [];

      if (answers.sleep) {
        promises.push(API.post('/health/sleep', {
          duration: answers.sleep,
          quality: Math.round(answers.sleep >= 8 ? 5 : answers.sleep >= 6 ? 4 : answers.sleep >= 4 ? 3 : 2),
        }));
      }
      if (answers.mood) {
        promises.push(API.post('/health/mood', {
          moodRating: answers.mood,
          stressLevel: answers.stress || 3,
          journal: '',
        }));
      }
      if (answers.water) {
        promises.push(API.post('/health/nutrition', {
          meals: [],
          waterIntake: answers.water,
          nutritionRating: 3,
        }));
      }

      await Promise.allSettled(promises);

      // ── Track check-in in localStorage ──────────────────────────────────
      const today = new Date().toDateString();
      localStorage.setItem('hts_last_checkin', today);
      const prev = parseInt(localStorage.getItem('hts_checkin_count') || '0');
      localStorage.setItem('hts_checkin_count', String(prev + 1));

      setDone(true);
    } catch (e) {
      console.error(e);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  const pct = ((step + 1) / STEPS.length) * 100;

  // ── Done screen ──────────────────────────────────────────────────────────
  if (done) {
    const totalCheckins = parseInt(localStorage.getItem('hts_checkin_count') || '1');
    const tips = {
      sleep:  answers.sleep < 6   ? "You slept less than 6 hours. Try sleeping 30 minutes earlier tonight." : "Great sleep! Consistency is key — same bedtime daily helps.",
      mood:   answers.mood <= 2   ? "You're feeling low today. A short walk outside can significantly boost mood." : "Great mood! Channel that energy into something you enjoy.",
      stress: answers.stress >= 4 ? "High stress detected. Try box breathing: inhale 4s → hold 4s → exhale 4s." : "Stress is manageable today. Keep your routines consistent.",
      water:  answers.water < 2   ? "Low hydration yesterday. Set phone reminders every 2 hours to drink water." : "Good hydration! Aim to keep this up every day.",
      energy: answers.energy <= 2 ? "Low energy today. A 10-minute walk or a healthy snack can help." : "Great energy levels! Make the most of your productive time.",
    };
    const scored = {
      sleep: answers.sleep / 12,
      mood: (answers.mood || 3) / 5,
      energy: (answers.energy || 3) / 5,
      water: answers.water / 4,
      stress: (6 - (answers.stress || 3)) / 5,
    };
    const lowestArea = Object.entries(scored).sort((a, b) => a[1] - b[1])[0][0];
    const overallScore = Math.round(Object.values(scored).reduce((a, b) => a + b, 0) / 5 * 100);

    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="fade-up" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '72px', marginBottom: '12px' }}>🎉</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: '6px' }}>Check-in Complete!</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginBottom: '6px' }}>Check-in #{totalCheckins} · Your data is logged</p>

          {/* Overall score */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '99px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '24px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#a5b4fc' }}>Today's Wellness Score:</span>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#818cf8' }}>{overallScore}%</span>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {STEPS.map(s => {
              const val = answers[s.id];
              const emoji = s.type === 'slider' ? s.emoji(val) : s.options?.find(o => o.val === val)?.emoji || '—';
              const display = s.type === 'slider' ? `${val}${s.unit}` : s.options?.find(o => o.val === val)?.label || '—';
              return (
                <div key={s.id} style={{ padding: '12px 4px', borderRadius: '12px', background: `${s.color}15`, border: `1px solid ${s.color}30`, textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>{emoji}</div>
                  <div style={{ fontSize: '10px', color: s.color, fontWeight: 700, letterSpacing: '0.04em' }}>{s.id.toUpperCase()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-muted-light)', marginTop: '2px' }}>{display}</div>
                </div>
              );
            })}
          </div>

          {/* Insight */}
          <div style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: '6px', letterSpacing: '0.05em' }}>💡 TODAY'S FOCUS</div>
            <p style={{ fontSize: '13px', color: 'var(--color-muted-light)', lineHeight: 1.65, margin: 0 }}>{tips[lowestArea]}</p>
          </div>

          {/* Streak/milestone message */}
          {totalCheckins % 7 === 0 && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#fcd34d', fontWeight: 600, margin: 0 }}>🔥 {totalCheckins}-day check-in milestone! Check your achievements.</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary" onClick={() => navigate('/')} style={{ flex: 1, fontSize: '14px' }}>
              View Dashboard →
            </button>
            <button onClick={() => navigate('/achievements')}
              style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              🏆 Badges
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Question screen ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '520px', width: '100%' }} className="fade-up">

        {/* Progress bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.06em' }}>MORNING CHECK-IN</span>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{step + 1} of {STEPS.length}</span>
          </div>
          <div style={{ height: '6px', borderRadius: '99px', background: 'var(--color-surface-2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${current.color}, ${current.color}cc)`, width: `${pct}%`, transition: 'width 0.4s ease', boxShadow: `0 0 8px ${current.color}88` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', transition: 'all 0.2s',
                background: i < step ? s.color : i === step ? `${current.color}22` : 'var(--color-surface-2)',
                border: `2px solid ${i <= step ? s.color : 'var(--color-surface-3)'}`,
                boxShadow: i === step ? `0 0 12px ${current.color}66` : 'none',
                color: i < step ? 'white' : 'var(--color-muted)',
              }}>{i < step ? '✓' : s.icon}</div>
            ))}
          </div>
        </div>

        {/* Question card */}
        <div style={{ padding: '36px', borderRadius: '20px', background: 'var(--color-surface)', border: `1px solid ${current.color}30`, boxShadow: `0 8px 32px ${current.color}15`, marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>{current.icon}</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk', textAlign: 'center', marginBottom: '32px', lineHeight: 1.3 }}>{current.question}</h2>

          {current.type === 'slider' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '56px', fontWeight: 900, fontFamily: 'Space Grotesk', color: current.color }}>{answers[current.id]}</span>
                <span style={{ fontSize: '20px', color: 'var(--color-muted)', marginLeft: '4px' }}>{current.unit}</span>
                <div style={{ fontSize: '28px', marginTop: '8px' }}>{current.emoji(answers[current.id])}</div>
              </div>
              <input type="range" min={current.min} max={current.max} step={current.step}
                value={answers[current.id]} onChange={e => setAnswer(current.id, parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: current.color }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-muted)', marginTop: '6px' }}>
                {current.labels.map(l => <span key={l}>{l}</span>)}
              </div>
            </div>
          )}

          {current.type === 'emoji_select' && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {current.options.map(opt => (
                <button key={opt.val} type="button" onClick={() => setAnswer(current.id, opt.val)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '16px 18px', borderRadius: '14px', border: '2px solid', cursor: 'pointer',
                    transition: 'all 0.2s', minWidth: '78px',
                    borderColor: answers[current.id] === opt.val ? current.color : 'var(--color-surface-3)',
                    background: answers[current.id] === opt.val ? `${current.color}22` : 'var(--color-bg-2)',
                    transform: answers[current.id] === opt.val ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: answers[current.id] === opt.val ? `0 4px 16px ${current.color}44` : 'none',
                  }}>
                  <span style={{ fontSize: '32px' }}>{opt.emoji}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: answers[current.id] === opt.val ? current.color : 'var(--color-muted)' }}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{ padding: '13px 20px', borderRadius: '10px', background: 'var(--color-surface-2)', border: '1px solid var(--color-surface-3)', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
              ← Back
            </button>
          )}
          <button className="btn-primary" onClick={handleNext} disabled={!canNext || submitting}
            style={{ flex: 1, fontSize: '15px', padding: '14px', background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`, boxShadow: `0 4px 14px ${current.color}44`, opacity: canNext ? 1 : 0.5 }}>
            {submitting ? '⏳ Saving…' : isLast ? '✅ Complete Check-in' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
