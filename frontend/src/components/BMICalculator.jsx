import { useState } from 'react';

export default function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('metric');
  const [result, setResult] = useState(null);

  function calculate() {
    let h = parseFloat(height);
    let w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;

    let bmi;
    if (unit === 'metric') {
      bmi = w / ((h / 100) ** 2);
    } else {
      // imperial: height in inches, weight in lbs
      bmi = (703 * w) / (h ** 2);
    }

    bmi = Math.round(bmi * 10) / 10;
    let category, color, advice;

    if (bmi < 18.5) {
      category = 'Underweight'; color = '#06b6d4';
      advice = 'Consider increasing caloric intake with nutrient-dense foods. Consult a dietitian.';
    } else if (bmi < 25) {
      category = 'Normal Weight'; color = '#10b981';
      advice = 'Great! Maintain your current lifestyle with balanced diet and regular exercise.';
    } else if (bmi < 30) {
      category = 'Overweight'; color = '#f59e0b';
      advice = 'Focus on balanced nutrition and 150+ minutes of moderate activity per week.';
    } else {
      category = 'Obese'; color = '#ef4444';
      advice = 'Consider consulting a healthcare provider for a personalized wellness plan.';
    }

    const idealMin = unit === 'metric' ? (18.5 * ((h / 100) ** 2)).toFixed(1) : (18.5 * h * h / 703).toFixed(1);
    const idealMax = unit === 'metric' ? (24.9 * ((h / 100) ** 2)).toFixed(1) : (24.9 * h * h / 703).toFixed(1);

    setResult({ bmi, category, color, advice, idealMin, idealMax });
  }

  function reset() { setHeight(''); setWeight(''); setResult(null); }

  const bmiPosition = result ? Math.min(Math.max(((result.bmi - 10) / 35) * 100, 0), 100) : 0;

  return (
    <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'Space Grotesk' }}>⚖️ BMI Calculator</h3>
        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-surface-3)' }}>
          {['metric', 'imperial'].map(u => (
            <button key={u} onClick={() => { setUnit(u); setResult(null); }}
              style={{ padding: '5px 14px', background: unit === u ? 'var(--color-primary)' : 'var(--color-bg-2)', color: unit === u ? 'white' : 'var(--color-muted)', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
            HEIGHT ({unit === 'metric' ? 'cm' : 'inches'})
          </label>
          <input className="hts-input" type="number" value={height} onChange={e => setHeight(e.target.value)}
            placeholder={unit === 'metric' ? '170' : '67'} min="1" />
        </div>
        <div>
          <label style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
            WEIGHT ({unit === 'metric' ? 'kg' : 'lbs'})
          </label>
          <input className="hts-input" type="number" value={weight} onChange={e => setWeight(e.target.value)}
            placeholder={unit === 'metric' ? '65' : '143'} min="1" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: result ? '20px' : '0' }}>
        <button onClick={calculate} className="btn-primary" style={{ flex: 1, padding: '11px' }}>
          Calculate BMI
        </button>
        {result && (
          <button onClick={reset} style={{ padding: '11px 16px', borderRadius: '10px', background: 'var(--color-surface-2)', border: '1px solid var(--color-surface-3)', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '13px' }}>
            Reset
          </button>
        )}
      </div>

      {result && (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* BMI value */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '12px', background: `${result.color}14`, border: `1px solid ${result.color}30` }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: result.color, letterSpacing: '0.06em', marginBottom: '2px' }}>YOUR BMI</div>
              <div style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Space Grotesk', color: result.color }}>{result.bmi}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: result.color }}>{result.category}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
                Ideal: {result.idealMin}–{result.idealMax} {unit === 'metric' ? 'kg' : 'lbs'}
              </div>
            </div>
          </div>

          {/* Scale bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-muted)', marginBottom: '6px', fontWeight: 600 }}>
              <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
            </div>
            <div style={{ height: '10px', borderRadius: '99px', background: 'linear-gradient(to right, #06b6d4 0%, #10b981 28%, #f59e0b 57%, #ef4444 100%)', position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                left: `${bmiPosition}%`,
                width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                border: `3px solid ${result.color}`, boxShadow: `0 0 8px ${result.color}88`,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-muted)', marginTop: '4px' }}>
              <span>10</span><span>18.5</span><span>25</span><span>30</span><span>45</span>
            </div>
          </div>

          {/* Advice */}
          <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: '13px', color: 'var(--color-muted-light)', lineHeight: 1.6 }}>{result.advice}</p>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--color-muted)', textAlign: 'center' }}>
            * BMI is a screening tool, not a diagnostic measure. Consult a healthcare provider for medical advice.
          </p>
        </div>
      )}
    </div>
  );
}
