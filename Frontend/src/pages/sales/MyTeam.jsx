import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGet } from '../../hooks';
import {
  Users, Shield, Award, Target, TrendingUp, Mail, Phone,
  Search, CheckCircle2, Flame, ArrowUpRight, BarChart3,
  Layers, ChevronRight, UserCheck, Calendar, Filter, Sparkles, RefreshCw
} from 'lucide-react';

export default function MyTeam() {
  const { user } = useAuth();
  const currentManagerName = user?.name || '';

  // ─── TanStack Query: Fetch Live Assigned Team from Backend ────────────────────
  const { data: myTeamData, isLoading, refetch: refetchTeam } = useGet(['my-team'], '/teams/my-team');

  const teamData = useMemo(() => {
    if (myTeamData?.success && myTeamData?.team) {
      const t = myTeamData.team;
      return {
        id: t._id,
        name: t.name,
        departmentName: t.department?.name || 'Enterprise Sales',
        targetQuota: t.targetQuota || 2500000,
        description: t.description || 'Specialized closing unit.',
        manager: t.manager
          ? {
              name: t.manager.name,
              role: t.manager.role,
              email: t.manager.email,
              phone: t.manager.phone || '+91 98112 34567',
              avatar: t.manager.name
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
              color: 'bg-emerald-600',
            }
          : {
              name: currentManagerName || 'Team Manager',
              role: 'Sales Manager',
              email: user?.email || '',
              phone: '+91 98112 34567',
              avatar: 'TM',
              color: 'bg-emerald-600',
            },
        members:
          Array.isArray(t.members)
            ? t.members.map((m, idx) => ({
                id: m._id,
                name: m.name,
                role: m.role === 'sales_person' ? 'Commercial Closer' : m.role,
                email: m.email,
                phone: m.phone || '+91 98000 00000',
                avatar: m.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase(),
                color: ['bg-blue-600', 'bg-amber-600', 'bg-purple-600', 'bg-teal-600'][idx % 4],
                revenueWon: 0,
                quotaTarget: 1000000,
                dealsWon: 0,
                totalDeals: 0,
                winRate: 0,
                activeLeads: 0,
                status: 'Ready for Leads',
                statusColor: 'text-slate-700 bg-slate-50 border-slate-200',
              }))
            : [],
      };
    }
    return null;
  }, [myTeamData, currentManagerName, user]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // KPI Computations (Safe against null teamData)
  const membersList = useMemo(() => teamData?.members || [], [teamData]);

  const totalClosedRevenue = useMemo(() => {
    return membersList.reduce((acc, m) => acc + (m.revenueWon || 0), 0);
  }, [membersList]);

  const teamQuotaAttainment = useMemo(() => {
    if (!teamData?.targetQuota) return 0;
    return Math.min(100, Math.round((totalClosedRevenue / teamData.targetQuota) * 100));
  }, [totalClosedRevenue, teamData]);

  const totalActiveDeals = useMemo(() => {
    return membersList.reduce((acc, m) => acc + (m.activeLeads || 0), 0);
  }, [membersList]);

  const avgTeamWinRate = useMemo(() => {
    if (membersList.length === 0) return 0;
    const totalWinRate = membersList.reduce((acc, m) => acc + (m.winRate || 0), 0);
    return Math.round(totalWinRate / membersList.length);
  }, [membersList]);

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return membersList.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        m.name?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'All' || m.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [membersList, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
        <RefreshCw size={16} className="animate-spin text-emerald-600" />
        <span>Loading assigned team...</span>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-400 shadow-2xs my-6">
        <Users size={44} className="mx-auto text-slate-300 mb-3" />
        <h3 className="text-base font-black text-slate-800">No Team Assigned</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Aapko abhi tak kisi sales team ka manager assign nahi kiya gaya hai. Admin portal se team assign hone ke baad aapki team yahan live display hogi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14 font-sans">
      {/* ─── 1. AMBIENT GLOW HERO BANNER ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-green-100/80 text-slate-800 shadow-sm p-6 sm:p-7 border border-emerald-200/90">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-emerald-300/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-80 h-80 bg-teal-300/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/90 border border-emerald-300/90 text-emerald-900 shadow-2xs">
                <Users size={13} className="text-emerald-700" />
                {teamData.departmentName}
              </span>
              <span className="text-xs text-emerald-400">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/70 border border-emerald-200/80 text-slate-700">
                <Shield size={12} className="text-emerald-600" />
                Led by You ({currentManagerName})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{teamData.name}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white tracking-normal">
                {teamData.members.length} Active Reps
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
              {teamData.description}
            </p>
          </div>

          {/* Quick Team Target Badge */}
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-3.5 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              <Target size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Quota Target</span>
              <span className="text-xl font-black text-slate-900 tracking-tight">₹{(teamData.targetQuota / 100000).toFixed(1)} Lakh</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. TEAM PERFORMANCE KPIS (4 VIBRANT CARDS - NO BOTTOM LINE) ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue Closed */}
        <div className="group relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp size={19} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
              Attained
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Closed Revenue</span>
            <div className="text-2xl font-black text-emerald-800 tracking-tight">
              ₹{(totalClosedRevenue / 100000).toFixed(2)}L
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-emerald-600">{teamQuotaAttainment}%</span>
              <span className="ml-1">of team monthly quota</span>
            </div>
          </div>
        </div>

        {/* Card 2: Team Members Count */}
        <div className="group relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Users size={19} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-800 border-blue-200">
              Assigned
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subordinate Reps</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {teamData.members.length} Closers
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-blue-600">100% active</span>
              <span className="ml-1">in your sales pod</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Funnel Deals */}
        <div className="group relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-teal-300 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Layers size={19} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-teal-50 text-teal-800 border-teal-200">
              Live Pipeline
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Deals</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalActiveDeals} Deals
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-teal-700">Currently in negotiation</span>
            </div>
          </div>
        </div>

        {/* Card 4: Avg Win Rate */}
        <div className="group relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg hover:border-purple-300 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Award size={19} />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-purple-50 text-purple-800 border-purple-200">
              Velocity
            </span>
          </div>
          <div className="mt-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Win Rate</span>
            <div className="text-2xl font-black text-purple-900 tracking-tight">
              {avgTeamWinRate}%
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-purple-700">+12% vs industry average</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. SEARCH & REPS TOOLBAR ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search member name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 sm:w-72 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Performance Badges</option>
            <option value="Top Closer">Top Closer</option>
            <option value="On Target">On Target</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing {filteredMembers.length} of {teamData.members.length} team members
        </span>
      </div>

      {/* ─── 4. TEAM MEMBERS CARDS GRID ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((rep) => {
          const quotaPercent = Math.min(100, Math.round((rep.revenueWon / rep.quotaTarget) * 100));

          return (
            <div
              key={rep.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 space-y-4 relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

              {/* Rep Header */}
              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${rep.color} text-white flex items-center justify-center font-black text-sm shadow-xs`}>
                    {rep.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">{rep.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{rep.role}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold">{rep.email}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border ${rep.statusColor}`}>
                  {rep.status}
                </span>
              </div>

              {/* Rep Quota Fulfillment Bar */}
              <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Quota Attainment</span>
                  <span className="font-black text-emerald-800">{quotaPercent}%</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-0.5">
                  <span>Won: ₹{(rep.revenueWon / 100000).toFixed(1)}L</span>
                  <span>Target: ₹{(rep.quotaTarget / 100000).toFixed(1)}L</span>
                </div>
              </div>

              {/* Performance Mini Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Deals Won</span>
                  <span className="text-sm font-black text-slate-900">{rep.dealsWon} / {rep.totalDeals}</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Win Rate</span>
                  <span className="text-sm font-black text-emerald-700">{rep.winRate}%</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Active Leads</span>
                  <span className="text-sm font-black text-blue-700">{rep.activeLeads}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={`tel:${rep.phone}`}
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 font-bold transition-colors"
                >
                  <Phone size={13} className="text-emerald-600" />
                  <span>Call Rep</span>
                </a>

                <a
                  href={`mailto:${rep.email}`}
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 font-bold transition-colors"
                >
                  <Mail size={13} className="text-emerald-600" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

