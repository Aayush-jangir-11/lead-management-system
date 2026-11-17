import React, { useState, useEffect } from 'react';
import {
  TrendingUp, User, Mail, Phone, Building2,
  Calendar, Lock, Bell, CheckCircle2,
  Smartphone, Camera, Save, Eye, EyeOff,
  Briefcase, Clock, Check, Copy,
  MapPin, Target, Award, Star, RefreshCw
} from 'lucide-react';
import { useUpdate, useToast } from '../../hooks';
import { useAuth } from '../../context/AuthContext';

export default function SalesProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingWork, setIsEditingWork] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── TanStack Mutation: Update Password ───────────────────────────────────────
  const changePasswordMutation = useUpdate('/auth/change-password', {
    onSuccess: (res) => {
      setSecurityState((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
      showToast(res?.message || 'Password updated successfully!');
    },
    onError: (err) => {
      console.error('Change password failed:', err);
      const errMsg = err.response?.data?.message || 'Failed to update password. Please try again.';
      showToast(errMsg);
    },
  });

  const isUpdatingPassword = changePasswordMutation.isPending;

  // 1. Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    profilePhoto: null,
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // 2. Work Information State
  const [workInfo, setWorkInfo] = useState({
    employeeId: user?._id ? `SP-${user._id.slice(-4).toUpperCase()}` : '',
    role: user?.role === 'sales_manager'
      ? 'Sales Manager'
      : user?.role === 'sales_person'
      ? 'Sales Representative'
      : (user?.role || 'Sales Representative'),
    department: user?.department?.name || user?.department || 'Sales Department',
    territory: user?.territory || 'Assigned Territory',
    reportingManager: user?.manager?.name || 'Sales Leadership',
  });

  // 3. Account Information State
  const [accountInfo] = useState({
    accountStatus: user?.status || 'Active',
    joiningDate: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Active',
    lastLogin: 'Active Now',
  });

  // 4. Performance Stats (Sales-specific)
  const [performanceStats] = useState({
    monthlyQuota: '₹12,00,000',
    dealsWon: 8,
    conversionRate: '34%',
    rank: '#3 in Team',
  });

  // 5. Security State
  const [securityState, setSecurityState] = useState({
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  // 6. Notification Preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    followUpReminders: true,
  });

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

  const handleSavePersonal = (e) => {
    e.preventDefault();
    setIsEditingPersonal(false);
    showToast('Personal information updated successfully!');
  };

  const handleSaveWork = (e) => {
    e.preventDefault();
    setIsEditingWork(false);
    showToast('Work information updated successfully!');
  };

  // Sync logged-in sales user details
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
          user.role === 'sales_manager'
            ? 'Sales Manager'
            : user.role === 'sales_person'
            ? 'Sales Representative'
            : (user.role || prev.role),
        department:
          user.role === 'sales_manager'
            ? 'Sales Management & Operations'
            : prev.department,
      }));
    }
  }, [user]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!securityState.newPassword) {
      showToast('Please enter a new password');
      return;
    }
    if (securityState.newPassword.length < 6) {
      showToast('Password must be at least 6 characters long');
      return;
    }
    if (securityState.newPassword !== securityState.confirmPassword) {
      showToast('New password and confirmation do not match');
      return;
    }

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
      {/* ================================================================ */}
      {/* HEADER BANNER                                                    */}
      {/* ================================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-6 sm:p-7 border border-emerald-200/90">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            {/* Profile Photo */}
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
                htmlFor="sales-photo-upload"
                className="absolute -bottom-1.5 -right-1.5 p-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl shadow-md cursor-pointer transition-colors"
                title="Change Profile Photo"
              >
                <Camera size={13} />
                <input
                  id="sales-photo-upload"
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
                  <TrendingUp size={13} className="text-emerald-700" />
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
                {workInfo.department} • {workInfo.territory}
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

          {/* Quick Info Badge — Sales Specific */}
          <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-emerald-200/90 shadow-2xs text-xs space-y-1.5 min-w-[220px]">
            <div className="flex justify-between items-center text-slate-500">
              <span>Monthly Quota</span>
              <span className="font-bold text-emerald-700">{performanceStats.monthlyQuota}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Deals Won (Month)</span>
              <span className="font-bold text-slate-800">{performanceStats.dealsWon} Deals</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Team Rank</span>
              <span className="font-bold text-amber-600">{performanceStats.rank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* PERFORMANCE STATS STRIP (Sales-Specific)                        */}
      {/* ================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Target size={18} />, label: 'Monthly Quota', value: performanceStats.monthlyQuota, color: 'emerald' },
          { icon: <Award size={18} />, label: 'Deals Won', value: `${performanceStats.dealsWon} this month`, color: 'teal' },
          { icon: <TrendingUp size={18} />, label: 'Conversion Rate', value: performanceStats.conversionRate, color: 'blue' },
          { icon: <Star size={18} />, label: 'Team Rank', value: performanceStats.rank, color: 'amber' },
        ].map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0`}>
              {icon}
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">{label}</p>
              <p className="text-sm font-black text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ================================================================ */}
      {/* 2-COLUMN FORM SECTIONS                                          */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SECTION 1: PERSONAL INFORMATION */}
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

        {/* SECTION 2: WORK INFORMATION */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Work Information</h3>
                  <p className="text-[11px] text-slate-500">Employee ID, role, department, territory & manager</p>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Role</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1"><MapPin size={11} /> Territory</span>
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingWork}
                    value={workInfo.territory}
                    onChange={(e) => setWorkInfo({ ...workInfo, territory: e.target.value })}
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

        {/* SECTION 3: ACCOUNT INFORMATION */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Account Information</h3>
              <p className="text-[11px] text-slate-500">Account status, joining date & last session</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 block">Account Status</span>
                <span className="text-[11px] text-slate-500">Active sales team member</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Check size={12} />
                {accountInfo.accountStatus}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 block">Joining Date</span>
                <span className="text-[11px] text-slate-500">Onboarding date</span>
              </div>
              <span className="font-bold text-slate-800">{accountInfo.joiningDate}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Last Login</span>
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5">Session timestamp</span>
                </div>
                <span className="font-bold text-slate-800">{accountInfo.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: SECURITY */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Security</h3>
              <p className="text-[11px] text-slate-500">Change password & Two-Factor Authentication</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
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

            {/* 2FA Toggle */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Two-Factor Authentication (2FA)</span>
                  <span className="text-[11px] text-slate-500">OTP verification via Authenticator App</span>
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

        {/* SECTION 5: NOTIFICATION PREFERENCES (full-width) */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Notification Preferences</h3>
                <p className="text-[11px] text-slate-500">
                  Configure alerts for lead updates, follow-up reminders & in-app notifications
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('Notification preferences saved!')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Save Preferences
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email Notifications */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={16} className="text-emerald-600" />
                  <span className="font-bold text-slate-900 text-xs">Email Notifications</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Receive lead assignment alerts, quota updates, and weekly performance reports.
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

            {/* In-App Notifications */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bell size={16} className="text-teal-600" />
                  <span className="font-bold text-slate-900 text-xs">In-App Notifications</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Real-time pop-ups and badge alerts for new leads, messages, and task updates.
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

            {/* Follow-up Reminders */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-blue-600" />
                  <span className="font-bold text-slate-900 text-xs">Follow-up Reminders</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Timely reminders for pending lead follow-ups, call schedules, and SLA deadlines.
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

