import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';

const SUGGESTIONS = [
  "Why am I feeling tired even after 8 hours of sleep?",
  "What should I eat to improve my mood today?",
  "Give me a 5-minute stress relief routine",
  "How can I improve my sleep quality?",
  "What does my health data say about my habits this week?",
  "Tips for staying hydrated during study sessions",
  "How do I reduce stress during exam season?",
  "What foods help with better sleep?",
];

export default function AIAssistant() {
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [healthData,  setHealthData]  = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [apiError,    setApiError]    = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    Promise.all([
      API.get('/health/dashboard'),
      API.get('/health/sleep'),
      API.get('/health/mood'),
      API.get('/health/symptoms'),
    ]).then(([dash, sleep, mood, symptoms]) => {
      setHealthData({
        summary:        dash.data.data?.weekSummary || {},
        recentSleep:    (sleep.data.data    || []).slice(0, 5),
        recentMood:     (mood.data.data     || []).slice(0, 5),
        recentSymptoms: (symptoms.data.data || []).slice(0, 5),
      });
    }).catch(console.error)
      .finally(() => setDataLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function buildSystemPrompt() {
    const user = JSON.parse(localStorage.getItem('hts_user') || '{}');
    let ctx = `You are HealthBot, a friendly and knowledgeable wellness assistant inside "HealthTrack" — a student wellness platform built as a B.Tech CSE project at Techno Bengal Institute of Technology.

You help users understand their health data, give evidence-based wellness advice, and motivate healthy habits. Be warm, concise, and practical. Use emojis naturally. Always remind users to consult a doctor for medical concerns — never diagnose.

User name: ${user.name || 'Student'}`;

    if (healthData?.summary) {
      const s = healthData.summary;
      ctx += `\n\nUser's health data (last 7 days):
- Average sleep: ${s.avgSleepHours || 'N/A'} hours/night
- Average mood: ${s.avgMoodRating || 'N/A'}/5
- Active days: ${s.activeDays || 0}/7
- Symptoms logged: ${s.symptomsLogged || 0}
- Sleep consistency: ${s.sleepConsistency || 0}%
- Nutrition consistency: ${s.nutritionConsistency || 0}%
- Sleep streak: ${s.sleepStreak || 0} days`;

      if (healthData.recentSleep?.length > 0)
        ctx += `\nRecent sleep: ${healthData.recentSleep.map(l => `${l.duration}h (quality ${l.quality}/5)`).join(', ')}`;
      if (healthData.recentMood?.length > 0)
        ctx += `\nRecent mood: ${healthData.recentMood.map(l => `mood ${l.moodRating}/5, stress ${l.stressLevel}/5`).join(', ')}`;
      if (healthData.recentSymptoms?.length > 0)
        ctx += `\nRecent symptoms: ${healthData.recentSymptoms.map(l => `${l.symptom} (${l.domain}, severity ${l.severity}/5)`).join(', ')}`;
    }

    ctx += `\n\nGive personalized advice based on their data. Keep responses concise (2-3 paragraphs). Use **bold** for key points. Be encouraging and supportive.`;
    return ctx;
  }

  async function sendMessage(text) {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput('');
    setApiError('');

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await API.post('/ai/chat', {
        messages: newMessages,
        systemPrompt: buildSystemPrompt(),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);

    } catch (err) {
      const errMsg  = err.response?.data?.message || '';
      const errCode = err.response?.data?.code    || '';
      const status  = err.response?.status;

      // No API key
      if (status === 401 || errCode === 'NO_API_KEY' || errCode === 'INVALID_API_KEY' ||
          errMsg.toLowerCase().includes('not configured')) {
        setApiError('no_key');
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      // Quota exceeded
      if (status === 429 || errCode === 'QUOTA_EXCEEDED' || errMsg.toLowerCase().includes('quota')) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `⏳ **Free quota temporarily reached.** \n\nThe Gemini free tier allows 15 requests per minute. Please **wait 1-2 minutes** and try again.\n\n💡 *Tip: Keep your questions concise to use fewer tokens.*`,
          },
        ]);
        return;
      }

      // Generic error
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Something went wrong.** ${errMsg || 'Please try again in a moment.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function renderMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }

  const userInitial = (JSON.parse(localStorage.getItem('hts_user') || '{}').name || 'U')[0].toUpperCase();

  // ── No API key screen ──────────────────────────────────────────────────────
  if (apiError === 'no_key') {
    return (
      <div style={{ maxWidth: '600px' }}>
        <div style={{ padding: '28px', borderRadius: '16px', background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.25)' }}>
          <div style={{ fontSize: '40px', marginBottom: '14px' }}>🔑</div>
          <h3 style={{ fontWeight: 700, fontSize: '18px', fontFamily: 'Space Grotesk', marginBottom: '10px', color: '#93c5fd' }}>
            Gemini API Key Required
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-light)', lineHeight: 1.7, marginBottom: '20px' }}>
            The AI Assistant uses <strong style={{ color: 'var(--color-text)' }}>Google Gemini</strong> which is completely <strong style={{ color: '#4ade80' }}>FREE</strong>. Follow these steps:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {[
              { step: '1', text: 'Go to Google AI Studio (free, no credit card)', link: 'https://aistudio.google.com/app/apikey' },
              { step: '2', text: 'Sign in with your Google account' },
              { step: '3', text: 'Click "Create API Key" → Copy it (starts with AIzaSy...)' },
              { step: '4', text: 'Open: C:\\Users\\Hp\\OneDrive\\Desktop\\Health\\backend\\.env' },
              { step: '5', text: 'Set GEMINI_API_KEY=AIzaSy_your_key_here' },
              { step: '6', text: 'In backend terminal type: rs  then press Enter' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: '10px', background: 'var(--color-surface)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'white', flexShrink: 0 }}>{s.step}</div>
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted-light)', margin: 0 }}>{s.text}</p>
                  {s.link && <a href={s.link} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#60a5fa', textDecoration: 'none' }}>{s.link} →</a>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 16px', borderRadius: '10px', background: '#0d1117', border: '1px solid var(--color-surface-3)', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.05em' }}>ADD THIS TO YOUR .env FILE:</p>
            <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#86efac', margin: 0 }}>GEMINI_API_KEY=AIzaSy_your_key_here</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setApiError('')} className="btn-primary" style={{ flex: 1 }}>✅ I've added the key — Try Again</button>
            <button onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
              style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              Get Free Key →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main chat UI ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 140px)' }}>

      {/* Header */}
      <div className="fade-up" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #4285f4, #34a853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🤖</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Space Grotesk', margin: 0 }}>AI Health Assistant</h2>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '99px', background: 'rgba(52,168,83,0.15)', color: '#4ade80', border: '1px solid rgba(52,168,83,0.3)' }}>
                Powered by Gemini ✨
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <div className="pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: dataLoading ? '#f59e0b' : '#10b981' }} />
              <span style={{ fontSize: '12px', color: dataLoading ? '#fbbf24' : '#10b981', fontWeight: 600 }}>
                {dataLoading ? 'Loading your health data…' : 'Online · Personalized with your health data'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rate limit info banner */}
      <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: '12px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span>ℹ️</span>
        <span>Gemini free tier: 15 requests/minute, 1,500/day. If you hit a limit, wait 1 minute and retry.</span>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>

        {/* Welcome + suggestions */}
        {messages.length === 0 && (
          <div className="fade-up">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4285f4, #34a853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🤖</div>
              <div style={{ padding: '16px 18px', borderRadius: '0 16px 16px 16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)', maxWidth: '78%' }}>
                <p style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.7, margin: 0 }}>
                  Hey! 👋 I'm <strong>HealthBot</strong>, your personal AI wellness assistant powered by <strong>Google Gemini</strong>.<br /><br />
                  I have access to your recent health data and can give you personalized advice on sleep, nutrition, stress, and more. What would you like to know today?
                </p>
              </div>
            </div>
            <div style={{ marginTop: '16px', marginLeft: '48px' }}>
              <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>TRY ASKING:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    style={{ padding: '8px 14px', borderRadius: '99px', border: '1px solid rgba(66,133,244,0.3)', background: 'rgba(66,133,244,0.08)', color: '#93c5fd', cursor: 'pointer', fontSize: '12px', fontWeight: 500, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(66,133,244,0.18)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(66,133,244,0.08)'; }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4285f4, #34a853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🤖</div>
            )}
            <div style={{
              padding: '14px 18px', maxWidth: '76%',
              borderRadius: msg.role === 'user' ? '16px 0 16px 16px' : '0 16px 16px 16px',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #4285f4, #1d4ed8)' : 'var(--color-surface)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)',
              boxShadow: msg.role === 'user' ? '0 4px 14px rgba(66,133,244,0.3)' : 'none',
            }}>
              <p style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.75, margin: 0 }}
                dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }} />
            </div>
            {msg.role === 'user' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {userInitial}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4285f4, #34a853)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
            <div style={{ padding: '16px 20px', borderRadius: '0 16px 16px 16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4285f4', animation: 'pulse-dot 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fade-up" style={{ flexShrink: 0, display: 'flex', gap: '10px', padding: '14px 16px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <input className="hts-input" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask me anything about your health… (Press Enter to send)"
          disabled={loading}
          style={{ flex: 1, background: 'var(--color-bg-2)' }} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="btn-primary"
          style={{ padding: '12px 22px', flexShrink: 0, opacity: input.trim() && !loading ? 1 : 0.5, background: 'linear-gradient(135deg, #4285f4, #1d4ed8)', boxShadow: '0 4px 14px rgba(66,133,244,0.3)' }}>
          {loading ? '⏳' : 'Send ↑'}
        </button>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--color-muted)', textAlign: 'center', marginTop: '-8px' }}>
        HealthBot gives wellness guidance only — not medical advice. Always consult a doctor for health concerns.
      </p>
    </div>
  );
}
