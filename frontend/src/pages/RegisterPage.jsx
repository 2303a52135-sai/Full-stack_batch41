import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400'];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-pink-500 via-purple-600 to-primary-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {['✨','🌟','💎','🎨','👑','🌈','🦋','💫'].map((e, i) => (
            <motion.span key={i} className="absolute text-4xl select-none"
              style={{ top: `${8 + i * 11}%`, left: `${10 + (i * 19) % 75}%` }}
              animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.4 }}>
              {e}
            </motion.span>
          ))}
        </div>
        <div className="relative text-center text-white">
          <h1 className="font-display text-4xl font-bold mb-3">Join StyleVault</h1>
          <p className="text-white/80 text-lg">Build your perfect digital wardrobe</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {['Free forever','Smart AI suggestions','Outfit planner','Travel assistant'].map(f => (
              <div key={f} className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
                <span className="text-green-300">✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-bg)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">SV</span>
            </div>
            <span className="font-display font-semibold text-lg gradient-text">StyleVault</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-[var(--color-text)] mb-1">Create account</h2>
          <p className="text-[var(--color-text-muted)] text-sm mb-8">Start your style journey today</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input className="input pl-9" placeholder="Alex Johnson" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required minLength={2} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input type="email" className="input pl-9" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input type={showPwd ? 'text' : 'password'} className="input pl-9 pr-10" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                  {showPwd ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(n => (
                      <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength ? strengthColor[strength] : 'bg-gray-200 dark:bg-dark-600'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">{strengthLabel[strength]}</span>
                </div>
              )}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input type="password" className={`input pl-9 ${form.confirm && form.confirm !== form.password ? 'ring-2 ring-red-400' : ''}`}
                  placeholder="Repeat password" value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
