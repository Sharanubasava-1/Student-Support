import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';
import CreateTicketModal from './components/CreateTicketModal';
import TicketDetailModal from './components/TicketDetailModal';
import AuthScreen from './components/AuthScreen';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  const [authMode, setAuthMode] = useState('login');
  const [ticketRefreshKey, setTicketRefreshKey] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide">Initializing EduMerge Support Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen initialMode={authMode} />;
  }

  const handleTicketSelect = (id) => {
    setSelectedTicketId(id);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          logout();
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {activeTab === 'analytics' && ['ADMIN', 'STAFF'].includes(user?.role) ? (
          <AdminDashboard onSelectTicket={handleTicketSelect} />
        ) : (
          <>
            {user?.role === 'STUDENT' && (
              <StudentDashboard
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onSelectTicket={handleTicketSelect}
                refreshKey={ticketRefreshKey}
              />
            )}

            {user?.role === 'STAFF' && (
              <StaffDashboard onSelectTicket={handleTicketSelect} />
            )}

            {user?.role === 'ADMIN' && (
              <AdminDashboard onSelectTicket={handleTicketSelect} />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm py-4 text-center text-[11px] text-slate-500">
        <p>© 2026 Edumerge Solutions — Student Support & Ticket Management Engine. SLA & Audit Enabled.</p>
      </footer>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={(newTicket) => {
          setSelectedTicketId(newTicket.id);
        }}
      />

      <TicketDetailModal
        ticketId={selectedTicketId}
        isOpen={Boolean(selectedTicketId)}
        onClose={() => setSelectedTicketId(null)}
        onUpdate={() => {
          setTicketRefreshKey((current) => current + 1);
        }}
      />

    </div>
  );
}
