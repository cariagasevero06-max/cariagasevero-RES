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
  login: (username: string, password: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
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
      const CURRENT_VERSION = '2026_v4';
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

    if (!foundUser.isActivated) {
      return {
        success: false,
        message: 'Account not activated yet. Newly hired employees must activate their account first.',
      };
    }

    if (foundUser.password !== cleanPass) {
      return { success: false, message: 'Incorrect Password' };
    }

    setCurrentUser(foundUser);
    return { success: true, message: 'Login successful!', user: foundUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Phase 1: Account Activation
  const activateAccount = (employeeId: string, email: string): ActivationResult => {
    const cleanId = employeeId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    const foundIndex = users.findIndex(
      (u) => u.id.toUpperCase() === cleanId && u.email.toLowerCase() === cleanEmail
    );

    if (foundIndex === -1) {
      return {
        success: false,
        message: 'Verification failed. No matching Employee ID and Company Email record found in ISTOREYA HR database.',
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
      isActivated: true,
      firstTimeLogin: true,
      temporaryPassword,
      password: temporaryPassword,
    };

    const newUsers = [...users];
    newUsers[foundIndex] = updatedUser;
    setUsers(newUsers);
    setCurrentUser(updatedUser);

    return {
      success: true,
      message: 'Account successfully verified! Temporary credentials have been generated and dispatched to your company email.',
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
