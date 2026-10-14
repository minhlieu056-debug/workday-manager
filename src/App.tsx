import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';
import { LoginForm } from './components/auth/LoginForm';
import { ResetPasswordModal } from './components/auth/ResetPasswordModal';
import { PersonalOverview } from './components/dashboard/PersonalOverview';
import { MonthCalendar } from './components/dashboard/MonthCalendar';
import { LeaveHistoryTable } from './components/dashboard/LeaveHistoryTable';
import { LeaveRequestModal } from './components/dashboard/LeaveRequestModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { ApprovalManager } from './components/admin/ApprovalManager';
import { MonthlyReport } from './components/admin/MonthlyReport';
import { QuotaSettings } from './components/admin/QuotaSettings';
import { AuditLogView } from './components/admin/AuditLogView';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentUser, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isDataLoading } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedLeaveDate, setSelectedLeaveDate] = useState<string | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // If loading session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-300 font-semibold tracking-wider uppercase">
            Đang tải dữ liệu Workday Manager...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <LoginForm onOpenResetPassword={() => setIsResetPasswordOpen(true)} />
        <ResetPasswordModal
          isOpen={isResetPasswordOpen}
          onClose={() => setIsResetPasswordOpen(false)}
        />
        <ToastContainer />
      </>
    );
  }

  const handleOpenLeaveModal = (date?: string) => {
    setSelectedLeaveDate(date || null);
    setIsLeaveModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Header */}
      <Header
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenResetPassword={() => setIsResetPasswordOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenLeaveModal={() => handleOpenLeaveModal()}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 min-w-0 transition-all">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <PersonalOverview onOpenLeaveModal={handleOpenLeaveModal} />
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <MonthCalendar onSelectDateToRegister={handleOpenLeaveModal} />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <LeaveHistoryTable onOpenRegisterModal={() => handleOpenLeaveModal()} />
              </div>
            )}

            {activeTab === 'admin_dashboard' && (
              <AdminDashboard setActiveTab={setActiveTab} />
            )}

            {activeTab === 'approvals' && <ApprovalManager />}

            {activeTab === 'employees' && <EmployeeManagement />}

            {activeTab === 'monthly_report' && <MonthlyReport />}

            {activeTab === 'quotas' && <QuotaSettings />}

            {activeTab === 'audit' && <AuditLogView />}
          </div>
        </main>
      </div>

      {/* Leave Registration Modal */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        defaultDate={selectedLeaveDate}
      />

      {/* Password Reset Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
