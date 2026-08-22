import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ProfileView } from './components/profile/ProfileView';
import { AttendanceManager } from './components/attendance/AttendanceManager';
import { LeaveManager } from './components/leave/LeaveManager';
import { PayrollManager } from './components/payroll/PayrollManager';
import { AnalyticsManager } from './components/analytics/AnalyticsManager';
import { AuthModal } from './components/auth/AuthModal';
import { Toast } from './components/common/Toast';

const MainContent: React.FC = () => {
  const { currentTab, currentUser } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="app-layout">
      <Navbar onOpenAuth={() => setShowAuthModal(true)} />

      <div className="main-wrapper">
        <Sidebar />

        <main className="content-area">
          {currentTab === 'dashboard' && (
            currentUser.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />
          )}

          {currentTab === 'profile' && <ProfileView />}

          {currentTab === 'attendance' && <AttendanceManager />}

          {currentTab === 'leave' && <LeaveManager />}

          {currentTab === 'payroll' && <PayrollManager />}

          {currentTab === 'analytics' && <AnalyticsManager />}
        </main>
      </div>

      <Toast />

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
