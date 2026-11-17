import React, { useState, useEffect } from 'react';
import {
  X, UserPlus, Shield, Mail, Phone, User, Target,
  MapPin, Lock, Key, Eye, EyeOff, Copy, Building, Check, Edit3, AlertCircle
} from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,}$/;

export default function CreateUserModal({ isOpen, onClose, onUserCreated, userToEdit = null }) {
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'Sales Representative',
    department: 'Inside Sales',
    territory: 'North India & NCR',
    monthlyQuota: '1500000',
    leadCapacity: '50',
    password: 'Leadflow@123',
    requirePasswordChange: true,
    enable2FA: true,
    sendInviteEmail: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form data whenever modal opens or userToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    if (userToEdit) {
      setFormData({
        userId: userToEdit.userId || userToEdit.id || '',
        fullName: userToEdit.name || '',
        email: userToEdit.email || '',
        phone: userToEdit.phone || '',
        role: userToEdit.role || 'Sales Representative',
        department: userToEdit.department || 'Inside Sales',
        territory: userToEdit.territory || 'North India & NCR',
        monthlyQuota: userToEdit.quota !== undefined ? String(userToEdit.quota) : '1500000',
        leadCapacity: userToEdit.leadCapacity !== undefined ? String(userToEdit.leadCapacity) : '50',
        password: '',
        requirePasswordChange: false,
        enable2FA: userToEdit.twoFactor ?? true,
        sendInviteEmail: false,
      });
    } else {
      setFormData({
        userId: '',
        fullName: '',
        email: '',
        phone: '',
        role: 'Sales Representative',
        department: 'Inside Sales',
        territory: 'North India & NCR',
        monthlyQuota: '1500000',
        leadCapacity: '50',
        password: 'Leadflow@123',
        requirePasswordChange: true,
        enable2FA: true,
        sendInviteEmail: true,
      });
    }

    setShowPassword(false);
    setPasswordError('');
  }, [isOpen, userToEdit]);

  // Lock background window scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'password') {
      setPasswordError('');
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const effectivePassword = formData.password?.trim() || (userToEdit ? '' : 'Leadflow@123');

    // Validate password if adding user or if user chose to reset/update password
    if (!userToEdit || effectivePassword) {
      if (!PASSWORD_REGEX.test(effectivePassword)) {
        setPasswordError('Password must be 8+ chars with uppercase, lowercase, number & special char.');
        return;
      }
    }

    setIsSubmitting(true);

    const initials = formData.fullName
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const finalUserId = formData.userId.trim() || `USR-${Math.floor(Math.random() * 90) + 10}`;

    const userObj = userToEdit
      ? {
          ...userToEdit,
          id: formData.userId.trim() || userToEdit.id,
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone || '+91 98000 00000',
          role: formData.role,
          department: formData.department,
          territory: formData.territory,
          twoFactor: formData.enable2FA,
          avatar: initials || userToEdit.avatar || 'US',
          quota: Number(formData.monthlyQuota) || userToEdit.quota || 1500000,
          password: effectivePassword || userToEdit.password,
        }
      : {
          id: finalUserId,
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone || '+91 98000 00000',
          role: formData.role,
          department: formData.department,
          territory: formData.territory,
          status: 'Active',
          twoFactor: formData.enable2FA,
          lastActive: 'Just invited',
          avatar: initials || 'US',
          avatarBg: 'bg-emerald-600',
          quota: Number(formData.monthlyQuota) || 1500000,
          leadsAssigned: 0,
          closedDeals: 0,
          conversionRate: '0.0%',
          password: effectivePassword,
        };

    try {
      if (onUserCreated) {
        await onUserCreated(userObj);
      }
      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 pt-20 sm:pt-24 pb-6 overflow-hidden">
      {/* Dark backdrop with click-to-close */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card - Positioned comfortably below navbar with top margin */}
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/90 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col h-[78vh] max-h-[calc(100vh-6.5rem)] sm:max-h-[calc(100vh-7.5rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 shrink-0">
              {userToEdit ? <Edit3 size={18} /> : <UserPlus size={18} />}
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                {userToEdit ? 'Edit User Details' : 'Add New Sales User'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                {userToEdit
                  ? `Update information, quota, or territory for ${userToEdit.name}`
                  : 'Provision new sales rep, territory, and monthly quota.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 overscroll-contain">
            {/* Section 1: Basic Info */}
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3 flex items-center gap-1.5">
                <User size={14} className="text-blue-600" />
                1. Personal & Contact Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    User ID <span className="text-slate-400 font-normal text-[11px]">(Optional, e.g. USR-06)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">#</span>
                    <input
                      type="text"
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      placeholder="Auto-generated if left blank"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Vikramaditya Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="vikram@leadflow.in"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Inside Sales">Inside Sales</option>
                      <option value="Enterprise Sales">Enterprise Sales</option>
                      <option value="Direct Sales">Direct Sales</option>
                      <option value="Lead Qualification">Lead Qualification (SDR)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Role, Territory & Quota */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2.5 flex items-center gap-1.5">
                <Target size={13} className="text-emerald-600" />
                Role, Territory & Quota
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CRM Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Sales Representative">Sales Representative</option>
                      <option value="Commercial Closer">Commercial Closer</option>
                      <option value="Senior Enterprise AE">Senior Enterprise AE</option>
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="Inbound SDR Specialist">Inbound SDR Specialist</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Region <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      name="territory"
                      value={formData.territory}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="North India & NCR">North India & NCR</option>
                      <option value="West & Mumbai Region">West & Mumbai</option>
                      <option value="South & Bangalore">South & Bangalore</option>
                      <option value="East India Region">East India</option>
                      <option value="Pan India / Enterprise">Pan India / Enterprise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Target (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      name="monthlyQuota"
                      value={formData.monthlyQuota}
                      onChange={handleInputChange}
                      placeholder="1500000"
                      step="50000"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lead Capacity
                  </label>
                  <div className="relative">
                    <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      name="leadCapacity"
                      value={formData.leadCapacity}
                      onChange={handleInputChange}
                      placeholder="50"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Credentials */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2.5 flex items-center gap-1.5">
                <Lock size={13} className="text-emerald-600" />
                {userToEdit ? 'Reset Password & Security' : 'User Password & Security'}
              </span>

              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password <span className="text-slate-400 font-normal text-[11px]">(Default: Leadflow@123 or write manual)</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      Strong Policy Required
                    </span>
                  </div>

                  <div className="relative">
                    <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={userToEdit ? 'Leave blank to keep existing password' : 'Enter password or leave as Leadflow@123'}
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono ${
                        passwordError ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-emerald-500 focus:bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {passwordError && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-rose-600 text-[11px] font-bold animate-in fade-in">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {/* Real-time Password Strength Criteria Badges */}
                  {(!userToEdit || formData.password) && (
                    <div className="mt-2.5 p-2.5 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          Password Requirements
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Default: <code className="font-mono text-emerald-700 font-bold">Leadflow@123</code>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '8+ Chars', met: (formData.password || '').length >= 8 },
                          { label: 'Uppercase (A-Z)', met: /[A-Z]/.test(formData.password || '') },
                          { label: 'Lowercase (a-z)', met: /[a-z]/.test(formData.password || '') },
                          { label: 'Number (0-9)', met: /\d/.test(formData.password || '') },
                          { label: 'Special (!@#$...)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(formData.password || '') },
                        ].map((rule) => (
                          <span
                            key={rule.label}
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all ${
                              rule.met
                                ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-300'
                                : 'bg-white text-slate-500 border border-slate-200'
                            }`}
                          >
                            <Check size={11} className={rule.met ? 'text-emerald-700 stroke-[3]' : 'text-slate-300'} />
                            {rule.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300">
                    <input
                      type="checkbox"
                      name="enable2FA"
                      checked={formData.enable2FA}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Enforce 2FA / OTP</span>
                  </label>

                  {!userToEdit && (
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300">
                      <input
                        type="checkbox"
                        name="sendInviteEmail"
                        checked={formData.sendInviteEmail}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">Send Welcome Email</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Modal Action Footer */}
          <div className="flex items-center justify-end gap-3 p-5 sm:p-6 border-t border-slate-100 bg-slate-50/90 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {userToEdit ? 'Saving Changes...' : 'Saving User...'}
                </>
              ) : (
                <>
                  {userToEdit ? <Check size={15} /> : <UserPlus size={15} />}
                  {userToEdit ? 'Save Changes' : 'Add User to Team'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
