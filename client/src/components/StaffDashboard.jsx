import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketList from './TicketList';
import { Headphones, ShieldAlert, UserCheck, Inbox, Clock } from 'lucide-react';

export default function StaffDashboard({ onSelectTicket }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('mine'); // 'mine', 'unassigned', 'breached', 'all'
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
  }, [activeTab, searchQuery, selectedCategory, selectedPriority, selectedStatus, isBreachedFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab === 'mine') params.append('staffId', 'mine');
      if (activeTab === 'unassigned') params.append('staffId', 'unassigned');
      if (activeTab === 'breached') params.append('isBreached', 'true');

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (selectedStatus) params.append('status', selectedStatus);
      if (isBreachedFilter) params.append('isBreached', 'true');

      const res = await API.get(`/tickets?${params.toString()}`);
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Error fetching staff tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[30px] border border-[#dfe9ff] bg-[linear-gradient(135deg,#f7fbff,#edf2ff_38%,#f6f3ff)] p-6 custom-panel-shadow">
        <div className="absolute right-10 top-0 h-40 w-40 rounded-full bg-[#c7d2fe]/45 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-32 w-32 rounded-full bg-[#bfdbfe]/50 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full mb-3 shadow-sm">
              <Headphones className="w-3.5 h-3.5" /> Support Agent Workspace
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-[-0.06em]">
              Agent Workstation: {user?.name}
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Department: <strong className="text-slate-800">{user?.department}</strong> • Manage ticket flow, updates, and resolution notes.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('mine')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'mine'
              ? 'bg-[#2d5bff] text-white shadow-[0_16px_28px_-18px_rgba(45,91,255,0.9)]'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" /> My Assigned Queue
        </button>

        <button
          onClick={() => setActiveTab('unassigned')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'unassigned'
              ? 'bg-[#4338ca] text-white shadow-[0_16px_28px_-18px_rgba(67,56,202,0.9)]'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4" /> Unassigned Queue
        </button>

        <button
          onClick={() => setActiveTab('breached')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'breached'
              ? 'bg-rose-600 text-white shadow-[0_16px_28px_-18px_rgba(225,29,72,0.9)] animate-pulse-red'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-200" /> SLA Breached Queue
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
          }`}
        >
          All System Tickets
        </button>
      </div>

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
  );
}
