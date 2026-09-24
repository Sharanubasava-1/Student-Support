import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { X, AlertTriangle, CheckCircle, Clock, Send, ShieldAlert } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HOSTEL');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Duplicate check state
  const [duplicates, setDuplicates] = useState([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  useEffect(() => {
    if (title.trim().length >= 4) {
      const timer = setTimeout(() => {
        checkDuplicates();
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setDuplicates([]);
    }
  }, [title, category]);

  const checkDuplicates = async () => {
    try {
      setIsCheckingDuplicate(true);
      const res = await API.get(`/tickets/check-duplicate?category=${category}&query=${encodeURIComponent(title.trim())}`);
      setDuplicates(res.data.duplicates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await API.post('/tickets', {
        title,
        description,
        category,
        priority
      });

      onTicketCreated(res.data.ticket);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setDuplicates([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-panel border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 font-heading">
              <Send className="w-5 h-5 text-indigo-400" /> Submit New Support Ticket
            </h2>
            <p className="text-xs text-slate-400">Specify details and priority to initiate automated SLA tracking</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="ACADEMICS">Academics & Examination</option>
                <option value="HOSTEL">Hostel & Facilities</option>
                <option value="TRANSPORT">Transport & Bus Pass</option>
                <option value="FEE">Fee Collection & Accounts</option>
                <option value="IT">IT Infrastructure & Wi-Fi</option>
                <option value="GENERAL">General Administration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Priority (SLA Target) *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="CRITICAL">🔴 Critical (4 Hours Target)</option>
                <option value="HIGH">🟠 High (8 Hours Target)</option>
                <option value="MEDIUM">🟡 Medium (24 Hours Target)</option>
                <option value="LOW">🔵 Low (48 Hours Target)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Issue Subject / Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water pipe leakage in Room 304 / Wi-Fi auth failure"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* DUPLICATE WARNING ALERT */}
          {duplicates.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Duplicate Ticket Alert Detected!
              </div>
              <p className="text-xs text-slate-300">
                Found {duplicates.length} existing active ticket(s) matching your request. Check if your issue is already recorded:
              </p>
              <div className="space-y-1.5 pt-1">
                {duplicates.map(dup => (
                  <div key={dup.id} className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/20 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-indigo-400 font-semibold">{dup.ticketCode}</span>
                      <span className="text-slate-200 ml-2 font-medium">{dup.title}</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {dup.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact location, error code, step-by-step issue context..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Submitting Ticket...' : 'Submit Ticket & Start SLA Timer'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
