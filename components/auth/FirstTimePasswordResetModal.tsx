'use client';

import React, { useState } from 'react';
import { usePortal } from '@/lib/PortalContext';
import { ShieldCheck, Lock, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
}

export const FirstTimePasswordResetModal: React.FC<Props> = ({ isOpen, onSuccess }) => {
  const { currentUser, resetFirstTimeCredentials } = usePortal();
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !currentUser || !currentUser.firstTimeLogin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newUsername.trim().length < 4) {
      setErrorMessage('Username must be at least 4 characters.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    if (newPassword === currentUser.temporaryPassword) {
      setErrorMessage('New password cannot be the same as your temporary password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = resetFirstTimeCredentials(newUsername, newPassword);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMessage(res.message);
      }
    }, 600);
  };

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(newPassword);
  const hasNumbers = /[0-9]/.test(newPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8E0D5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2C2523] text-[#FAF7F2] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C27A19] flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FCF4E3] text-[#9E5F0E] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                First-Time Setup Required
              </div>
              <h2 className="text-lg font-serif font-medium tracking-tight">
                Update Default Credentials
              </h2>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <p className="text-xs text-[#6B5E57] mb-4 leading-relaxed">
            Welcome to ISTOREYA, <strong className="text-[#2C2523]">{currentUser.fullName}</strong>! As part of our security policy, you must personalize your default username and set a private password before accessing the employee dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Current Default Credentials Banner */}
            <div className="bg-[#F3EFE6] rounded-xl p-3 border border-[#E8E0D5] text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8C7E77] tracking-wider block">
                Current Temporary Access
              </span>
              <div className="flex items-center justify-between text-[#4B413C]">
                <span>Temporary Username: <code className="font-mono text-[#2C2523] bg-white px-1.5 py-0.5 rounded border border-[#E0D7CB]">{currentUser.username}</code></span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Verified Active</span>
              </div>
            </div>

            {/* New Username */}
            <div>
              <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1.5">
                New Desired Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g., maria.santos or msantos"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CEBE] bg-white text-[#2C2523] placeholder-[#A89D96] text-sm focus:outline-none focus:ring-2 focus:ring-[#B85032] focus:border-transparent transition"
                />
                <User className="w-4 h-4 text-[#8C7E77] absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1.5">
                New Private Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CEBE] bg-white text-[#2C2523] placeholder-[#A89D96] text-sm focus:outline-none focus:ring-2 focus:ring-[#B85032] focus:border-transparent transition"
                />
                <Lock className="w-4 h-4 text-[#8C7E77] absolute left-3.5 top-3.5" />
              </div>

              {/* Requirement Checklist */}
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
                <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-700' : 'text-[#8C7E77]'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasMinLength ? 'text-emerald-600' : 'text-[#A89D96]'}`} />
                  8+ characters
                </span>
                <span className={`flex items-center gap-1 ${hasLetters ? 'text-emerald-700' : 'text-[#8C7E77]'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasLetters ? 'text-emerald-600' : 'text-[#A89D96]'}`} />
                  Letters
                </span>
                <span className={`flex items-center gap-1 ${hasNumbers ? 'text-emerald-700' : 'text-[#8C7E77]'}`}>
                  <CheckCircle2 className={`w-3 h-3 ${hasNumbers ? 'text-emerald-600' : 'text-[#A89D96]'}`} />
                  Numbers
                </span>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CEBE] bg-white text-[#2C2523] placeholder-[#A89D96] text-sm focus:outline-none focus:ring-2 focus:ring-[#B85032] focus:border-transparent transition"
                />
                <Lock className="w-4 h-4 text-[#8C7E77] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-semibold bg-[#B85032] hover:bg-[#A34327] text-white shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Encrypting & Saving Credentials...</span>
                ) : (
                  <>
                    <span>Save & Enter Portal Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
