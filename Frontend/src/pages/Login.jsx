import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();

  // Check URL query parameters for redirect reason (e.g. account suspended or session expired)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const reason = params.get('reason');
      if (reason === 'suspended') {
        setError('Your account has been suspended by the administrator. Access denied.');
      } else if (reason === 'session_expired') {
        setError('Your session has expired. Please sign in again.');
      }
    } catch (err) {
      console.error('Error reading url params:', err);
    }
  }, []);

  // Quick Demo Autofill (matches seeded demo credentials)
  const handleDemoFill = () => {
    setEmail('admin@leadflow.io');
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      setIsLoading(false);
      setSuccess(true);
    } catch (err) {
      setIsLoading(false);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to connect to server. Please ensure backend is running on port 3000.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-700 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      
      {/* ======================================================== */}
      {/* VIBRANT AURORA AMBIENT GLOW & RADIAL LIGHTING            */}
      {/* ======================================================== */}
      <div className="pointer-events-none fixed -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/35 blur-3xl animate-pulse" />
      <div className="pointer-events-none fixed top-1/2 -right-24 h-96 w-96 rounded-full bg-emerald-300/35 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 left-1/3 h-96 w-96 rounded-full bg-teal-300/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.18),_transparent_65%)]" />

      {/* ======================================================== */}
      {/* 1. TOP-LEFT: HOME BUTTON                                 */}
      {/* ======================================================== */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold border border-white/30 shadow-md backdrop-blur-md transition-all cursor-pointer hover:shadow-lg"
        >
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM-LEFT CORNER: 2D LAPTOP & COFFEE (IMAGE 1 STYLE)*/}
      {/* ======================================================== */}
      <div className="hidden lg:block absolute -bottom-6 -left-6 z-10 pointer-events-none select-none">
        <svg width="340" height="280" viewBox="0 0 340 280" fill="none" className="filter drop-shadow-md">
          {/* Soft background glow ring */}
          <circle cx="80" cy="220" r="130" fill="#ffffff" fillOpacity="0.14" />

          {/* Mini 2D Laptop Base & Screen */}
          <g transform="translate(60, 90)">
            {/* Screen Bezel */}
            <rect x="30" y="20" width="160" height="100" rx="8" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
            {/* Inner Display with Charts */}
            <rect x="37" y="27" width="146" height="86" rx="4" fill="#0f172a" />
            
            {/* Mini Header bar */}
            <rect x="37" y="27" width="146" height="12" fill="#1e293b" />
            <circle cx="45" cy="33" r="2.5" fill="#ef4444" />
            <circle cx="52" cy="33" r="2.5" fill="#f59e0b" />
            <circle cx="59" cy="33" r="2.5" fill="#10b981" />
            <text x="110" y="35" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="900">LEADFLOW DASHBOARD</text>

            {/* Mini Waterfall bars */}
            <rect x="48" y="75" width="12" height="30" rx="2" fill="#2dd4bf" />
            <rect x="66" y="62" width="12" height="43" rx="2" fill="#10b981" />
            <rect x="84" y="52" width="12" height="53" rx="2" fill="#2dd4bf" />
            <rect x="102" y="45" width="12" height="60" rx="2" fill="#10b981" />

            {/* Trend line */}
            <path d="M 54 70 Q 75 55, 90 48 T 120 42" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />

            {/* Laptop Base */}
            <polygon points="15,120 205,120 220,134 0,134" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            <rect x="90" y="123" width="40" height="6" rx="1.5" fill="#94a3b8" opacity="0.6" />
          </g>

          {/* Coffee Mug with Steam */}
          <g transform="translate(30, 180)">
            <path d="M 8 -8 Q 12 -14 8 -20" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M 15 -6 Q 19 -12 15 -18" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M 0 6 C -8 6, -8 22, 0 22" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <rect x="0" y="0" width="24" height="30" rx="4" fill="#475569" />
          </g>

          {/* Stack of Lead Books */}
          <g transform="translate(195, 195)">
            <rect x="0" y="14" width="60" height="10" rx="2" fill="#0d9488" />
            <rect x="4" y="5" width="56" height="10" rx="2" fill="#10b981" />
            <rect x="2" y="-4" width="58" height="10" rx="2" fill="#059669" />
          </g>
        </svg>
      </div>



      {/* Success Notification */}
      {success && (
        <div className="fixed top-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-2xl shadow-xl text-xs font-bold animate-in slide-in-from-top duration-200">
          <CheckCircle2 size={16} />
          <span>Logged in successfully! Redirecting to Dashboard...</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. CENTER: CLEAN & FOCUSED LOGIN CARD (EXACTLY AS DESIRED)*/}
      {/* ======================================================== */}
      <div className="w-full max-w-[430px] bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] p-8 sm:p-10 space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-xs mb-1">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
            >
              <circle cx="20" cy="20" r="19" fill="#ECFDF5" />
              <path
                d="M11 20C11 15.0294 15.0294 11 20 11C23.5 11 26.5 13 27.8 16"
                stroke="#059669"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M29 20C29 24.9706 24.9706 29 20 29C16.5 29 13.5 27 12.2 24"
                stroke="#10B981"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="20" cy="20" r="4.5" fill="#047857" />
            </svg>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome to LeadFlow
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Sign in to access your CRM pipeline & leads
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 block">
              Username or Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 block">
                Password
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset instructions sent to your email!');
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Demo Fill */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-600">Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleDemoFill}
              className="text-[11px] font-bold text-slate-400 hover:text-emerald-700 underline cursor-pointer"
            >
              Fill Demo User
            </button>
          </div>

          {/* Log In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-extrabold shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-3 bg-white text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            or continue with
          </span>
        </div>

        {/* Social SSO Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDemoFill}
            className="py-2.5 px-3 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleDemoFill}
            className="py-2.5 px-3 rounded-xl border border-slate-200/90 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
              <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
            </svg>
            <span>Microsoft</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-xs text-slate-400">
          <span>Need enterprise access? </span>
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              handleDemoFill();
            }}
            className="font-bold text-emerald-700 hover:text-emerald-900"
          >
            Contact Admin
          </a>
        </div>
      </div>
    </div>
  );
}
