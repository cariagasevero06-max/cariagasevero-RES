'use client';

import React, { useState } from 'react';
import { usePortal } from '@/lib/PortalContext';
import {
  Settings,
  Shield,
  KeyRound,
  RefreshCw,
  Bell,
  Moon,
  Sun,
  User,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { currentUser, switchUser, resetToDefaultData, updateUserProfile } = usePortal();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordToast('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordToast('Passwords do not match.');
      return;
    }

    updateUserProfile(currentUser.id, { password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordToast('Password updated successfully!');
    setTimeout(() => setPasswordToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-[#E8E0D5]">
        <h1 className="text-2xl font-serif font-bold text-[#2C2523] tracking-tight">
          Portal Settings & Security
        </h1>
        <p className="text-xs text-[#786C65]">
          System preferences, account security, and evaluator demo tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Security */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F0EAE1]">
            <div className="w-9 h-9 rounded-xl bg-[#FAEBE5] text-[#B85032] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#2C2523]">
                Account Password & Security
              </h2>
              <p className="text-[11px] text-[#786C65]">Update your portal access key</p>
            </div>
          </div>

          {passwordToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordToast}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-xs text-[#2C2523] bg-[#FAF7F2] focus:bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-xs text-[#2C2523] bg-[#FAF7F2] focus:bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#2C2523] hover:bg-[#3D3532] text-white text-xs font-semibold transition"
              >
                Save New Password
              </button>
            </div>
          </form>
        </div>

        {/* Demo Role Switcher Matrix */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F0EAE1]">
            <div className="w-9 h-9 rounded-xl bg-[#FCF4E3] text-[#C27A19] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#2C2523]">
                Role & Account Simulator
              </h2>
              <p className="text-[11px] text-[#786C65]">
                Instantly switch accounts to test role-based features
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => switchUser('EMP-2024-001')}
              className="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#3D6F4B] text-left transition flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-[#2C2523] block">
                  Maria Santos (Sales Associate)
                </span>
                <span className="text-[11px] text-[#786C65]">
                  Role: Employee • Retail Sales & Customer Service
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3ED] text-[#3D6F4B]">
                Active Employee
              </span>
            </button>

            <button
              onClick={() => switchUser('EMP-2024-002')}
              className="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#B85032] text-left transition flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-[#2C2523] block">
                  Carlos Mendoza (Store Operations Manager)
                </span>
                <span className="text-[11px] text-[#786C65]">
                  Role: Admin • Store Management & Operations
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAEBE5] text-[#B85032]">
                Admin / Manager
              </span>
            </button>

            <button
              onClick={() => switchUser('EMP-2024-005')}
              className="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#C27A19] text-left transition flex items-center justify-between"
            >
              <div>
                <span className="font-semibold text-[#2C2523] block">
                  Angela Reyes (Lead Visual Merchandiser)
                </span>
                <span className="text-[11px] text-[#786C65]">
                  Role: Employee • Visual Merchandising
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCF4E3] text-[#C27A19]">
                Employee
              </span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#F0EAE1]">
            <button
              onClick={() => {
                if (confirm('Reset all demo state to original initial values?')) {
                  resetToDefaultData();
                }
              }}
              className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Entire Portal to Default Seed Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
