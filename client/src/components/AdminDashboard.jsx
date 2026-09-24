import React, { useState, useEffect } from 'react';
import API from '../services/api';
import TicketList from './TicketList';
import { Shield, Activity, Users, AlertTriangle, CheckCircle2, BarChart3, TrendingUp, UserPlus, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const CATEGORY_COLORS = {
  ACADEMICS: '#6366f1',
  HOSTEL: '#f59e0b',
  TRANSPORT: '#10b981',
  FEE: '#ec4899',
  IT: '#06b6d4',
  GENERAL: '#8b5cf6'
};

const PRIORITY_COLORS = {
  CRITICAL: '#f43f5e',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#38bdf8'
};

export default function AdminDashboard({ onSelectTicket }) {
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Filters for ticket list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isBreachedFilter, setIsBreachedFilter] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchTickets();
  }, [searchQuery, selectedCategory, selectedPriority, selectedStatus, isBreachedFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await API.get('/analytics/dashboard');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (selectedStatus) params.append('status', selectedStatus);
      if (isBreachedFilter) params.append('isBreached', 'true');

      const res = await API.get(`/tickets?${params.toString()}`);
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const summary = analytics?.summary || {};

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[30px] border border-[#e5d9ff] bg-[linear-gradient(135deg,#f8f4ff,#f3f4ff_40%,#f4fbff)] p-6 custom-panel-shadow">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-32 w-32 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full mb-3 shadow-sm">
            <Shield className="w-3.5 h-3.5" /> Support Management & SLA Control Center
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-[-0.06em]">
            Manager Dashboard & SLA Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Track service volume, response quality, and overall campus support performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border-l-4 border-violet-500">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] block">Total Volume</span>
              <span className="text-2xl font-black text-slate-900 mt-2 block">{summary.totalTickets || 0}</span>
              <span className="text-[11px] text-slate-500 block mt-1">Tickets submitted</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-emerald-500">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] block">SLA Compliance</span>
              <span className="text-2xl font-black text-emerald-600 mt-2 block">
                {summary.slaComplianceRate !== undefined ? `${summary.slaComplianceRate}%` : '100%'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Target response met</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-rose-500">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] block">SLA Breached</span>
              <span className="text-2xl font-black text-rose-600 mt-2 block">
                {summary.slaBreachedTickets || 0}
              </span>
              <span className="text-[11px] text-rose-500 block mt-1 font-medium">Requires escalation</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-amber-500">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] block">Active Queue</span>
              <span className="text-2xl font-black text-amber-600 mt-2 block">
                {(summary.openTickets || 0) + (summary.inProgressTickets || 0)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Open & In Progress</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {!loadingAnalytics && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.12em] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" /> Ticket Volume by Category
            </h3>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryStats}>
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {analytics.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.12em] flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" /> Staff Workload & Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-[0.12em]">
                    <th className="py-2 px-3">Agent</th>
                    <th className="py-2 px-3">Dept</th>
                    <th className="py-2 px-3 text-center">Active</th>
                    <th className="py-2 px-3 text-center">Resolved</th>
                    <th className="py-2 px-3 text-center">Breached</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {analytics.staffWorkload.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                        <img src={s.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Staff'} alt="Avatar" className="w-6 h-6 rounded-full" />
                        {s.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{s.department}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-amber-600">{s.activeCount}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-teal-600">{s.resolvedCount}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-rose-600">
                        {s.breachedCount > 0 ? (
                          <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">
                            {s.breachedCount}
                          </span>
                        ) : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-black text-slate-900 mb-3 tracking-[-0.04em]">All System Tickets & Assignment Control</h2>
        <TicketList
          tickets={tickets}
          loading={loadingTickets}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          isBreachedFilter={isBreachedFilter}
          setIsBreachedFilter={setIsBreachedFilter}
          onSelectTicket={onSelectTicket}
        />
      </div>

    </div>
  );
}
