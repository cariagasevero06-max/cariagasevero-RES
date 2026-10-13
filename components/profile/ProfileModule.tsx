'use client';

import React, { useState } from 'react';
import { usePortal } from '@/lib/PortalContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  Edit3,
  CheckCircle2,
  X,
  Users,
  AlertCircle,
  Building2,
  HeartHandshake,
} from 'lucide-react';

export const ProfileModule: React.FC = () => {
  const { currentUser, users, updateUserProfile } = usePortal();
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || 'EMP-2024-001');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const targetUser = users.find((u) => u.id === selectedUserId) || currentUser;

  // Edit form states
  const [fullName, setFullName] = useState(targetUser?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(targetUser?.phoneNumber || '');
  const [address, setAddress] = useState(targetUser?.address || '');
  const [dateOfBirth, setDateOfBirth] = useState(targetUser?.dateOfBirth || '');
  const [gender, setGender] = useState(targetUser?.gender || '');
  const [emergencyName, setEmergencyName] = useState(targetUser?.emergencyContact.name || '');
  const [emergencyRel, setEmergencyRel] = useState(targetUser?.emergencyContact.relationship || '');
  const [emergencyPhone, setEmergencyPhone] = useState(targetUser?.emergencyContact.phoneNumber || '');
  const [emergencyAddr, setEmergencyAddr] = useState(targetUser?.emergencyContact.address || '');

  // For Admin editing employee status/department
  const [department, setDepartment] = useState(targetUser?.department || '');
  const [position, setPosition] = useState(targetUser?.position || '');
  const [status, setStatus] = useState(targetUser?.status || 'Active');

  if (!currentUser || !targetUser) return null;

  const startEditing = () => {
    setFullName(targetUser.fullName);
    setPhoneNumber(targetUser.phoneNumber);
    setAddress(targetUser.address);
    setDateOfBirth(targetUser.dateOfBirth);
    setGender(targetUser.gender);
    setEmergencyName(targetUser.emergencyContact.name);
    setEmergencyRel(targetUser.emergencyContact.relationship);
    setEmergencyPhone(targetUser.emergencyContact.phoneNumber);
    setEmergencyAddr(targetUser.emergencyContact.address);
    setDepartment(targetUser.department);
    setPosition(targetUser.position);
    setStatus(targetUser.status);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(targetUser.id, {
      fullName,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      department,
      position,
      status,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRel,
        phoneNumber: emergencyPhone,
        address: emergencyAddr,
      },
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E0D5]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2C2523] tracking-tight">
            {isAdmin && selectedUserId !== currentUser.id
              ? `Employee Record: ${targetUser.fullName}`
              : 'My Profile & Employment Details'}
          </h1>
          <p className="text-xs text-[#786C65]">
            ISTOREYA Human Resources & Associate Identification Information
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={startEditing}
            className="px-4 py-2.5 rounded-xl bg-[#B85032] hover:bg-[#A34327] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition self-start"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes successfully saved to the ISTOREYA central database!</span>
        </div>
      )}

      {/* Admin Quick Employee Selector */}
      {isAdmin && (
        <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4B413C]">
            <Users className="w-4 h-4 text-[#B85032]" />
            <span>Staff Directory (Switch Employee to Inspect or Edit):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setSelectedUserId(u.id);
                  setIsEditing(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
                  selectedUserId === u.id
                    ? 'bg-[#2C2523] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#4B413C] hover:bg-[#EFE8DC] border border-[#E8E0D5]'
                }`}
              >
                <img
                  src={u.avatarUrl}
                  alt={u.fullName}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{u.fullName}</span>
                <span className="text-[10px] opacity-75 font-mono">({u.role})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isEditing ? (
        /* Edit Profile Form */
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
            <h2 className="text-base font-serif font-bold text-[#2C2523]">
              Modify Employee Information
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 rounded-lg text-[#8C7E77] hover:text-[#2C2523]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                Residential Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none"
              />
            </div>

            {/* Admin only overrides */}
            {isAdmin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                    Department (Admin Edit)
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                    Position / Title (Admin Edit)
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                    Employment Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Emergency Contact Fields */}
          <div className="pt-4 border-t border-[#F0EAE1]">
            <h3 className="text-sm font-serif font-bold text-[#2C2523] mb-4 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#B85032]" />
              <span>Emergency Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  required
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  required
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B413C] uppercase tracking-wider mb-1">
                  Contact Address
                </label>
                <input
                  type="text"
                  required
                  value={emergencyAddr}
                  onChange={(e) => setEmergencyAddr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8CEBE] text-sm text-[#2C2523] focus:ring-2 focus:ring-[#B85032] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#6B5E57] hover:bg-[#FAF7F2] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#B85032] hover:bg-[#A34327] text-white shadow-sm transition"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      ) : (
        /* Profile Display Cards */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Avatar & Identity Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E0D5] shadow-xs space-y-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img
                src={targetUser.avatarUrl}
                alt={targetUser.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D8CEBE] shadow-sm"
              />
              <div className="space-y-1">
                <h2 className="text-lg font-serif font-bold text-[#2C2523]">
                  {targetUser.fullName}
                </h2>
                <p className="text-xs text-[#786C65]">{targetUser.position}</p>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {targetUser.status}
                  </span>
                  <span className="text-[10px] font-mono text-[#8C7E77]">
                    {targetUser.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F0EAE1] space-y-3 text-xs">
              <div className="flex items-center gap-3 text-[#4B413C]">
                <Mail className="w-4 h-4 text-[#B85032] shrink-0" />
                <span className="truncate">{targetUser.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[#4B413C]">
                <Phone className="w-4 h-4 text-[#B85032] shrink-0" />
                <span>{targetUser.phoneNumber}</span>
              </div>
              <div className="flex items-start gap-3 text-[#4B413C]">
                <MapPin className="w-4 h-4 text-[#B85032] shrink-0 mt-0.5" />
                <span>{targetUser.address}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F0EAE1] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E77] block">
                Store Department
              </span>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] text-xs text-[#2C2523] font-medium">
                {targetUser.department}
              </div>
            </div>
          </div>

          {/* Right: Detailed Employment & Emergency Info (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Employment Record */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] shadow-xs space-y-5">
              <h3 className="text-base font-serif font-bold text-[#2C2523] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#B85032]" />
                <span>Employment & Personal Records</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5]">
                  <span className="text-[10px] text-[#8C7E77] uppercase font-bold tracking-wider block mb-0.5">
                    Date Hired
                  </span>
                  <span className="text-sm font-semibold text-[#2C2523]">
                    {targetUser.dateHired}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5]">
                  <span className="text-[10px] text-[#8C7E77] uppercase font-bold tracking-wider block mb-0.5">
                    Date of Birth
                  </span>
                  <span className="text-sm font-semibold text-[#2C2523]">
                    {targetUser.dateOfBirth}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5]">
                  <span className="text-[10px] text-[#8C7E77] uppercase font-bold tracking-wider block mb-0.5">
                    Gender Identity
                  </span>
                  <span className="text-sm font-semibold text-[#2C2523]">
                    {targetUser.gender}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5]">
                  <span className="text-[10px] text-[#8C7E77] uppercase font-bold tracking-wider block mb-0.5">
                    Role Clearance
                  </span>
                  <span className="text-sm font-semibold text-[#2C2523] uppercase">
                    {targetUser.role} clearance
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-[#2C2523] flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#3D6F4B]" />
                  <span>Primary Emergency Contact</span>
                </h3>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Verified Contact
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5]">
                  <span className="text-[10px] text-[#8C7E77] uppercase font-bold tracking-wider block mb-0.5">
                    Contact Name
                  </span>
                  <span className="text-sm font-semibold text-[#2C2523]">
                    {targetUser.emergencyContact.name}
                  </span>
                  <span className="text-[11px] text-[#786C65] block mt-0.5">
                    Relationship: {targetUser.emergencyContact.relationship}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5]">
                  <span className="text-[10px] text-[#8C7E77] uppercase font-bold tracking-wider block mb-0.5">
                    Emergency Phone
                  </span>
                  <span className="text-sm font-semibold text-[#2C2523]">
                    {targetUser.emergencyContact.phoneNumber}
                  </span>
                  <span className="text-[11px] text-[#786C65] block mt-0.5">
                    24/7 Priority Line
                  </span>
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8E0D5]">
                  <span className="text-[10px] text-[#8C7E77] uppercase font-bold tracking-wider block mb-0.5">
                    Contact Address
                  </span>
                  <span className="text-sm text-[#2C2523]">
                    {targetUser.emergencyContact.address}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
