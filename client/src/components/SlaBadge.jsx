import React from 'react';
import { Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SlaBadge({ ticket }) {
  if (['RESOLVED', 'CLOSED'].includes(ticket.status)) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
      </span>
    );
  }

  const isBreached = ticket.isSlaBreached || ticket.isOverdue;
  const remainingHours = ticket.remainingHours;

  if (isBreached) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse-red">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        SLA BREACHED ({Math.abs(remainingHours || 0)}h overdue)
      </span>
    );
  }

  const isWarning = remainingHours < 4;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
      isWarning
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }`}>
      <Clock className="w-3.5 h-3.5 shrink-0" />
      {remainingHours > 0 ? `${remainingHours}h remaining` : 'Due soon'}
    </span>
  );
}
