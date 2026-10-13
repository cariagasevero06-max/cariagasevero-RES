'use client';

import React, { useState } from 'react';
import { PortalProvider, usePortal } from '@/lib/PortalContext';
import { TopBanner } from '@/components/TopBanner';
import { Sidebar, NavTab } from '@/components/Sidebar';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { AccountActivationModal } from '@/components/auth/AccountActivationModal';
import { FirstTimePasswordResetModal } from '@/components/auth/FirstTimePasswordResetModal';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { ProfileModule } from '@/components/profile/ProfileModule';
import { TasksModule } from '@/components/tasks/TasksModule';
import { AnnouncementsModule } from '@/components/announcements/AnnouncementsModule';
import { AttendanceModule } from '@/components/attendance/AttendanceModule';
import { SettingsModule } from '@/components/settings/SettingsModule';
import { Announcement } from '@/lib/types';
import { Menu, X, BookOpen } from 'lucide-react';

function PortalApp() {
  const { currentUser, switchUser, isLoaded } = usePortal();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cross-module states
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [openedAnnouncement, setOpenedAnnouncement] = useState<Announcement | null>(null);
  const [openCreateTaskDirectly, setOpenCreateTaskDirectly] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F4E7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2C2523] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="font-serif tracking-widest text-[11px] uppercase text-[#2C2523]">ISTOREYA</span>
        </div>
      </div>
    );
  }

  // If unauthenticated, show LoginScreen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  // If authenticated but account is not yet activated, proceed to Activate Account page
  if (!currentUser.isActivated) {
    return (
      <LoginScreen
        initialView="activate"
        initialUser={currentUser}
        onLoginSuccess={() => setActiveTab('dashboard')}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col text-[#2C2523] selection:bg-[#FAEBE5] selection:text-[#B85032]">
      {/* Top Banner with Quick Demo Role Switcher */}
      <TopBanner
        onOpenActivation={() => setShowActivationModal(true)}
      />

      {/* Account Activation Modal callable from top bar */}
      <AccountActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onProceedToLogin={(u) => {
          setShowActivationModal(false);
          const found = ['EMP-2024-003'].includes(u) ? 'EMP-2024-003' : 'EMP-2024-001';
          switchUser(found);
        }}
      />

      {/* First-time login enforcement modal */}
      <FirstTimePasswordResetModal
        isOpen={Boolean(currentUser.firstTimeLogin)}
        onSuccess={() => {}}
      />

      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Persistent Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setOpenCreateTaskDirectly(false);
          }}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          {/* Mobile Top Navigation Bar */}
          <header className="lg:hidden bg-white border-b border-[#E8E0D5] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2C2523] text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#D8A47F]" />
              </div>
              <div>
                <span className="font-serif font-bold text-sm text-[#2C2523] block leading-none">
                  ISTOREYA
                </span>
                <span className="text-[9px] uppercase font-bold text-[#B85032]">
                  Employee Portal
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-[#4B413C] hover:bg-[#FAF7F2] transition"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Module Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
            {activeTab === 'dashboard' && (
              isAdmin ? (
                <AdminDashboard
                  onNavigateToTab={(t) => setActiveTab(t as NavTab)}
                  onOpenCreateTask={() => {
                    setActiveTab('tasks');
                    setOpenCreateTaskDirectly(true);
                  }}
                />
              ) : (
                <EmployeeDashboard
                  onNavigateToTab={(t) => setActiveTab(t as NavTab)}
                  onOpenAnnouncement={(ann) => {
                    setOpenedAnnouncement(ann);
                    setActiveTab('announcements');
                  }}
                />
              )
            )}

            {activeTab === 'profile' && <ProfileModule />}

            {activeTab === 'tasks' && (
              <TasksModule initialCreateModalOpen={openCreateTaskDirectly} />
            )}

            {activeTab === 'announcements' && (
              <AnnouncementsModule
                openedAnnouncement={openedAnnouncement}
                onCloseAnnouncement={() => setOpenedAnnouncement(null)}
              />
            )}

            {activeTab === 'attendance' && <AttendanceModule />}

            {activeTab === 'settings' && <SettingsModule />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <PortalProvider>
      <PortalApp />
    </PortalProvider>
  );
}
