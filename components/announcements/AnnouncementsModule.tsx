'use client';

import React, { useState } from 'react';
import { usePortal } from '@/lib/PortalContext';
import { Announcement, PollOption } from '@/lib/types';
import {
  Megaphone,
  Vote,
  MessageSquare,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  X,
  Send,
  Eye,
  Award,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const AnnouncementsModule: React.FC<{
  openedAnnouncement?: Announcement | null;
  onCloseAnnouncement?: () => void;
}> = ({ openedAnnouncement: externalOpened, onCloseAnnouncement: externalClose }) => {
  const { currentUser, announcements, addAnnouncement, votePoll } = usePortal();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(
    externalOpened || null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const [messageSentToast, setMessageSentToast] = useState(false);

  // Direct Message State
  const [directMessageSubject, setDirectMessageSubject] = useState('');
  const [directMessageBody, setDirectMessageBody] = useState('');

  // Admin New Announcement Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Announcement['category']>('Store Operations');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [includePoll, setIncludePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOption1, setPollOption1] = useState('');
  const [pollOption2, setPollOption2] = useState('');
  const [pollOption3, setPollOption3] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  // Categories
  const categories = [
    'All',
    'Store Operations',
    'Department Meetings',
    'Employee of the Month',
    'New Arrivals',
    'Notice',
  ];

  const filteredAnnouncements =
    selectedCategory === 'All'
      ? announcements
      : announcements.filter((a) => a.category === selectedCategory);

  const handleVote = (announcementId: string, optionId: string) => {
    votePoll(announcementId, optionId);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const pollData = includePoll && pollQuestion.trim()
      ? {
          question: pollQuestion,
          options: [
            { id: 'opt-1', text: pollOption1, votes: 0 },
            { id: 'opt-2', text: pollOption2, votes: 0 },
            ...(pollOption3.trim() ? [{ id: 'opt-3', text: pollOption3, votes: 0 }] : []),
          ],
          voters: [],
        }
      : undefined;

    addAnnouncement({
      title: newTitle,
      category: newCategory,
      author: currentUser?.fullName || 'Carlos Mendoza',
      authorRole: currentUser?.position || 'Store Manager',
      date: new Date().toISOString().split('T')[0],
      summary: newSummary,
      content: newContent,
      poll: pollData,
    });

    // Reset
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setIncludePoll(false);
    setPollQuestion('');
    setPollOption1('');
    setPollOption2('');
    setPollOption3('');
    setShowCreateModal(false);
  };

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDirectMessageModal(false);
    setDirectMessageSubject('');
    setDirectMessageBody('');
    setMessageSentToast(true);
    setTimeout(() => setMessageSentToast(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {messageSentToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Direct store memo dispatched to Store Management. Thank you for your feedback!</span>
        </div>
      )}

      {/* Read More Detail Modal */}
      {(activeAnnouncement || externalOpened) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8E0D5] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#2C2523] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B85032] flex items-center justify-center text-white">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8CEBE]">
                    {(activeAnnouncement || externalOpened)?.category}
                  </span>
                  <h3 className="text-base font-serif font-bold text-white">
                    {(activeAnnouncement || externalOpened)?.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveAnnouncement(null);
                  if (externalClose) externalClose();
                }}
                className="text-[#A89D96] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#4B413C]">
              <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-3 text-[11px] text-[#786C65]">
                <span className="flex items-center gap-1.5 font-medium text-[#2C2523]">
                  <User className="w-3.5 h-3.5 text-[#B85032]" />
                  <span>
                    {(activeAnnouncement || externalOpened)?.author} (
                    {(activeAnnouncement || externalOpened)?.authorRole})
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[#8C7E77]">
                  <Calendar className="w-3.5 h-3.5 text-[#C27A19]" />
                  <span>{(activeAnnouncement || externalOpened)?.date}</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#E8E0D5] text-[#2C2523] font-medium leading-relaxed">
                {(activeAnnouncement || externalOpened)?.summary}
              </div>

              <div className="prose prose-sm text-[#2C2523] leading-relaxed whitespace-pre-line font-sans text-xs sm:text-sm">
                {(activeAnnouncement || externalOpened)?.content}
              </div>

              {/* Poll if attached inside modal */}
              {(activeAnnouncement || externalOpened)?.poll && (
                <div className="p-4 rounded-2xl bg-white border border-[#E8E0D5] space-y-3">
                  <div className="flex items-center gap-2">
                    <Vote className="w-4 h-4 text-[#B85032]" />
                    <span className="font-serif font-bold text-sm text-[#2C2523]">
                      {(activeAnnouncement || externalOpened)?.poll?.question}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(activeAnnouncement || externalOpened)?.poll?.options.map((opt) => {
                      const totalVotes =
                        (activeAnnouncement || externalOpened)?.poll?.options.reduce(
                          (acc, o) => acc + o.votes,
                          0
                        ) || 1;
                      const pct = Math.round((opt.votes / totalVotes) * 100);
                      const hasVoted = Boolean(
                        currentUser &&
                          (activeAnnouncement || externalOpened)?.poll?.voters.includes(
                            currentUser.id
                          )
                      );

                      return (
                        <button
                          key={opt.id}
                          disabled={!!hasVoted}
                          onClick={() =>
                            handleVote((activeAnnouncement || externalOpened)!.id, opt.id)
                          }
                          className="w-full text-left p-3 rounded-xl border border-[#D8CEBE] hover:border-[#B85032] transition relative overflow-hidden bg-[#FAF7F2]"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-[#FAEBE5] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                          <div className="relative flex items-center justify-between text-xs">
                            <span className="font-medium text-[#2C2523]">{opt.text}</span>
                            <span className="font-bold text-[#B85032]">
                              {opt.votes} votes ({pct}%)
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E8E0D5] bg-[#F7F3EB] flex justify-end gap-3">
              <button
                onClick={() => {
                  setActiveAnnouncement(null);
                  if (externalClose) externalClose();
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2C2523] text-white hover:bg-[#3D3532] transition"
              >
                I have read & acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Message / Store Memo Modal */}
      {showDirectMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8E0D5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#2C2523] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D6F4B] flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">Send Direct Store Memo</h3>
                  <p className="text-xs text-[#D8CEBE]">Confidential inquiry to Management</p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectMessageModal(false)}
                className="text-[#A89D96] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendDirectMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={directMessageSubject}
                  onChange={(e) => setDirectMessageSubject(e.target.value)}
                  placeholder="e.g., Question regarding holiday shift rotation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#3D6F4B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Message Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={directMessageBody}
                  onChange={(e) => setDirectMessageBody(e.target.value)}
                  placeholder="Type your message, suggestion or inquiry for management..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#3D6F4B] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDirectMessageModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#6B5E57] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#3D6F4B] hover:bg-[#2D583B] text-white shadow-sm flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Memo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8E0D5] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#2C2523] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B85032] flex items-center justify-center text-white">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">Publish Store Announcement</h3>
                  <p className="text-xs text-[#D8CEBE]">Post memos, updates or team polls</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#A89D96] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., New Curated Ceramics Arrival Briefing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                >
                  <option value="Store Operations">Store Operations</option>
                  <option value="Department Meetings">Department Meetings</option>
                  <option value="Employee of the Month">Employee of the Month</option>
                  <option value="New Arrivals">New Arrivals</option>
                  <option value="Notice">Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Brief Summary
                </label>
                <input
                  type="text"
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="One sentence summary for the feed ticker..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Full Announcement Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Full memo text and details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] bg-white focus:ring-2 focus:ring-[#B85032] outline-none"
                />
              </div>

              {/* Attach Interactive Poll */}
              <div className="pt-2 border-t border-[#E8E0D5]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2C2523]">
                  <input
                    type="checkbox"
                    checked={includePoll}
                    onChange={(e) => setIncludePoll(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B85032] accent-[#B85032]"
                  />
                  <span>Attach an Interactive Staff Poll</span>
                </label>

                {includePoll && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-white border border-[#D8CEBE] space-y-3 text-xs animate-in fade-in">
                    <div>
                      <label className="block font-medium text-[#4B413C] mb-1">Poll Question</label>
                      <input
                        type="text"
                        required={includePoll}
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        placeholder="e.g., Staff Choice: Next Month's Featured Artisan Theme?"
                        className="w-full px-3 py-2 rounded-xl border border-[#D8CEBE] text-xs outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required={includePoll}
                        value={pollOption1}
                        onChange={(e) => setPollOption1(e.target.value)}
                        placeholder="Option 1"
                        className="px-3 py-2 rounded-xl border border-[#D8CEBE] text-xs outline-none"
                      />
                      <input
                        type="text"
                        required={includePoll}
                        value={pollOption2}
                        onChange={(e) => setPollOption2(e.target.value)}
                        placeholder="Option 2"
                        className="px-3 py-2 rounded-xl border border-[#D8CEBE] text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={pollOption3}
                        onChange={(e) => setPollOption3(e.target.value)}
                        placeholder="Option 3 (Optional)"
                        className="px-3 py-2 rounded-xl border border-[#D8CEBE] text-xs outline-none sm:col-span-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#6B5E57] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#B85032] hover:bg-[#A34327] text-white shadow-sm"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E0D5]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2C2523] tracking-tight">
            Announcements & Store Feed
          </h1>
          <p className="text-xs text-[#786C65]">
            ISTOREYA company memos, department meetings, community polls, and celebrations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setShowDirectMessageModal(true)}
            className="px-4 py-2.5 rounded-xl border border-[#D8CEBE] hover:border-[#3D6F4B] bg-white text-xs font-semibold text-[#4B413C] hover:text-[#3D6F4B] shadow-xs flex items-center gap-2 transition"
          >
            <MessageSquare className="w-4 h-4 text-[#3D6F4B]" />
            <span>Direct Memo</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#B85032] hover:bg-[#A34327] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#2C2523] text-white shadow-xs font-semibold'
                  : 'bg-white text-[#6B5E57] hover:bg-[#F0EAE1] hover:text-[#2C2523] border border-[#E8E0D5]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAnnouncements.map((ann) => {
          const isPoll = Boolean(ann.poll);

          return (
            <div
              key={ann.id}
              className="bg-white rounded-3xl p-6 border border-[#E0D7CB] hover:border-[#B85032] transition shadow-xs flex flex-col justify-between gap-5 group"
            >
              <div className="space-y-3">
                {/* Badge & Date */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      ann.category === 'Employee of the Month'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ann.category === 'Department Meetings'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#FAEBE5] text-[#B85032]'
                    }`}
                  >
                    {ann.category}
                  </span>

                  <span className="text-[11px] text-[#8C7E77] flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#C27A19]" />
                    {ann.date}
                  </span>
                </div>

                {/* Title & Summary */}
                <div>
                  <h3 className="text-base font-serif font-bold text-[#2C2523] group-hover:text-[#B85032] transition">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-[#6B5E57] mt-1.5 leading-relaxed">
                    {ann.summary}
                  </p>
                </div>

                {/* Interactive Poll Preview Widget */}
                {ann.poll && (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Vote className="w-4 h-4 text-[#B85032]" />
                        <span className="font-serif font-bold text-xs text-[#2C2523]">
                          {ann.poll.question}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#8C7E77]">
                        {ann.poll.options.reduce((acc, o) => acc + o.votes, 0)} Votes
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ann.poll.options.map((opt) => {
                        const totalVotes =
                          ann.poll!.options.reduce((acc, o) => acc + o.votes, 0) || 1;
                        const pct = Math.round((opt.votes / totalVotes) * 100);
                        const hasVoted = Boolean(
                          currentUser && ann.poll!.voters.includes(currentUser.id)
                        );

                        return (
                          <button
                            key={opt.id}
                            disabled={!!hasVoted}
                            onClick={() => handleVote(ann.id, opt.id)}
                            className="w-full text-left p-2.5 rounded-xl border border-[#D8CEBE] hover:border-[#B85032] transition relative overflow-hidden bg-white"
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-[#FAEBE5] transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative flex items-center justify-between text-xs">
                              <span className="font-medium text-[#2C2523]">{opt.text}</span>
                              <span className="font-bold text-[#B85032]">
                                {opt.votes} ({pct}%)
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Author & Read More Button */}
              <div className="pt-3 border-t border-[#F0EAE1] flex items-center justify-between">
                <span className="text-[11px] text-[#786C65]">
                  By <strong className="text-[#2C2523]">{ann.author}</strong> ({ann.authorRole})
                </span>

                <button
                  onClick={() => setActiveAnnouncement(ann)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#B85032] text-[#2C2523] hover:text-white border border-[#D8CEBE] hover:border-[#B85032] text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read Story</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
