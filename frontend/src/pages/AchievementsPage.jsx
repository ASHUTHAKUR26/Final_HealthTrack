import { useState, useEffect } from 'react';
import API from '../utils/api';

const BADGES = [
  // ── Sleep ──────────────────────────────────────────────────────────────────
  { id: 'first_sleep',  icon: '🛌', title: 'First Night',       desc: 'Log your first sleep entry',         cat: 'Sleep',     color: '#6366f1', check: d => d.sleepCount >= 1 },
  { id: 'sleep_3',      icon: '😴', title: 'Getting Cozy',      desc: 'Log sleep 3 times',                   cat: 'Sleep',     color: '#6366f1', check: d => d.sleepCount >= 3 },
  { id: 'sleep_7',      icon: '🌙', title: 'Week Warrior',      desc: 'Log sleep 7 days in a row',           cat: 'Sleep',     color: '#6366f1', check: d => d.sleepStreak >= 7 },
  { id: 'sleep_14',     icon: '⭐', title: 'Sleep Champion',    desc: 'Log sleep 14 days in a row',          cat: 'Sleep',     color: '#6366f1', check: d => d.sleepStreak >= 14 },
  { id: 'sleep_8h',     icon: '💤', title: 'Well Rested',       desc: 'Log a sleep of 8+ hours',             cat: 'Sleep',     color: '#6366f1', check: d => d.bestSleep >= 8 },
  { id: 'sleep_10',     icon: '🌟', title: 'Sleep Veteran',     desc: 'Log sleep 10 times total',            cat: 'Sleep',     color: '#6366f1', check: d => d.sleepCount >= 10 },

  // ── Nutrition ──────────────────────────────────────────────────────────────
  { id: 'first_nutrition', icon: '🥗', title: 'First Bite',     desc: 'Log your first nutrition entry',      cat: 'Nutrition', color: '#10b981', check: d => d.nutritionCount >= 1 },
  { id: 'nutrition_5',     icon: '🥦', title: 'Healthy Eater',  desc: 'Log nutrition 5 times',               cat: 'Nutrition', color: '#10b981', check: d => d.nutritionCount >= 5 },
  { id: 'nutrition_10',    icon: '🍽️', title: 'Meal Planner',  desc: 'Log nutrition 10 times',              cat: 'Nutrition', color: '#10b981', check: d => d.nutritionCount >= 10 },
  { id: 'hydration',       icon: '💧', title: 'Hydration Hero', desc: 'Log 2.5L+ water in a single day',     cat: 'Nutrition', color: '#06b6d4', check: d => d.bestWater >= 2.5 },
  { id: 'hydration_3l',    icon: '🌊', title: 'Hydration Pro',  desc: 'Log 3L+ water in a single day',       cat: 'Nutrition', color: '#06b6d4', check: d => d.bestWater >= 3 },

  // ── Activity ───────────────────────────────────────────────────────────────
  { id: 'first_activity', icon: '🏃', title: 'First Step',         desc: 'Log your first workout',           cat: 'Activity',  color: '#f59e0b', check: d => d.activityCount >= 1 },
  { id: 'activity_5',     icon: '💪', title: 'Getting Active',     desc: 'Log 5 workouts total',             cat: 'Activity',  color: '#f59e0b', check: d => d.activityCount >= 5 },
  { id: 'activity_10',    icon: '🏅', title: 'Fitness Enthusiast', desc: 'Log 10 workouts total',            cat: 'Activity',  color: '#f59e0b', check: d => d.activityCount >= 10 },
  { id: 'active_week',    icon: '🔥', title: 'Active Week',        desc: 'Work out 5+ days in a week',       cat: 'Activity',  color: '#f59e0b', check: d => d.activeDaysThisWeek >= 5 },
  { id: 'activity_20',    icon: '🥇', title: 'Fitness Legend',     desc: 'Log 20 workouts total',            cat: 'Activity',  color: '#f59e0b', check: d => d.activityCount >= 20 },

  // ── Mood ───────────────────────────────────────────────────────────────────
  { id: 'first_mood',  icon: '😊', title: 'First Feeling',  desc: 'Log your first mood entry',              cat: 'Mood',      color: '#ec4899', check: d => d.moodCount >= 1 },
  { id: 'mood_7',      icon: '🧠', title: 'Mood Tracker',   desc: 'Log mood 7 times',                       cat: 'Mood',      color: '#ec4899', check: d => d.moodCount >= 7 },
  { id: 'mood_14',     icon: '🌈', title: 'Mood Master',    desc: 'Log mood 14 times',                      cat: 'Mood',      color: '#ec4899', check: d => d.moodCount >= 14 },
  { id: 'journaler',   icon: '📓', title: 'Journaler',      desc: 'Write 5 journal entries',                cat: 'Mood',      color: '#ec4899', check: d => d.journalCount >= 5 },
  { id: 'journaler_10',icon: '✍️', title: 'Author',         desc: 'Write 10 journal entries',               cat: 'Mood',      color: '#ec4899', check: d => d.journalCount >= 10 },

  // ── Symptoms ───────────────────────────────────────────────────────────────
  { id: 'first_symptom', icon: '🩺', title: 'Health Aware',   desc: 'Log your first symptom',               cat: 'Symptoms',  color: '#ef4444', check: d => d.symptomCount >= 1 },
  { id: 'symptom_5',     icon: '🔍', title: 'Body Detective', desc: 'Log 5 symptom entries',                cat: 'Symptoms',  color: '#ef4444', check: d => d.symptomCount >= 5 },

  // ── Skin ───────────────────────────────────────────────────────────────────
  { id: 'first_skin', icon: '🧴', title: 'Skin Starter', desc: 'Log your first skincare routine',           cat: 'Skin',      color: '#a855f7', check: d => d.skinCount >= 1 },
  { id: 'skin_7',     icon: '✨', title: 'Glow Up',      desc: 'Log skincare 7 times',                      cat: 'Skin',      color: '#a855f7', check: d => d.skinCount >= 7 },

  // ── Milestones ─────────────────────────────────────────────────────────────
  { id: 'total_10',     icon: '🎯', title: 'Getting Started',  desc: 'Log 10 entries across all categories',  cat: 'Milestone', color: '#f97316', check: d => d.totalLogs >= 10 },
  { id: 'total_25',     icon: '🏆', title: 'Committed',        desc: 'Log 25 entries across all categories',  cat: 'Milestone', color: '#f97316', check: d => d.totalLogs >= 25 },
  { id: 'total_50',     icon: '👑', title: 'Wellness Legend',  desc: 'Log 50 entries across all categories',  cat: 'Milestone', color: '#f97316', check: d => d.totalLogs >= 50 },
  { id: 'all_rounder',  icon: '🌟', title: 'All Rounder',      desc: 'Use all 6 tracking features at least once', cat: 'Milestone', color: '#f97316', check: d => d.sleepCount >= 1 && d.nutritionCount >= 1 && d.activityCount >= 1 && d.moodCount >= 1 && d.symptomCount >= 1 && d.skinCount >= 1 },
  { id: 'checkin_first',icon: '☀️', title: 'Early Bird',       desc: 'Complete your first daily check-in',    cat: 'Milestone', color: '#06b6d4', check: d => d.checkInCount >= 1 },
  { id: 'checkin_7',    icon: '🗓️', title: 'Daily Devotee',   desc: 'Complete 7 daily check-ins',            cat: 'Milestone', color: '#06b6d4', check: d => d.checkInCount >= 7 },
  { id: 'checkin_30',   icon: '📅', title: 'Monthly Devotee', desc: 'Complete 30 daily check-ins',           cat: 'Milestone', color: '#06b6d4', check: d => d.checkInCount >= 30 },
];

const CATEGORIES = ['All', 'Milestone', 'Sleep', 'Nutrition', 'Activity', 'Mood', 'Symptoms', 'Skin'];
const CAT_ICONS  = { All: '🏅', Milestone: '🏆', Sleep: '🛌', Nutrition: '🥗', Activity: '🏃', Mood: '😊', Symptoms: '🩺', Skin: '🧴' };

export default function AchievementsPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('All');
  const [error,   setError]   = useState('');

  useEffect(() => {
    // /health/stats now returns everything needed for badges
    API.get('/health/stats')
      .then(res => {
        const s = res.data.data;
        const checkInCount = parseInt(localStorage.getItem('hts_checkin_count') || '0');
        setStats({ ...s, checkInCount });
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load achievement data. Please refresh.');
      })
      .finally(() => setLoading(false));
  }, []);

  const unlocked = stats ? BADGES.filter(b => b.check(stats)) : [];
  const locked   = stats ? BADGES.filter(b => !b.check(stats)) : BADGES;

  const allSorted      = [...unlocked, ...locked];
  const filtered       = filter === 'All' ? allSorted : allSorted.filter(b => b.cat === filter);
  const unlockedFiltered = filtered.filter(b => unlocked.includes(b));
  const lockedFiltered   = filtered.filter(b => locked.includes(b));
  const pct = BADGES.length > 0 ? Math.round((unlocked.length / BADGES.length) * 100) : 0;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: '80px', borderRadius: '14px', opacity: 1 - i * 0.15 }} />)}
    </div>
  );

  if (error) return (
    <div style={{ padding: '24px', borderRadius: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
      ❌ {error}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div className="fade-up">
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>🏆 Achievements</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>
          Earn badges by building healthy habits consistently
        </p>
      </div>

      {/* Progress Overview */}
      <div className="fade-up" style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(249,115,22,0.06))', border: '1px solid rgba(245,158,11,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.06em', marginBottom: '6px' }}>OVERALL PROGRESS</div>
            <div style={{ fontSize: '40px', fontWeight: 900, fontFamily: 'Space Grotesk', color: '#fcd34d', lineHeight: 1 }}>
              {unlocked.length}
              <span style={{ fontSize: '20px', color: 'var(--color-muted)', fontWeight: 400 }}>/{BADGES.length}</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>badges unlocked</div>
          </div>
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
            <circle cx="44" cy="44" r="36" fill="none" stroke="#f59e0b" strokeWidth="9"
              strokeDasharray={`${(pct / 100) * 226.2} 226.2`} strokeLinecap="round"
              transform="rotate(-90 44 44)"
              style={{ filter: 'drop-shadow(0 0 8px #f59e0baa)', transition: 'stroke-dasharray 1s ease' }} />
            <text x="44" y="49" textAnchor="middle" fill="white" fontSize="16" fontWeight="700" fontFamily="Space Grotesk">{pct}%</text>
          </svg>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            { label: 'Sleep Logs',      val: stats?.sleepCount     || 0, icon: '🛌', color: '#6366f1' },
            { label: 'Nutrition Logs',  val: stats?.nutritionCount || 0, icon: '🥗', color: '#10b981' },
            { label: 'Workouts',        val: stats?.activityCount  || 0, icon: '🏃', color: '#f59e0b' },
            { label: 'Mood Entries',    val: stats?.moodCount      || 0, icon: '😊', color: '#ec4899' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', marginBottom: '3px' }}>{s.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Space Grotesk', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Extra stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
          {[
            { label: 'Sleep Streak',   val: `${stats?.sleepStreak || 0}d`,     icon: '🔥', color: '#f97316' },
            { label: 'Best Sleep',     val: `${stats?.bestSleep || 0}h`,        icon: '💤', color: '#6366f1' },
            { label: 'Best Water',     val: `${stats?.bestWater || 0}L`,        icon: '💧', color: '#06b6d4' },
            { label: 'Check-ins',      val: stats?.checkInCount || 0,           icon: '☀️', color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', marginBottom: '2px' }}>{s.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'Space Grotesk', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="fade-up" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            style={{ padding: '7px 16px', borderRadius: '99px', border: '1px solid', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
              borderColor: filter === cat ? '#f59e0b' : 'var(--color-surface-3)',
              background:  filter === cat ? 'rgba(245,158,11,0.15)' : 'var(--color-surface)',
              color:       filter === cat ? '#fcd34d' : 'var(--color-muted)',
            }}>
            {CAT_ICONS[cat]} {cat}
            {filter !== cat && (
              <span style={{ marginLeft: '5px', fontSize: '10px', color: 'var(--color-muted)' }}>
                {cat === 'All'
                  ? `${unlocked.length}/${BADGES.length}`
                  : `${unlocked.filter(b => b.cat === cat).length}/${BADGES.filter(b => b.cat === cat).length}`}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Unlocked Badges */}
      {unlockedFiltered.length > 0 && (
        <div className="fade-up">
          <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.07em', marginBottom: '12px' }}>
            ✅ UNLOCKED ({unlockedFiltered.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
            {unlockedFiltered.map(badge => (
              <div key={badge.id} className="card-hover" style={{
                padding: '18px', borderRadius: '16px', display: 'flex', gap: '14px', alignItems: 'center',
                background: `linear-gradient(135deg, ${badge.color}18, ${badge.color}08)`,
                border: `1px solid ${badge.color}35`,
                boxShadow: `0 4px 16px ${badge.color}15`,
              }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: `${badge.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0, boxShadow: `0 0 14px ${badge.color}55` }}>
                  {badge.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>{badge.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px', lineHeight: 1.4 }}>{badge.desc}</div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: badge.color, marginTop: '5px', display: 'inline-block', padding: '2px 8px', borderRadius: '99px', background: `${badge.color}20` }}>
                    {badge.cat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedFiltered.length > 0 && (
        <div className="fade-up">
          <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.07em', marginBottom: '12px' }}>
            🔒 LOCKED ({lockedFiltered.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
            {lockedFiltered.map(badge => (
              <div key={badge.id} style={{
                padding: '18px', borderRadius: '16px', display: 'flex', gap: '14px', alignItems: 'center',
                background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.04)', opacity: 0.55,
              }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0, filter: 'grayscale(1)' }}>
                  {badge.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-muted-light)' }}>{badge.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px', lineHeight: 1.4 }}>{badge.desc}</div>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-muted)', marginTop: '5px', display: 'inline-block' }}>
                    {badge.cat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unlockedFiltered.length === 0 && lockedFiltered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontSize: '14px' }}>No badges in this category yet. Start logging to earn them!</p>
        </div>
      )}
    </div>
  );
}
