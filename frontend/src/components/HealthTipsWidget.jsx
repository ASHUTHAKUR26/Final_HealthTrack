import { useState } from 'react';

const tips = [
  { icon: '🛌', category: 'Sleep', tip: 'Go to bed and wake up at the same time every day — even on weekends.', color: '#6366f1' },
  { icon: '💧', category: 'Hydration', tip: 'Drink a glass of water first thing in the morning to kickstart your metabolism.', color: '#06b6d4' },
  { icon: '🥗', category: 'Nutrition', tip: 'Fill half your plate with vegetables at every meal for optimal micronutrients.', color: '#10b981' },
  { icon: '🏃', category: 'Activity', tip: 'Even 20 minutes of brisk walking daily significantly improves cardiovascular health.', color: '#f59e0b' },
  { icon: '🧠', category: 'Mental Health', tip: '5 minutes of deep breathing before bed lowers cortisol and improves sleep quality.', color: '#8b5cf6' },
  { icon: '☀️', category: 'Vitamin D', tip: 'Get 15–20 minutes of morning sunlight daily for natural Vitamin D synthesis.', color: '#f97316' },
  { icon: '📵', category: 'Screen Time', tip: 'Avoid screens for at least 1 hour before bed — blue light suppresses melatonin.', color: '#ec4899' },
  { icon: '🫁', category: 'Gut Health', tip: 'Include fermented foods like yogurt or curd in your daily diet for gut microbiome health.', color: '#14b8a6' },
  { icon: '🧴', category: 'Skincare', tip: 'Always apply SPF 30+ sunscreen before going outdoors, even on cloudy days.', color: '#a855f7' },
  { icon: '🎯', category: 'Habit', tip: 'Start a habit with just 2 minutes — the "2-minute rule" lowers resistance to starting.', color: '#ef4444' },
];

export default function HealthTipsWidget() {
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * tips.length));
  const tip = tips[current];

  function next() { setCurrent(i => (i + 1) % tips.length); }
  function prev() { setCurrent(i => (i - 1 + tips.length) % tips.length); }

  return (
    <div style={{
      padding: '20px 24px', borderRadius: '16px',
      background: `linear-gradient(135deg, ${tip.color}12, ${tip.color}06)`,
      border: `1px solid ${tip.color}28`,
      display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: tip.color, letterSpacing: '0.07em' }}>
          💡 HEALTH TIP
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{current + 1}/{tips.length}</span>
      </div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: '32px', width: '48px', height: '48px', borderRadius: '12px',
          background: `${tip.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{tip.icon}</span>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: tip.color, marginBottom: '4px', letterSpacing: '0.05em' }}>{tip.category.toUpperCase()}</div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted-light)', lineHeight: 1.6 }}>{tip.tip}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button onClick={prev} style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>← Prev</button>
        <button onClick={next} style={{ padding: '6px 14px', borderRadius: '8px', background: `${tip.color}20`, border: `1px solid ${tip.color}40`, color: tip.color, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Next →</button>
      </div>
    </div>
  );
}
