'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePortal } from '@/lib/PortalContext';
import { FirstTimePasswordResetModal } from './FirstTimePasswordResetModal';
import {
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Mail,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

import { User } from '@/lib/types';

interface Props {
  onLoginSuccess: () => void;
  initialView?: 'login' | 'activate' | 'otp';
  initialUser?: User | null;
  initialVerifiedEmail?: string;
}

export const LoginScreen: React.FC<Props> = ({
  onLoginSuccess,
  initialView,
  initialUser,
  initialVerifiedEmail,
}) => {
  const { login, requestActivationOtp, verifyActivationOtp } = usePortal();

  // Mode: 'login', 'activate', or 'otp'
  const [view, setView] = useState<'login' | 'activate' | 'otp'>(
    initialView || 'login'
  );

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedNotice, setVerifiedNotice] = useState('');

  // Activate form state (Employee ID & Personal Gmail)
  const [employeeId, setEmployeeId] = useState(initialUser?.id || 'EMP-2024-006');
  const [personalEmail, setPersonalEmail] = useState(
    initialUser?.personalEmail || initialUser?.email || 'cariagasevero06@gmail.com'
  );
  const [activationNotice, setActivationNotice] = useState('');
  const [activationError, setActivationError] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [brevoStatus, setBrevoStatus] = useState<{ sent: boolean; message: string } | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Success state
  const [activationSuccess, setActivationSuccess] = useState<{
    username: string;
    temporaryPassword: string;
    employeeName: string;
    email: string;
  } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // First-time reset modal
  const [showFirstTimeReset, setShowFirstTimeReset] = useState(false);

  // Check for verified email query param or props from Gmail redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isVerified = params.get('verified') === 'true' || params.get('status') === 'verified';
      const email = params.get('email') || initialVerifiedEmail || '';

      if (isVerified || email) {
        setVerifiedNotice(
          email
            ? `Personal email (${email}) confirmed via Brevo! Please log in to access your portal.`
            : 'Your email has been successfully verified via Brevo SMTP! You can now log in.'
        );
        if (email) {
          setUsername(email.split('@')[0]);
        }
      }
    }
  }, [initialVerifiedEmail]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (view === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [view, resendCountdown]);

  // Focus first OTP input when view switches to 'otp'
  useEffect(() => {
    if (view === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [view]);

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Invalid Username');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = login(username, password);

      if (res.success && res.user) {
        // If account has not been activated, route directly to Activate Account & OTP
        if (res.needsActivation || !res.user.isActivated) {
          setEmployeeId(res.user.id);
          setPersonalEmail(res.user.personalEmail || res.user.email || 'cariagasevero06@gmail.com');
          setActivationNotice(
            `Welcome, ${res.user.fullName}! Your employee account requires personal email verification via Brevo OTP.`
          );
          setView('activate');
          return;
        }

        if (res.user.firstTimeLogin) {
          setShowFirstTimeReset(true);
        } else {
          onLoginSuccess();
        }
      } else {
        setErrorMessage(res.message);
      }
    }, 350);
  };

  // Handle Step 1: Request OTP for Account Activation to Personal Email
  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError('');

    if (!employeeId.trim()) {
      setActivationError('Please enter your Employee ID');
      return;
    }
    if (!personalEmail.trim()) {
      setActivationError('Please enter your Personal Email (Gmail)');
      return;
    }

    setIsActivating(true);
    try {
      const res = await requestActivationOtp(employeeId, personalEmail);
      setIsActivating(false);

      if (res.success) {
        setActiveOtpCode(res.otp || '');
        setBrevoStatus({
          sent: Boolean(res.brevoSent),
          message: res.brevoMessage || res.message,
        });
        setResendCountdown(60);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpError('');
        setView('otp');
      } else {
        setActivationError(res.message);
      }
    } catch {
      setIsActivating(false);
      setActivationError('Failed to dispatch OTP. Please check your network and try again.');
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');

    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      setOtpError('');
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setOtpError('');

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP inputs
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setOtpError('Please enter all 6 digits of your OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      const res = verifyActivationOtp(employeeId, enteredOtp);

      if (res.success && res.user) {
        setActivationSuccess({
          username: res.user.username,
          temporaryPassword: res.user.temporaryPassword || 'TempAaron2024!',
          employeeName: res.user.fullName,
          email: personalEmail,
        });
      } else {
        setOtpError(res.message);
      }
    }, 450);
  };

  // Resend OTP code to personal email
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending) return;
    setIsResending(true);
    setOtpError('');

    const res = await requestActivationOtp(employeeId, personalEmail);
    setIsResending(false);
    if (res.success) {
      setActiveOtpCode(res.otp || '');
      setBrevoStatus({
        sent: Boolean(res.brevoSent),
        message: res.brevoMessage || res.message,
      });
      setResendCountdown(60);
    } else {
      setOtpError(res.message);
    }
  };

  // Quick helper to fill demo OTP
  const handleAutoFillDemoOtp = () => {
    const code = activeOtpCode || '123456';
    setOtpDigits(code.split('').slice(0, 6));
    setOtpError('');
  };

  const copyCredentials = () => {
    if (!activationSuccess) return;
    navigator.clipboard.writeText(
      `Username: ${activationSuccess.username}\nTemporary Password: ${activationSuccess.temporaryPassword}`
    );
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F4E7] flex flex-col lg:flex-row">
      {/* First-Time Password Reset Modal if user logged in for the first time */}
      <FirstTimePasswordResetModal
        isOpen={showFirstTimeReset}
        onSuccess={() => {
          setShowFirstTimeReset(false);
          onLoginSuccess();
        }}
      />

      {/* LEFT COLUMN: Card Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-[440px] bg-[#A4A895] rounded-[34px] sm:rounded-[38px] p-7 sm:p-10 shadow-xl transition-all duration-300">
          {/* Brand Header */}
          <div className="text-center">
            <span className="font-bold text-base sm:text-lg tracking-wider text-[#141412] underline underline-offset-4 decoration-2">
              ISTOREYA
            </span>
          </div>

          {/* VIEW 1: LOGIN */}
          {view === 'login' && (
            <div className="animate-in fade-in duration-200">
              <div className="mt-8 mb-6">
                <h2 className="text-3xl font-normal text-[#141412] tracking-tight">
                  Welcome Back!
                </h2>
                <p className="text-xs text-[#2A2926] mt-1 font-normal">
                  ISTOREYA a store with many stories
                </p>
              </div>

              {verifiedNotice && (
                <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-2xl text-xs flex items-start gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{verifiedNotice}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#141412] mb-1.5 ml-1">
                    Username:
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Enter your username"
                    className="w-full px-5 py-3 rounded-full bg-white text-sm text-[#141412] placeholder-[#8C877D] outline-none shadow-xs transition"
                  />
                  {errorMessage && (
                    <p className="text-xs font-bold text-red-600 underline decoration-red-600 mt-1.5 ml-2">
                      {errorMessage}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#141412] mb-1.5 ml-1">
                    Password:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Enter your password"
                    className="w-full px-5 py-3 rounded-full bg-white text-sm text-[#141412] placeholder-[#8C877D] outline-none shadow-xs transition"
                  />
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-44 py-2.5 rounded-full bg-[#EDE8CF] hover:bg-[#E2DDC2] active:scale-[0.98] text-[#141412] font-semibold text-sm transition shadow-xs mx-auto block cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? 'Logging in...' : 'Log in'}
                  </button>
                </div>

                {/* Only Employee Activation Option */}
                <div className="mt-8 text-center text-xs text-[#141412]">
                  <span>Newly hired? click here </span>
                  <button
                    type="button"
                    onClick={() => {
                      setView('activate');
                      setErrorMessage('');
                      setActivationSuccess(null);
                      setActivationError('');
                      setActivationNotice('');
                    }}
                    className="font-bold underline decoration-1 text-[#141412] hover:opacity-80 cursor-pointer"
                  >
                    Activate Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 2: ACTIVATE ACCOUNT (Verify with Personal Email / Gmail) */}
          {view === 'activate' && (
            <div className="animate-in fade-in duration-200">
              <div className="mt-8 mb-5 text-center">
                <h2 className="text-3xl font-normal text-[#141412] tracking-tight">
                  Welcome!
                </h2>
                <p className="text-xs text-[#2A2926] mt-1 font-normal max-w-xs mx-auto">
                  Use your Employee ID and Personal Gmail to verify and activate your account
                </p>
              </div>

              {activationNotice && (
                <div className="mb-4 bg-[#F2EDE0] border border-[#DDD3C2] p-2.5 rounded-2xl text-[11px] text-[#2C2523] leading-relaxed text-center font-medium">
                  {activationNotice}
                </div>
              )}

              <form onSubmit={handleRequestOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#141412] mb-1.5 ml-1">
                    Enter Employee Id:
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value);
                      setActivationError('');
                    }}
                    placeholder="e.g., EMP-2024-006"
                    className="w-full px-5 py-3 rounded-full bg-white text-sm text-[#141412] placeholder-[#8C877D] outline-none shadow-xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#141412] mb-1.5 ml-1">
                    Enter Personal Email (Gmail) to Verify:
                  </label>
                  <input
                    type="email"
                    value={personalEmail}
                    onChange={(e) => {
                      setPersonalEmail(e.target.value);
                      setActivationError('');
                    }}
                    placeholder="e.g., cariagasevero06@gmail.com"
                    className="w-full px-5 py-3 rounded-full bg-white text-sm text-[#141412] placeholder-[#8C877D] outline-none shadow-xs transition"
                  />
                  <span className="text-[10px] text-[#2C2523]/80 ml-2 mt-1 block">
                    We will send your 6-digit OTP code to this personal email.
                  </span>
                </div>

                {/* Quick Pre-fill Employee Accounts */}
                <div className="pt-0.5 space-y-1.5">
                  <span className="text-[10px] text-[#2C2523] block mb-1 font-medium">
                    Quick test employee accounts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEmployeeId('EMP-2024-006');
                        setPersonalEmail('cariagasevero06@gmail.com');
                        setActivationError('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C2523] hover:bg-black text-[11px] font-semibold text-white transition shadow-2xs cursor-pointer"
                    >
                      <span>✨ Aaron Tumaliuan (EMP-2024-006 • cariagasevero06@gmail.com)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmployeeId('EMP-2024-003');
                        setPersonalEmail('chloe.rivera@istoreya.com');
                        setActivationError('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE8CF] hover:bg-[#E2DDC2] text-[11px] font-semibold text-[#141412] transition shadow-2xs cursor-pointer"
                    >
                      <span>Chloe Rivera (EMP-2024-003)</span>
                    </button>
                  </div>
                </div>

                {activationError && (
                  <p className="text-xs font-bold text-red-600 underline decoration-red-600 mt-2 text-center">
                    {activationError}
                  </p>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    disabled={isActivating}
                    className="w-56 py-2.5 rounded-full bg-[#EDE8CF] hover:bg-[#E2DDC2] active:scale-[0.98] text-[#141412] font-semibold text-sm transition shadow-xs mx-auto block cursor-pointer disabled:opacity-60"
                  >
                    {isActivating ? 'Verifying & Sending OTP...' : 'Send Verification OTP'}
                  </button>
                </div>

                <p className="mt-4 text-[11px] font-semibold text-[#2C2523] text-center">
                  Verification OTP is routed to your Gmail via Brevo SMTP (Port 587)
                </p>

                <div className="mt-3 text-center text-xs text-[#141412]">
                  <span>Already activated? click here </span>
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setActivationError('');
                      setActivationNotice('');
                    }}
                    className="font-bold underline decoration-1 text-[#141412] hover:opacity-80 cursor-pointer"
                  >
                    Log in
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 3: OTP AUTHENTICATION & VERIFICATION */}
          {view === 'otp' && (
            <div className="animate-in fade-in duration-200">
              {!activationSuccess ? (
                <div>
                  <div className="mt-6 mb-4 text-center">
                    <div className="w-11 h-11 rounded-2xl bg-[#EDE8CF] text-[#141412] flex items-center justify-center mx-auto mb-2 shadow-xs">
                      <ShieldCheck className="w-6 h-6 text-[#2C2523]" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-[#141412] tracking-tight">
                      Verify Your Personal Email
                    </h2>
                    <p className="text-xs text-[#2A2926] mt-1 max-w-xs mx-auto leading-relaxed">
                      Enter the 6-digit authentication OTP code sent to your personal Gmail{' '}
                      <span className="font-semibold underline decoration-1 text-[#141412]">
                        {personalEmail}
                      </span>{' '}
                      via Brevo SMTP.
                    </p>
                  </div>

                  {/* Brevo SMTP Live Dispatch Indicator */}
                  {brevoStatus && (
                    <div
                      className={`mb-3 p-3 rounded-2xl text-xs flex items-start gap-2 shadow-2xs ${
                        brevoStatus.sent
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                          : 'bg-amber-50 border border-amber-300 text-amber-900'
                      }`}
                    >
                      {brevoStatus.sent ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        {brevoStatus.sent ? (
                          <span>
                            <strong>Brevo Dispatched:</strong> Code successfully delivered to{' '}
                            <strong>{personalEmail}</strong>! Please check your Gmail inbox (and Spam folder).
                          </span>
                        ) : (
                          <span>
                            <strong>Brevo Notice:</strong>{' '}
                            {brevoStatus.message ? (
                              brevoStatus.message.includes('https://') ? (
                                <span>
                                  {brevoStatus.message.split('https://')[0]}
                                  <a
                                    href={`https://${brevoStatus.message.split('https://')[1].trim()}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline font-semibold hover:text-amber-950 inline-flex items-center ml-1"
                                  >
                                    Authorize in Brevo &rarr;
                                  </a>
                                </span>
                              ) : (
                                brevoStatus.message
                              )
                            ) : (
                              <>
                                To receive real emails in Gmail, enter your Brevo SMTP User &amp; Key in{' '}
                                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">.env.local</code>.
                              </>
                            )}
                            <span className="block mt-1 text-[#6E5A47]">Your testing OTP is ready below.</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dev / Test Code Helper Badge */}
                  {activeOtpCode && (
                    <div className="mb-3 bg-white/80 border border-white/60 p-2.5 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[#2C2523]">
                        <KeyRound className="w-3.5 h-3.5 text-[#B85032]" />
                        <span>Generated OTP:</span>
                        <strong className="font-mono text-sm tracking-widest text-[#B85032]">
                          {activeOtpCode}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFillDemoOtp}
                        className="text-[10px] font-bold text-[#141412] bg-[#EDE8CF] hover:bg-[#E2DDC2] px-2 py-0.5 rounded-full transition cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                    {/* 6 Digit Input Boxes */}
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2 my-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl sm:rounded-2xl bg-white text-[#141412] shadow-xs outline-none focus:ring-2 focus:ring-[#2C2523] border border-white/80 transition"
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-xs font-bold text-red-600 underline decoration-red-600 text-center">
                        {otpError}
                      </p>
                    )}

                    <div className="pt-2 text-center">
                      <button
                        type="submit"
                        disabled={isVerifyingOtp}
                        className="w-60 py-2.5 rounded-full bg-[#EDE8CF] hover:bg-[#E2DDC2] active:scale-[0.98] text-[#141412] font-semibold text-sm transition shadow-xs mx-auto block cursor-pointer disabled:opacity-60"
                      >
                        {isVerifyingOtp ? 'Verifying OTP...' : 'Verify & Complete Activation'}
                      </button>
                    </div>

                    {/* Resend & Back controls */}
                    <div className="pt-2 flex flex-col items-center gap-2 text-xs text-[#141412]">
                      <div className="flex items-center gap-1.5">
                        <span>Didn&apos;t receive the code?</span>
                        {resendCountdown > 0 ? (
                          <span className="font-semibold text-[#3C3632]">
                            Resend in {resendCountdown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isResending}
                            className="font-bold underline decoration-1 text-[#141412] hover:opacity-80 flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setView('activate');
                          setOtpError('');
                        }}
                        className="text-[11px] text-[#2C2523] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Change Email or ID</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Success Confirmation Card */
                <div className="space-y-4 py-2 animate-in fade-in duration-200">
                  <div className="bg-white/95 p-5 rounded-2xl border border-white text-xs space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Employee Verified & Activated!</span>
                    </div>
                    <p className="text-[#3C3632]">
                      Welcome to ISTOREYA, <strong>{activationSuccess.employeeName}</strong>! Your personal email has been authenticated via Brevo OTP:
                    </p>
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#D8CEBE] font-mono text-xs space-y-1 relative">
                      <div>
                        Username: <strong className="text-[#141412]">{activationSuccess.username}</strong>
                      </div>
                      <div>
                        Temporary Password:{' '}
                        <strong className="text-[#B85032]">{activationSuccess.temporaryPassword}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={copyCredentials}
                        className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-white hover:bg-[#F0EAE1] text-[10px] font-sans font-semibold border border-[#D8CEBE] flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedCreds ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCreds ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#6B5E57] italic">
                      You will be asked to set your permanent credentials on first sign in.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onLoginSuccess();
                    }}
                    className="w-56 py-2.5 rounded-full bg-[#EDE8CF] hover:bg-[#E2DDC2] active:scale-[0.98] text-[#141412] font-semibold text-sm transition shadow-xs mx-auto block cursor-pointer"
                  >
                    Proceed to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Architectural Storefront */}
      <div className="w-full lg:w-1/2 relative min-h-[440px] lg:min-h-screen bg-[#F0ECE1] overflow-hidden flex items-center justify-center select-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ECE5D8] via-[#F4EFE6] to-[#E5DECD] opacity-90" />

        <svg
          viewBox="0 0 800 1000"
          className="w-full h-full object-cover max-w-full max-h-full drop-shadow-xl"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EDE6D8" />
              <stop offset="100%" stopColor="#DFD7C7" />
            </linearGradient>
            <linearGradient id="interiorGlow" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFF2D6" />
              <stop offset="55%" stopColor="#F9E2C2" />
              <stop offset="100%" stopColor="#ECD0AB" />
            </linearGradient>
            <linearGradient id="roofShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5A524C" />
              <stop offset="100%" stopColor="#2C2523" />
            </linearGradient>
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#2C2523" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Sky background / atmosphere */}
          <rect width="800" height="1000" fill="#E8E2D2" />
          <circle cx="680" cy="180" r="160" fill="#FDFBF7" opacity="0.6" />

          {/* Roof overhang & Parapet */}
          <polygon points="120,240 680,240 650,265 150,265" fill="#3D3531" />
          <rect x="140" y="265" width="520" height="18" fill="#4B413C" />

          {/* Main Facade Building Block */}
          <rect x="150" y="283" width="500" height="580" fill="url(#wallGrad)" rx="4" />

          {/* Modernist Signboard */}
          <rect x="250" y="315" width="300" height="48" rx="8" fill="#FFFFFF" filter="url(#softShadow)" />
          <text
            x="400"
            y="346"
            textAnchor="middle"
            fontFamily="serif"
            fontSize="18"
            fontWeight="bold"
            letterSpacing="5"
            fill="#2C2523"
          >
            ISTOREYA
          </text>
          <text
            x="400"
            y="358"
            textAnchor="middle"
            fontFamily="sans-serif"
            fontSize="7"
            letterSpacing="2"
            fill="#8C7E77"
          >
            EST. 2024 • MANILA
          </text>

          {/* Main Glass Storefront Framing */}
          <rect x="180" y="390" width="440" height="420" rx="6" fill="#1C1816" filter="url(#softShadow)" />
          <rect x="188" y="398" width="424" height="404" rx="4" fill="url(#interiorGlow)" />

          {/* Glass Mullions */}
          <line x1="188" y1="530" x2="612" y2="530" stroke="#1C1816" strokeWidth="6" />
          <line x1="330" y1="398" x2="330" y2="802" stroke="#1C1816" strokeWidth="6" />
          <line x1="470" y1="398" x2="470" y2="802" stroke="#1C1816" strokeWidth="6" />

          {/* Central Entrance Double Door */}
          <rect x="333" y="533" width="134" height="266" fill="#F4EFE6" opacity="0.2" />
          <line x1="400" y1="533" x2="400" y2="802" stroke="#1C1816" strokeWidth="4" />
          <rect x="385" y="650" width="4" height="36" rx="2" fill="#2C2523" />
          <rect x="411" y="650" width="4" height="36" rx="2" fill="#2C2523" />

          {/* Interior Curated Displays */}
          <rect x="206" y="560" width="105" height="12" fill="#2C2523" rx="2" />
          <rect x="212" y="535" width="18" height="25" fill="#B85032" rx="1" />
          <rect x="234" y="528" width="14" height="32" fill="#4B413C" rx="1" />
          <rect x="252" y="540" width="20" height="20" fill="#D8CEBE" rx="1" />
          <rect x="276" y="532" width="22" height="28" fill="#6B5E57" rx="1" />

          <rect x="488" y="560" width="105" height="12" fill="#2C2523" rx="2" />
          <circle cx="515" cy="542" r="14" fill="#C26A4A" />
          <rect x="540" y="530" width="16" height="30" fill="#2C2523" rx="1" />
          <polygon points="575,532 590,560 560,560" fill="#8C7E77" />

          {/* Designer Pendant Lamps */}
          <line x1="260" y1="398" x2="260" y2="445" stroke="#1C1816" strokeWidth="2" />
          <ellipse cx="260" cy="450" rx="22" ry="10" fill="#2C2523" />
          <circle cx="260" cy="454" r="5" fill="#FFE2A3" />

          <line x1="400" y1="398" x2="400" y2="440" stroke="#1C1816" strokeWidth="2" />
          <ellipse cx="400" cy="445" rx="26" ry="12" fill="#2C2523" />
          <circle cx="400" cy="450" r="6" fill="#FFE2A3" />

          <line x1="540" y1="398" x2="540" y2="445" stroke="#1C1816" strokeWidth="2" />
          <ellipse cx="540" cy="450" rx="22" ry="10" fill="#2C2523" />
          <circle cx="540" cy="454" r="5" fill="#FFE2A3" />

          {/* Exterior Pavement & Terrace Steps */}
          <rect x="80" y="860" width="640" height="20" fill="#C7BEB0" rx="2" />
          <rect x="50" y="880" width="700" height="30" fill="#B0A696" rx="2" />
          <rect x="20" y="910" width="760" height="90" fill="#9C9282" />

          {/* Planter Boxes & Architectural Greenery */}
          <rect x="110" y="810" width="55" height="52" rx="4" fill="#2C2523" />
          <circle cx="137" cy="790" r="28" fill="#4F5D44" />
          <circle cx="125" cy="780" r="18" fill="#6A7B5E" />
          <circle cx="150" cy="782" r="20" fill="#3D4934" />

          <rect x="635" y="810" width="55" height="52" rx="4" fill="#2C2523" />
          <circle cx="662" cy="790" r="28" fill="#4F5D44" />
          <circle cx="650" cy="780" r="18" fill="#6A7B5E" />
          <circle cx="675" cy="782" r="20" fill="#3D4934" />
        </svg>

        {/* Ambient Overlay Quote */}
        <div className="absolute bottom-6 left-8 right-8 text-center text-[#4B413C]/80 pointer-events-none">
          <p className="font-serif italic text-xs tracking-wider">
            &ldquo;A store with many stories — where every encounter has a narrative.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
