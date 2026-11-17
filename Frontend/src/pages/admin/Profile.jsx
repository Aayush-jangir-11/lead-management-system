import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, User, Mail, Phone, Building2,
  Calendar, Key, Lock, Bell, CheckCircle2, Shield,
  Smartphone, Camera, Save, RefreshCw, Eye, EyeOff,
  Briefcase, Users, Clock, Check, Copy, AlertCircle,
  ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';
import { useUpdate, useToast } from '../../hooks';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingWork, setIsEditingWork] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // TanStack Mutation: Change Password 
  const changePasswordMutation = useUpdate('/auth/change-password', {
    onSuccess: (res) => {
      setSecurityState((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
      showToast(res?.message || 'Security password updated successfully!');
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to update password. Please try again.');
    },
  });

  const isUpdatingPassword = changePasswordMutation.isPending;

  // 1. Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    profilePhoto: null, // photo url or initials
    fullName: 'Vikramaditya Singhania',
    email: 'admin.singhania@leadflow.io',
    phone: '+91 98200 11223',
  });

  // 2. Work Information State
  const [workInfo, setWorkInfo] = useState({
    employeeId: 'ADM-9021',
    role: 'Super Administrator',
    department: 'Enterprise Core Systems & Security',
    team: 'Core Infrastructure & Compliance',
    reportingManager: 'Board of Directors / Chief Executive Officer',
  });

  // 3. Account Information State (Audit / Metadata)
  const [accountInfo, setAccountInfo] = useState({
    accountStatus: 'Active', // Active | Suspended | Inactive
    joiningDate: '14 January 2023',
    lastLogin: '27 Oct 2026, 05:42 PM (IST)',
    lastLoginIp: '103.24.88.192 (Mumbai, India)',
  });

  // 4. Security State
  const [securityState, setSecurityState] = useState({
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true, // optional 2FA toggle
  });

  // 5. Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    followUpReminders: true,
  });

  // Avatar Photo Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPersonalInfo((prev) => ({ ...prev, profilePhoto: reader.result }));
        showToast('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Personal Info
  const handleSavePersonal = (e) => {
    e.preventDefault();
    setIsEditingPersonal(false);
    showToast('Personal information updated successfully!');
  };

  // Save Work Info
  const handleSaveWork = (e) => {
    e.preventDefault();
    setIsEditingWork(false);
    showToast('Work information updated successfully!');
  };

  // Sync logged-in user details if available
  useEffect(() => {
    if (user) {
      setPersonalInfo((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
      setWorkInfo((prev) => ({
        ...prev,
        role:
          user.role === 'admin'
            ? 'Super Administrator'
            : user.role === 'sales_manager'
            ? 'Sales Manager'
            : 'Sales Representative',
        department:
          user.role === 'sales_manager'
            ? 'Enterprise Sales & Operations'
            : prev.department,
      }));
    }
  }, [user]);

  // Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!securityState.newPassword) { showToast('Please enter a new password'); return; }
    if (securityState.newPassword.length < 6) { showToast('Password must be at least 6 characters long'); return; }
    if (securityState.newPassword !== securityState.confirmPassword) { showToast('New password and confirmation do not match'); return; }

    await changePasswordMutation.mutateAsync({
      newPassword: securityState.newPassword,
      confirmPassword: securityState.confirmPassword,
    });
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* HEADER BANNER                                                    */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-6 sm:p-7 border border-emerald-200/90">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            {/* Profile Photo with Upload Button */}
            <div className="relative group shrink-0">
              {personalInfo.profilePhoto ? (
                <img
                  src={personalInfo.profilePhoto}
                  alt={personalInfo.fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover shadow-xl ring-4 ring-white border border-emerald-200"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl shadow-emerald-600/25 ring-4 ring-white">
                  {personalInfo.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <label
                htmlFor="admin-photo-upload"
                className="absolute -bottom-1.5 -right-1.5 p-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl shadow-md cursor-pointer transition-colors"
                title="Change Profile Photo"
              >
                <Camera size={13} />
                <input
                  id="admin-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/90 border border-emerald-300 text-emerald-950 shadow-2xs">
                  <ShieldCheck size={13} className="text-emerald-700" />
                  {workInfo.role}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check size={11} /> {accountInfo.accountStatus}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ID: {workInfo.employeeId}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {personalInfo.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                {workInfo.department} • {workInfo.team}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" />
                  {personalInfo.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" />
                  {personalInfo.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" />
                  Joined {accountInfo.joiningDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Badge */}
          <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-emerald-200/90 shadow-2xs text-xs space-y-1.5 min-w-[220px]">
            <div className="flex justify-between items-center text-slate-500">
              <span>Account Tier</span>
              <span className="font-bold text-emerald-700">Root Super Admin</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>2FA Security</span>
              <span className="font-bold text-slate-800">
                {securityState.twoFactorEnabled ? 'Enabled (Active)' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Last Login</span>
              <span className="font-bold text-slate-800">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN STRUCTURED FORM & SECTIONS                              */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SECTION 1: PERSONAL INFORMATION                                */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Personal Information</h3>
                  <p className="text-[11px] text-slate-500">Profile photo, full name, email and phone number</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                {isEditingPersonal ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleSavePersonal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditingPersonal}
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    disabled={!isEditingPersonal}
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(personalInfo.email, 'Email')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Copy Email"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  disabled={!isEditingPersonal}
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {isEditingPersonal && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Save size={13} />
                    Save Personal Info
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* SECTION 2: WORK INFORMATION                                    */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Work Information</h3>
                  <p className="text-[11px] text-slate-500">Employee ID, role, department, team & reporting manager</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingWork(!isEditingWork)}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                {isEditingWork ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleSaveWork} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Employee ID</label>
                  <input
                    type="text"
                    disabled={!isEditingWork}
                    value={workInfo.employeeId}
                    onChange={(e) => setWorkInfo({ ...workInfo, employeeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">System Role</label>
                  <input
                    type="text"
                    disabled={!isEditingWork}
                    value={workInfo.role}
                    onChange={(e) => setWorkInfo({ ...workInfo, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                  <input
                    type="text"
                    disabled={!isEditingWork}
                    value={workInfo.department}
                    onChange={(e) => setWorkInfo({ ...workInfo, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Team</label>
                  <input
                    type="text"
                    disabled={!isEditingWork}
                    value={workInfo.team}
                    onChange={(e) => setWorkInfo({ ...workInfo, team: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reporting Manager</label>
                <input
                  type="text"
                  disabled={!isEditingWork}
                  value={workInfo.reportingManager}
                  onChange={(e) => setWorkInfo({ ...workInfo, reportingManager: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {isEditingWork && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                  >
                    <Save size={13} />
                    Save Work Info
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* SECTION 3: ACCOUNT INFORMATION                                 */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Account Information</h3>
              <p className="text-[11px] text-slate-500">Account status, organization joining date & session telemetry</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 block">Account Status</span>
                <span className="text-[11px] text-slate-500">Active organization administrator</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Check size={12} />
                {accountInfo.accountStatus}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 block">Joining Date</span>
                <span className="text-[11px] text-slate-500">Initial onboarding timestamp</span>
              </div>
              <span className="font-bold text-slate-800">{accountInfo.joiningDate}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Last Login Timestamp</span>
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5">{accountInfo.lastLoginIp}</span>
                </div>
                <span className="font-bold text-slate-800">{accountInfo.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: SECURITY                                            */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Security Credentials</h3>
              <p className="text-[11px] text-slate-500">Change password, confirm password & Two-Factor Authentication</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Change Password (New Password)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={securityState.newPassword}
                  onChange={(e) => setSecurityState({ ...securityState, newPassword: e.target.value })}
                  placeholder="Enter new strong password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={securityState.confirmPassword}
                  onChange={(e) => setSecurityState({ ...securityState, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication (Optional Toggle) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    Two-Factor Authentication (2FA)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Optional OTP verification via Authenticator App
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const updated = !securityState.twoFactorEnabled;
                  setSecurityState({ ...securityState, twoFactorEnabled: updated });
                  showToast(`Two-Factor Authentication ${updated ? 'Enabled' : 'Disabled'}`);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  securityState.twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    securityState.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer mt-1 flex items-center justify-center gap-2"
            >
              {isUpdatingPassword ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>


        {/* SECTION 5: NOTIFICATION PREFERENCES                            */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Notification Preferences</h3>
                <p className="text-[11px] text-slate-500">
                  Configure delivery channels for system alerts, follow-up reminders & in-app updates
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('All notification preferences saved!')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Save Preferences
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Email Notifications */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={16} className="text-emerald-600" />
                  <span className="font-bold text-slate-900 text-xs">Email Notifications</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Receive critical security alerts, user provisioning updates, and export reports in inbox.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = !notifications.emailNotifications;
                  setNotifications({ ...notifications, emailNotifications: updated });
                  showToast(`Email Notifications ${updated ? 'Enabled' : 'Disabled'}`);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.emailNotifications ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 2. In-App Notifications */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bell size={16} className="text-teal-600" />
                  <span className="font-bold text-slate-900 text-xs">In-App Notifications</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Show pop-up badges, top navbar alerts, and live audio chime for real-time lead updates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = !notifications.inAppNotifications;
                  setNotifications({ ...notifications, inAppNotifications: updated });
                  showToast(`In-App Notifications ${updated ? 'Enabled' : 'Disabled'}`);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.inAppNotifications ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.inAppNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. Follow-up Reminders */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-blue-600" />
                  <span className="font-bold text-slate-900 text-xs">Follow-up Reminders</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Timely notifications for pending customer task SLAs, lead follow-ups, and calendar schedules.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = !notifications.followUpReminders;
                  setNotifications({ ...notifications, followUpReminders: updated });
                  showToast(`Follow-up Reminders ${updated ? 'Enabled' : 'Disabled'}`);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.followUpReminders ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.followUpReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
