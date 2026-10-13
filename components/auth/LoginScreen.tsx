'use client';

import React, { useState } from 'react';
import { usePortal } from '@/lib/PortalContext';
import { FirstTimePasswordResetModal } from './FirstTimePasswordResetModal';
import { CheckCircle2, Copy, Check } from 'lucide-react';

import { User } from '@/lib/types';

interface Props {
  onLoginSuccess: () => void;
  initialView?: 'login' | 'activate';
  initialUser?: User | null;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess, initialView, initialUser }) => {
  const { login, activateAccount } = usePortal();

  // Mode: 'login' (Image 2) or 'activate' (Image 3)
  const [view, setView] = useState<'login' | 'activate'>(initialView || 'login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Activate form state
  const [employeeId, setEmployeeId] = useState(initialUser?.id || '');
  const [companyEmail, setCompanyEmail] = useState(initialUser?.email || '');
  const [activationError, setActivationError] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState<{
    username: string;
    temporaryPassword: string;
    employeeName: string;
    email: string;
  } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // First-time reset modal
  const [showFirstTimeReset, setShowFirstTimeReset] = useState(false);

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
        if (!res.user.isActivated) {
          // Proceed to activate page!
          setEmployeeId(res.user.id);
          setCompanyEmail(res.user.email);
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

  // Handle Account Activation submission
  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError('');

    if (!employeeId.trim()) {
      setActivationError('Please enter your Employee ID');
      return;
    }
    if (!companyEmail.trim()) {
      setActivationError('Please enter your Company Email');
      return;
    }

    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      const res = activateAccount(employeeId, companyEmail);
      if (res.success && res.credentials) {
        setActivationSuccess(res.credentials);
      } else {
        setActivationError(res.message || 'Verification failed. Please check your Employee ID and Email.');
      }
    }, 450);
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

      {/* LEFT COLUMN: Card Container (Image 2 & Image 3) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-[430px] bg-[#A4A895] rounded-[34px] sm:rounded-[38px] p-7 sm:p-10 shadow-xl transition-all duration-300">
          {/* Brand Header */}
          <div className="text-center">
            <span className="font-bold text-base sm:text-lg tracking-wider text-[#141412] underline underline-offset-4 decoration-2">
              ISTOREYA
            </span>
          </div>

          {/* VIEW 1: LOGIN (Image 2) */}
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

                <div className="mt-8 text-center text-xs text-[#141412]">
                  <span>Newly hired? click here </span>
                  <button
                    type="button"
                    onClick={() => {
                      setView('activate');
                      setErrorMessage('');
                      setActivationSuccess(null);
                      setActivationError('');
                    }}
                    className="font-bold underline decoration-1 text-[#141412] hover:opacity-80 cursor-pointer"
                  >
                    Activate Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 2: ACTIVATE ACCOUNT (Image 3) */}
          {view === 'activate' && (
            <div className="animate-in fade-in duration-200">
              <div className="mt-8 mb-6 text-center">
                <h2 className="text-3xl font-normal text-[#141412] tracking-tight">
                  Welcome!
                </h2>
                <p className="text-xs text-[#2A2926] mt-1 font-normal max-w-xs mx-auto">
                  Use your employee Id and Company Email to activate your acount
                </p>
              </div>

              {!activationSuccess ? (
                <form onSubmit={handleActivateSubmit} className="space-y-4">
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
                      placeholder="e.g., EMP-2024-003"
                      className="w-full px-5 py-3 rounded-full bg-white text-sm text-[#141412] placeholder-[#8C877D] outline-none shadow-xs transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#141412] mb-1.5 ml-1">
                      Enter Company Email
                    </label>
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => {
                        setCompanyEmail(e.target.value);
                        setActivationError('');
                      }}
                      placeholder="e.g., chloe.rivera@istoreya.com"
                      className="w-full px-5 py-3 rounded-full bg-white text-sm text-[#141412] placeholder-[#8C877D] outline-none shadow-xs transition"
                    />
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
                      className="w-52 py-2.5 rounded-full bg-[#EDE8CF] hover:bg-[#E2DDC2] active:scale-[0.98] text-[#141412] font-semibold text-sm transition shadow-xs mx-auto block cursor-pointer disabled:opacity-60"
                    >
                      {isActivating ? 'Verifying...' : 'Activate Account'}
                    </button>
                  </div>

                  <p className="mt-8 text-xs font-bold text-[#141412] text-center">
                    We’ll send a message on your email after clicking activate
                  </p>

                  <div className="mt-4 text-center text-xs text-[#141412]">
                    <span>Already activated? click here </span>
                    <button
                      type="button"
                      onClick={() => {
                        setView('login');
                        setActivationError('');
                      }}
                      className="font-bold underline decoration-1 text-[#141412] hover:opacity-80 cursor-pointer"
                    >
                      Log in
                    </button>
                  </div>
                </form>
              ) : (
                /* Activation Success Card */
                <div className="space-y-4 py-2 animate-in fade-in duration-200">
                  <div className="bg-white/95 p-5 rounded-2xl border border-white text-xs space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Account Verified & Activated!</span>
                    </div>
                    <p className="text-[#3C3632]">
                      Welcome to the team, <strong>{activationSuccess.employeeName}</strong>! Your account has been verified and temporary credentials are ready:
                    </p>
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#D8CEBE] font-mono text-xs space-y-1 relative">
                      <div>
                        Username: <strong className="text-[#141412]">{activationSuccess.username}</strong>
                      </div>
                      <div>
                        Temporary Password: <strong className="text-[#B85032]">{activationSuccess.temporaryPassword}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={copyCredentials}
                        className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-white hover:bg-[#F0EAE1] text-[10px] font-sans font-semibold border border-[#D8CEBE] flex items-center gap-1 transition"
                      >
                        {copiedCreds ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCreds ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#6B5E57] italic">
                      You will be asked to set your permanent password upon logging in.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onLoginSuccess();
                    }}
                    className="w-52 py-2.5 rounded-full bg-[#EDE8CF] hover:bg-[#E2DDC2] active:scale-[0.98] text-[#141412] font-semibold text-sm transition shadow-xs mx-auto block cursor-pointer"
                  >
                    Proceed to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Architectural Storefront (Image 2 & Image 3) */}
      <div className="w-full lg:w-1/2 relative min-h-[440px] lg:min-h-screen bg-[#F0ECE1] overflow-hidden flex items-center justify-center select-none">
        {/* Architectural Facade Vector & Shading */}
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
            <linearGradient id="goldBrass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8A565" />
              <stop offset="50%" stopColor="#E5C78A" />
              <stop offset="100%" stopColor="#B8934E" />
            </linearGradient>
            <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.20)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
            </linearGradient>
            <linearGradient id="pedestal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5EFE6" />
              <stop offset="100%" stopColor="#E2D8C7" />
            </linearGradient>
            <linearGradient id="pedestalSide" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D8CDBC" />
              <stop offset="100%" stopColor="#C4B8A5" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Exterior Stone Facade */}
          <rect x="0" y="0" width="800" height="1000" fill="url(#wallGrad)" />

          {/* Grand Arch Molding Shadow */}
          <path
            d="M 120 900 L 120 300 C 120 120, 680 120, 680 300 L 680 900 Z"
            fill="#000000"
            opacity="0.10"
            transform="translate(0, 8)"
          />

          {/* Arch Opening (Travertine Recess) */}
          <path
            d="M 120 900 L 120 280 C 120 110, 680 110, 680 280 L 680 900 Z"
            fill="#D8CEBD"
          />

          {/* Inner Step Molding */}
          <path
            d="M 135 900 L 135 290 C 135 130, 665 130, 665 290 L 665 900 Z"
            fill="#E8DFD0"
          />

          {/* Interior Warm Ambient Glow */}
          <path
            d="M 150 900 L 150 300 C 150 150, 650 150, 650 300 L 650 900 Z"
            fill="url(#interiorGlow)"
          />

          {/* Spotlights */}
          <circle cx="280" cy="260" r="14" fill="#FFF9ED" opacity="0.8" filter="url(#softGlow)" />
          <circle cx="400" cy="235" r="16" fill="#FFF9ED" opacity="0.9" filter="url(#softGlow)" />
          <circle cx="520" cy="260" r="14" fill="#FFF9ED" opacity="0.8" filter="url(#softGlow)" />

          {/* Display Pedestals (Left) */}
          <g opacity="0.95">
            <rect x="180" y="700" width="100" height="200" fill="url(#pedestal)" />
            <polygon points="180,700 210,675 310,675 280,700" fill="#FFFBF5" />
            <polygon points="280,700 310,675 310,875 280,900" fill="url(#pedestalSide)" />

            <rect x="220" y="750" width="90" height="150" fill="url(#pedestal)" />
            <polygon points="220,750 245,730 335,730 310,750" fill="#FFFBF5" />
            <polygon points="310,750 335,730 335,880 310,900" fill="url(#pedestalSide)" />

            <ellipse cx="250" cy="670" rx="14" ry="5" fill="#E8DDD0" />
            <path d="M 238 670 C 235 645, 230 630, 240 610 C 245 600, 255 600, 260 610 C 270 630, 265 645, 262 670 Z" fill="#FAF6EE" />
          </g>

          {/* Display Pedestals & Garments (Right) */}
          <g opacity="0.95">
            <line x1="510" y1="620" x2="620" y2="620" stroke="#3A332F" strokeWidth="4" />
            <line x1="520" y1="620" x2="520" y2="860" stroke="#3A332F" strokeWidth="4" />
            <line x1="610" y1="620" x2="610" y2="860" stroke="#3A332F" strokeWidth="4" />

            <rect x="530" y="635" width="16" height="150" rx="3" fill="#FAF8F3" opacity="0.9" />
            <rect x="555" y="635" width="16" height="140" rx="3" fill="#D4B69B" opacity="0.9" />
            <rect x="580" y="635" width="16" height="160" rx="3" fill="#3D3531" opacity="0.85" />

            <rect x="490" y="780" width="80" height="120" fill="url(#pedestal)" />
            <polygon points="490,780 515,760 595,760 570,780" fill="#FFFBF5" />
            <polygon points="570,780 595,760 595,880 570,900" fill="url(#pedestalSide)" />
          </g>

          {/* Outer Frame (Bronze Arch with Gold Trim) */}
          <path
            d="M 150 900 L 150 300 C 150 150, 650 150, 650 300 L 650 900"
            fill="none"
            stroke="#262321"
            strokeWidth="14"
          />
          <path
            d="M 157 900 L 157 300 C 157 157, 643 157, 643 300 L 643 900"
            fill="none"
            stroke="url(#goldBrass)"
            strokeWidth="6"
          />

          {/* Transom Divider */}
          <rect x="150" y="475" width="500" height="10" fill="#262321" />
          <rect x="150" y="477" width="500" height="4" fill="url(#goldBrass)" />

          {/* Upper Window Mullions */}
          <line x1="250" y1="210" x2="250" y2="475" stroke="#262321" strokeWidth="6" />
          <line x1="250" y1="210" x2="250" y2="475" stroke="url(#goldBrass)" strokeWidth="2.5" />

          <line x1="350" y1="165" x2="350" y2="475" stroke="#262321" strokeWidth="6" />
          <line x1="350" y1="165" x2="350" y2="475" stroke="url(#goldBrass)" strokeWidth="2.5" />

          <line x1="450" y1="165" x2="450" y2="475" stroke="#262321" strokeWidth="6" />
          <line x1="450" y1="165" x2="450" y2="475" stroke="url(#goldBrass)" strokeWidth="2.5" />

          <line x1="550" y1="210" x2="550" y2="475" stroke="#262321" strokeWidth="6" />
          <line x1="550" y1="210" x2="550" y2="475" stroke="url(#goldBrass)" strokeWidth="2.5" />

          {/* Double Glass Doors */}
          <rect x="394" y="485" width="12" height="415" fill="#262321" />
          <rect x="398" y="485" width="4" height="415" fill="url(#goldBrass)" />

          <rect x="150" y="485" width="244" height="415" fill="none" stroke="#262321" strokeWidth="8" />
          <rect x="154" y="489" width="236" height="407" fill="none" stroke="url(#goldBrass)" strokeWidth="2.5" />

          <rect x="406" y="485" width="244" height="415" fill="none" stroke="#262321" strokeWidth="8" />
          <rect x="410" y="489" width="236" height="407" fill="none" stroke="url(#goldBrass)" strokeWidth="2.5" />

          {/* Door Handles */}
          <rect x="382" y="620" width="6" height="85" rx="3" fill="#1A1816" />
          <rect x="412" y="620" width="6" height="85" rx="3" fill="#1A1816" />

          {/* Glass Reflections */}
          <polygon points="155,485 280,485 155,750" fill="url(#glassReflection)" />
          <polygon points="450,485 645,485 645,700 450,900" fill="url(#glassReflection)" />

          {/* Threshold Steps */}
          <rect x="100" y="900" width="600" height="24" fill="#DFD8C9" />
          <rect x="100" y="900" width="600" height="4" fill="#F4EFE6" />
          <rect x="60" y="924" width="680" height="30" fill="#CEC5B3" />
          <rect x="60" y="924" width="680" height="4" fill="#E8E2D2" />
          <rect x="0" y="954" width="800" height="46" fill="#BCB29E" />
        </svg>

        {/* Centered Typography: ISTOREYA / A STORE WITH MANY STORIES */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-[0.22em] text-white font-light drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]">
            ISTOREYA
          </h2>
          <p className="text-[11px] sm:text-xs md:text-sm tracking-[0.28em] font-sans font-light mt-2.5 uppercase text-white/95 drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
            A STORE WITH MANY STORIES
          </p>
        </div>
      </div>
    </div>
  );
};
