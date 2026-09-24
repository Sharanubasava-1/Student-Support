import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, MessageSquare, Shield, Clock, UserCheck, RefreshCw, Lock, Send, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import SlaBadge from './SlaBadge';

export default function TicketDetailModal({ ticketId, isOpen, onClose, onUpdate }) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenBox, setShowReopenBox] = useState(false);

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicketDetails();
      if (['ADMIN', 'STAFF'].includes(user?.role)) {
        fetchStaffList();
      }
    }
  }, [isOpen, ticketId]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`/tickets/${ticketId}`);
      setTicket(res.data.ticket);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await API.get('/users/staff');
      setStaffList(res.data.staff || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await API.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      fetchTicketDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleAssignChange = async (staffId) => {
    try {
      await API.patch(`/tickets/${ticketId}/assign`, { staffId: staffId || null });
      fetchTicketDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reassign ticket');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await API.patch(`/tickets/${ticketId}/priority`, { priority: newPriority });
      fetchTicketDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update priority');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await API.post(`/tickets/${ticketId}/comments`, {
        comment: commentText,
        isInternalNote
      });
      setCommentText('');
      setIsInternalNote(false);
      fetchTicketDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/tickets/${ticketId}/reopen`, { reason: reopenReason });
      setShowReopenBox(false);
      setReopenReason('');
      fetchTicketDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reopen ticket');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this ticket? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await API.delete(`/tickets/${ticketId}`);
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete ticket');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="glass-panel border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
              {ticket?.ticketCode || 'TICK-....'}
            </span>
            {ticket && (
              <>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} showSla />
                <SlaBadge ticket={ticket} />
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-xs">Loading ticket details & audit history...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-sm">{error}</div>
        ) : ticket && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Ticket Subject & Category */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold tracking-wider uppercase mb-1">
                <div className="flex items-center gap-2 text-indigo-400">
                  <span>Category: {ticket.category}</span>
                  <span>•</span>
                  <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
                {user?.role === 'STUDENT' && ticket.status === 'OPEN' && !ticket.assignedStaffId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-[10px] font-bold text-rose-700 transition hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Ticket
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold text-white font-heading">{ticket.title}</h2>
              <div className="mt-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>

            {/* Student & Assignment Control Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
              
              {/* Raised By */}
              <div className="flex items-center gap-3">
                <img
                  src={ticket.student?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Student'}
                  alt="Student"
                  className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Student</span>
                  <span className="block text-xs font-semibold text-white">{ticket.student?.name}</span>
                  <span className="block text-[10px] text-slate-400">{ticket.student?.department}</span>
                </div>
              </div>

              {/* Assigned Support Staff */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="w-full">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Assigned Agent</span>
                  {['ADMIN', 'STAFF'].includes(user?.role) ? (
                    <select
                      value={ticket.assignedStaffId || ''}
                      onChange={(e) => handleAssignChange(e.target.value)}
                      className="mt-0.5 w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Unassigned</option>
                      {staffList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                      ))}
                    </select>
                  ) : (
                    <span className="block text-xs font-semibold text-slate-200">
                      {ticket.assignedStaff ? ticket.assignedStaff.name : 'Unassigned'}
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Priority Controls for Staff */}
              {['ADMIN', 'STAFF'].includes(user?.role) ? (
                <div className="flex flex-col justify-center gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Update Status:</span>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-xs text-indigo-300 font-semibold rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="PENDING_STUDENT_INFO">PENDING_STUDENT_INFO</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Priority SLA:</span>
                    <select
                      value={ticket.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-xs text-amber-300 font-semibold rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="CRITICAL">CRITICAL (4h)</option>
                      <option value="HIGH">HIGH (8h)</option>
                      <option value="MEDIUM">MEDIUM (24h)</option>
                      <option value="LOW">LOW (48h)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Target SLA</span>
                  <span className="block text-xs font-semibold text-indigo-300">{ticket.slaHours} Hours Resolution Target</span>
                </div>
              )}

            </div>

            {/* Re-Open Ticket Box for Unsatisfied Students */}
            {ticket.status === 'RESOLVED' && user?.role === 'STUDENT' && (
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">This ticket was marked RESOLVED</h4>
                      <p className="text-[11px] text-slate-300">If your issue is not fully solved, you may re-open this ticket.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReopenBox(!showReopenBox)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
                  >
                    Re-Open Ticket
                  </button>
                </div>

                {showReopenBox && (
                  <form onSubmit={handleReopen} className="pt-2 border-t border-teal-500/20 space-y-2">
                    <input
                      type="text"
                      placeholder="Specify reason for reopening..."
                      value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                      className="w-full bg-slate-900 border border-teal-500/40 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReopenBox(false)}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg"
                      >
                        Confirm Re-Open
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* AUDIT TIMELINE LOG (`TicketActivity`) */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" /> Ticket Activity & Audit History
              </h3>

              <div className="relative pl-6 border-l-2 border-slate-800 space-y-4">
                {ticket.activities.map((act) => {
                  const isInternal = act.isInternalNote;
                  return (
                    <div key={act.id} className="relative group">
                      {/* Node Bullet */}
                      <span className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 ${
                        isInternal
                          ? 'bg-amber-500 border-amber-300'
                          : act.action === 'SLA_BREACHED'
                          ? 'bg-rose-500 border-rose-300'
                          : 'bg-indigo-500 border-slate-900'
                      }`} />

                      <div className={`p-3.5 rounded-xl border ${
                        isInternal
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-slate-900/70 border-slate-800/90 text-slate-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{act.user?.name || 'System Auto'}</span>
                            <span className="text-[10px] text-slate-400">({act.user?.role || 'SYSTEM'})</span>
                            {isInternal && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-semibold">
                                <Lock className="w-2.5 h-2.5" /> Staff Internal Note
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-300">{act.comment}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ADD COMMENT FORM */}
            <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" /> Add Response / Update
                </label>

                {/* Staff internal note toggle */}
                {['ADMIN', 'STAFF'].includes(user?.role) && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-amber-500/50 bg-slate-900 text-amber-500 focus:ring-0"
                    />
                    <Lock className="w-3 h-3" /> Private Internal Note (Visible to Staff only)
                  </label>
                )}
              </div>

              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isInternalNote ? "Write internal staff note..." : "Type response to ticket..."}
                className={`w-full rounded-xl p-3 text-xs text-slate-200 focus:outline-none transition border ${
                  isInternalNote
                    ? 'bg-slate-900/90 border-amber-500/40 focus:border-amber-400'
                    : 'bg-slate-900 border-slate-700 focus:border-indigo-500'
                }`}
                required
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition flex items-center gap-2 ${
                    isInternalNote
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingComment ? 'Posting...' : isInternalNote ? 'Post Internal Note' : 'Post Reply'}
                </button>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
