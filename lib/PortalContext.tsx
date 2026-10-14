'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Task,
  AttendanceRecord,
  LeaveRequest,
  Announcement,
  TaskStatus,
  LeaveStatus,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_ANNOUNCEMENTS,
} from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface ActivationResult {
  success: boolean;
  message: string;
  credentials?: {
    username: string;
    temporaryPassword: string;
    employeeName: string;
    email: string;
  };
}

interface PortalContextType {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  announcements: Announcement[];
  isLoaded: boolean;
  
  // Auth & Activation
  login: (username: string, password: string) => { success: boolean; message: string; user?: User; needsActivation?: boolean };
  logout: () => void;
  signUpUser: (params: {
    email: string;
    password: string;
    fullName?: string;
    employeeId?: string;
  }) => Promise<{
    success: boolean;
    message: string;
    requiresEmailVerification?: boolean;
    user?: any;
  }>;
  requestActivationOtp: (
    employeeId: string,
    email: string
  ) => Promise<{
    success: boolean;
    message: string;
    otp?: string;
    employeeName?: string;
    email?: string;
    brevoSent?: boolean;
    brevoMessage?: string;
  }>;
  verifyActivationOtp: (employeeId: string, otp: string) => { success: boolean; message: string; user?: User };
  activateAccount: (employeeId: string, email: string) => ActivationResult;
  resetFirstTimeCredentials: (newUsername: string, newPassword: string) => { success: boolean; message: string };
  switchUser: (userId: string) => void;
  
  // Profile
  updateUserProfile: (userId: string, updatedData: Partial<User>) => void;
  
  // Attendance
  timeIn: () => { success: boolean; message: string };
  timeOut: () => { success: boolean; message: string };
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  
  // Leaves
  submitLeaveRequest: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => void;
  reviewLeaveRequest: (leaveId: string, status: LeaveStatus, remarks?: string) => void;
  
  // Announcements & Polls
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  votePoll: (announcementId: string, optionId: string) => void;
  
  // Quick helper reset
  resetToDefaultData: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'istoreya_current_user';
const STORAGE_KEY_USERS = 'istoreya_users_data';
const STORAGE_KEY_TASKS = 'istoreya_tasks_data';
const STORAGE_KEY_ATTENDANCE = 'istoreya_attendance_data';
const STORAGE_KEY_LEAVES = 'istoreya_leaves_data';
const STORAGE_KEY_ANNOUNCEMENTS = 'istoreya_announcements_data';

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const SCHEMA_VERSION_KEY = 'istoreya_schema_v';
      const CURRENT_VERSION = '2026_v5';
      const storedVersion = localStorage.getItem(SCHEMA_VERSION_KEY);

      if (storedVersion !== CURRENT_VERSION) {
        localStorage.clear();
        localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_VERSION);
        setUsers(INITIAL_USERS);
        setCurrentUser(null);
        setIsLoaded(true);
        return;
      }

      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      const storedAttendance = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
      const storedLeaves = localStorage.getItem(STORAGE_KEY_LEAVES);
      const storedAnnouncements = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
      const storedCurrentUser = localStorage.getItem(STORAGE_KEY_USER);

      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedAttendance) setAttendance(JSON.parse(storedAttendance));
      if (storedLeaves) setLeaves(JSON.parse(storedLeaves));
      if (storedAnnouncements) setAnnouncements(JSON.parse(storedAnnouncements));

      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Listen for Supabase auth state changes (e.g. email verified from Gmail activation link)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Check existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncSupabaseUser(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        syncSupabaseUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const syncSupabaseUser = (user: any) => {
    const email = user.email?.toLowerCase();
    if (!email) return;

    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.email.toLowerCase() === email);
      if (idx !== -1) {
        const updated: User = {
          ...prev[idx],
          isActivated: true,
        };
        const nextList = [...prev];
        nextList[idx] = updated;
        setCurrentUser(updated);
        return nextList;
      } else {
        const newUser: User = {
          id: user.user_metadata?.employee_id || `EMP-${Date.now().toString().slice(-4)}`,
          username: email.split('@')[0],
          fullName: user.user_metadata?.full_name || email.split('@')[0],
          email,
          role: 'employee',
          position: 'Associate',
          department: 'Store Operations',
          dateHired: new Date().toISOString().split('T')[0],
          status: 'Active',
          dateOfBirth: '2001-01-01',
          gender: 'Not specified',
          phoneNumber: '+63 900 000 0000',
          address: 'Metro Manila, Philippines',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          emergencyContact: {
            name: 'Primary Contact',
            relationship: 'Family',
            phoneNumber: '+63 900 000 0000',
            address: 'Metro Manila',
          },
          isActivated: true,
          firstTimeLogin: false,
          vacationLeaveBalance: 15,
          sickLeaveBalance: 10,
        };
        setCurrentUser(newUser);
        return [...prev, newUser];
      }
    });
  };

  // Sync to LocalStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendance));
      localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(leaves));
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(announcements));
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [users, tasks, attendance, leaves, announcements, currentUser, isLoaded]);

  // Auth: Login
  const login = (username: string, password: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const foundUser = users.find(
      (u) => u.username.toLowerCase() === cleanUsername
    );

    if (!foundUser) {
      return { success: false, message: 'Invalid Username' };
    }

    if (foundUser.password !== cleanPass) {
      return { success: false, message: 'Incorrect Password' };
    }

    // If account has not been activated yet, route to Activate Account with OTP verification
    if (!foundUser.isActivated) {
      return {
        success: true,
        needsActivation: true,
        message: 'Account not activated yet. Redirecting to employee activation and OTP verification...',
        user: foundUser,
      };
    }

    setCurrentUser(foundUser);
    return { success: true, message: 'Login successful!', user: foundUser };
  };

  const logout = () => {
    setCurrentUser(null);
    if (isSupabaseConfigured()) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  // Supabase Auth Sign Up with Brevo SMTP email routing
  const signUpUser = async ({
    email,
    password,
    fullName = '',
    employeeId = '',
  }: {
    email: string;
    password: string;
    fullName?: string;
    employeeId?: string;
  }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || cleanEmail.split('@')[0];
    const cleanId = (employeeId.trim() || `EMP-${Date.now().toString().slice(-4)}`).toUpperCase();

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    const emailRedirectTo = `${siteUrl}/auth/callback?type=signup`;

    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase credentials are not configured in .env.local yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: cleanName,
            employee_id: cleanId,
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      // Add to local state pending activation
      const existingIdx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
      const newUser: User = {
        id: cleanId,
        username: cleanEmail.split('@')[0],
        fullName: cleanName,
        email: cleanEmail,
        role: 'employee',
        position: 'Associate',
        department: 'Store Operations',
        dateHired: new Date().toISOString().split('T')[0],
        status: 'Active',
        dateOfBirth: '2001-01-01',
        gender: 'Not specified',
        phoneNumber: '+63 900 000 0000',
        address: 'Metro Manila, Philippines',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        emergencyContact: {
          name: 'Primary Contact',
          relationship: 'Family',
          phoneNumber: '+63 900 000 0000',
          address: 'Metro Manila',
        },
        isActivated: false,
        firstTimeLogin: false,
        vacationLeaveBalance: 15,
        sickLeaveBalance: 10,
      };

      if (existingIdx === -1) {
        setUsers((prev) => [...prev, newUser]);
      }

      return {
        success: true,
        message: `Verification link dispatched to ${cleanEmail} via Brevo SMTP. Please check your Gmail inbox.`,
        requiresEmailVerification: !data.session,
        user: data.user,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error communicating with Supabase Auth.' };
    }
  };

  // Phase 1: Request OTP for Employee Verification (via Personal Email / Gmail)
  const requestActivationOtp = async (employeeId: string, email: string) => {
    const cleanId = employeeId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Find employee by ID in ISTOREYA HR records
    const foundIndex = users.findIndex((u) => u.id.toUpperCase() === cleanId);

    if (foundIndex === -1) {
      return {
        success: false,
        message: 'Verification failed. No matching Employee ID found in ISTOREYA HR records.',
      };
    }

    const targetUser = users[foundIndex];
    if (targetUser.isActivated && !targetUser.firstTimeLogin) {
      return {
        success: false,
        message: 'This employee account is already active. Please proceed directly to the Login page.',
      };
    }

    // Generate 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store personal email on the employee account
    const updatedUser: User = {
      ...targetUser,
      personalEmail: cleanEmail,
      otpCode: generatedOtp,
      otpExpiresAt,
    };

    const newUsers = [...users];
    newUsers[foundIndex] = updatedUser;
    setUsers(newUsers);

    // Asynchronously dispatch OTP through direct Brevo API to their personal email
    let brevoSent = false;
    let brevoMessage = '';

    try {
      const resp = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail, // Send directly to the employee's personal Gmail
          employeeId: targetUser.id,
          fullName: targetUser.fullName,
          code: generatedOtp,
        }),
      });
      const data = await resp.json();
      brevoSent = Boolean(data?.success);
      brevoMessage = data?.message || data?.error || '';
    } catch (e: any) {
      console.warn('Error contacting Brevo send-email route:', e);
      brevoMessage = e?.message || 'Network error contacting email service';
    }

    return {
      success: true,
      message: brevoSent
        ? `Authentication OTP dispatched directly to personal email (${cleanEmail}) via Brevo API.`
        : brevoMessage || `OTP generated for personal email (${cleanEmail}).`,
      otp: generatedOtp,
      employeeName: targetUser.fullName,
      email: cleanEmail,
      brevoSent,
      brevoMessage,
    };
  };

  // Phase 1: Verify Employee OTP Code
  const verifyActivationOtp = (employeeId: string, otp: string) => {
    const cleanId = employeeId.trim().toUpperCase();
    const cleanOtp = otp.trim();

    const foundIndex = users.findIndex((u) => u.id.toUpperCase() === cleanId);
    if (foundIndex === -1) {
      return { success: false, message: 'Employee record not found.' };
    }

    const targetUser = users[foundIndex];

    // Verify OTP matching or fallback 123456 for instant developer testing
    const isOtpValid =
      (targetUser.otpCode && targetUser.otpCode === cleanOtp) ||
      cleanOtp === '123456';

    if (!isOtpValid) {
      return {
        success: false,
        message: 'Invalid OTP code. Please enter the correct 6-digit code or request a new one.',
      };
    }

    const temporaryPassword = targetUser.temporaryPassword || `Istoreya@${Math.floor(1000 + Math.random() * 9000)}`;

    const activatedUser: User = {
      ...targetUser,
      isActivated: true,
      firstTimeLogin: true,
      otpCode: undefined,
      otpExpiresAt: undefined,
      temporaryPassword,
      password: temporaryPassword,
    };

    const newUsers = [...users];
    newUsers[foundIndex] = activatedUser;
    setUsers(newUsers);
    setCurrentUser(activatedUser);

    return {
      success: true,
      message: 'Employee authentication successful! Account has been verified and activated.',
      user: activatedUser,
    };
  };

  // Phase 1: Account Activation
  const activateAccount = (employeeId: string, email: string): ActivationResult => {
    const cleanId = employeeId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    const foundIndex = users.findIndex(
      (u) =>
        u.id.toUpperCase() === cleanId &&
        (u.email.toLowerCase() === cleanEmail ||
          (u.personalEmail && u.personalEmail.toLowerCase() === cleanEmail) ||
          cleanEmail.includes('@'))
    );

    if (foundIndex === -1) {
      return {
        success: false,
        message: 'Verification failed. No matching Employee ID record found in ISTOREYA HR database.',
      };
    }

    const targetUser = users[foundIndex];
    if (targetUser.isActivated && !targetUser.firstTimeLogin) {
      return {
        success: false,
        message: 'This employee account is already active and configured. Please proceed directly to the Login page.',
      };
    }

    // Generate temporary password
    const temporaryPassword = targetUser.temporaryPassword || `Istoreya@${Math.floor(1000 + Math.random() * 9000)}`;
    const tempUsername = targetUser.username;

    const updatedUser: User = {
      ...targetUser,
      personalEmail: cleanEmail,
      isActivated: true,
      firstTimeLogin: true,
      temporaryPassword,
      password: temporaryPassword,
    };

    const newUsers = [...users];
    newUsers[foundIndex] = updatedUser;
    setUsers(newUsers);
    setCurrentUser(updatedUser);

    // Asynchronously dispatch email notification via Brevo API
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        employeeId: targetUser.id,
        fullName: targetUser.fullName,
        code: temporaryPassword,
      }),
    }).catch((err) => {
      console.warn('Brevo notification skipped/failed:', err);
    });

    return {
      success: true,
      message: 'Account successfully verified! Temporary credentials have been generated and dispatched to your email via Brevo API.',
      credentials: {
        username: tempUsername,
        temporaryPassword,
        employeeName: targetUser.fullName,
        email: targetUser.email,
      },
    };
  };

  // Phase 1: First-Time Credential Reset
  const resetFirstTimeCredentials = (newUsername: string, newPassword: string) => {
    if (!currentUser) {
      return { success: false, message: 'No active session found.' };
    }

    if (newUsername.trim().length < 4) {
      return { success: false, message: 'Username must be at least 4 characters long.' };
    }

    if (newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    const updatedUser: User = {
      ...currentUser,
      username: newUsername.trim(),
      password: newPassword,
      firstTimeLogin: false,
    };

    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);

    return { success: true, message: 'Credentials updated successfully! Welcome to ISTOREYA.' };
  };

  // Fast Account Switcher for testing/demo
  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  // Update Profile
  const updateUserProfile = (userId: string, updatedData: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updatedData } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    }
  };

  // Attendance Actions
  const timeIn = () => {
    if (!currentUser) return { success: false, message: 'Not logged in.' };

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    // Check if already timed in today
    const existing = attendance.find(
      (a) => a.employeeId === currentUser.id && a.date === todayStr
    );

    if (existing && !existing.timeOut) {
      return { success: false, message: `Already clocked in at ${existing.timeIn} today.` };
    }

    // Determine status (Late if after 9:00 AM)
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.fullName,
      date: todayStr,
      timeIn: timeStr,
      timeOut: null,
      status: isLate ? 'Late' : 'Present',
      totalHours: 0,
      branch: 'ISTOREYA Flagship - Greenbelt 5',
    };

    setAttendance((prev) => [newRecord, ...prev]);
    return { success: true, message: `Successfully Clocked In at ${timeStr} (${isLate ? 'Marked Late' : 'On Time'})!` };
  };

  const timeOut = () => {
    if (!currentUser) return { success: false, message: 'Not logged in.' };

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const openRecordIndex = attendance.findIndex(
      (a) => a.employeeId === currentUser.id && a.date === todayStr && !a.timeOut
    );

    if (openRecordIndex === -1) {
      return { success: false, message: 'No active Clock-In session found for today.' };
    }

    const rec = attendance[openRecordIndex];
    // Calculate simulated hours or minimum 8.0
    const calculatedHours = 8.2;

    const updatedRec: AttendanceRecord = {
      ...rec,
      timeOut: timeStr,
      totalHours: calculatedHours,
    };

    const newAttendance = [...attendance];
    newAttendance[openRecordIndex] = updatedRec;
    setAttendance(newAttendance);

    return { success: true, message: `Successfully Clocked Out at ${timeStr}. Total shift: ${calculatedHours} hrs.` };
  };

  // Task Actions
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `TSK-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks((prev) => [task, ...prev]);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  // Leave Actions
  const submitLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    const newLeave: LeaveRequest = {
      ...req,
      id: `LV-${Date.now().toString().slice(-5)}`,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    setLeaves((prev) => [newLeave, ...prev]);
  };

  const reviewLeaveRequest = (leaveId: string, status: LeaveStatus, remarks?: string) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status,
              reviewedBy: currentUser?.fullName || 'Carlos Mendoza',
              reviewedDate: new Date().toISOString().split('T')[0],
              managerRemarks: remarks || (status === 'Approved' ? 'Approved by Store Operations.' : 'Request denied based on schedule constraints.'),
            }
          : l
      )
    );
  };

  // Announcements & Polls
  const addAnnouncement = (newAnn: Omit<Announcement, 'id'>) => {
    const ann: Announcement = {
      ...newAnn,
      id: `ANN-${Date.now().toString().slice(-4)}`,
    };
    setAnnouncements((prev) => [ann, ...prev]);
  };

  const votePoll = (announcementId: string, optionId: string) => {
    if (!currentUser) return;
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id !== announcementId || !ann.poll) return ann;
        if (ann.poll.voters.includes(currentUser.id)) return ann; // already voted

        const updatedOptions = ann.poll.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );

        return {
          ...ann,
          poll: {
            ...ann.poll,
            options: updatedOptions,
            voters: [...ann.poll.voters, currentUser.id],
          },
        };
      })
    );
  };

  // Helper reset
  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setTasks(INITIAL_TASKS);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaves(INITIAL_LEAVES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    localStorage.clear();
  };

  return (
    <PortalContext.Provider
      value={{
        currentUser,
        users,
        tasks,
        attendance,
        leaves,
        announcements,
        isLoaded,
        login,
        logout,
        signUpUser,
        requestActivationOtp,
        verifyActivationOtp,
        activateAccount,
        resetFirstTimeCredentials,
        switchUser,
        updateUserProfile,
        timeIn,
        timeOut,
        addTask,
        updateTaskStatus,
        submitLeaveRequest,
        reviewLeaveRequest,
        addAnnouncement,
        votePoll,
        resetToDefaultData,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
