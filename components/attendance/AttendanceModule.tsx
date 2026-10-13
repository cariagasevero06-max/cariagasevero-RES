'use client';

import React, { useState, useEffect } from 'react';
import { usePortal } from '@/lib/PortalContext';
import { LeaveType, LeaveStatus, AttendanceRecord, LeaveRequest } from '@/lib/types';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Plane,
  Plus,
  AlertCircle,
  X,
  Search,
  Filter,
  Users,
  Check,
  TrendingUp,
  MapPin,
  MessageSquare,
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const {
    currentUser,
    users,
    attendance,
    leaves,
    timeIn,
    timeOut,
    submitLeaveRequest,
    reviewLeaveRequest,
  } = usePortal();

  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves'>('attendance');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [clockActionToast, setClockActionToast] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Leave Form Modal
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('Vacation');
  const [leaveStartDate, setLeaveStartDate] = useState('2026-10-24');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-10-26');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmittedToast, setLeaveSubmittedToast] = useState(false);
  const [todayStr, setTodayStr] = useState('2026-10-12');

  // Admin Review Modal
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<LeaveStatus>('Approved');
  const [managerRemarks, setManagerRemarks] = useState('');

  // Attendance Filters
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
      );
      setTodayStr(now.toISOString().split('T')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  // Punch status for current user
  const todayRecord = attendance.find(
    (a) => a.employeeId === currentUser.id && a.date === todayStr
  );
  const isClockedIn = Boolean(todayRecord && !todayRecord.timeOut);

  const handlePunchIn = () => {
    const res = timeIn();
    setClockActionToast({ text: res.message, type: res.success ? 'success' : 'info' });
    setTimeout(() => setClockActionToast(null), 4000);
  };

  const handlePunchOut = () => {
    const res = timeOut();
    setClockActionToast({ text: res.message, type: res.success ? 'success' : 'info' });
    setTimeout(() => setClockActionToast(null), 4000);
  };

  // Filter Attendance Logs
  const relevantAttendance = isAdmin
    ? selectedEmployeeFilter === 'All'
      ? attendance
      : attendance.filter((a) => a.employeeId === selectedEmployeeFilter)
    : attendance.filter((a) => a.employeeId === currentUser.id);

  const filteredAttendance =
    selectedStatusFilter === 'All'
      ? relevantAttendance
      : relevantAttendance.filter((a) => a.status === selectedStatusFilter);

  // Summary Metrics
  const totalDays = relevantAttendance.length || 1;
  const presentDays = relevantAttendance.filter((a) => a.status === 'Present').length;
  const lateDays = relevantAttendance.filter((a) => a.status === 'Late').length;
  const absentDays = relevantAttendance.filter((a) => a.status === 'Absent').length;
  const totalHours = relevantAttendance.reduce((acc, a) => acc + (a.totalHours || 0), 0);
  const attendanceRate = Math.round(((presentDays + lateDays) / totalDays) * 100);

  // Leave calculations
  const calculateDays = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diff = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);
    return diff;
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const days = calculateDays(leaveStartDate, leaveEndDate);

    submitLeaveRequest({
      employeeId: currentUser.id,
      employeeName: currentUser.fullName,
      position: currentUser.position,
      leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      totalDays: days,
      reason: leaveReason,
    });

    setShowApplyLeaveModal(false);
    setLeaveReason('');
    setLeaveSubmittedToast(true);
    setTimeout(() => setLeaveSubmittedToast(false), 4000);
  };

  const handleOpenReview = (leave: LeaveRequest, action: LeaveStatus) => {
    setReviewingLeave(leave);
    setReviewAction(action);
    setManagerRemarks(
      action === 'Approved'
        ? 'Approved by Store Operations. Schedule coverage confirmed.'
        : 'Denied due to peak inventory audit on requested dates.'
    );
  };

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingLeave) return;
    reviewLeaveRequest(reviewingLeave.id, reviewAction, managerRemarks);
    setReviewingLeave(null);
  };

  // Leaves list
  const relevantLeaves = isAdmin
    ? leaves
    : leaves.filter((l) => l.employeeId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {clockActionToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{clockActionToast.text}</span>
        </div>
      )}

      {leaveSubmittedToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your leave application has been submitted to Store Operations for review!</span>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8E0D5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#2C2523] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D6F4B] flex items-center justify-center text-white">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">File Leave Application</h3>
                  <p className="text-xs text-[#D8CEBE]">ISTOREYA Associate Time-Off Request</p>
                </div>
              </div>
              <button
                onClick={() => setShowApplyLeaveModal(false)}
                className="text-[#A89D96] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Type of Leave
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#3D6F4B] outline-none"
                >
                  <option value="Vacation">
                    Vacation Leave ({currentUser.vacationLeaveBalance} days remaining)
                  </option>
                  <option value="Sick">
                    Sick Leave ({currentUser.sickLeaveBalance} days remaining)
                  </option>
                  <option value="Emergency">Emergency Leave (3 days available)</option>
                  <option value="Maternity/Paternity">Maternity / Paternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#3D6F4B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#3D6F4B] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F0EAE1] text-xs text-[#6B5E57] flex items-center justify-between">
                <span>Total Days Requested:</span>
                <span className="font-bold text-[#2C2523] font-mono">
                  {calculateDays(leaveStartDate, leaveEndDate)} Business Days
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Reason for Leave
                </label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Provide brief context for store operations coverage planning..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#3D6F4B] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyLeaveModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#6B5E57] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#3D6F4B] hover:bg-[#2D583B] text-white shadow-sm flex items-center gap-2"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Submit Leave Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Review Remarks Modal */}
      {reviewingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8E0D5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#2C2523] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${reviewAction === 'Approved' ? 'bg-[#3D6F4B]' : 'bg-rose-700'
                    }`}
                >
                  {reviewAction === 'Approved' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">
                    {reviewAction === 'Approved' ? 'Approve' : 'Deny'} Leave Request
                  </h3>
                  <p className="text-xs text-[#D8CEBE]">
                    Applicant: {reviewingLeave.employeeName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewingLeave(null)}
                className="text-[#A89D96] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReview} className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8E0D5] text-xs space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-[#2C2523]">
                    {reviewingLeave.leaveType} Leave ({reviewingLeave.totalDays} days)
                  </span>
                  <span className="text-[#8C7E77]">{reviewingLeave.appliedDate}</span>
                </div>
                <div className="text-[#786C65]">
                  Dates: {reviewingLeave.startDate} to {reviewingLeave.endDate}
                </div>
                <div className="text-[#4B413C] italic">"{reviewingLeave.reason}"</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Manager Remarks & Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  value={managerRemarks}
                  onChange={(e) => setManagerRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewingLeave(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#6B5E57] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center gap-2 ${reviewAction === 'Approved'
                    ? 'bg-[#3D6F4B] hover:bg-[#2D583B]'
                    : 'bg-rose-700 hover:bg-rose-800'
                    }`}
                >
                  <span>Confirm {reviewAction}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header & Sub-Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E0D5]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2C2523] tracking-tight">
            Attendance & Leave Operations
          </h1>
          <p className="text-xs text-[#786C65]">
            Daily time-in/out records, shift compliance, and vacation/sick leave approvals
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#F0EAE1] border border-[#E8E0D5] self-start">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${activeTab === 'attendance'
              ? 'bg-[#2C2523] text-white shadow-xs'
              : 'text-[#6B5E57] hover:text-[#2C2523]'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Attendance Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${activeTab === 'leaves'
              ? 'bg-[#2C2523] text-white shadow-xs'
              : 'text-[#6B5E57] hover:text-[#2C2523]'
              }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Leave Management</span>
            {isAdmin && leaves.filter((l) => l.status === 'Pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#B85032] text-white font-bold">
                {leaves.filter((l) => l.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: ATTENDANCE TRACKER & LOGS */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Live Punch Widget */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#8C7E77] uppercase tracking-wider block">
                Store Associate Punch Terminal
              </span>
              <h2 className="text-xl font-serif font-bold text-[#2C2523]">
                {currentUser.fullName}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[#786C65]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#B85032]" /> Greenbelt 5 Flagship
                </span>
                <span>•</span>
                <span>Standard Shift: 09:00 AM – 06:00 PM</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E0D5]">
              <div className="text-center sm:text-right">
                <span className="text-[10px] text-[#8C7E77] block">{currentDate}</span>
                <span className="font-mono text-2xl font-bold text-[#2C2523] tracking-wider">
                  {currentTime}
                </span>
              </div>

              {!isClockedIn ? (
                <button
                  onClick={handlePunchIn}
                  className="px-6 py-3 rounded-xl bg-[#3D6F4B] hover:bg-[#2D583B] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition"
                >
                  <Clock className="w-4 h-4" />
                  <span>Time-In Shift</span>
                </button>
              ) : (
                <button
                  onClick={handlePunchOut}
                  className="px-6 py-3 rounded-xl bg-[#B85032] hover:bg-[#A34327] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition"
                >
                  <Clock className="w-4 h-4" />
                  <span>Time-Out Shift</span>
                </button>
              )}
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] shadow-xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] block">
                On-Time Rate
              </span>
              <div className="text-2xl font-serif font-bold text-[#2C2523] mt-1">
                {attendanceRate}%
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] shadow-xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] block">
                Days Present
              </span>
              <div className="text-2xl font-serif font-bold text-[#3D6F4B] mt-1">
                {presentDays}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] shadow-xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] block">
                Late Incidents
              </span>
              <div className="text-2xl font-serif font-bold text-[#C27A19] mt-1">
                {lateDays}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] shadow-xs text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] block">
                Total Work Hours
              </span>
              <div className="text-2xl font-serif font-bold text-[#2C2523] mt-1">
                {totalHours.toFixed(1)} hrs
              </div>
            </div>
          </div>

          {/* Attendance Table & Filters */}
          <div className="bg-white rounded-3xl border border-[#E8E0D5] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#F0EAE1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#2C2523]">
                  Attendance Punch History
                </h3>
                <p className="text-xs text-[#786C65]">
                  Verified biometric and portal time records
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Employee Filter for Admin */}
                {isAdmin && (
                  <select
                    value={selectedEmployeeFilter}
                    onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-[#D8CEBE] text-xs text-[#2C2523] bg-[#FAF7F2] outline-none"
                  >
                    <option value="All">All Store Associates</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                )}

                {/* Status Filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#D8CEBE] text-xs text-[#2C2523] bg-[#FAF7F2] outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#6B5E57] uppercase tracking-wider text-[10px] border-b border-[#E8E0D5]">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Date</th>
                    {isAdmin && <th className="px-5 py-3.5 font-bold">Associate</th>}
                    <th className="px-5 py-3.5 font-bold">Time-In</th>
                    <th className="px-5 py-3.5 font-bold">Time-Out</th>
                    <th className="px-5 py-3.5 font-bold">Total Shift</th>
                    <th className="px-5 py-3.5 font-bold">Status</th>
                    <th className="px-5 py-3.5 font-bold">Branch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-[#8C7E77]">
                        No attendance records found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-[#FAF7F2]/60 transition">
                        <td className="px-5 py-4 font-mono font-medium text-[#2C2523]">
                          {rec.date}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-4 font-semibold text-[#2C2523]">
                            {rec.employeeName}
                          </td>
                        )}
                        <td className="px-5 py-4 font-mono text-[#4B413C]">
                          {rec.timeIn}
                        </td>
                        <td className="px-5 py-4 font-mono text-[#4B413C]">
                          {rec.timeOut || (
                            <span className="text-[#3D6F4B] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                              Active Shift
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-[#4B413C]">
                          {rec.totalHours > 0 ? `${rec.totalHours} hrs` : '--'}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${rec.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'Late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                              }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#786C65]">
                          {rec.branch}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE MANAGEMENT & REQUESTS */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Leave Balances Cards & Apply Action */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#E8E0D5] shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] block">
                Vacation Leave Credits
              </span>
              <div className="text-2xl font-serif font-bold text-[#2C2523]">
                {currentUser.vacationLeaveBalance}{' '}
                <span className="text-xs font-sans text-[#8C7E77] font-normal">/ 15 days</span>
              </div>
              <p className="text-[11px] text-[#3D6F4B]">Available for planned time-off</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E8E0D5] shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] block">
                Sick Leave Credits
              </span>
              <div className="text-2xl font-serif font-bold text-[#2C2523]">
                {currentUser.sickLeaveBalance}{' '}
                <span className="text-xs font-sans text-[#8C7E77] font-normal">/ 10 days</span>
              </div>
              <p className="text-[11px] text-[#C27A19]">Medical & health recovery</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E8E0D5] shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] block">
                Emergency Leave
              </span>
              <div className="text-2xl font-serif font-bold text-[#2C2523]">
                3{' '}
                <span className="text-xs font-sans text-[#8C7E77] font-normal">/ 3 days</span>
              </div>
              <p className="text-[11px] text-[#786C65]">Immediate family needs</p>
            </div>

            {/* Apply Leave Trigger Button */}
            <div className="bg-[#FAF7F2] p-5 rounded-3xl border-2 border-dashed border-[#D8CEBE] flex flex-col items-center justify-center text-center gap-2">
              <button
                onClick={() => setShowApplyLeaveModal(true)}
                className="w-full py-2.5 rounded-xl bg-[#B85032] hover:bg-[#A34327] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Apply for Leave</span>
              </button>
              <span className="text-[10px] text-[#8C7E77]">Standard notice: 3 days in advance</span>
            </div>
          </div>

          {/* Leaves Tracking & Review Table */}
          <div className="bg-white rounded-3xl border border-[#E8E0D5] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#F0EAE1] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-[#2C2523]">
                  {isAdmin ? 'All Associate Leave Applications' : 'My Leave History & Status'}
                </h3>
                <p className="text-xs text-[#786C65]">
                  Track submission status, review remarks, and manager decisions
                </p>
              </div>

              {isAdmin && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAEBE5] text-[#B85032]">
                  Manager Review Interface Active
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#6B5E57] uppercase tracking-wider text-[10px] border-b border-[#E8E0D5]">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Applied On</th>
                    {isAdmin && <th className="px-5 py-3.5 font-bold">Associate</th>}
                    <th className="px-5 py-3.5 font-bold">Type</th>
                    <th className="px-5 py-3.5 font-bold">Dates Requested</th>
                    <th className="px-5 py-3.5 font-bold">Duration</th>
                    <th className="px-5 py-3.5 font-bold">Reason</th>
                    <th className="px-5 py-3.5 font-bold">Status</th>
                    <th className="px-5 py-3.5 font-bold">
                      {isAdmin ? 'Manager Actions' : 'Remarks'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {relevantLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-[#8C7E77]">
                        No leave records found.
                      </td>
                    </tr>
                  ) : (
                    relevantLeaves.map((leave) => {
                      const isPending = leave.status === 'Pending';

                      return (
                        <tr key={leave.id} className="hover:bg-[#FAF7F2]/60 transition">
                          <td className="px-5 py-4 font-mono font-medium text-[#2C2523]">
                            {leave.appliedDate}
                          </td>
                          {isAdmin && (
                            <td className="px-5 py-4">
                              <span className="font-semibold text-[#2C2523] block">
                                {leave.employeeName}
                              </span>
                              <span className="text-[10px] text-[#8C7E77]">
                                {leave.position}
                              </span>
                            </td>
                          )}
                          <td className="px-5 py-4 font-semibold text-[#B85032]">
                            {leave.leaveType}
                          </td>
                          <td className="px-5 py-4 font-mono text-[#4B413C]">
                            {leave.startDate} to {leave.endDate}
                          </td>
                          <td className="px-5 py-4 font-medium text-[#2C2523]">
                            {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                          </td>
                          <td className="px-5 py-4 max-w-xs text-[#5C504A]">
                            <p className="line-clamp-2">{leave.reason}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${leave.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : leave.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                                }`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {isAdmin && isPending ? (
                              /* Manager Decision Buttons */
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenReview(leave, 'Approved')}
                                  className="px-2.5 py-1 rounded-lg bg-[#3D6F4B] hover:bg-[#2D583B] text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-xs"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Agree</span>
                                </button>
                                <button
                                  onClick={() => handleOpenReview(leave, 'Rejected')}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Deny</span>
                                </button>
                              </div>
                            ) : (
                              /* Display Manager Remarks */
                              <span className="text-[11px] text-[#786C65] italic">
                                {leave.managerRemarks ||
                                  (isPending ? 'Pending store review' : 'No comments')}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
