import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useToast } from '../../hooks';
import {
  Settings, Users, Layers, Building2, Target, Bell, ShieldCheck,
  Activity, Search, Filter, Download, Plus, Trash2, Edit3, Save,
  RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Check, X,
  Lock, Key, Globe, Mail, Phone, MapPin, Calendar, SlidersHorizontal,
  ChevronRight, ExternalLink, Zap, Eye, EyeOff, UserPlus, Smartphone,
  MessageSquare, Send, Clock, ArrowUpRight, Shield, Sparkles, Laptop,
  Database, UserCheck
} from 'lucide-react';

// ==========================================
// 1. DEFAULT DATASETS FOR THE 8 SETTINGS AREAS
// ==========================================

const INITIAL_GENERAL_SETTINGS = {
  companyName: 'LeadFlow Enterprise Technologies Pvt Ltd',
  brandName: 'LeadFlow CRM',
  supportEmail: 'support@leadflow.io',
  adminEmail: 'admin@leadflow.io',
  phone: '+91 (022) 6789-4321',
  website: 'https://leadflow.io',
  hqAddress: 'Level 14, Tower B, Cyber City, Bandra Kurla Complex (BKC), Mumbai, MH 400051',
  gstin: '27AABCU9603R1ZM',
  currency: 'INR',
  currencySymbol: '₹',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Kolkata (IST +05:30)',
  fiscalYearStart: 'April',
  brandColor: '#059669', // Emerald
  autoSaveDrafts: true,
  autoSaveIntervalSec: 30,
  stagnantLeadThresholdDays: 2,
  duplicateDetectionRule: 'email_or_phone',
  workingHours: '09:30 AM - 06:30 PM (Mon-Sat)',
};

const INITIAL_USERS = [];

const INITIAL_ROLES_OVERVIEW = [
  { id: 'super_admin', name: 'Super Administrator', usersCount: 2, badge: 'Full Root Access', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'sales_manager', name: 'Sales Manager', usersCount: 1, badge: 'Supervisor Access', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'enterprise_ae', name: 'Senior Enterprise AE', usersCount: 1, badge: 'Full Pipeline Access', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'commercial_closer', name: 'Commercial Closer', usersCount: 1, badge: 'Deals & Tasks', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'inbound_sdr', name: 'Inbound SDR Specialist', usersCount: 1, badge: 'Lead Intake & Qualification', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'outbound_ae', name: 'Outbound AE', usersCount: 1, badge: 'Outreach & Prospecting', color: 'bg-amber-100 text-amber-800 border-amber-200' },
];

const INITIAL_LEAD_SOURCES = [
  { id: 'SRC-01', name: 'Website Inbound Form', category: 'Inbound Web', monthlyLeads: 142, conversionRate: '34.2%', active: true, utmSource: 'website_contact' },
  { id: 'SRC-02', name: 'IndiaMART B2B Portal', category: 'Marketplace Webhook', monthlyLeads: 88, conversionRate: '28.5%', active: true, utmSource: 'indiamart_b2b' },
  { id: 'SRC-03', name: 'Direct Client Referral', category: 'Referral / Word of Mouth', monthlyLeads: 39, conversionRate: '52.0%', active: true, utmSource: 'client_referral' },
  { id: 'SRC-04', name: 'LinkedIn Sales Navigator', category: 'Social Selling', monthlyLeads: 64, conversionRate: '22.4%', active: true, utmSource: 'linkedin_outreach' },
  { id: 'SRC-05', name: 'Google Search Ads (PPC)', category: 'Paid Advertising', monthlyLeads: 110, conversionRate: '19.8%', active: true, utmSource: 'google_ppc_inbound' },
  { id: 'SRC-06', name: 'Inbound WhatsApp Business', category: 'Instant Chat', monthlyLeads: 75, conversionRate: '41.3%', active: true, utmSource: 'whatsapp_qr' },
  { id: 'SRC-07', name: 'National Trade Expo 2026', category: 'Offline Event', monthlyLeads: 25, conversionRate: '36.0%', active: false, utmSource: 'expo_mumbai_2026' },
];

const INITIAL_PIPELINE_STAGES = [
  { id: 'STG-01', rank: 1, name: 'New / Fresh Inquiry', probability: 10, slaHours: 24, color: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-500', requireDealValue: false },
  { id: 'STG-02', rank: 2, name: 'Contacted & Discovery', probability: 25, slaHours: 48, color: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500', requireDealValue: false },
  { id: 'STG-03', rank: 3, name: 'Needs Qualified (BANT)', probability: 45, slaHours: 72, color: 'bg-indigo-100 text-indigo-800 border-indigo-300', dot: 'bg-indigo-500', requireDealValue: true },
  { id: 'STG-04', rank: 4, name: 'Proposal / Demo Delivered', probability: 70, slaHours: 120, color: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500', requireDealValue: true },
  { id: 'STG-05', rank: 5, name: 'Commercial Negotiation', probability: 85, slaHours: 168, color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500', requireDealValue: true },
  { id: 'STG-06', rank: 6, name: 'Closed Won (Signed)', probability: 100, slaHours: 0, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500', requireDealValue: true },
  { id: 'STG-07', rank: 7, name: 'Closed Lost / Disqualified', probability: 0, slaHours: 0, color: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500', requireDealValue: false },
];

const INITIAL_DEPARTMENTS = [
  {
    id: 'DEPT-01',
    name: 'Enterprise Strategic Accounts',
    leadName: 'Ajay Sharma',
    leadEmail: 'ajay.sharma@leadflow.io',
    leadAvatar: 'AS',
    memberCount: 4,
    monthlyTarget: 8500000,
    territories: ['Pan India', 'Maharashtra', 'Gujarat', 'NCR Hub'],
    routingMode: 'Territory & Value Escalation (> ₹2L)',
    active: true,
  },
  {
    id: 'DEPT-02',
    name: 'Commercial & Mid-Market Sales',
    leadName: 'Rohan Mehta',
    leadEmail: 'rohan.mehta@leadflow.io',
    leadAvatar: 'RM',
    memberCount: 3,
    monthlyTarget: 4500000,
    territories: ['North India', 'Delhi NCR', 'Punjab', 'Rajasthan'],
    routingMode: 'Round-Robin Equal Distribution',
    active: true,
  },
  {
    id: 'DEPT-03',
    name: 'Inbound SDR & Qualification',
    leadName: 'Sneha Rao',
    leadEmail: 'sneha.rao@leadflow.io',
    leadAvatar: 'SR',
    memberCount: 3,
    monthlyTarget: 3000000,
    territories: ['South India', 'Bengaluru', 'Hyderabad', 'Chennai'],
    routingMode: '15-Minute SLA Speed-to-Lead Pool',
    active: true,
  },
  {
    id: 'DEPT-04',
    name: 'Outbound Prospecting & Alliances',
    leadName: 'Priya Patel',
    leadEmail: 'priya.patel@leadflow.io',
    leadAvatar: 'PP',
    memberCount: 2,
    monthlyTarget: 4000000,
    territories: ['West India', 'Pune', 'Ahmedabad', 'International'],
    routingMode: 'Direct Senior Rep Assignment',
    active: true,
  },
];

const INITIAL_NOTIFICATIONS = [
  { id: 'NOTIF-01', event: 'New Lead Auto-Assigned', desc: 'When an incoming lead is assigned to a sales rep', inApp: true, email: true, whatsapp: true, slack: true },
  { id: 'NOTIF-02', event: 'Deal Moved to Proposal / Negotiation', desc: 'High-intent milestone progression alert', inApp: true, email: false, whatsapp: false, slack: true },
  { id: 'NOTIF-03', event: 'Deal Closed Won (Victory Gong)', desc: 'Broadcast victory celebration to organization', inApp: true, email: true, whatsapp: true, slack: true },
  { id: 'NOTIF-04', event: 'Deal Marked Closed Lost', desc: 'Alert manager with reason code & notes', inApp: true, email: true, whatsapp: false, slack: false },
  { id: 'NOTIF-05', event: 'Speed-to-Lead SLA Breach (>15m)', desc: 'Urgent alarm if fresh inquiry is uncontacted', inApp: true, email: true, whatsapp: true, slack: true },
  { id: 'NOTIF-06', event: 'Task & Client Meeting Reminder', desc: '15 minutes before scheduled call or demo', inApp: true, email: true, whatsapp: true, slack: false },
  { id: 'NOTIF-07', event: 'Daily Morning Pipeline Digest', desc: 'Dispatched at 09:00 AM IST with today\'s follow-ups', inApp: true, email: true, whatsapp: false, slack: true },
  { id: 'NOTIF-08', event: 'Sales Target Quota Milestone (80%/100%)', desc: 'Notification when rep approaches or beats target', inApp: true, email: true, whatsapp: true, slack: true },
  { id: 'NOTIF-09', event: 'Security: New IP / Device Login', desc: 'Critical alert if account is accessed from new location', inApp: true, email: true, whatsapp: true, slack: false },
];

const INITIAL_SECURITY_SETTINGS = {
  twoFactorPolicy: 'mandatory_all', // 'mandatory_all' | 'admins_only' | 'optional'
  allowed2faMethods: ['totp', 'email_otp'], // 'totp', 'sms_otp', 'email_otp'
  minPasswordLength: 10,
  requireSpecialChar: true,
  requireNumbers: true,
  requireUppercase: true,
  passwordExpiryDays: 90,
  preventPasswordReuseCount: 3,
  sessionTimeoutMinutes: 30,
  singleActiveSessionPerUser: true,
  maxFailedLoginsBeforeLockout: 5,
  lockoutDurationMinutes: 30,
  ipWhitelistingEnabled: true,
  whitelistedIps: [
    { id: 'IP-01', label: 'Mumbai Headquarters (Static Fiber)', cidr: '103.21.124.0/24', addedBy: 'Ananya Deshmukh' },
    { id: 'IP-02', label: 'Primary Enterprise VPN Gateway', cidr: '14.139.12.0/28', addedBy: 'Super Admin' },
  ],
  googleSsoEnabled: true,
  azureAdEnabled: false,
};

const INITIAL_AUDIT_LOGS = [];

// ==========================================
// 2. MAIN COMPONENT: ADMIN SETTINGS PAGE
// ==========================================
export default function AdminSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'general';

  // Active Tab State (syncs with query param)
  const [activeTab, setActiveTab] = useState(initialTab);

  // Synchronize URL query parameter when activeTab changes
  useEffect(() => {
    const currentTabInUrl = searchParams.get('tab');
    if (currentTabInUrl !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  // Global Toasts
  const { showToast } = useToast();

  // ------------------------------------------
  // STATE: 1. General Settings
  // ------------------------------------------
  const [general, setGeneral] = useState(INITIAL_GENERAL_SETTINGS);
  const handleSaveGeneral = (e) => {
    e.preventDefault();
    showToast('General organization settings saved successfully!');
  };

  // ------------------------------------------
  // STATE: 2. Users & Roles
  // ------------------------------------------
  const [users, setUsers] = useState(INITIAL_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Senior Enterprise AE',
    department: 'Enterprise Strategic Accounts',
    territory: 'Pan India',
    quota: 1500000,
  });

  const handleToggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = u.status === 'Active' ? 'Suspended' : 'Active';
          showToast(`User ${u.name} status updated to ${next}.`);
          return { ...u, status: next };
        }
        return u;
      })
    );
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          showToast(`Updated role for ${u.name} to ${newRole}.`);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    const initials = newUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const createdUser = {
      id: `USR-${Math.floor(10 + Math.random() * 90)}`,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '+91 98000 00000',
      role: newUser.role,
      department: newUser.department,
      territory: newUser.territory,
      status: 'Active',
      twoFactor: false,
      avatar: initials || 'US',
      avatarBg: 'bg-emerald-600',
      quota: Number(newUser.quota) || 1000000,
      quotaAchieved: 0,
    };
    setUsers([createdUser, ...users]);
    setShowInviteModal(false);
    showToast(`Invitation sent to ${createdUser.email}! Access granted.`);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'Senior Enterprise AE',
      department: 'Enterprise Strategic Accounts',
      territory: 'Pan India',
      quota: 1500000,
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.territory.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'All' || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // ------------------------------------------
  // STATE: 3. Lead Sources & Stages
  // ------------------------------------------
  const [leadSources, setLeadSources] = useState(INITIAL_LEAD_SOURCES);
  const [pipelineStages, setPipelineStages] = useState(INITIAL_PIPELINE_STAGES);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', category: 'Digital Inbound', utmSource: '' });

  const handleToggleSourceActive = (id) => {
    setLeadSources((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const next = !s.active;
          showToast(`Lead source "${s.name}" is now ${next ? 'Active' : 'Inactive'}.`);
          return { ...s, active: next };
        }
        return s;
      })
    );
  };

  const handleAddSourceSubmit = (e) => {
    e.preventDefault();
    if (!newSource.name.trim()) return;
    const src = {
      id: `SRC-${Math.floor(10 + Math.random() * 90)}`,
      name: newSource.name,
      category: newSource.category,
      monthlyLeads: 0,
      conversionRate: '0.0%',
      active: true,
      utmSource: newSource.utmSource || newSource.name.toLowerCase().replace(/\s+/g, '_'),
    };
    setLeadSources([...leadSources, src]);
    setShowAddSourceModal(false);
    setNewSource({ name: '', category: 'Digital Inbound', utmSource: '' });
    showToast(`New lead source "${src.name}" configured.`);
  };

  const handleUpdateStageProbability = (id, newProb) => {
    setPipelineStages((prev) =>
      prev.map((stg) => (stg.id === id ? { ...stg, probability: Number(newProb) } : stg))
    );
  };

  const handleToggleStageRequireDealValue = (id) => {
    setPipelineStages((prev) =>
      prev.map((stg) => {
        if (stg.id === id) {
          const next = !stg.requireDealValue;
          showToast(`Stage "${stg.name}": Deal value requirement set to ${next ? 'Mandatory' : 'Optional'}.`);
          return { ...stg, requireDealValue: next };
        }
        return stg;
      })
    );
  };

  // ------------------------------------------
  // STATE: 4. Teams & Departments
  // ------------------------------------------
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({
    name: '',
    leadName: 'Ajay Sharma',
    leadEmail: 'ajay.sharma@leadflow.io',
    monthlyTarget: 5000000,
    territories: 'West India, Pune, Goa',
    routingMode: 'Round-Robin Equal Distribution',
  });

  const handleAddDeptSubmit = (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return;
    const deptObj = {
      id: `DEPT-${Math.floor(10 + Math.random() * 90)}`,
      name: newDept.name,
      leadName: newDept.leadName,
      leadEmail: newDept.leadEmail,
      leadAvatar: newDept.leadName.split(' ').map((n) => n[0]).join('').slice(0, 2),
      memberCount: 1,
      monthlyTarget: Number(newDept.monthlyTarget) || 5000000,
      territories: newDept.territories.split(',').map((t) => t.trim()),
      routingMode: newDept.routingMode,
      active: true,
    };
    setDepartments([...departments, deptObj]);
    setShowAddDeptModal(false);
    showToast(`Department "${deptObj.name}" created!`);
    setNewDept({
      name: '',
      leadName: 'Ajay Sharma',
      leadEmail: 'ajay.sharma@leadflow.io',
      monthlyTarget: 5000000,
      territories: 'West India, Pune, Goa',
      routingMode: 'Round-Robin Equal Distribution',
    });
  };

  // ------------------------------------------
  // STATE: 5. Sales Targets
  // ------------------------------------------
  const [selectedFiscalQuarter, setSelectedFiscalQuarter] = useState('Q3 FY 2026-27 (Oct - Dec)');
  const [targetPacingFilter, setTargetPacingFilter] = useState('All');

  const totalTargetQuota = useMemo(() => {
    return users.reduce((acc, u) => acc + (u.quota || 0), 0);
  }, [users]);

  const totalAchievedQuota = useMemo(() => {
    return users.reduce((acc, u) => acc + (u.quotaAchieved || 0), 0);
  }, [users]);

  const quotaAttainmentPct = useMemo(() => {
    if (totalTargetQuota === 0) return 0;
    return Math.round((totalAchievedQuota / totalTargetQuota) * 100);
  }, [totalTargetQuota, totalAchievedQuota]);

  const handleUpdateUserQuota = (userId, newQuotaValue) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, quota: Number(newQuotaValue) };
        }
        return u;
      })
    );
    showToast('Updated sales quota target.');
  };

  // ------------------------------------------
  // STATE: 6. Notifications
  // ------------------------------------------
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('https://hooks.slack.com/services/T90K2/B881P/leadflow-crm-alerts');
  const [slackChannelName, setSlackChannelName] = useState('#sales-alerts-live');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);

  const handleToggleNotificationChannel = (notifId, channel) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notifId) {
          const nextVal = !n[channel];
          return { ...n, [channel]: nextVal };
        }
        return n;
      })
    );
  };

  const handleTestSlackWebhook = () => {
    showToast(`Test payload dispatched to ${slackChannelName}! Status: 200 OK.`);
  };

  // ------------------------------------------
  // STATE: 7. Security Settings
  // ------------------------------------------
  const [security, setSecurity] = useState(INITIAL_SECURITY_SETTINGS);
  const [newIpInput, setNewIpInput] = useState({ label: '', cidr: '' });
  const [showAddIpModal, setShowAddIpModal] = useState(false);
  const [showRevokeSessionsModal, setShowRevokeSessionsModal] = useState(false);

  const handleAddIpSubmit = (e) => {
    e.preventDefault();
    if (!newIpInput.cidr.trim()) return;
    const ipObj = {
      id: `IP-${Math.floor(10 + Math.random() * 90)}`,
      label: newIpInput.label || 'Branch Office',
      cidr: newIpInput.cidr,
      addedBy: 'Super Admin',
    };
    setSecurity((prev) => ({
      ...prev,
      whitelistedIps: [...prev.whitelistedIps, ipObj],
    }));
    setShowAddIpModal(false);
    setNewIpInput({ label: '', cidr: '' });
    showToast(`CIDR range ${ipObj.cidr} added to whitelist.`);
  };

  const handleDeleteWhitelistedIp = (ipId) => {
    setSecurity((prev) => ({
      ...prev,
      whitelistedIps: prev.whitelistedIps.filter((i) => i.id !== ipId),
    }));
    showToast('IP whitelist rule removed.');
  };

  const handleForceRevokeAllSessions = () => {
    setShowRevokeSessionsModal(false);
    showToast('All active sessions revoked across the organization. Users must re-authenticate.');
  };

  // ------------------------------------------
  // STATE: 8. Audit Logs
  // ------------------------------------------
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState('All');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState('All');
  const [selectedAuditLogForModal, setSelectedAuditLogForModal] = useState(null);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.ip.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearch.toLowerCase());
      const matchModule = auditModuleFilter === 'All' || log.module === auditModuleFilter;
      const matchSeverity = auditSeverityFilter === 'All' || log.severity === auditSeverityFilter;
      return matchSearch && matchModule && matchSeverity;
    });
  }, [auditLogs, auditSearch, auditModuleFilter, auditSeverityFilter]);

  const handleExportAuditCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Actor Name', 'Email', 'Role', 'Action Description', 'Module', 'IP & Location', 'Severity', 'Details'];
    const rows = filteredAuditLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.user}"`,
      `"${l.userEmail}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.module}"`,
      `"${l.ip}"`,
      l.severity,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `leadflow_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit trail exported as CSV!');
  };

  const handleSimulateAuditLog = () => {
    const sampleLog = {
      id: `LOG-${Math.floor(1100 + Math.random() * 899)}`,
      timestamp: 'Just now',
      user: 'Super Admin',
      userEmail: 'admin@leadflow.io',
      userRole: 'Super Admin',
      userAvatar: 'SA',
      action: 'Tested Security Audit Trigger Event',
      module: 'Security & Auth',
      ip: '103.21.124.89 (Active Admin Console)',
      severity: 'info',
      details: 'Admin verified audit trail event delivery pipeline in real-time.',
    };
    setAuditLogs([sampleLog, ...auditLogs]);
    showToast('Simulated real-time security event added to ledger!');
  };

  // Nav Tabs Definition (All 8 User-Requested Areas)
  const TABS = [
    { id: 'general', label: 'General Settings', icon: Settings, count: null },
    { id: 'users', label: 'Users & Roles', icon: Users, count: users.length },
    { id: 'lead-sources', label: 'Lead Sources & Stages', icon: Layers, count: leadSources.length + pipelineStages.length },
    { id: 'teams', label: 'Teams & Departments', icon: Building2, count: departments.length },
    { id: 'targets', label: 'Sales Targets', icon: Target, count: null },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.length },
    { id: 'security', label: 'Security', icon: ShieldCheck, count: null },
    { id: 'audit', label: 'Audit Logs', icon: Activity, count: auditLogs.length },
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* 1. TOP HEADER BANNER (Aurora Glassmorphic Hero)          */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 p-6 sm:p-7 border border-emerald-200/60 shadow-xs">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
              <Settings size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Admin Settings & System Control
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-emerald-800 font-extrabold text-[11px] border border-emerald-300/80 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Super Admin Console
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Comprehensive control center for organization defaults, RBAC, pipeline stages, quotas, security, and audit ledgers.
              </p>
            </div>
          </div>

          {/* Global Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => showToast('All configuration changes auto-saved to secure cloud store.')}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Save size={15} />
              <span>Save All Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAB NAVIGATION BAR (8 SECTIONS) (Glassmorphic Pills)   */}
      {/* ======================================================== */}
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: GENERAL SETTINGS                                  */}
      {/* ======================================================== */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          {/* Card A: Company Profile & Branding */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Building2 size={18} />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Organization Profile & Identity
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Corporate details used across outgoing invoices, deal contracts, and client portals.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                GSTIN: {general.gstin}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Legal Entity Name
                </label>
                <input
                  type="text"
                  value={general.companyName}
                  onChange={(e) => setGeneral({ ...general, companyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Product / Brand Display Name
                </label>
                <input
                  type="text"
                  value={general.brandName}
                  onChange={(e) => setGeneral({ ...general, brandName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Corporate Website URL
                </label>
                <input
                  type="url"
                  value={general.website}
                  onChange={(e) => setGeneral({ ...general, website: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Official Support Email
                </label>
                <input
                  type="email"
                  value={general.supportEmail}
                  onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Official Admin Email
                </label>
                <input
                  type="email"
                  value={general.adminEmail}
                  onChange={(e) => setGeneral({ ...general, adminEmail: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={general.phone}
                  onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Registered Headquarters & Tax Address
              </label>
              <textarea
                rows={2}
                value={general.hqAddress}
                onChange={(e) => setGeneral({ ...general, hqAddress: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Card B: Regional, Currency & Fiscal Year Defaults */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Globe size={18} />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Localization, Currency & Fiscal Cycle
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Configures default currency formatting across pipeline cards, forecasts, and reports.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Base System Currency
                </label>
                <select
                  value={general.currency}
                  onChange={(e) => {
                    const c = e.target.value;
                    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED' };
                    setGeneral({ ...general, currency: c, currencySymbol: symbols[c] || '₹' });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="INR">INR (₹) - Indian Rupee (Lakhs/Crores)</option>
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Eurozone</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="AED">AED (AED) - UAE Dirham</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Timezone
                </label>
                <select
                  value={general.timezone}
                  onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</option>
                  <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York (EST)">America/New_York (EST)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                  <option value="Asia/Dubai (GST +04:00)">Asia/Dubai (GST +04:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Standard Date Format
                </label>
                <select
                  value={general.dateFormat}
                  onChange={(e) => setGeneral({ ...general, dateFormat: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 28/10/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/28/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Fiscal Year Starting Month
                </label>
                <select
                  value={general.fiscalYearStart}
                  onChange={(e) => setGeneral({ ...general, fiscalYearStart: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="April">April 1st (Indian Standard FY)</option>
                  <option value="January">January 1st (Calendar Year)</option>
                  <option value="July">July 1st</option>
                  <option value="October">October 1st</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Default Working Hours
                </label>
                <input
                  type="text"
                  value={general.workingHours}
                  onChange={(e) => setGeneral({ ...general, workingHours: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Duplicate Lead Matching Rule
                </label>
                <select
                  value={general.duplicateDetectionRule}
                  onChange={(e) => setGeneral({ ...general, duplicateDetectionRule: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="email_or_phone">Match Either Email OR Phone</option>
                  <option value="exact_email">Exact Work Email Only</option>
                  <option value="phone_only">Phone Number Only</option>
                  <option value="company_and_name">Company Name & Full Name</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Stagnant Lead SLA Warning Threshold
                </label>
                <select
                  value={general.stagnantLeadThresholdDays}
                  onChange={(e) => setGeneral({ ...general, stagnantLeadThresholdDays: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={1}>Flag after 24 Hours (1 Day)</option>
                  <option value={2}>Flag after 48 Hours (2 Days)</option>
                  <option value={3}>Flag after 72 Hours (3 Days)</option>
                  <option value={7}>Flag after 7 Days (1 Week)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">
              Changes will apply across all {users.length} active organization members immediately.
            </span>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setGeneral(INITIAL_GENERAL_SETTINGS);
                  showToast('General settings reset to system defaults.');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Reset to Default
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                Save General Settings
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 2: USERS & ROLES                                     */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar (Elevated Glassmorphism) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Licensed Team Seats
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{users.length} / 10 Used</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                  4 Available
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Enterprise Tier Active</p>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Active Sales Reps
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600">
                  {users.filter((u) => u.status === 'Active' && !u.role.includes('Admin')).length} Active
                </span>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded-full">
                  Lead Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">In Round-Robin Rotation</p>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Super Administrators
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-purple-700">2 Admins</span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-2 py-0.5 rounded-full">
                  Level 4 Access
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Security & Role Authority</p>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Total Monthly Quotas
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">
                  ₹{(totalTargetQuota / 100000).toFixed(1)} Lakhs
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                  {quotaAttainmentPct}% Done
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">Cumulative rep target</p>
            </div>
          </div>

          {/* Roles Overview Badges Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Configured Organization Roles & RBAC Tiers</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Click below to view or customize deep granular role permissions for each module.
                </p>
              </div>

              <Link
                to="/admin/roles"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
              >
                <span>Edit RBAC Matrix</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
              {INITIAL_ROLES_OVERVIEW.map((role) => (
                <div key={role.id} className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white transition-all">
                  <div className="text-xs font-extrabold text-slate-800 truncate">{role.name}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${role.color}`}>
                    {role.badge}
                  </span>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">
                    {role.usersCount} Assigned
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Management Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  User Directory & Role Assignments
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Assign system roles, update quotas, inspect 2FA health, and control account active status.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search name, email, territory..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-52 sm:w-60"
                  />
                  <Search size={13} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Senior Enterprise AE">Senior Enterprise AE</option>
                  <option value="Commercial Closer">Commercial Closer</option>
                  <option value="Inbound SDR Specialist">Inbound SDR Specialist</option>
                  <option value="Outbound AE">Outbound AE</option>
                </select>

                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <UserPlus size={13} />
                  <span>+ Invite User</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-3.5 pl-4">Member</th>
                    <th className="py-3.5 px-3">System Role</th>
                    <th className="py-3.5 px-3">Department</th>
                    <th className="py-3.5 px-3">Territory</th>
                    <th className="py-3.5 px-3">Monthly Quota</th>
                    <th className="py-3.5 px-3 text-center">2FA</th>
                    <th className="py-3.5 pr-4 text-right">Status & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 font-medium text-xs">
                        No team members configured yet.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-emerald-50/30 transition-colors group">
                      {/* Name & Avatar */}
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl ${u.avatarBg} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs`}>
                            {u.avatar}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs">{u.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Dropdown */}
                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-slate-50 hover:bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Sales Manager">Sales Manager</option>
                          <option value="Senior Enterprise AE">Senior Enterprise AE</option>
                          <option value="Commercial Closer">Commercial Closer</option>
                          <option value="Inbound SDR Specialist">Inbound SDR Specialist</option>
                          <option value="Outbound AE">Outbound AE</option>
                        </select>
                      </td>

                      {/* Department */}
                      <td className="py-3 text-slate-600 font-semibold text-[11px]">
                        {u.department}
                      </td>

                      {/* Territory */}
                      <td className="py-3 font-semibold text-slate-700 text-[11px]">
                        {u.territory}
                      </td>

                      {/* Quota */}
                      <td className="py-3 font-bold text-slate-900">
                        {u.quota > 0 ? `₹${(u.quota / 100000).toFixed(1)}L` : '—'}
                      </td>

                      {/* 2FA */}
                      <td className="py-3">
                        {u.twoFactor ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check size={10} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 text-right pr-2 space-x-1.5">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            u.status === 'Active'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          }`}
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
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

      {/* ======================================================== */}
      {/* TAB 3: LEAD SOURCES & STAGES                             */}
      {/* ======================================================== */}
      {activeTab === 'lead-sources' && (
        <div className="space-y-6">
          {/* Section 1: Lead Sources Manager */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers size={17} className="text-emerald-600" />
                  <span>Lead Ingestion Sources & Attribution</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Track inbound channels, webhooks, marketing UTM tags, and channel conversion velocity.
                </p>
              </div>

              <button
                onClick={() => setShowAddSourceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Add Lead Source</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leadSources.map((src) => (
                <div
                  key={src.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    src.active
                      ? 'bg-white border-slate-200/90 shadow-2xs hover:border-emerald-300'
                      : 'bg-slate-50/70 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900">{src.name}</h4>
                        <span
                          className={`w-2 h-2 rounded-full ${src.active ? 'bg-emerald-500' : 'bg-slate-400'}`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                        {src.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleSourceActive(src.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        src.active
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-rose-50 hover:text-rose-700'
                          : 'bg-slate-200 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                    >
                      {src.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Monthly Inflow</span>
                      <span className="font-extrabold text-slate-800">{src.monthlyLeads} Leads</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Conversion Rate</span>
                      <span className="font-extrabold text-emerald-600">{src.conversionRate}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">UTM: {src.utmSource}</span>
                    <span className="font-bold text-slate-500">ID: {src.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Pipeline Stages & SLA Configurator */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal size={17} className="text-blue-600" />
                  <span>Pipeline Stages, Win Probabilities & SLAs</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Configure visual stages on the Kanban board, stage win probability percentages, and stagnation warning triggers.
                </p>
              </div>

              <button
                onClick={() => showToast('Stage configuration saved to live Kanban pipeline.')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Save Pipeline Stages
              </button>
            </div>

            <div className="space-y-3">
              {pipelineStages.map((stage) => (
                <div
                  key={stage.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                      {stage.rank}
                    </span>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${stage.dot}`} />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">{stage.name}</h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        SLA Target: {stage.slaHours > 0 ? `${stage.slaHours} Hours (${Math.round(stage.slaHours / 24)} Days)` : 'Closed Stage'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {/* Win Probability Slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">Win Probability:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={stage.probability}
                        onChange={(e) => handleUpdateStageProbability(stage.id, e.target.value)}
                        className="w-24 sm:w-28 accent-emerald-600 cursor-pointer"
                      />
                      <span className="w-10 text-right font-black text-slate-900 font-mono">
                        {stage.probability}%
                      </span>
                    </div>

                    {/* Deal Value Requirement Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStageRequireDealValue(stage.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-colors cursor-pointer ${
                        stage.requireDealValue
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <Check size={11} className={stage.requireDealValue ? 'text-emerald-600' : 'text-slate-400'} />
                      <span>Require Deal Value</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: TEAMS & DEPARTMENTS                               */}
      {/* ======================================================== */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 size={17} className="text-purple-600" />
                  <span>Departments, Squads & Regional Coverage</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Organize sales representatives into specialized pods with assigned team leads, quota targets, and territory rules.
                </p>
              </div>

              <button
                onClick={() => setShowAddDeptModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Add Department</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-purple-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{dept.name}</h3>
                        <span className="text-[11px] font-bold text-slate-400">{dept.id}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                        {dept.memberCount} Team Members
                      </span>
                    </div>

                    {/* Team Lead Info */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                        {dept.leadAvatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-extrabold text-slate-900 block truncate">
                          Lead: {dept.leadName}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {dept.leadEmail}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                        Pod Supervisor
                      </span>
                    </div>

                    {/* Territories */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Assigned Territories
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dept.territories.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                          >
                            <MapPin size={9} className="text-slate-400" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Routing Logic */}
                    <div className="text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Auto-Routing: </span>
                      {dept.routingMode}
                    </div>
                  </div>

                  {/* Footer Quota */}
                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Monthly Pod Target</span>
                      <span className="font-black text-slate-900">
                        ₹{(dept.monthlyTarget / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>
                    <button
                      onClick={() => showToast(`Department details opened for ${dept.name}`)}
                      className="text-xs font-extrabold text-purple-700 hover:underline cursor-pointer"
                    >
                      Manage Members →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SALES TARGETS                                     */}
      {/* ======================================================== */}
      {activeTab === 'targets' && (
        <div className="space-y-6">
          {/* Targets Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
                  Quarterly Attainment Pace
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {selectedFiscalQuarter}
                </h2>
                <p className="text-xs text-slate-300 mt-1 font-medium max-w-xl">
                  Enterprise-wide cumulative revenue quota pacing against confirmed closed deals and weighted pipeline forecast.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedFiscalQuarter}
                  onChange={(e) => setSelectedFiscalQuarter(e.target.value)}
                  className="bg-slate-800 text-white text-xs font-bold border border-slate-700 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="Q3 FY 2026-27 (Oct - Dec)">Q3 FY 2026-27 (Oct - Dec)</option>
                  <option value="Q4 FY 2026-27 (Jan - Mar)">Q4 FY 2026-27 (Jan - Mar)</option>
                  <option value="Full Annual FY 2026-27">Full Annual FY 2026-27</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/80 relative z-10">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">Total Organization Quota</span>
                <span className="text-2xl font-black text-white font-mono">
                  ₹{(totalTargetQuota / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">Realized Closed Revenue</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{(totalAchievedQuota / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">Overall Attainment</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white font-mono">{quotaAttainmentPct}%</span>
                  <span className="text-xs font-bold text-emerald-400">On Track</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-3 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(quotaAttainmentPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Reps Quota Allocation Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Individual Representative Quotas & Attainment
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Adjust individual monthly targets and monitor performance against quota milestones.
                </p>
              </div>

              <button
                onClick={() => {
                  setUsers((prev) =>
                    prev.map((u) => ({
                      ...u,
                      quota: Math.round(u.quota * 1.1),
                    }))
                  );
                  showToast('Applied +10% festive quota uplift across all sales reps!');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                +10% Seasonal Bulk Uplift
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Sales Rep</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Monthly Target (₹)</th>
                    <th className="pb-3">Closed Value</th>
                    <th className="pb-3">Pacing Progress</th>
                    <th className="pb-3 text-right pr-2">Attainment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.filter((u) => u.quota > 0).map((u) => {
                    const pct = Math.round((u.quotaAchieved / u.quota) * 100);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl ${u.avatarBg} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                              {u.avatar}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block">{u.name}</span>
                              <span className="text-[10px] text-slate-400">{u.role}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 text-slate-600 font-semibold text-[11px]">
                          {u.department}
                        </td>

                        {/* Editable Target */}
                        <td className="py-3.5">
                          <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                            <span>₹</span>
                            <input
                              type="number"
                              step="50000"
                              value={u.quota}
                              onChange={(e) => handleUpdateUserQuota(u.id, e.target.value)}
                              className="w-24 bg-slate-50 hover:bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono font-bold focus:outline-none"
                            />
                          </div>
                        </td>

                        <td className="py-3.5 font-bold font-mono text-emerald-700">
                          ₹{(u.quotaAchieved / 100000).toFixed(1)}L
                        </td>

                        {/* Visual Progress */}
                        <td className="py-3.5">
                          <div className="w-32 sm:w-40 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 90 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 text-right pr-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              pct >= 90
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : pct >= 60
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {pct}% ({pct >= 90 ? 'Exceeding' : pct >= 60 ? 'On Track' : 'Attention'})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: NOTIFICATIONS                                     */}
      {/* ======================================================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Slack & Webhook Settings Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <MessageSquare size={18} />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Real-Time Slack & Webhook Dispatcher
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Broadcast deal milestones, high-value inquiries, and urgent SLA alerts to team channels.
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestSlackWebhook}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Send size={13} />
                <span>Send Test Ping</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Incoming Webhook URL
                </label>
                <input
                  type="text"
                  value={slackWebhookUrl}
                  onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Target Slack / Teams Channel
                </label>
                <input
                  type="text"
                  value={slackChannelName}
                  onChange={(e) => setSlackChannelName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">
                  Quiet Hours (10:00 PM - 08:00 AM IST)
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  • Suppresses non-critical push notifications outside business hours
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuietHoursEnabled(!quietHoursEnabled);
                  showToast(`Quiet hours ${!quietHoursEnabled ? 'Enabled' : 'Disabled'}.`);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  quietHoursEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    quietHoursEnabled ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Granular Events Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                Multi-Channel Event Trigger Matrix
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Toggle delivery channels for each specific operational and security trigger.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">System Event</th>
                    <th className="pb-3 text-center">In-App</th>
                    <th className="pb-3 text-center">Work Email</th>
                    <th className="pb-3 text-center">WhatsApp API</th>
                    <th className="pb-3 text-center">Slack / Teams</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-2">
                        <span className="font-extrabold text-slate-900 block text-xs">{n.event}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{n.desc}</span>
                      </td>

                      {/* In-App Toggle */}
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleToggleNotificationChannel(n.id, 'inApp')}
                          className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                            n.inApp ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {n.inApp ? <Check size={13} /> : <X size={13} />}
                        </button>
                      </td>

                      {/* Email Toggle */}
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleToggleNotificationChannel(n.id, 'email')}
                          className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                            n.email ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {n.email ? <Check size={13} /> : <X size={13} />}
                        </button>
                      </td>

                      {/* WhatsApp Toggle */}
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleToggleNotificationChannel(n.id, 'whatsapp')}
                          className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                            n.whatsapp ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {n.whatsapp ? <Check size={13} /> : <X size={13} />}
                        </button>
                      </td>

                      {/* Slack Toggle */}
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleToggleNotificationChannel(n.id, 'slack')}
                          className={`w-6 h-6 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer ${
                            n.slack ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {n.slack ? <Check size={13} /> : <X size={13} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: SECURITY                                          */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Card A: 2FA & Password Policy */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Lock size={18} />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Authentication, 2FA & Password Governance
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Enforce strict identity validation and regulatory access standards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 2FA Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-700">
                  Two-Factor Authentication (2FA) Policy
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'mandatory_all', title: 'Mandatory for All Users', desc: 'All team members must setup 2FA upon first login.' },
                    { id: 'admins_only', title: 'Mandatory for Admins & Managers Only', desc: 'Standard reps can optionally enable 2FA.' },
                    { id: 'optional', title: 'Optional (Self-Enrolled)', desc: 'Users choose whether to enable 2FA on profile page.' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        security.twoFactorPolicy === opt.id
                          ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="twoFactorPolicy"
                        checked={security.twoFactorPolicy === opt.id}
                        onChange={() => {
                          setSecurity({ ...security, twoFactorPolicy: opt.id });
                          showToast(`2FA policy updated to "${opt.title}".`);
                        }}
                        className="mt-0.5 accent-emerald-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{opt.title}</span>
                        <span className="text-[11px] text-slate-500">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Password Complexity */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Key size={14} className="text-slate-500" />
                  <span>Password Complexity Constraints</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Minimum Password Length:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {security.minPasswordLength} Characters
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Mandatory Password Rotation:</span>
                    <span className="font-bold text-slate-900">Every 90 Days</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Prevent Reuse of Past Passwords:</span>
                    <span className="font-bold text-slate-900">Last 3 Passwords</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Max Failed Login Attempts:</span>
                    <span className="font-bold text-rose-600">5 Attempts (Lock for 30m)</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 font-semibold">Idle Session Auto-Timeout:</span>
                    <select
                      value={security.sessionTimeoutMinutes}
                      onChange={(e) => {
                        setSecurity({ ...security, sessionTimeoutMinutes: Number(e.target.value) });
                        showToast(`Session timeout set to ${e.target.value} minutes.`);
                      }}
                      className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={60}>60 Minutes</option>
                      <option value={240}>4 Hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: IP Whitelisting & Network Restrictions */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Laptop size={17} className="text-emerald-600" />
                  <span>Network Access & IP Whitelisting</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Restrict login attempts to approved static IP ranges or corporate VPN gateways.
                </p>
              </div>

              <button
                onClick={() => setShowAddIpModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Whitelist CIDR</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {security.whitelistedIps.map((ip) => (
                <div
                  key={ip.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-900 block">{ip.cidr}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {ip.label} • Added by {ip.addedBy}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteWhitelistedIp(ip.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove rule"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card C: Emergency Access Revocation */}
          <div className="bg-rose-50/60 rounded-3xl border border-rose-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-rose-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-600" />
                <span>Emergency Session Invalidation</span>
              </h3>
              <p className="text-xs text-rose-700 font-medium mt-0.5 max-w-xl">
                Immediately terminates all active browser sessions and API access tokens across all {users.length} users in case of security breach or credential leak.
              </p>
            </div>

            <button
              onClick={() => setShowRevokeSessionsModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer shrink-0"
            >
              Revoke All Active Sessions
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 8: AUDIT LOGS                                        */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Activity size={17} className="text-emerald-600" />
                <span>Immutable Security & System Audit Ledger</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Cryptographically tracked record of authentication events, lead reallocations, and sensitive data exports.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSimulateAuditLog}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles size={13} className="text-emerald-600" />
                <span>Simulate Event</span>
              </button>

              <button
                onClick={handleExportAuditCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>

          {/* Audit Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search actor, action, IP, location..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <Search size={14} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Module:</span>
                <select
                  value={auditModuleFilter}
                  onChange={(e) => setAuditModuleFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="All">All Modules</option>
                  <option value="Reports & Analytics">Reports & Analytics</option>
                  <option value="Pipeline Settings">Pipeline Settings</option>
                  <option value="Deals Pipeline">Deals Pipeline</option>
                  <option value="User Administration">User Administration</option>
                  <option value="Security & Auth">Security & Auth</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Severity:</span>
                <select
                  value={auditSeverityFilter}
                  onChange={(e) => setAuditSeverityFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="All">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Timestamp</th>
                  <th className="pb-3">Actor & Role</th>
                  <th className="pb-3">Action Performed</th>
                  <th className="pb-3">Module</th>
                  <th className="pb-3">IP / Location</th>
                  <th className="pb-3 text-right pr-2">Severity & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No audit events match your filter query.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3 pl-2 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {log.userAvatar}
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs">{log.user}</span>
                            <span className="text-[10px] text-slate-400">{log.userRole}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 font-semibold text-slate-800 max-w-xs truncate">
                        {log.action}
                      </td>

                      <td className="py-3">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {log.module}
                        </span>
                      </td>

                      <td className="py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.ip}
                      </td>

                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => setSelectedAuditLogForModal(log)}
                          className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border cursor-pointer transition-transform hover:scale-105 ${
                            log.severity === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : log.severity === 'warning'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          View Payload →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: INVITE USER                                     */}
      {/* ======================================================== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Invite New Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="r.verma@leadflow.io"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">System Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="Senior Enterprise AE">Senior Enterprise AE</option>
                    <option value="Commercial Closer">Commercial Closer</option>
                    <option value="Inbound SDR Specialist">Inbound SDR Specialist</option>
                    <option value="Outbound AE">Outbound AE</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Monthly Quota (₹)</label>
                  <input
                    type="number"
                    value={newUser.quota}
                    onChange={(e) => setNewUser({ ...newUser, quota: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Assigned Department</label>
                <select
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD LEAD SOURCE                                 */}
      {/* ======================================================== */}
      {showAddSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Add New Inbound Source</h3>
              <button
                onClick={() => setShowAddSourceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSourceSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Source Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meta Instagram Ads 2026"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Channel Category</label>
                <select
                  value={newSource.category}
                  onChange={(e) => setNewSource({ ...newSource, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="Paid Social Ads">Paid Social Ads</option>
                  <option value="Organic Search (SEO)">Organic Search (SEO)</option>
                  <option value="Marketplace Webhook">Marketplace Webhook</option>
                  <option value="Partner Referral">Partner Referral</option>
                  <option value="Offline Event / Expo">Offline Event / Expo</option>
                  <option value="Outbound Campaign">Outbound Campaign</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">UTM Source Tag</label>
                <input
                  type="text"
                  placeholder="e.g. instagram_story_ads"
                  value={newSource.utmSource}
                  onChange={(e) => setNewSource({ ...newSource, utmSource: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSourceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Create Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD DEPARTMENT                                  */}
      {/* ======================================================== */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Add New Department / Squad</h3>
              <button
                onClick={() => setShowAddDeptModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDeptSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government & PSU Strategic Accounts"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Department Lead</label>
                  <select
                    value={newDept.leadName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const user = users.find((u) => u.name === name);
                      setNewDept({
                        ...newDept,
                        leadName: name,
                        leadEmail: user ? user.email : 'lead@leadflow.io',
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Monthly Target (₹)</label>
                  <input
                    type="number"
                    value={newDept.monthlyTarget}
                    onChange={(e) => setNewDept({ ...newDept, monthlyTarget: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Coverage Regions (Comma-Separated)</label>
                <input
                  type="text"
                  placeholder="Pan India, NCR Hub, Bengaluru"
                  value={newDept.territories}
                  onChange={(e) => setNewDept({ ...newDept, territories: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 cursor-pointer shadow-xs"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ADD WHITELISTED IP                              */}
      {/* ======================================================== */}
      {showAddIpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Whitelist Static IP / CIDR</h3>
              <button
                onClick={() => setShowAddIpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddIpSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Office / Gateway Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore Tech Hub Leased Line"
                  value={newIpInput.label}
                  onChange={(e) => setNewIpInput({ ...newIpInput, label: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">IP Address or CIDR Range *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 103.45.67.12/32 or 14.139.10.0/24"
                  value={newIpInput.cidr}
                  onChange={(e) => setNewIpInput({ ...newIpInput, cidr: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddIpModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Add IP Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: REVOKE ALL ACTIVE SESSIONS CONFIRMATION         */}
      {/* ======================================================== */}
      {showRevokeSessionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2.5 rounded-2xl bg-rose-100">
                <AlertTriangle size={24} />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">Revoke All Active Sessions?</h3>
                <span className="text-xs text-rose-600 font-bold">Irreversible Security Action</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              This action will immediately terminate all active browser sessions, mobile app tokens, and API sessions for all {users.length} users. Everyone will be redirected to the login screen.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRevokeSessionsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleForceRevokeAllSessions}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                Yes, Invalidate All Sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: AUDIT LOG PAYLOAD INSPECTOR                     */}
      {/* ======================================================== */}
      {selectedAuditLogForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Audit Event Payload ({selectedAuditLogForModal.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditLogForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Actor Name</span>
                  <span className="font-extrabold text-slate-900">{selectedAuditLogForModal.user}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Actor Email</span>
                  <span className="font-medium text-slate-600">{selectedAuditLogForModal.userEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Timestamp</span>
                  <span className="font-mono font-bold text-slate-800">{selectedAuditLogForModal.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">IP & Origin</span>
                  <span className="font-mono font-bold text-slate-800">{selectedAuditLogForModal.ip}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Action Summary
                </span>
                <p className="font-bold text-slate-800 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  {selectedAuditLogForModal.action}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Full Event Details & Metadata
                </span>
                <p className="text-slate-600 p-2.5 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed font-medium">
                  {selectedAuditLogForModal.details}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Raw JSON Event Record
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedAuditLogForModal, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAuditLogForModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
