import { useState } from 'react';
import BMICalculator from '../components/BMICalculator';
import HealthTipsWidget from '../components/HealthTipsWidget';

// ─── Data ─────────────────────────────────────────────────────────────────────

const hydrationTips = [
  { time: '7:00 AM', tip: 'Start with 1 glass of water after waking up' },
  { time: '9:00 AM', tip: 'Drink water before breakfast' },
  { time: '11:00 AM', tip: 'Mid-morning hydration break' },
  { time: '1:00 PM', tip: 'Drink water before lunch' },
  { time: '3:00 PM', tip: 'Afternoon hydration — avoid coffee after 2 PM' },
  { time: '6:00 PM', tip: 'Pre-dinner water helps reduce overeating' },
  { time: '8:00 PM', tip: 'Sip warm water or herbal tea in the evening' },
];

const sleepHygiene = [
  { icon: '📵', tip: 'Avoid screens 1 hour before bed' },
  { icon: '🌡️', tip: 'Keep bedroom cool (18–22°C is optimal)' },
  { icon: '⏰', tip: 'Fixed sleep/wake schedule — even weekends' },
  { icon: '☕', tip: 'No caffeine after 2 PM' },
  { icon: '🏃', tip: 'Exercise helps sleep — but not within 3 hours of bedtime' },
  { icon: '📖', tip: 'Read a book instead of scrolling before bed' },
];

const stressRelief = [
  { icon: '🧘', title: 'Box Breathing', desc: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 times.' },
  { icon: '🚶', title: '10-Min Walk', desc: 'A short walk outdoors reduces cortisol by up to 15%.' },
  { icon: '📓', title: 'Journaling', desc: 'Write 3 things you\'re grateful for every morning.' },
  { icon: '🎵', title: 'Music Therapy', desc: '60 BPM music (classical, lo-fi) slows heart rate and reduces anxiety.' },
  { icon: '🤸', title: 'Progressive Muscle Relax', desc: 'Tense and release each muscle group from toes to head.' },
  { icon: '🌿', title: 'Nature Exposure', desc: '20 minutes in nature significantly lowers stress hormones.' },
];

const skincareTips = [
  { step: '1', title: 'Cleanser', tip: 'Wash face with a gentle, pH-balanced cleanser twice daily.', icon: '🧼' },
  { step: '2', title: 'Toner', tip: 'Apply toner to balance skin pH and prep for moisturizer.', icon: '💧' },
  { step: '3', title: 'Serum', tip: 'Use Vitamin C serum in morning, retinol or niacinamide at night.', icon: '🧪' },
  { step: '4', title: 'Moisturizer', tip: 'Apply moisturizer while skin is slightly damp to lock in hydration.', icon: '🫙' },
  { step: '5', title: 'Sunscreen', tip: 'Always apply SPF 30+ in the morning, even indoors.', icon: '☀️' },
  { step: '6', title: 'Exfoliate', tip: 'Use a gentle exfoliator 2–3 times per week. Never over-exfoliate.', icon: '✨' },
];

// ─── Tools ────────────────────────────────────────────────────────────────────

// 1. Sleep Duration Calculator
function SleepCalculator() {
  const [wakeTime, setWakeTime] = useState('06:30');
  const [cycles, setCycles] = useState(5);
  const [results, setResults] = useState([]);

  function calculate() {
    const [wh, wm] = wakeTime.split(':').map(Number);
    const totalWakeMinutes = wh * 60 + wm;
    const CYCLE = 90; // minutes
    const SLEEP_ONSET = 15;
    const res = [];
    for (let c = cycles; c >= 3; c--) {
      const sleepMinutes = totalWakeMinutes - c * CYCLE - SLEEP_ONSET;
      let h = Math.floor(((sleepMinutes % 1440) + 1440) % 1440 / 60);
      let m = ((sleepMinutes % 60) + 60) % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      const duration = (c * CYCLE / 60).toFixed(1);
      res.push({ time: `${h12}:${String(m).padStart(2, '0')} ${ampm}`, cycles: c, duration, quality: c >= 5 ? '⭐⭐⭐' : c === 4 ? '⭐⭐' : '⭐' });
    }
    setResults(res);
  }

  return (
    <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(99,102,241,0.2)' }}>
      <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px', fontFamily: 'Space Grotesk' }}>⏰ Sleep Cycle Calculator</h3>
      <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '18px' }}>Find the best bedtime based on 90-min sleep cycles</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>WAKE UP TIME</label>
          <input className="hts-input" type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} />
        </div>
        <div>
          <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>MAX CYCLES (4–6)</label>
          <select className="hts-input" value={cycles} onChange={e => setCycles(Number(e.target.value))}>
            <option value={6}>6 cycles (9h)</option>
            <option value={5}>5 cycles (7.5h)</option>
            <option value={4}>4 cycles (6h)</option>
          </select>
        </div>
      </div>

      <button className="btn-primary" onClick={calculate} style={{ width: '100%', marginBottom: results.length ? '16px' : '0' }}>
        Calculate Bedtimes
      </button>

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="fade-up">
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '4px' }}>Go to bed at one of these times:</p>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: i === 0 ? 'rgba(99,102,241,0.15)' : 'var(--color-bg-2)', border: i === 0 ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '15px', color: i === 0 ? '#a5b4fc' : 'var(--color-text)' }}>{r.time}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-muted)', marginLeft: '10px' }}>{r.cycles} cycles · {r.duration}h</span>
              </div>
              <span style={{ fontSize: '13px' }}>{r.quality}</span>
            </div>
          ))}
          <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '4px' }}>* Includes 15 min to fall asleep. Top option is most recommended.</p>
        </div>
      )}
    </div>
  );
}

// 2. Water Intake Calculator
function WaterIntakeCalculator() {
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [climate, setClimate] = useState('normal');
  const [result, setResult] = useState(null);

  function calculate() {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    let base = w * 0.033;
    if (activityLevel === 'active')     base += 0.5;
    if (activityLevel === 'veryActive') base += 1.0;
    if (climate === 'hot')              base += 0.5;
    const glasses = Math.round((base / 0.25) * 10) / 10;
    setResult({ liters: base.toFixed(1), glasses: Math.ceil(glasses) });
  }

  return (
    <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(6,182,212,0.2)' }}>
      <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px', fontFamily: 'Space Grotesk' }}>💧 Water Intake Calculator</h3>
      <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '18px' }}>Get your personalized daily water goal</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>BODY WEIGHT (kg)</label>
          <input className="hts-input" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65" min="1" />
        </div>
        <div>
          <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>ACTIVITY LEVEL</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[['sedentary','🪑 Sedentary'],['moderate','🚶 Moderate'],['veryActive','🏃 Very Active']].map(([v, l]) => (
              <button key={v} onClick={() => setActivityLevel(v)} type="button"
                style={{ padding: '8px 4px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontSize: '11px', fontWeight: 600, transition: 'all 0.15s', textAlign: 'center',
                  borderColor: activityLevel === v ? '#06b6d4' : 'var(--color-surface-3)',
                  background: activityLevel === v ? 'rgba(6,182,212,0.15)' : 'var(--color-bg-2)',
                  color: activityLevel === v ? '#67e8f9' : 'var(--color-muted)',
                }}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>CLIMATE</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {[['normal','🌤 Normal / Mild'],['hot','🌞 Hot / Humid']].map(([v, l]) => (
              <button key={v} onClick={() => setClimate(v)} type="button"
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontSize: '11px', fontWeight: 600, transition: 'all 0.15s',
                  borderColor: climate === v ? '#06b6d4' : 'var(--color-surface-3)',
                  background: climate === v ? 'rgba(6,182,212,0.15)' : 'var(--color-bg-2)',
                  color: climate === v ? '#67e8f9' : 'var(--color-muted)',
                }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={calculate} style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 4px 14px rgba(6,182,212,0.3)', marginBottom: result ? '16px' : '0' }}>
        Calculate My Water Goal
      </button>

      {result && (
        <div className="fade-up" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Space Grotesk', color: '#67e8f9' }}>{result.liters}L</div>
          <div style={{ fontSize: '14px', color: 'var(--color-muted-light)', marginTop: '4px' }}>≈ {result.glasses} glasses per day (250ml each)</div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '8px' }}>Spread evenly throughout the day for best results</div>
        </div>
      )}
    </div>
  );
}

// 3. Stress Level Assessment
function StressAssessment() {
  const questions = [
    'I have been upset because of something unexpected',
    'I felt unable to control the important things in my life',
    'I felt nervous and stressed',
    'I have been unable to cope with all things I had to do',
    'I have been able to control irritations in my life',
    'I felt that things were going my way',
    'I felt difficulties were piling up so high I could not overcome them',
  ];
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [result, setResult] = useState(null);
  const reverseIdx = [4, 5]; // Q5 & Q6 are reverse scored

  function setAnswer(qi, val) {
    const a = [...answers]; a[qi] = val; setAnswers(a);
  }

  function calculate() {
    if (answers.some(a => a === null)) return;
    let score = answers.reduce((sum, val, i) => sum + (reverseIdx.includes(i) ? (4 - val) : val), 0);
    let level, color, advice;
    if (score <= 13)      { level = 'Low Stress';      color = '#10b981'; advice = 'You\'re managing stress well. Keep up your healthy routines!'; }
    else if (score <= 26) { level = 'Moderate Stress'; color = '#f59e0b'; advice = 'Some stress is present. Try adding breathing exercises or daily walks.'; }
    else                  { level = 'High Stress';     color = '#ef4444'; advice = 'Your stress levels are high. Consider speaking to someone you trust or a professional.'; }
    setResult({ score, level, color, advice, pct: Math.round((score / 28) * 100) });
  }

  return (
    <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(139,92,246,0.2)' }}>
      <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px', fontFamily: 'Space Grotesk' }}>😰 Stress Level Assessment</h3>
      <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '18px' }}>Based on the Perceived Stress Scale (PSS-7). Rate each from 0 (Never) to 4 (Very Often).</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
        {questions.map((q, i) => (
          <div key={i}>
            <p style={{ fontSize: '13px', color: 'var(--color-muted-light)', marginBottom: '8px', lineHeight: 1.5 }}>{i + 1}. {q}</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Never', 'Almost\nNever', 'Sometimes', 'Fairly\nOften', 'Very\nOften'].map((label, v) => (
                <button key={v} onClick={() => setAnswer(i, v)} type="button"
                  style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontSize: '10px', fontWeight: 600, transition: 'all 0.15s', textAlign: 'center', lineHeight: 1.3,
                    borderColor: answers[i] === v ? '#8b5cf6' : 'var(--color-surface-3)',
                    background: answers[i] === v ? 'rgba(139,92,246,0.2)' : 'var(--color-bg-2)',
                    color: answers[i] === v ? '#c4b5fd' : 'var(--color-muted)',
                  }}>
                  <div style={{ fontSize: '14px', marginBottom: '2px' }}>{v}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={calculate}
        disabled={answers.some(a => a === null)}
        style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 4px 14px rgba(139,92,246,0.3)', opacity: answers.some(a => a === null) ? 0.6 : 1, marginBottom: result ? '16px' : '0' }}>
        Assess My Stress Level
      </button>

      {result && (
        <div className="fade-up" style={{ padding: '16px', borderRadius: '12px', background: `${result.color}12`, border: `1px solid ${result.color}30` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: result.color, letterSpacing: '0.06em' }}>STRESS LEVEL</div>
              <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk', color: result.color }}>{result.level}</div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: result.color }}>{result.score}<span style={{ fontSize: '14px' }}>/28</span></div>
          </div>
          <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.1)', marginBottom: '12px' }}>
            <div style={{ height: '100%', borderRadius: '99px', background: result.color, width: `${result.pct}%`, transition: 'width 0.8s ease' }} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-muted-light)', lineHeight: 1.6 }}>💡 {result.advice}</p>
        </div>
      )}
    </div>
  );
}

// 4. Calorie Burn Estimator
function CalorieBurnEstimator() {
  const [weight, setWeight] = useState('');
  const [exercise, setExercise] = useState('running');
  const [duration, setDuration] = useState('');
  const [result, setResult] = useState(null);

  const exercises = [
    { id: 'running',   label: '🏃 Running',     met: 9.8 },
    { id: 'walking',   label: '🚶 Walking',      met: 3.5 },
    { id: 'cycling',   label: '🚴 Cycling',      met: 7.5 },
    { id: 'swimming',  label: '🏊 Swimming',     met: 8.0 },
    { id: 'yoga',      label: '🧘 Yoga',         met: 3.0 },
    { id: 'gym',       label: '🏋️ Weight Train', met: 6.0 },
    { id: 'dancing',   label: '💃 Dancing',      met: 5.0 },
    { id: 'cricket',   label: '🏏 Cricket',      met: 4.8 },
    { id: 'football',  label: '⚽ Football',     met: 7.0 },
    { id: 'skipping',  label: '🪂 Skipping Rope', met: 11.0 },
  ];

  function calculate() {
    const w = parseFloat(weight); const d = parseFloat(duration);
    if (!w || !d) return;
    const ex = exercises.find(e => e.id === exercise);
    const kcal = Math.round(ex.met * 3.5 * w / 200 * d);
    const steps = exercise === 'walking' ? Math.round(d * 100) : exercise === 'running' ? Math.round(d * 160) : null;
    setResult({ kcal, ex, steps });
  }

  return (
    <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(245,158,11,0.2)' }}>
      <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px', fontFamily: 'Space Grotesk' }}>🔥 Calorie Burn Estimator</h3>
      <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '18px' }}>Estimate calories burned based on MET values</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>SELECT EXERCISE</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {exercises.map(ex => (
              <button key={ex.id} onClick={() => setExercise(ex.id)} type="button"
                style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s', textAlign: 'left',
                  borderColor: exercise === ex.id ? '#f59e0b' : 'var(--color-surface-3)',
                  background: exercise === ex.id ? 'rgba(245,158,11,0.15)' : 'var(--color-bg-2)',
                  color: exercise === ex.id ? '#fcd34d' : 'var(--color-muted)',
                }}>{ex.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>WEIGHT (kg)</label>
            <input className="hts-input" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="65" min="1" />
          </div>
          <div>
            <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>DURATION (mins)</label>
            <input className="hts-input" type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" min="1" />
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={calculate}
        style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 4px 14px rgba(245,158,11,0.3)', marginBottom: result ? '16px' : '0' }}>
        Estimate Calories Burned
      </button>

      {result && (
        <div className="fade-up" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '42px', fontWeight: 900, fontFamily: 'Space Grotesk', color: '#fcd34d' }}>{result.kcal}</div>
          <div style={{ fontSize: '14px', color: 'var(--color-muted-light)' }}>kcal burned doing {result.ex.label}</div>
          {result.steps && <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '6px' }}>≈ {result.steps.toLocaleString()} steps</div>}
          <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '8px' }}>MET value: {result.ex.met} · Based on body weight × duration</div>
        </div>
      )}
    </div>
  );
}

// 5. Mood Journal Prompt Generator
function JournalPromptGenerator() {
  const prompts = {
    '😊 Happy': [
      'What made you smile today? How can you recreate this feeling?',
      'Who contributed to your happiness today? Have you told them?',
      'Describe 3 things that went really well this week.',
      'What are you most proud of right now?',
    ],
    '😐 Neutral': [
      'What would make today feel more meaningful?',
      'Is there something you\'ve been avoiding that you could start today?',
      'What does your ideal day look like? How different is it from today?',
      'Write about one thing you want to improve this week.',
    ],
    '😞 Stressed': [
      'What is causing the most stress right now? Can you control it?',
      'List 5 things you can do in the next hour to feel better.',
      'Write a letter to yourself from 5 years in the future.',
      'What would you tell a friend going through the same situation?',
    ],
    '😴 Tired': [
      'What drained your energy most today? How can you reduce it?',
      'Are you getting enough sleep? What is one change you can make tonight?',
      'List 3 self-care activities you can do this weekend.',
      'What would help you feel recharged right now?',
    ],
    '😰 Anxious': [
      'Write down your worries. Which ones are within your control?',
      'What is the worst that could realistically happen? How would you cope?',
      'Name 5 things you can see, 4 you can touch, 3 you can hear right now.',
      'What has helped you overcome anxiety in the past?',
    ],
  };

  const moods = Object.keys(prompts);
  const [mood, setMood] = useState(moods[0]);
  const [promptIdx, setPromptIdx] = useState(0);

  function randomize() {
    setPromptIdx(Math.floor(Math.random() * prompts[mood].length));
  }

  return (
    <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(16,185,129,0.2)' }}>
      <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px', fontFamily: 'Space Grotesk' }}>📝 Journal Prompt Generator</h3>
      <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '18px' }}>Get a guided prompt based on how you feel</p>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {moods.map(m => (
          <button key={m} onClick={() => { setMood(m); setPromptIdx(0); }} type="button"
            style={{ padding: '7px 14px', borderRadius: '99px', border: '1px solid', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
              borderColor: mood === m ? '#10b981' : 'var(--color-surface-3)',
              background: mood === m ? 'rgba(16,185,129,0.15)' : 'var(--color-bg-2)',
              color: mood === m ? '#6ee7b7' : 'var(--color-muted)',
            }}>{m}</button>
        ))}
      </div>

      <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)', minHeight: '80px', marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.7, fontStyle: 'italic' }}>
          "{prompts[mood][promptIdx]}"
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={randomize} className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
          🎲 New Prompt
        </button>
        <button onClick={() => { const el = document.createElement('textarea'); el.value = prompts[mood][promptIdx]; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }}
          style={{ padding: '11px 16px', borderRadius: '10px', background: 'var(--color-surface-2)', border: '1px solid var(--color-surface-3)', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '13px' }}>
          📋 Copy
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div className="fade-up">
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Space Grotesk' }}>🛠️ Wellness Tools</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Interactive calculators and resources for your health journey</p>
      </div>

      {/* Row 1 — BMI + Tips + Calorie Guide */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="fade-up"><BMICalculator /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="fade-up"><HealthTipsWidget /></div>
          <div className="fade-up card-hover" style={{ padding: '20px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>🔥 Daily Calorie Guide</h3>
            {[
              { label: 'Sedentary (desk job)', cal: '1800–2000', color: '#6b7280' },
              { label: 'Lightly active (1–3/wk)', cal: '2000–2200', color: '#06b6d4' },
              { label: 'Moderately active (3–5/wk)', cal: '2200–2600', color: '#10b981' },
              { label: 'Very active (6–7/wk)', cal: '2600–3000', color: '#f59e0b' },
              { label: 'Extra active (athlete)', cal: '3000–3500+', color: '#ef4444' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: '8px', background: 'var(--color-bg-2)', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-muted-light)' }}>{r.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: r.color }}>{r.cal} kcal</span>
              </div>
            ))}
            <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '8px' }}>* Approx. for adults. Women typically need 200–300 kcal less.</p>
          </div>
        </div>
      </div>

      {/* Row 2 — Sleep Calc + Water Calc */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="fade-up"><SleepCalculator /></div>
        <div className="fade-up"><WaterIntakeCalculator /></div>
      </div>

      {/* Row 3 — Calorie Burn + Stress Assessment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="fade-up"><CalorieBurnEstimator /></div>
        <div className="fade-up"><StressAssessment /></div>
      </div>

      {/* Row 4 — Journal Prompt Generator (full width) */}
      <div className="fade-up"><JournalPromptGenerator /></div>

      {/* Hydration Schedule */}
      <div className="fade-up card-hover" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(6,182,212,0.15)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>💧 Hydration Schedule</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {hydrationTips.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.12)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#67e8f9', minWidth: '56px', marginTop: '1px', fontFamily: 'monospace' }}>{h.time}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-muted-light)', lineHeight: 1.5 }}>{h.tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sleep Hygiene */}
      <div className="fade-up card-hover" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>🛌 Sleep Hygiene Checklist</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {sleepHygiene.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{s.icon}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-muted-light)', lineHeight: 1.5 }}>{s.tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stress Relief */}
      <div className="fade-up card-hover" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>🧘 Stress Relief Techniques</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {stressRelief.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px', borderRadius: '10px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{s.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skincare Routine */}
      <div className="fade-up card-hover" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(236,72,153,0.15)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>🧴 Skincare Routine Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {skincareTips.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px', borderRadius: '10px', background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.12)', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(236,72,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '3px' }}>Step {s.step}: {s.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{s.tip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Macronutrient Guide */}
      <div className="fade-up card-hover" style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>🥗 Macronutrient Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { nutrient: 'Carbohydrates', pct: '45–65%', example: 'Rice, roti, oats, fruits', color: '#f59e0b', icon: '🍚' },
            { nutrient: 'Protein',       pct: '10–35%', example: 'Dal, eggs, chicken, paneer, tofu', color: '#10b981', icon: '🥚' },
            { nutrient: 'Fats',          pct: '20–35%', example: 'Nuts, ghee, avocado, olive oil', color: '#6366f1', icon: '🥑' },
          ].map(m => (
            <div key={m.nutrient} style={{ padding: '16px', borderRadius: '12px', background: `${m.color}0f`, border: `1px solid ${m.color}25`, textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{m.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: m.color, marginBottom: '4px' }}>{m.pct}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}>{m.nutrient}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.5 }}>{m.example}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
