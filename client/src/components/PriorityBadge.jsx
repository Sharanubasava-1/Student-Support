import React from 'react';
import { AlertOctagon, AlertTriangle, Info, ArrowDown } from 'lucide-react';

const PRIORITY_STYLES = {
  CRITICAL: { label: 'Critical (4h SLA)', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: AlertOctagon },
  HIGH: { label: 'High (8h SLA)', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle },
  MEDIUM: { label: 'Medium (24h SLA)', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Info },
  LOW: { label: 'Low (48h SLA)', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', icon: ArrowDown }
};

export default function PriorityBadge({ priority, showSla = false }) {
  const config = PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {showSla ? config.label : priority}
    </span>
  );
}
