export type UserRole = 'employee' | 'admin';

export type EmploymentStatus = 'Active' | 'On Leave' | 'Suspended';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  address: string;
}

export interface User {
  id: string; // Employee ID e.g., EMP-2024-001
  username: string;
  password?: string;
  fullName: string;
  email: string;
  personalEmail?: string;
  role: UserRole;
  position: string;
  department: string;
  dateHired: string;
  status: EmploymentStatus;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  avatarUrl: string;
  emergencyContact: EmergencyContact;
  isActivated: boolean;
  firstTimeLogin: boolean;
  temporaryPassword?: string;
  vacationLeaveBalance: number;
  sickLeaveBalance: number;
  otpCode?: string;
  otpExpiresAt?: number;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  assignedBy: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  category: string;
  createdAt: string;
  notes?: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  timeIn: string;
  timeOut: string | null;
  status: AttendanceStatus;
  totalHours: number;
  branch: string;
}

export type LeaveType = 'Vacation' | 'Sick' | 'Emergency' | 'Maternity/Paternity';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  managerRemarks?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Department Meetings' | 'Employee of the Month' | 'Store Operations' | 'New Arrivals' | 'Notice';
  author: string;
  authorRole: string;
  date: string;
  summary: string;
  content: string;
  tagColor?: string;
  poll?: {
    question: string;
    options: PollOption[];
    voters: string[]; // employeeIds who voted
  };
}
