import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ initialMode = 'login' }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          department: form.department || undefined,
          phone: form.phone || undefined
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to complete this request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-[0_28px_80px_-42px_rgba(32,37,34,0.35)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-[#f1f4f1] p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="brand-mark auth-mark flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-black">EduMerge Support</p>
              <h1 className="mt-3 max-w-sm text-4xl font-black leading-tight tracking-[-0.06em] text-black">
                Support that keeps campus moving.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-black">
                Submit requests, follow progress, and connect with the right support team from one place.
              </p>
            </div>
            <p className="text-xs font-medium text-black">Student Support & Ticket Management</p>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-black">Welcome</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-black">
                  {isLogin ? 'Sign in to your account' : 'Create your account'}
                </h2>
              </div>
              <div className="hidden rounded-full border border-stone-200 bg-[#f9faf9] p-1 sm:flex">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${isLogin ? 'bg-white text-black shadow-sm' : 'text-black'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${!isLogin ? 'bg-white text-black shadow-sm' : 'text-black'}`}
                >
                  Sign up
                </button>
              </div>
            </div>

            <div className="mb-6 flex rounded-xl border border-stone-200 bg-[#f9faf9] p-1 sm:hidden">
              <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`flex-1 rounded-lg py-2 text-xs font-bold ${isLogin ? 'bg-white text-black shadow-sm' : 'text-black'}`}>Login</button>
              <button type="button" onClick={() => { setMode('signup'); setError(''); }} className={`flex-1 rounded-lg py-2 text-xs font-bold ${!isLogin ? 'bg-white text-black shadow-sm' : 'text-black'}`}>Sign up</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Full name</span>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
                    <input name="name" value={form.name} onChange={updateField} required placeholder="Your name" className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm text-black outline-none transition placeholder:text-black focus:border-stone-400" />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Email address</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
                  <input type="email" name="email" value={form.email} onChange={updateField} required placeholder="you@example.com" className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm text-black outline-none transition placeholder:text-black focus:border-stone-400" />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Password</span>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
                  <input type="password" name="password" value={form.password} onChange={updateField} required minLength={6} placeholder="Minimum 6 characters" className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm text-black outline-none transition placeholder:text-black focus:border-stone-400" />
                </div>
              </label>

              {!isLogin && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Department</span>
                    <input name="department" value={form.department} onChange={updateField} placeholder="Optional" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm text-black outline-none transition placeholder:text-black focus:border-stone-400" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Phone</span>
                    <input name="phone" value={form.phone} onChange={updateField} placeholder="Optional" className="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm text-black outline-none transition placeholder:text-black focus:border-stone-400" />
                  </label>
                </div>
              )}

              {error && <p className="rounded-xl border border-stone-300 bg-[#f1f4f1] px-3 py-2.5 text-xs font-semibold text-black">{error}</p>}

              <button type="submit" disabled={submitting} className="auth-action flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-xs font-medium text-black">
              {isLogin ? 'New to EduMerge? ' : 'Already have an account? '}
              <button type="button" onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError(''); }} className="font-black underline underline-offset-2">
                {isLogin ? 'Create an account' : 'Login here'}
              </button>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
