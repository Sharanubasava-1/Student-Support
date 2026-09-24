import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import SlaBadge from './SlaBadge';
import { Search, ShieldAlert, ChevronRight, Inbox } from 'lucide-react';

export default function TicketList({
  tickets,
  loading,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  selectedStatus,
  setSelectedStatus,
  isBreachedFilter,
  setIsBreachedFilter,
  onSelectTicket
}) {
  return (
    <div className="space-y-4">
      <div className="soft-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Ticket ID, title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f9f7f5] border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-violet-400 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#f9f7f5] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-violet-400"
          >
            <option value="">All Categories</option>
            <option value="HOSTEL">Hostel</option>
            <option value="ACADEMICS">Academics</option>
            <option value="IT">IT Infrastructure</option>
            <option value="FEE">Fee Collection</option>
            <option value="TRANSPORT">Transport</option>
            <option value="GENERAL">General</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-[#f9f7f5] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-violet-400"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#f9f7f5] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-violet-400"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_STUDENT_INFO">Pending Info</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button
            onClick={() => setIsBreachedFilter(!isBreachedFilter)}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              isBreachedFilter
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'
                : 'bg-[#f9f7f5] text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            SLA Breached Only
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin mx-auto mb-2" />
          Fetching support tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center gap-2">
          <Inbox className="w-10 h-10 text-slate-400" />
          <p className="text-sm font-black text-slate-800">No matching support tickets found</p>
          <p className="text-xs text-slate-500">Try adjusting search filters or raise a new ticket</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectTicket(t.id)}
              className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-[0_14px_32px_-26px_rgba(15,23,42,0.4)] hover:border-violet-300 hover:shadow-[0_18px_36px_-26px_rgba(79,70,229,0.36)] transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-500 via-indigo-500 to-sky-400" />
              <div className="space-y-1.5 flex-1 min-w-0 pl-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-black text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                    {t.ticketCode}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-[0.14em] font-bold">
                    {t.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500">
                    Student: <strong className="text-slate-800">{t.student?.name}</strong>
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 group-hover:text-violet-700 transition truncate tracking-[-0.03em]">
                  {t.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-1">
                  {t.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start md:self-center pl-2 md:pl-0">
                <StatusBadge status={t.status} />
                <PriorityBadge priority={t.priority} />
                <SlaBadge ticket={t} />
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
