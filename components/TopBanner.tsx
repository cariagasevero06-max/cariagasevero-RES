'use client';

import React from 'react';
import { usePortal } from '@/lib/PortalContext';
import { Shield, User, KeyRound, Sparkles, RefreshCw, LogOut } from 'lucide-react';

export const TopBanner: React.FC<{
  onOpenActivation?: () => void;
  onOpenFirstTimeReset?: () => void;
}> = ({ onOpenActivation, onOpenFirstTimeReset }) => {
  const { currentUser, switchUser, users, resetToDefaultData, logout } = usePortal();

  const isEmployee = currentUser?.role === 'employee';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="bg-[#2C2523] text-[#FAF7F2] px-4 py-2 text-xs border-b border-[#3D3532] shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold tracking-wide uppercase text-[10px] text-[#D8CEBE]">
          ISTOREYA Live Portal
        </span>
        <span className="text-[#8C7E77]">|</span>
        <span className="text-[#E5DDD0] font-medium hidden sm:inline">
          Greenbelt Flagship Store (Branch #04)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {currentUser && (
          <div className="flex items-center gap-1.5 bg-[#3B3330] rounded-full px-2.5 py-1 text-[11px] border border-[#4D433F]">
            {isAdmin ? (
              <Shield className="w-3.5 h-3.5 text-[#E08A63]" />
            ) : (
              <User className="w-3.5 h-3.5 text-[#8CB897]" />
            )}
            <span className="text-[#D8CEBE]">Logged in as:</span>
            <span className="font-semibold text-white">{currentUser.fullName}</span>
            <span
              className={`ml-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                isAdmin
                  ? 'bg-[#B85032] text-white'
                  : 'bg-[#3D6F4B] text-white'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
        )}

        {/* Quick Demo Switchers */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => switchUser('EMP-2024-001')}
            title="Switch to Maria Santos (Sales Associate)"
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              currentUser?.id === 'EMP-2024-001'
                ? 'bg-[#FAF7F2] text-[#2C2523] shadow-sm'
                : 'bg-[#3B3330] text-[#D8CEBE] hover:bg-[#4D433F] hover:text-white'
            }`}
          >
            👤 Employee View
          </button>

          <button
            onClick={() => switchUser('EMP-2024-002')}
            title="Switch to Carlos Mendoza (Store Manager / Admin)"
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              currentUser?.id === 'EMP-2024-002'
                ? 'bg-[#B85032] text-white shadow-sm'
                : 'bg-[#3B3330] text-[#D8CEBE] hover:bg-[#4D433F] hover:text-white'
            }`}
          >
            🛡️ Admin View
          </button>

          {onOpenActivation && (
            <button
              onClick={onOpenActivation}
              title="Test Account Activation (Chloe Rivera EMP-2024-003)"
              className="px-2 py-1 rounded text-[11px] bg-[#3B3330] text-[#D8CEBE] hover:bg-[#4D433F] hover:text-white transition-all flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3 text-[#E08A63]" />
              <span className="hidden md:inline">Test</span> Activation
            </button>
          )}

          {currentUser && (
            <button
              onClick={logout}
              title="Log Out to Authentication Screen"
              className="px-2 py-1 rounded text-[11px] bg-[#3B3330] text-[#D8CEBE] hover:bg-rose-900/60 hover:text-white transition-all flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden md:inline">Logout</span>
            </button>
          )}

          <button
            onClick={() => {
              if (confirm('Reset demo portal data to original state?')) {
                resetToDefaultData();
              }
            }}
            title="Reset Mock Data to Initial State"
            className="p-1 rounded text-[#8C7E77] hover:text-white hover:bg-[#3B3330] transition-all ml-1"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
