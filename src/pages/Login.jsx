import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Sparkles, TrendingUp, Target, Zap, Shield,
  CheckCircle2, Brain
} from 'lucide-react';

/* ─── tiny animated stat card ─────────────────────────────── */
function StatCard({ icon: Icon, label, value, delay, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-xl"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-white font-bold text-base leading-none">{value}</p>
        <p className="text-white/40 text-[11px] mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

/* ─── animated floating orb ───────────────────────────────── */
function Orb({ className, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/* ─── animated grid background ────────────────────────────── */
function GridBg() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(99,102,241,0.07) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(99,102,241,0.07) 1px, transparent 1px)
        `,
        backgroundSize: '52px 52px',
      }}
    />
  );
}

/* ─── main component ───────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithToken } = useAuth();

  const [tab, setTab]           = useState('login'); // 'login' | 'signup'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const urlError = searchParams.get('error');

    if (token) {
      loginWithToken(token);
      navigate('/');
    } else if (urlError) {
      setError('Social authentication failed. Please try again.');
    }
  }, [searchParams, loginWithToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (tab === 'signup' && !name) { setError('Please enter your name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setSuccess(true);
    await new Promise(r => setTimeout(r, 600));
    login(email, password);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#07070f] overflow-hidden relative font-sans">

      {/* ══════════════════════════════════════════════════
          LEFT PANEL — Branding / Illustration
      ══════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden">
        <GridBg />

        {/* Glow orbs */}
        <Orb className="w-[520px] h-[520px] bg-indigo-600/20 blur-[120px] -top-32 -left-32" delay={0} />
        <Orb className="w-[380px] h-[380px] bg-violet-500/20 blur-[100px] bottom-10 right-0" delay={1.5} />
        <Orb className="w-[260px] h-[260px] bg-cyan-500/15 blur-[80px] top-1/2 left-1/3" delay={3} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">CareerOS</span>
            <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">AI</span>
          </motion.div>

          {/* Central visual */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Big headline */}
              <h1 className="text-5xl xl:text-6xl font-bold leading-[1.1] mb-5">
                <span className="text-white">Build your</span>
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #22d3ee 100%)' }}
                >
                  dream career
                </span>
                <br />
                <span className="text-white">with AI.</span>
              </h1>
              <p className="text-white/40 text-base leading-relaxed max-w-sm mb-10">
                CareerOS uses artificial intelligence to analyse your resume, predict success rates, and help you land more interviews — faster.
              </p>

              {/* Feature chips */}
              <div className="flex flex-wrap gap-2 mb-10">
                {[
                  { icon: Brain,     label: 'AI Analysis' },
                  { icon: Target,    label: 'Job Matching' },
                  { icon: TrendingUp,label: 'Skill Gaps' },
                  { icon: Shield,    label: 'ATS Optimised' },
                  { icon: Zap,       label: 'Instant Results' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/60"
                  >
                    <Icon size={12} className="text-indigo-400" />
                    {label}
                  </div>
                ))}
              </div>

              {/* Floating stat cards */}
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <StatCard icon={TrendingUp} label="Resumes analysed" value="128K+"   color="bg-gradient-to-br from-indigo-500 to-indigo-700" delay={0.5} />
                <StatCard icon={CheckCircle2} label="Jobs landed"     value="43K+"   color="bg-gradient-to-br from-violet-500 to-violet-700"  delay={0.65} />
                <StatCard icon={Zap}          label="Avg. score boost" value="+34%"  color="bg-gradient-to-br from-cyan-500 to-cyan-700"       delay={0.8} />
                <StatCard icon={Brain}        label="AI suggestions"   value="∞"     color="bg-gradient-to-br from-pink-500 to-rose-700"       delay={0.95} />
              </div>
            </motion.div>
          </div>

          {/* Bottom */}
          <p className="relative z-10 text-white/20 text-xs">
            © {new Date().getFullYear()} CareerOS · Privacy · Terms
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT PANEL — Form
      ══════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        {/* Mobile glow */}
        <Orb className="w-72 h-72 bg-indigo-600/20 blur-[90px] -top-10 right-0 lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="w-full max-w-md z-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">CareerOS</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
            {['login', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-white mb-1">
                {tab === 'login' ? 'Welcome back 👋' : 'Start your journey 🚀'}
              </h2>
              <p className="text-white/40 text-sm">
                {tab === 'login'
                  ? 'Sign in to continue building your future'
                  : 'Join 128,000+ professionals accelerating their career'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
              className="flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-sm text-white/70 hover:text-white transition-all duration-200 group"
            >
              {/* Google icon */}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/linkedin'}
              className="flex items-center justify-center gap-2.5 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 rounded-xl py-2.5 text-sm text-white/70 hover:text-white transition-all duration-200"
            >
              {/* LinkedIn icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/25 text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <AnimatePresence>
              {tab === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-white/20"
                      placeholder="Alex Johnson"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all placeholder-white/20"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Password</label>
                {tab === 'login' && (
                  <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-11 py-3 text-white text-sm outline-none transition-all placeholder-white/20"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button"
                  id="toggle-password"
                  tabIndex={-1}
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Password strength bar (signup only) */}
              <AnimatePresence>
                {tab === 'signup' && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1"
                  >
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                            password.length >= i * 3
                              ? i <= 1 ? 'bg-rose-500'
                              : i <= 2 ? 'bg-orange-400'
                              : i <= 3 ? 'bg-yellow-400'
                              : 'bg-emerald-400'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-white/30">
                      {password.length < 4 ? 'Too short' : password.length < 7 ? 'Weak' : password.length < 10 ? 'Fair' : 'Strong ✓'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Remember me (login only) */}
            {tab === 'login' && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <span className="text-sm text-white/40">Remember me for 30 days</span>
              </label>
            )}

            {/* Submit */}
            <motion.button
              id="login-submit"
              type="submit"
              disabled={loading || success}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full relative flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20"
              style={{
                background: success
                  ? 'linear-gradient(135deg,#10b981,#059669)'
                  : 'linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)',
                backgroundSize: '200% 200%',
              }}
            >
              {/* Shimmer */}
              {!success && !loading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  animate={{ x: ['-150%', '250%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                />
              )}

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Success!
                  </motion.span>
                ) : loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {tab === 'login' ? 'Signing in…' : 'Creating account…'}
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    {tab === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={15} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Switch tab link */}
          <p className="mt-6 text-center text-sm text-white/30">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              {tab === 'login' ? 'Create one free' : 'Sign in'}
            </button>
          </p>

          {/* Trust row */}
          <div className="mt-8 flex items-center justify-center gap-4 text-white/20 text-[11px]">
            <span className="flex items-center gap-1"><Shield size={11} /> SOC 2 compliant</span>
            <span>·</span>
            <span>256-bit encryption</span>
            <span>·</span>
            <span>No spam ever</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
