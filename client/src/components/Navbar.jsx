import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Headphones, Shield, User, ChevronDown, Sparkles, BarChart3, Ticket as TicketIcon, LogIn, UserPlus } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenCreateModal, onOpenAuth }) {
  const { user, switchUser, DEMO_ACCOUNTS } = useAuth();
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1"><Shield className="w-3 h-3 text-purple-600" /> Admin</span>;
      case 'STAFF':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1"><Headphones className="w-3 h-3 text-blue-600" /> Staff Agent</span>;
      default:
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1"><User className="w-3 h-3 text-emerald-600" /> Student</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#fffdfb]/85 backdrop-blur-xl shadow-[0_18px_40px_-28px_rgba(41,37,36,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="brand-mark w-11 h-11 rounded-2xl bg-[linear-gradient(135deg,#1f2940,#4f46e5_55%,#8b5cf6)] flex items-center justify-center shadow-[0_14px_30px_-18px_rgba(79,70,229,0.7)] ring-1 ring-white/60">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-[-0.06em]">
                EduMerge <span className="text-violet-600 font-semibold text-sm">Campus</span>
              </span>
              <p className="text-[10px] text-slate-500 -mt-1 tracking-[0.18em] uppercase font-bold">Support OS</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 ml-4 bg-[#f3f1ee] p-1 rounded-2xl border border-stone-200 shadow-inner">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold tracking-[0.02em] transition ${
                activeTab === 'tickets'
                  ? 'bg-white text-[#2f2a54] shadow-[0_8px_18px_-12px_rgba(79,70,229,0.5)] border border-stone-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TicketIcon className="w-3.5 h-3.5 text-violet-600" /> Tickets Portal
            </button>

            {['ADMIN', 'STAFF'].includes(user?.role) && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold tracking-[0.02em] transition ${
                  activeTab === 'analytics'
                    ? 'bg-white text-[#2f2a54] shadow-[0_8px_18px_-12px_rgba(79,70,229,0.5)] border border-stone-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-violet-600" /> Analytics & SLA
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[11px] font-bold text-black transition hover:border-stone-400"
            >
              <LogIn className="h-3.5 w-3.5" /> Login
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="auth-action flex items-center gap-1.5 rounded-xl bg-black px-3 py-2 text-[11px] font-bold transition hover:bg-stone-800"
            >
              <UserPlus className="h-3.5 w-3.5" /> Sign up
            </button>
          </div>

          {user?.role === 'STUDENT' && (
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 rounded-xl bg-[linear-gradient(135deg,#6b7a2a,#879b35)] hover:brightness-110 text-white text-[11px] font-bold shadow-[0_16px_28px_-18px_rgba(107,122,42,0.9)] transition flex items-center gap-1.5"
            >
              + Raise Ticket
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
              className="flex items-center gap-2 bg-[#faf7f4] border border-stone-200 hover:border-violet-300 px-3 py-2 rounded-xl text-xs transition shadow-sm hover:shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <div className="text-left hidden sm:block">
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Demo Role</span>
                <span className="block font-bold text-slate-800">{user?.name}</span>
              </div>
              {getRoleBadge(user?.role)}
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
            </button>

            {showDemoDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-[0_20px_40px_-24px_rgba(15,23,42,0.4)] p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-stone-100">
                  <p className="text-xs font-black text-slate-800">Switch Demo User Role</p>
                  <p className="text-[10px] text-slate-500">Test multi-role workflows instantly</p>
                </div>
                <div className="py-1 space-y-1">
                  {Object.entries(DEMO_ACCOUNTS).map(([key, acc]) => (
                    <button
                      key={key}
                      onClick={() => {
                        switchUser(key);
                        setShowDemoDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                        user?.email === acc.email
                          ? 'bg-violet-50 border border-violet-200 text-violet-900 font-bold'
                          : 'hover:bg-stone-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="block font-bold">{acc.label}</span>
                        <span className="text-[10px] text-slate-500">{acc.email}</span>
                      </div>
                      {user?.email === acc.email && <span className="w-2 h-2 rounded-full bg-violet-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
