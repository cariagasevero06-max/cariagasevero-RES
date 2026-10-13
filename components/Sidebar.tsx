'use client';

import React from 'react';
import { usePortal } from '@/lib/PortalContext';
import {
  LayoutDashboard,
  User,
  CheckSquare,
  Megaphone,
  Clock,
  Settings,
  LogOut,
  BookOpen,
  Shield,
  Users,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'profile' | 'tasks' | 'announcements' | 'attendance' | 'settings';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, logout, tasks, leaves } = usePortal();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  // Badge counts
  const pendingTasksCount = tasks.filter(
    (t) => (isAdmin ? true : t.assignedToId === currentUser.id) && t.status === 'Pending'
  ).length;

  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'profile' as NavTab,
      label: isAdmin ? 'Staff Directory & Profiles' : 'My Profile',
      icon: isAdmin ? Users : User,
    },
    {
      id: 'tasks' as NavTab,
      label: isAdmin ? 'Assign & Manage Tasks' : 'My Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'announcements' as NavTab,
      label: 'Announcements & Feed',
      icon: Megaphone,
    },
    {
      id: 'attendance' as NavTab,
      label: 'Attendance & Leaves',
      icon: Clock,
      badge: isAdmin && pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
    },
    {
      id: 'settings' as NavTab,
      label: 'Portal Settings',
      icon: Settings,
    },
  ];

  const handleSelect = (tab: NavTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#F7F3EB] border-r border-[#E8E0D5] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        {/* Top: Branding & Store Identity */}
        <div>
          <div className="p-6 border-b border-[#E8E0D5] bg-[#FAF7F2]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#2C2523] text-[#FAF7F2] flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-[#D8A47F]" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold tracking-tight text-[#2C2523] leading-none">
                  ISTOREYA
                </h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#B85032] mt-1">
                  A Store With Many Stories
                </p>
              </div>
            </div>
          </div>

          {/* User Profile Snippet */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-[#FFFFFF] border border-[#E8E0D5] shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-12 h-12 rounded-xl object-cover border border-[#D8CEBE]"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-[#2C2523] truncate">
                  {currentUser.fullName}
                </h3>
                <p className="text-[11px] text-[#786C65] truncate">{currentUser.position}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-[#FAEBE5] text-[#B85032] border border-[#E8C2B3]'
                        : 'bg-[#EBF3ED] text-[#2D583B] border border-[#BDE0C7]'
                    }`}
                  >
                    {isAdmin ? <Shield className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                    <span>{currentUser.role}</span>
                  </span>
                  <span className="text-[10px] text-[#8C7E77] font-mono">
                    {currentUser.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#2C2523] text-white shadow-sm font-semibold'
                      : 'text-[#5C504A] hover:bg-[#EFE8DC] hover:text-[#2C2523]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#D8A47F]' : 'text-[#8C7E77]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-[#B85032] text-white'
                          : 'bg-[#EAE3D6] text-[#6B5E57]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Store Branch & Sign Out */}
        <div className="p-4 border-t border-[#E8E0D5] bg-[#FAF7F2] space-y-3">
          <div className="rounded-xl bg-[#F0EAE1] p-2.5 border border-[#E4DACD] text-[11px] text-[#6B5E57] space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-[#8C7E77] tracking-wider block">
              Store Assignment
            </span>
            <div className="font-medium text-[#2C2523]">Flagship - Greenbelt 5</div>
            <div className="text-[10px] text-[#8C7E77]">Branch Code: GBT-04</div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#786C65] hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
