import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketList from './TicketList';
import { Ticket as TicketIcon, Clock, CheckCircle2, PlusCircle, Sparkles } from 'lucide-react';

export default function StudentDashboard({ onOpenCreateModal, onSelectTicket, refreshKey }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isBreachedFilter, setIsBreachedFilter] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [searchQuery, selectedCategory, selectedPriority, selectedStatus, isBreachedFilter, refreshKey]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (selectedStatus) params.append('status', selectedStatus);
      if (isBreachedFilter) params.append('isBreached', 'true');

      const res = await API.get(`/tickets?${params.toString()}`);
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Error fetching student tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCount = tickets.filter(t => ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_STUDENT_INFO'].includes(t.status)).length;
  const resolvedCount = tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[30px] border border-[#e7dfdb] bg-[linear-gradient(135deg,#fffefc,#f2f0ff_42%,#eef9ff)] p-6 custom-panel-shadow">
        <div className="absolute right-0 top-0 h-full w-40 bg-[radial-gradient(circle_at_top_right,_rgba(91,91,214,0.22),transparent_58%)]" />
        <div className="absolute left-0 bottom-0 h-32 w-32 rounded-full bg-[#dbeafe]/60 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Student Portal
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-[-0.06em]">
              Welcome back, {user?.name}.
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              Follow issue progress, submit new requests, and keep every SLA target in view.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-[linear-gradient(135deg,#181d2f,#4338ca)] hover:brightness-110 text-white text-sm font-bold shadow-[0_18px_32px_-18px_rgba(79,70,229,0.9)] transition flex items-center justify-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Submit New Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card px-4 py-3 rounded-2xl border-l-4 border-violet-500">
          <div className="flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col justify-end">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em]">Total Tickets</span>
              <span className="mt-2 block text-[2.6rem] leading-none font-black tracking-[-0.06em] text-slate-900">{tickets.length}</span>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-600 shadow-sm">
              <TicketIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="glass-card px-4 py-3 rounded-2xl border-l-4 border-amber-500">
          <div className="flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col justify-end">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em]">In Progress</span>
              <span className="mt-2 block text-[2.6rem] leading-none font-black tracking-[-0.06em] text-amber-600">{openCount}</span>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 shadow-sm">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="glass-card px-4 py-3 rounded-2xl border-l-4 border-emerald-500">
          <div className="flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col justify-end">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em]">Resolved</span>
              <span className="mt-2 block text-[2.6rem] leading-none font-black tracking-[-0.06em] text-emerald-600">{resolvedCount}</span>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-black text-slate-900 mb-3 tracking-[-0.04em]">My Support Tickets</h2>
        <TicketList
          tickets={tickets}
          loading={loading}
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
