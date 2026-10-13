'use client';

import React, { useState, useEffect } from 'react';
import { usePortal } from '@/lib/PortalContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CheckSquare,
  Megaphone,
  Plane,
  ArrowRight,
  Sparkles,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { Announcement } from '@/lib/types';

interface Props {
  onNavigateToTab: (tab: 'tasks' | 'announcements' | 'attendance' | 'profile') => void;
  onOpenAnnouncement: (ann: Announcement) => void;
}

export const EmployeeDashboard: React.FC<Props> = ({
  onNavigateToTab,
  onOpenAnnouncement,
}) => {
  const { currentUser, tasks, attendance, leaves, announcements, timeIn, timeOut, updateTaskStatus } = usePortal();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [todayStr, setTodayStr] = useState<string>('');
  const [punchMessage, setPunchMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

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

  // Filter items for current employee
  const myTasks = tasks.filter((t) => t.assignedToId === currentUser.id);
  const pendingTasks = myTasks.filter((t) => t.status !== 'Completed');
  const completedTasks = myTasks.filter((t) => t.status === 'Completed');

  const todayRecord = attendance.find(
    (a) => a.employeeId === currentUser.id && a.date === (todayStr || '2026-10-12')
  );
  const isClockedIn = Boolean(todayRecord && !todayRecord.timeOut);

  // Attendance metrics calculation
  const myAttendance = attendance.filter((a) => a.employeeId === currentUser.id);
  const totalDays = myAttendance.length || 1;
  const presentOnTime = myAttendance.filter((a) => a.status === 'Present').length;
  const attendancePercentage = Math.round((presentOnTime / totalDays) * 100);

  // Leaves
  const myLeaves = leaves.filter((l) => l.employeeId === currentUser.id);
  const latestLeave = myLeaves[0];

  const handlePunchIn = () => {
    const res = timeIn();
    setPunchMessage({ text: res.message, type: res.success ? 'success' : 'info' });
    setTimeout(() => setPunchMessage(null), 4000);
  };

  const handlePunchOut = () => {
    const res = timeOut();
    setPunchMessage({ text: res.message, type: res.success ? 'success' : 'info' });
    setTimeout(() => setPunchMessage(null), 4000);
  };

  const toggleTaskStatus = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    updateTaskStatus(taskId, nextStatus);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE8DC] text-[#4B413C] text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#B85032]" />
              <span>Good day, Storyteller</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2523] tracking-tight">
              Welcome back, {currentUser.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-[#786C65] flex items-center gap-2">
              <span>{currentUser.position}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B85032]" /> Greenbelt 5 Flagship
              </span>
            </p>
          </div>

          {/* Real-time Clock & Punch Widget */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E0D5] shadow-sm flex flex-col items-center md:items-end gap-3 min-w-[260px]">
            <div className="text-center md:text-right">
              <span className="text-[11px] font-medium text-[#8C7E77] block">{currentDate}</span>
              <span className="font-mono text-2xl font-bold text-[#2C2523] tracking-wider">
                {currentTime}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full">
              {!isClockedIn ? (
                <button
                  onClick={handlePunchIn}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#3D6F4B] hover:bg-[#2D583B] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock In Shift</span>
                </button>
              ) : (
                <button
                  onClick={handlePunchOut}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#B85032] hover:bg-[#A34327] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock Out Shift</span>
                </button>
              )}
            </div>

            {/* Shift Ticker status */}
            <div className="text-[11px] text-[#786C65] flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>
                {todayRecord
                  ? todayRecord.timeOut
                    ? `Clocked Out at ${todayRecord.timeOut} (${todayRecord.totalHours} hrs)`
                    : `Clocked In at ${todayRecord.timeIn} (${todayRecord.status})`
                  : 'Not clocked in yet today (Shift: 9:00 AM)'}
              </span>
            </div>
          </div>
        </div>

        {punchMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{punchMessage.text}</span>
          </div>
        )}
      </div>

      {/* Quick Status Tickers & Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#8C7E77] uppercase tracking-wider block">
              On-Time Attendance
            </span>
            <div className="text-2xl font-serif font-bold text-[#2C2523]">
              {attendancePercentage}%
            </div>
            <span className="text-[11px] text-[#3D6F4B] flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Exemplary Record
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EBF3ED] text-[#3D6F4B] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div
          onClick={() => onNavigateToTab('tasks')}
          className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#B85032] transition group"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#8C7E77] uppercase tracking-wider block">
              Today's Tasks
            </span>
            <div className="text-2xl font-serif font-bold text-[#2C2523]">
              {pendingTasks.length}{' '}
              <span className="text-xs font-sans font-normal text-[#8C7E77]">
                / {myTasks.length} pending
              </span>
            </div>
            <span className="text-[11px] text-[#B85032] group-hover:underline flex items-center gap-1">
              View task board <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAEBE5] text-[#B85032] flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Leave Balance */}
        <div
          onClick={() => onNavigateToTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#C27A19] transition group"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#8C7E77] uppercase tracking-wider block">
              Leave Credits
            </span>
            <div className="text-2xl font-serif font-bold text-[#2C2523]">
              {currentUser.vacationLeaveBalance}{' '}
              <span className="text-xs font-sans font-normal text-[#8C7E77]">
                Vacation / {currentUser.sickLeaveBalance} Sick
              </span>
            </div>
            <span className="text-[11px] text-[#C27A19] group-hover:underline flex items-center gap-1">
              Apply or track leave <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FCF4E3] text-[#C27A19] flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
        </div>

        {/* Current Shift Status */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#8C7E77] uppercase tracking-wider block">
              Today's Shift
            </span>
            <div className="text-lg font-serif font-bold text-[#2C2523]">
              09:00 AM – 06:00 PM
            </div>
            <span className="text-[11px] text-[#786C65] block">
              Section: Ceramics & Books
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F0EAE1] text-[#786C65] flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Tasks Checklist + Announcements & Leave Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks Checklist (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <div>
              <h2 className="text-base font-serif font-bold text-[#2C2523]">
                Today's Task Checklist
              </h2>
              <p className="text-xs text-[#786C65]">
                Mark items as completed as you finish your store routines
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('tasks')}
              className="text-xs font-semibold text-[#B85032] hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {myTasks.length === 0 ? (
              <p className="text-xs text-[#8C7E77] py-4 text-center">
                No active tasks assigned for today. Great job!
              </p>
            ) : (
              myTasks.slice(0, 5).map((task) => {
                const isDone = task.status === 'Completed';
                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition ${
                      isDone
                        ? 'bg-[#FAF7F2] border-[#E8E0D5] opacity-75'
                        : 'bg-white border-[#E0D7CB] hover:border-[#B85032]'
                    }`}
                  >
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="mt-0.5 text-[#B85032] transition"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-lg border-2 border-[#C2B5A3] hover:border-[#B85032] transition" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold ${
                            isDone ? 'line-through text-[#8C7E77]' : 'text-[#2C2523]'
                          }`}
                        >
                          {task.title}
                        </span>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            task.priority === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <span className="text-[10px] text-[#8C7E77] font-mono">
                          Due: {task.dueDate}
                        </span>
                      </div>

                      <p className="text-xs text-[#786C65] mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700'
                          : task.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-[#F0EAE1] text-[#6B5E57]'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Announcements & Leave Request Status */}
        <div className="space-y-6">
          {/* Latest Announcements Summary */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#B85032]" />
                <h2 className="text-sm font-serif font-bold text-[#2C2523]">
                  Store Notice
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('announcements')}
                className="text-xs font-semibold text-[#B85032] hover:underline"
              >
                Feed
              </button>
            </div>

            {announcements.slice(0, 2).map((ann) => (
              <div
                key={ann.id}
                onClick={() => onOpenAnnouncement(ann)}
                className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] hover:border-[#B85032] transition cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#B85032] bg-[#FAEBE5] px-2 py-0.5 rounded-full">
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-[#8C7E77]">{ann.date}</span>
                </div>
                <h4 className="text-xs font-semibold text-[#2C2523] line-clamp-1">
                  {ann.title}
                </h4>
                <p className="text-[11px] text-[#786C65] line-clamp-2">
                  {ann.summary}
                </p>
              </div>
            ))}
          </div>

          {/* Leave Request Status Widget */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#3D6F4B]" />
                <h2 className="text-sm font-serif font-bold text-[#2C2523]">
                  Leave Request Status
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('attendance')}
                className="text-xs font-semibold text-[#B85032] hover:underline"
              >
                Apply
              </button>
            </div>

            {latestLeave ? (
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2C2523]">
                    {latestLeave.leaveType} Leave ({latestLeave.totalDays} days)
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      latestLeave.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : latestLeave.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {latestLeave.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#786C65] line-clamp-1">
                  Dates: {latestLeave.startDate} to {latestLeave.endDate}
                </p>
                {latestLeave.managerRemarks && (
                  <p className="text-[10px] text-[#8C7E77] italic bg-white p-2 rounded-lg border border-[#E8E0D5]">
                    Note: "{latestLeave.managerRemarks}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#8C7E77] text-center py-2">
                No recent leave requests filed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
