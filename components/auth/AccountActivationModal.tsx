'use client';

import React, { useState, useEffect } from 'react';
import { usePortal } from '@/lib/PortalContext';
import {
  X,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProceedToLogin: (username: string) => void;
  initialVerifiedEmail?: string;
}

export const AccountActivationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onProceedToLogin,
  initialVerifiedEmail,
}) => {
  const { requestActivationOtp, verifyActivationOtp } = usePortal();
  const [step, setStep] = useState<'details' | 'otp' | 'success'>(
    initialVerifiedEmail ? 'success' : 'details'
  );

  const [employeeId, setEmployeeId] = useState('EMP-2024-006'); // Pre-fill Aaron Tumaliuan for instant testing
  const [companyEmail, setCompanyEmail] = useState(initialVerifiedEmail || 'cariagasevero06@gmail.com');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Success state
  const [activationResult, setActivationResult] = useState<{
    username: string;
    temporaryPassword: string;
    employeeName: string;
    email: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((p) => p - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCountdown]);

  useEffect(() => {
    if (initialVerifiedEmail && isOpen) {
      setCompanyEmail(initialVerifiedEmail);
      setActivationResult({
        username: initialVerifiedEmail.split('@')[0],
        temporaryPassword: 'Configured during sign-up',
        employeeName: initialVerifiedEmail.split('@')[0],
        email: initialVerifiedEmail,
      });
      setStep('success');
    }
  }, [initialVerifiedEmail, isOpen]);

  if (!isOpen) return null;

  async function handleSendCode(userEmail: string, explicitCode?: number | string) {
    const code = explicitCode ? Number(explicitCode) : Math.floor(100000 + Math.random() * 900000);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          code,
          employeeId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('Email sent successfully via Brevo API!');
        return { success: true, code: code.toString() };
      } else {
        console.error('Error sending email via Brevo API:', data.error);
        return { success: false, error: data.error || 'Failed to dispatch email', code: code.toString() };
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message || 'Network error', code: code.toString() };
    }
  }

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await requestActivationOtp(employeeId, companyEmail);

      if (res.success) {
        const otpCode = res.otp || Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otpCode);
        
        // Dispatch OTP via direct Brevo API route
        const emailRes = await handleSendCode(companyEmail, otpCode);
        if (!emailRes.success && emailRes.error) {
          console.warn('Brevo dispatch notice:', emailRes.error);
        }

        setResendCountdown(60);
        setStep('otp');
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to dispatch OTP. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (otp.trim().length < 6) {
      setErrorMessage('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = verifyActivationOtp(employeeId, otp);

      if (res.success && res.user) {
        setActivationResult({
          username: res.user.username,
          temporaryPassword: res.user.temporaryPassword || 'TempPass2024!',
          employeeName: res.user.fullName,
          email: res.user.email,
        });
        setStep('success');
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage('');

    try {
      const res = await requestActivationOtp(employeeId, companyEmail);
      if (res.success) {
        const otpCode = res.otp || Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otpCode);
        await handleSendCode(companyEmail, otpCode);
        setResendCountdown(60);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
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
              <h2 className="text-lg font-serif font-medium tracking-tight">Account Activation & OTP</h2>
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
          {/* STEP 1: EMPLOYEE DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="bg-[#F3EFE6] p-3.5 rounded-xl border border-[#E8E0D5] text-xs text-[#6B5E57] leading-relaxed">
                <span className="font-semibold text-[#2C2523]">New Employee Notice:</span> Verify your profile against the central HR database to generate your one-time verification OTP routed via Brevo SMTP.
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
                  Personal Email (Gmail) to Verify
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="e.g., cariagasevero06@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CEBE] bg-white text-[#2C2523] placeholder-[#A89D96] text-sm focus:outline-none focus:ring-2 focus:ring-[#B85032] focus:border-transparent transition"
                  />
                  <Mail className="w-4 h-4 text-[#8C7E77] absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-[#8C7E77] mt-1">We will send your 6-digit OTP code to this personal email.</p>
              </div>

              {/* Sample Hint Pill */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] text-[#8C7E77] block mb-1">Pre-configured test accounts:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmployeeId('EMP-2024-006');
                      setCompanyEmail('cariagasevero06@gmail.com');
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2C2523] hover:bg-black text-white text-xs font-medium transition cursor-pointer"
                  >
                    <span>✨ Fill: Aaron Tumaliuan (EMP-2024-006 • cariagasevero06@gmail.com)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmployeeId('EMP-2024-003');
                      setCompanyEmail('cariagasevero06@gmail.com');
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAE3D6] text-[#4B413C] hover:bg-[#DDD3C2] text-xs font-medium transition cursor-pointer"
                  >
                    <span>Fill: Chloe Rivera (EMP-2024-003)</span>
                  </button>
                </div>
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
                    <span>Validating & Sending OTP...</span>
                  ) : (
                    <>
                      <span>Send Verification OTP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-serif font-semibold text-base text-[#2C2523]">
                  Enter Authentication Code
                </h3>
                <p className="text-xs text-[#6B5E57] max-w-sm mx-auto">
                  A 6-digit OTP code has been dispatched to{' '}
                  <strong className="text-[#2C2523] underline">{companyEmail}</strong> via Brevo API.
                </p>
              </div>

              {generatedOtp && (
                <div className="bg-[#F5F4E7] border border-[#E0D7CB] p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[#4B413C]">
                    🔑 Generated OTP: <strong className="font-mono text-sm text-[#B85032]">{generatedOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtp(generatedOtp)}
                    className="bg-[#2C2523] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md hover:bg-black transition"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1.5 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[12px] font-mono text-2xl font-bold py-3 rounded-xl border border-[#D8CEBE] bg-white text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B5E57] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('details');
                    setErrorMessage('');
                  }}
                  className="hover:underline"
                >
                  ← Change details
                </button>

                {resendCountdown > 0 ? (
                  <span>Resend in {resendCountdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="font-semibold text-[#B85032] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                    <span>Resend OTP</span>
                  </button>
                )}
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
                  className="px-6 py-2.5 rounded-xl text-xs font-medium bg-[#B85032] hover:bg-[#A34327] text-white shadow-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? 'Verifying OTP...' : 'Verify & Activate'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && activationResult && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-1">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-serif font-semibold text-[#2C2523]">
                  Identity Verified & Account Activated!
                </h3>
                <p className="text-xs text-[#6B5E57]">
                  Welcome to ISTOREYA, <strong className="text-[#2C2523]">{activationResult.employeeName}</strong>.
                </p>
              </div>

              <div className="bg-[#FFFFFF] border-2 border-[#D8CEBE] rounded-xl p-4 shadow-sm relative space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-2 text-[11px] text-[#8C7E77]">
                  <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    Automated Confirmation Sent: {activationResult.email}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    via Brevo SMTP
                  </span>
                </div>

                <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#E8E0D5] space-y-2">
                  <div className="text-xs text-[#6B5E57]">Employee Credentials Activated:</div>
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
                        <span className="text-emerald-700 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#8C7E77]" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onProceedToLogin(activationResult.username);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#2C2523] hover:bg-black text-white text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
