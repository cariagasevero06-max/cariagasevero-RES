'use client';

import React, { useState, useEffect } from 'react';
import { usePortal } from '@/lib/PortalContext';
import {
  Users,
  Clock,
  CheckSquare,
  Plane,
  Plus,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Shield,
  Building2,
} from 'lucide-react';
import { LeaveRequest } from '@/lib/types';

interface Props {
  onNavigateToTab: (tab: 'tasks' | 'announcements' | 'attendance' | 'profile') => void;
  onOpenCreateTask: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  onNavigateToTab,
  onOpenCreateTask,
}) => {
  const { users, tasks, attendance, leaves, reviewLeaveRequest } = usePortal();
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState<string>('2026-10-12');

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  // Metrics
  const totalEmployees = users.length;
  const activeEmployees = users.filter((u) => u.status === 'Active').length;

  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendance.filter((a) => a.status === 'Present').length;
  const lateCount = todayAttendance.filter((a) => a.status === 'Late').length;
  const attendanceRate = totalEmployees > 0 ? Math.round(((presentCount + lateCount) / totalEmployees) * 100) : 95;

  // Tasks breakdown
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const totalTasks = tasks.length || 1;
  const taskCompletionRate = Math.round((completedTasks / totalTasks) * 100);

  // Pending leaves
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  const handleQuickReview = (leaveId: string, status: 'Approved' | 'Rejected') => {
    reviewLeaveRequest(
      leaveId,
      status,
      status === 'Approved'
        ? 'Quick-approved by Store Operations Manager from Dashboard.'
        : 'Denied due to peak floor schedule requirements.'
    );
    setReviewSuccess(`Leave request successfully marked as ${status}!`);
    setTimeout(() => setReviewSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Operations Header */}
      <div className="bg-[#2C2523] text-[#FAF7F2] rounded-3xl p-6 sm:p-8 shadow-md border border-[#3D3532] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D3532] text-[#D8CEBE] text-xs font-medium border border-[#4E4440]">
            <Shield className="w-3.5 h-3.5 text-[#E08A63]" />
            <span>Store Operations Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            Branch Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#A89D96] flex items-center gap-2">
            <span>Greenbelt 5 Flagship (Branch #04)</span>
            <span>•</span>
            <span>Retail, Curation & Artisan Staff</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateTask}
            className="px-4 py-2.5 rounded-xl bg-[#B85032] hover:bg-[#A34327] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>

          <button
            onClick={() => onNavigateToTab('attendance')}
            className="px-4 py-2.5 rounded-xl bg-[#3D3532] hover:bg-[#4E4440] text-[#FAF7F2] text-xs font-semibold border border-[#524743] flex items-center gap-2 transition"
          >
            <Clock className="w-4 h-4 text-[#D8A47F]" />
            <span>Review Full Logs</span>
          </button>
        </div>
      </div>

      {reviewSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{reviewSuccess}</span>
        </div>
      )}

      {/* Admin KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Employees */}
        <div
          onClick={() => onNavigateToTab('profile')}
          className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-xs cursor-pointer hover:border-[#B85032] transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C7E77] uppercase tracking-wider">
              Total Staff
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAEBE5] text-[#B85032] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2C2523] mt-2">
            {activeEmployees}{' '}
            <span className="text-xs font-sans font-normal text-[#8C7E77]">
              / {totalEmployees} active
            </span>
          </div>
          <span className="text-[11px] text-[#B85032] group-hover:underline flex items-center gap-1 mt-1">
            Directory & profiles <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Store Attendance */}
        <div
          onClick={() => onNavigateToTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-xs cursor-pointer hover:border-[#3D6F4B] transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C7E77] uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#EBF3ED] text-[#3D6F4B] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2C2523] mt-2">
            {attendanceRate}%{' '}
            <span className="text-xs font-sans font-normal text-[#8C7E77]">
              present
            </span>
          </div>
          <span className="text-[11px] text-[#3D6F4B] flex items-center gap-1 mt-1 font-medium">
            <span>{presentCount} on-time</span> • <span>{lateCount} late</span>
          </span>
        </div>

        {/* Team Task Completion */}
        <div
          onClick={() => onNavigateToTab('tasks')}
          className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-xs cursor-pointer hover:border-[#C27A19] transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C7E77] uppercase tracking-wider">
              Store Tasks
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FCF4E3] text-[#C27A19] flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2C2523] mt-2">
            {taskCompletionRate}%{' '}
            <span className="text-xs font-sans font-normal text-[#8C7E77]">
              complete
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-[#786C65]">
            <span className="text-amber-700 font-semibold">{pendingTasks} Pending</span>
            <span>•</span>
            <span className="text-blue-700 font-semibold">{inProgressTasks} In Progress</span>
          </div>
        </div>

        {/* Pending Leave Approvals */}
        <div
          onClick={() => onNavigateToTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-xs cursor-pointer hover:border-[#B85032] transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C7E77] uppercase tracking-wider">
              Pending Leaves
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2C2523] mt-2">
            {pendingLeaves.length}{' '}
            <span className="text-xs font-sans font-normal text-[#8C7E77]">
              needing approval
            </span>
          </div>
          <span className="text-[11px] text-[#B85032] group-hover:underline flex items-center gap-1 mt-1">
            Review pipeline <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Main Section: Pending Leave Review Actions + Team Tasks Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leave Approvals with Quick Review Actions (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <div>
              <h2 className="text-base font-serif font-bold text-[#2C2523]">
                Pending Leave Applications (Quick Review)
              </h2>
              <p className="text-xs text-[#786C65]">
                Evaluate staff requests and approve or reject with instant notice
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAEBE5] text-[#B85032]">
              {pendingLeaves.length} Awaiting Action
            </span>
          </div>

          <div className="space-y-3">
            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8C7E77] bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E8E0D5]">
                All submitted leave requests have been reviewed. Excellent!
              </div>
            ) : (
              pendingLeaves.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] space-y-3 transition hover:border-[#D8CEBE]"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#2C2523]">
                          {req.employeeName}
                        </span>
                        <span className="text-[10px] text-[#8C7E77] font-mono">
                          ({req.position})
                        </span>
                      </div>
                      <p className="text-xs text-[#786C65] mt-0.5">
                        <strong className="text-[#B85032]">{req.leaveType} Leave</strong> •{' '}
                        <span>
                          {req.startDate} to {req.endDate} ({req.totalDays} days)
                        </span>
                      </p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800">
                      Filed {req.appliedDate}
                    </span>
                  </div>

                  <p className="text-xs text-[#5C504A] bg-white p-2.5 rounded-xl border border-[#E8E0D5]">
                    <strong className="text-[#2C2523]">Reason:</strong> "{req.reason}"
                  </p>

                  {/* 1-Click Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleQuickReview(req.id, 'Rejected')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Deny</span>
                    </button>
                    <button
                      onClick={() => handleQuickReview(req.id, 'Approved')}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#3D6F4B] hover:bg-[#2D583B] shadow-xs transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Agree & Approve</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Team Task Progress & Shift Log */}
        <div className="space-y-6">
          {/* Team Tasks Status Summary */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
              <h2 className="text-sm font-serif font-bold text-[#2C2523]">
                Task Distribution
              </h2>
              <button
                onClick={() => onNavigateToTab('tasks')}
                className="text-xs font-semibold text-[#B85032] hover:underline"
              >
                Task Board
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#6B5E57]">Completed</span>
                  <span className="font-semibold text-emerald-800">{completedTasks} tasks</span>
                </div>
                <div className="w-full bg-[#EAE3D6] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#3D6F4B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#6B5E57]">In Progress</span>
                  <span className="font-semibold text-blue-800">{inProgressTasks} tasks</span>
                </div>
                <div className="w-full bg-[#EAE3D6] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#3B82F6] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#6B5E57]">Pending Assignment</span>
                  <span className="font-semibold text-amber-800">{pendingTasks} tasks</span>
                </div>
                <div className="w-full bg-[#EAE3D6] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D97706] h-full rounded-full transition-all duration-500"
                    style={{ width: `${(pendingTasks / totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenCreateTask}
                className="w-full py-2.5 rounded-xl border border-[#D8CEBE] hover:border-[#B85032] text-xs font-semibold text-[#4B413C] hover:text-[#B85032] bg-[#FAF7F2] transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Store Duty</span>
              </button>
            </div>
          </div>

          {/* Today's Floor Attendance Snippet */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
              <h2 className="text-sm font-serif font-bold text-[#2C2523]">
                Floor Shift Attendance
              </h2>
              <button
                onClick={() => onNavigateToTab('attendance')}
                className="text-xs font-semibold text-[#B85032] hover:underline"
              >
                Full Log
              </button>
            </div>

            <div className="space-y-2">
              {todayAttendance.length === 0 ? (
                <p className="text-xs text-[#8C7E77] py-2 text-center">
                  No attendance logged yet for today.
                </p>
              ) : (
                todayAttendance.slice(0, 4).map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs"
                  >
                    <div>
                      <span className="font-medium text-[#2C2523] block">
                        {rec.employeeName}
                      </span>
                      <span className="text-[10px] text-[#8C7E77]">In: {rec.timeIn}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        rec.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
