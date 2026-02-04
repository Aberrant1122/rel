'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PrivateRoute from './components/auth/PrivateRoute';
import { useAuth } from './context/AuthContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const getTitle = () => {
    if (isAdmin) return "Admin Dashboard";

    switch (tab) {
      case 'profile': return 'My Profile';
      case 'attendance': return 'Attendance';
      case 'notifications': return 'My Tasks';
      default: return 'Overview';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getTitle()}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          {isAdmin ? <AdminDashboard /> : <EmployeeDashboard />}
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PrivateRoute>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </PrivateRoute>
  );
}
