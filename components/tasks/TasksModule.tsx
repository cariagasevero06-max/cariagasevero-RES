'use client';

import React, { useState } from 'react';
import { usePortal } from '@/lib/PortalContext';
import { TaskPriority, TaskStatus, Task } from '@/lib/types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface Props {
  initialCreateModalOpen?: boolean;
}

export const TasksModule: React.FC<Props> = ({ initialCreateModalOpen = false }) => {
  const { currentUser, tasks, users, addTask, updateTaskStatus } = usePortal();
  const [activeFilter, setActiveFilter] = useState<'All' | TaskStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(initialCreateModalOpen);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState(users[0]?.id || 'EMP-2024-001');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newDueDate, setNewDueDate] = useState('2026-10-18');
  const [newCategory, setNewCategory] = useState('Store Operations');

  const isAdmin = currentUser?.role === 'admin';

  // Base list depending on role
  const roleFilteredTasks = isAdmin
    ? tasks
    : tasks.filter((t) => t.assignedToId === currentUser?.id);

  // Status Filter
  const statusFiltered =
    activeFilter === 'All'
      ? roleFilteredTasks
      : roleFilteredTasks.filter((t) => t.status === activeFilter);

  // Search & Priority Filter
  const finalTasks = statusFiltered.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === 'All' ? true : t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = users.find((u) => u.id === newAssigneeId);
    addTask({
      title: newTitle,
      description: newDescription,
      assignedToId: newAssigneeId,
      assignedToName: assignee?.fullName || 'Assigned Staff',
      assignedBy: currentUser?.fullName || 'Carlos Mendoza',
      priority: newPriority,
      status: 'Pending',
      dueDate: newDueDate,
      category: newCategory,
    });

    // Reset
    setNewTitle('');
    setNewDescription('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Create Task Modal (for Admins) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8E0D5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#2C2523] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B85032] flex items-center justify-center text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">Assign New Store Task</h3>
                  <p className="text-xs text-[#D8CEBE]">Store Operations Duty Assignment</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#A89D96] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Autumn Collection Display Curation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Description & Instructions
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Specific instructions for the store associate..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                    Assignee Employee
                  </label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                    Store Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                  >
                    <option value="Display & Visuals">Display & Visuals</option>
                    <option value="Inventory">Inventory</option>
                    <option value="POS & Cashiering">POS & Cashiering</option>
                    <option value="Customer Experience">Customer Experience</option>
                    <option value="Store Safety">Store Safety</option>
                    <option value="Store Operations">Store Operations</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#6B5E57] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#B85032] hover:bg-[#A34327] text-white shadow-sm"
                >
                  Assign Duty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E0D5]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2C2523] tracking-tight">
            {isAdmin ? 'Store Task Management & Assignment' : 'My Daily Tasks & Operations'}
          </h1>
          <p className="text-xs text-[#786C65]">
            {isAdmin
              ? 'Assign, track and verify daily boutique responsibilities across sales associates'
              : 'Review assigned duties, update status states, and track delivery deadlines'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#B85032] hover:bg-[#A34327] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Create & Assign Task</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E0D5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs: All Tasks, Pending, In Progress, Completed */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] overflow-x-auto">
            {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((tab) => {
              const count =
                tab === 'All'
                  ? roleFilteredTasks.length
                  : roleFilteredTasks.filter((t) => t.status === tab).length;
              const isActive = activeFilter === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#2C2523] text-white shadow-xs'
                      : 'text-[#6B5E57] hover:text-[#2C2523] hover:bg-[#EFE8DC]'
                  }`}
                >
                  <span>{tab === 'All' ? 'All Tasks' : tab}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#4B413C] text-white' : 'bg-[#EAE3D6] text-[#6B5E57]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8C7E77] font-medium hidden sm:inline">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#D8CEBE] text-xs text-[#2C2523] bg-white outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, description, category, or staff assignee..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8CEBE] text-xs text-[#2C2523] placeholder-[#A89D96] bg-[#FAF7F2] focus:bg-white focus:ring-2 focus:ring-[#B85032] outline-none transition"
          />
          <Search className="w-4 h-4 text-[#8C7E77] absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Task List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {finalTasks.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-dashed border-[#D8CEBE] text-[#8C7E77] space-y-2">
            <CheckSquare className="w-8 h-8 text-[#C2B5A3] mx-auto" />
            <p className="text-xs font-semibold text-[#2C2523]">No tasks found for current filter</p>
            <p className="text-[11px]">Try selecting another tab or clear your search query.</p>
          </div>
        ) : (
          finalTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isInProgress = task.status === 'In Progress';
            const isPending = task.status === 'Pending';

            return (
              <div
                key={task.id}
                className={`bg-white rounded-3xl p-5 border transition shadow-xs flex flex-col justify-between gap-4 ${
                  isCompleted
                    ? 'border-[#E8E0D5] bg-[#FAF7F2]/50'
                    : 'border-[#E0D7CB] hover:border-[#B85032]'
                }`}
              >
                <div className="space-y-3">
                  {/* Category & Priority Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] bg-[#F0EAE1] px-2.5 py-0.5 rounded-full">
                      {task.category}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        task.priority === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : task.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        isCompleted ? 'line-through text-[#8C7E77]' : 'text-[#2C2523]'
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-xs text-[#6B5E57] mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Notes if any */}
                  {task.notes && (
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] text-[11px] text-[#786C65]">
                      <span className="font-semibold text-[#2C2523] block mb-0.5">Note:</span>
                      {task.notes}
                    </div>
                  )}
                </div>

                {/* Footer with Assignee, Due Date & Status Controls */}
                <div className="pt-3 border-t border-[#F0EAE1] space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#786C65]">
                    <span className="flex items-center gap-1.5 font-medium text-[#4B413C]">
                      <User className="w-3.5 h-3.5 text-[#B85032]" />
                      <span>{task.assignedToName}</span>
                    </span>

                    <span className="flex items-center gap-1 text-[11px] font-mono text-[#8C7E77]">
                      <Calendar className="w-3.5 h-3.5 text-[#C27A19]" />
                      <span>Due: {task.dueDate}</span>
                    </span>
                  </div>

                  {/* Interactive Status Changer Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] uppercase font-bold text-[#8C7E77] tracking-wider">
                      Status:
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'Pending')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                          isPending
                            ? 'bg-[#EAE3D6] text-[#4B413C] font-bold shadow-xs'
                            : 'text-[#8C7E77] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        Pending
                      </button>

                      <button
                        onClick={() => updateTaskStatus(task.id, 'In Progress')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                          isInProgress
                            ? 'bg-blue-100 text-blue-800 font-bold shadow-xs'
                            : 'text-[#8C7E77] hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        In Progress
                      </button>

                      <button
                        onClick={() => updateTaskStatus(task.id, 'Completed')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 font-bold shadow-xs'
                            : 'text-[#8C7E77] hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
