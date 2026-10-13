'use client';

import React, { useState } from 'react';
import { usePortal } from '@/lib/PortalContext';
import { X, Mail, KeyRound, CheckCircle2, AlertCircle, Copy, Check, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProceedToLogin: (username: string) => void;
}

export const AccountActivationModal: React.FC<Props> = ({ isOpen, onClose, onProceedToLogin }) => {
  const { activateAccount } = usePortal();
  const [employeeId, setEmployeeId] = useState('EMP-2024-003'); // Pre-fill with Chloe Rivera for instant testing
  const [companyEmail, setCompanyEmail] = useState('chloe.rivera@istoreya.com');
  const [errorMessage, setErrorMessage] = useState('');
  const [activationResult, setActivationResult] = useState<{
    username: string;
    temporaryPassword: string;
    employeeName: string;
    email: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = activateAccount(employeeId, companyEmail);
      if (res.success && res.credentials) {
        setActivationResult(res.credentials);
      } else {
        setErrorMessage(res.message);
      }
    }, 600);
  };

  const copyCredentials = () => {
    if (!activationResult) return;
    navigator.clipboard.writeText(
      `Username: ${activationResult.username}\nTemporary Password: ${activationResult.temporaryPassword}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8E0D5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2C2523] text-[#FAF7F2] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B85032] flex items-center justify-center text-white shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-medium tracking-tight">Account Activation</h2>
              <p className="text-xs text-[#D8CEBE]">ISTOREYA HR Employee Verification Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A89D96] hover:text-white transition-colors p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!activationResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-[#F3EFE6] p-3.5 rounded-xl border border-[#E8E0D5] text-xs text-[#6B5E57] leading-relaxed">
                <span className="font-semibold text-[#2C2523]">New Employee Notice:</span> Verify your profile against the central HR database to generate your temporary credentials and activate your employee portal access.
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1.5">
                  Employee ID
                </label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g., EMP-2024-003"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] bg-white text-[#2C2523] placeholder-[#A89D96] text-sm focus:outline-none focus:ring-2 focus:ring-[#B85032] focus:border-transparent transition"
                />
                <p className="text-[11px] text-[#8C7E77] mt-1">Found on your HR acceptance letter or badge</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1.5">
                  Official Company Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="e.g., firstname.lastname@istoreya.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CEBE] bg-white text-[#2C2523] placeholder-[#A89D96] text-sm focus:outline-none focus:ring-2 focus:ring-[#B85032] focus:border-transparent transition"
                  />
                  <Mail className="w-4 h-4 text-[#8C7E77] absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-[#8C7E77] mt-1">Your registered @istoreya.com email</p>
              </div>

              {/* Sample Hint Pills */}
              <div className="pt-1">
                <span className="text-[11px] text-[#8C7E77] block mb-1.5">Pre-configured test account:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmployeeId('EMP-2024-003');
                    setCompanyEmail('chloe.rivera@istoreya.com');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAE3D6] text-[#4B413C] hover:bg-[#DDD3C2] text-xs font-medium transition"
                >
                  <span>✨ Fill: Chloe Rivera (EMP-2024-003)</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#6B5E57] hover:text-[#2C2523] hover:bg-[#EAE3D6] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-medium bg-[#B85032] hover:bg-[#A34327] text-white shadow-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Validating with HR Database...</span>
                  ) : (
                    <>
                      <span>Validate & Activate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success & Temporary Credentials Screen */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-1">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-serif font-semibold text-[#2C2523]">
                  Identity Verified Successfully!
                </h3>
                <p className="text-xs text-[#6B5E57]">
                  Welcome to ISTOREYA, <strong className="text-[#2C2523]">{activationResult.employeeName}</strong>.
                </p>
              </div>

              {/* Simulated Email Notification Card */}
              <div className="bg-[#FFFFFF] border-2 border-[#D8CEBE] rounded-xl p-4 shadow-sm relative space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-2 text-[11px] text-[#8C7E77]">
                  <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    Automated HR Email Dispatched to: {activationResult.email}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    Delivered
                  </span>
                </div>

                <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#E8E0D5] space-y-2">
                  <div className="text-xs text-[#6B5E57]">Temporary Credentials Generated:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#8C7E77] uppercase block">Username</span>
                      <span className="font-mono font-semibold text-[#2C2523] bg-white px-2 py-1 rounded border border-[#E0D7CB] block">
                        {activationResult.username}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8C7E77] uppercase block">Temporary Password</span>
                      <span className="font-mono font-semibold text-[#B85032] bg-white px-2 py-1 rounded border border-[#E0D7CB] block">
                        {activationResult.temporaryPassword}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={copyCredentials}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8CEBE] text-xs text-[#4B413C] hover:bg-[#FAF7F2] transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#8C7E77]" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-[#8C7E77]">
                    *You will be prompted to reset upon first login
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => {
                    onProceedToLogin(activationResult.username);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#B85032] hover:bg-[#A34327] text-white shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <span>Proceed to Login Screen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
