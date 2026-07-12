import { useState, useCallback, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight,
  FiMoon, FiPieChart, FiActivity, FiClipboard, FiSmile,
} from 'react-icons/fi';
import API from '../utils/api';
import { useAuthContext } from '../context/AuthContext';

/* The five app features — reused for both the 3D floating cards and the
   chip row, so copy only lives in one place. */
const FEATURES = [
  { id: 'sleep', label: 'Sleep Tracking', icon: FiMoon, pos: { top: '10%', left: '14%' }, depth: 18, delay: 0.1, dur: 7 },
  { id: 'nutrition', label: 'Nutrition Log', icon: FiPieChart, pos: { top: '8%', right: '8%' }, depth: -14, delay: 0.5, dur: 8 },
  { id: 'activity', label: 'Activity Tracker', icon: FiActivity, pos: { bottom: '30%', left: '4%' }, depth: 24, delay: 0.3, dur: 6.5 },
  { id: 'symptom', label: 'Symptom Checker', icon: FiClipboard, pos: { bottom: '16%', right: '12%' }, depth: -20, delay: 0.8, dur: 7.5 },
  { id: 'mood', label: 'Mood Journal', icon: FiSmile, pos: { bottom: '2%', left: '30%' }, depth: 30, delay: 0.2, dur: 7 },
];

/* Signature element: a slim ECG pulse, used only as the button's
   loading state so it reads as "checking vitals", not a literal reading. */
function PulseLine({ width = 52, height = 16 }) {
  const d = `M0 ${height / 2} H${width * 0.22} L${width * 0.32} ${height * 0.15} L${width * 0.4} ${height * 0.92} L${width * 0.48} ${height * 0.3} L${width * 0.55} ${height / 2} H${width}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} fill="none">
      <motion.path
        d={d} stroke="#a5e8f2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        pathLength={1} initial={{ pathLength: 0, opacity: 0.3 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

function CrossGlyph({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" fill="currentColor" />
    </svg>
  );
}

/* One floating feature card inside the 3D scene */
function FeatureCard({ feature, parallaxX, parallaxY }) {
  const Icon = feature.icon;
  const x = useTransform(parallaxX, (v) => v * feature.depth);
  const y = useTransform(parallaxY, (v) => v * feature.depth);
  return (
    <motion.div
      style={{ ...feature.pos, x, y, position: 'absolute' }}
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: feature.delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: feature.dur, repeat: Infinity, ease: 'easeInOut', delay: feature.delay }}
        whileHover={{ scale: 1.08, rotateX: 6, rotateY: -6 }}
        className="flex w-[132px] items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-xl shadow-[0_18px_50px_-15px_rgba(6,182,212,0.35)]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-400/30 to-cyan-300/30 text-cyan-200">
          <Icon size={17} />
        </span>
        <span className="text-[12px] font-medium leading-tight text-white/80">{feature.label}</span>
      </motion.div>
    </motion.div>
  );
}

/* Left panel: perspective 3D scene with mouse parallax */
function Scene3D() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 60, damping: 18 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 18 });
  const rotateX = useTransform(springY, [-1, 1], [8, -8]);
  const rotateY = useTransform(springX, [-1, 1], [-10, 10]);

  const onMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }, [rawX, rawY]);
  const onLeave = useCallback(() => { rawX.set(0); rawY.set(0); }, [rawX, rawY]);

  return (
    <div onMouseMove={onMove} onMouseLeave={onLeave} className="relative h-full w-full" style={{ perspective: '1400px' }}>
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative h-full w-full">
        <motion.div
          className="absolute rounded-full border border-cyan-300/20"
          style={{ width: 360, height: 360, top: '20%', left: '24%' }}
          animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute rounded-full border border-indigo-300/15"
          style={{ width: 280, height: 280, top: '26%', left: '34%' }}
          animate={{ rotate: -360 }} transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        />
        {FEATURES.map((f) => (
          <FeatureCard key={f.id} feature={f} parallaxX={springX} parallaxY={springY} />
        ))}
      </motion.div>
    </div>
  );
}

/* Ambient background: gradient, blurred orbs, grid, drifting motes */
function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(1100px 700px at 12% 8%, rgba(99,102,241,0.16), transparent 60%),' +
          'radial-gradient(900px 600px at 88% 82%, rgba(6,182,212,0.14), transparent 60%),' +
          'linear-gradient(160deg, #060b18 0%, #0a1330 55%, #061a24 100%)',
      }} />
      <div className="absolute inset-0 opacity-[0.07] ht-grid" />
      <motion.div className="absolute rounded-full" style={{ width: 420, height: 420, top: '-10%', left: '-8%', background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)', filter: 'blur(40px)' }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute rounded-full" style={{ width: 360, height: 360, bottom: '-12%', right: '-6%', background: 'radial-gradient(circle, rgba(6,182,212,0.3), transparent 70%)', filter: 'blur(40px)' }}
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span key={i} className="absolute rounded-full bg-cyan-100"
          style={{ left: `${(i * 71) % 100}%`, bottom: '-5%', width: 2 + (i % 3), height: 2 + (i % 3), opacity: 0.5 }}
          animate={{ y: ['0vh', '-120vh'], opacity: [0, 0.6, 0] }}
          transition={{ duration: 10 + (i % 5) * 2.2, delay: (i % 7) * 0.9, repeat: Infinity, ease: 'linear' }} />
      ))}
    </div>
  );
}

/* Ripple + tilt submit button */
function SubmitButton({ loading }) {
  const [ripples, setRipples] = useState([]);
  const addRipple = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((rs) => rs.filter((rp) => rp.id !== id)), 650);
  };
  return (
    <motion.button
      type="submit" disabled={loading} onPointerDown={addRipple}
      whileHover={{ scale: loading ? 1 : 1.015, boxShadow: '0 12px 36px -8px rgba(6,182,212,0.55)' }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(99,102,241,0.6)] disabled:cursor-not-allowed disabled:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1330]"
    >
      {ripples.map((r) => (
        <motion.span key={r.id} className="pointer-events-none absolute rounded-full bg-white/40"
          style={{ left: r.x, top: r.y, translateX: '-50%', translateY: '-50%' }}
          initial={{ width: 0, height: 0, opacity: 0.5 }} animate={{ width: 260, height: 260, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }} />
      ))}
      <span className="relative z-10 flex items-center justify-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span key="loading" className="flex items-center gap-2" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
              <PulseLine /> Signing in
            </motion.span>
          ) : (
            <motion.span key="idle" className="flex items-center gap-2" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
              Sign In <FiArrowRight size={17} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusField, setFocusField] = useState(null);
  const emailId = useId();
  const passId = useId();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  }

  const cardVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#060b18] text-white md:flex-row">
      <style>{`
        .ht-grid { background-image: linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px); background-size: 46px 46px; animation: ht-grid-pan 26s linear infinite; }
        @keyframes ht-grid-pan { from { background-position: 0 0, 0 0; } to { background-position: 46px 92px, 46px 92px; } }
        .ht-input:focus { box-shadow: 0 0 0 3px rgba(103,232,249,0.18), 0 0 24px -4px rgba(6,182,212,0.45); }
      `}</style>

      <AmbientBackground />

      {/* Left: 3D illustration panel (desktop / tablet only) */}
      <div className="relative z-10 flex w-full flex-col justify-between p-6 sm:p-8 md:w-[52%] md:p-12 xl:p-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-cyan-500/20">
            <CrossGlyph size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>HealthTrack</span>
        </motion.div>

        <div className="relative my-6 h-[240px] sm:h-[300px] md:my-8 md:h-auto md:flex-1"><Scene3D /></div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-[2.4rem] md:text-[2.6rem] xl:text-[3rem]" style={{ fontFamily: 'Space Grotesk' }}>
            Your wellness,<br />
            <span className="bg-gradient-to-r from-indigo-300 to-cyan-200 bg-clip-text text-transparent">all in one place.</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
            A science-backed wellness platform built for students. Track every aspect of your health in one dashboard.
          </p>

          <p className="mt-8 text-xs text-white/35">B.Tech CSE Project · Techno Bengal Institute of Technology</p>
        </motion.div>
      </div>

      {/* Right: glass login card */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-5 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px] rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-9"
        >
          <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="text-[28px] font-extrabold tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
            Welcome back
          </motion.h2>
          <p className="mt-1.5 text-sm text-white/50">Sign in to continue your wellness journey</p>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 20 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.25 }}
                className="flex items-start gap-2 overflow-hidden rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-3 text-[13px] text-rose-200" role="alert">
                <FiAlertCircle className="mt-0.5 shrink-0" size={15} /><span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form variants={cardVariants} initial="hidden" animate="show" onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5" noValidate>
            <motion.div variants={itemVariants}>
              <label htmlFor={emailId} className="mb-1.5 block text-[11px] font-bold tracking-[0.09em] text-white/50">EMAIL ADDRESS</label>
              <div className={`flex items-center gap-2.5 rounded-xl border bg-white/5 px-3.5 transition-colors ${focusField === 'email' ? 'border-cyan-300/60' : 'border-white/10'}`}>
                <FiMail size={16} className="shrink-0 text-white/40" />
                <input id={emailId} className="ht-input w-full bg-transparent py-3 text-[14px] text-white placeholder-white/30 outline-none" type="email" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocusField('email')} onBlur={() => setFocusField(null)} placeholder="Enter your email" autoComplete="email" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor={passId} className="block text-[11px] font-bold tracking-[0.09em] text-white/50">PASSWORD</label>
                <Link to="/forgot-password" className="text-[12px] font-medium text-indigo-300 transition-colors hover:text-cyan-200">Forgot password?</Link>
              </div>
              <div className={`flex items-center gap-2.5 rounded-xl border bg-white/5 px-3.5 transition-colors ${focusField === 'password' ? 'border-cyan-300/60' : 'border-white/10'}`}>
                <FiLock size={16} className="shrink-0 text-white/40" />
                <input id={passId} className="ht-input w-full bg-transparent py-3 text-[14px] text-white placeholder-white/30 outline-none" type={showPass ? 'text' : 'password'} required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocusField('password')} onBlur={() => setFocusField(null)} placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass((s) => !s)} className="shrink-0 text-white/40 transition-colors hover:text-white/70 focus-visible:outline-none" aria-label={showPass ? 'Hide password' : 'Show password'} aria-pressed={showPass}>
                  {showPass ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </motion.div>

            <motion.label variants={itemVariants} className="flex select-none items-center gap-2.5 text-[13px] text-white/60">
              <span className="relative inline-flex h-4 w-4 items-center justify-center">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer sr-only" />
                <span className="h-4 w-4 rounded-[5px] border border-white/25 bg-white/5 transition-colors peer-checked:border-cyan-300 peer-checked:bg-cyan-400/90 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-300/50" />
                <svg className="pointer-events-none absolute h-2.5 w-2.5 scale-0 text-[#060b18] transition-transform peer-checked:scale-100" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5l3.2 3.2L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Remember me
            </motion.label>

            <motion.div variants={itemVariants}><SubmitButton loading={loading} /></motion.div>
          </motion.form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="mt-7 text-center text-[13px] text-white/50">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-cyan-200 transition-colors hover:text-cyan-100">Create one free</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}