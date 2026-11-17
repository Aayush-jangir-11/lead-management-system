import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Users, Building2, User, Flame, ArrowUpRight, ArrowRight,
  Search, Phone, Mail, CheckCircle2, Sparkles, Filter, ExternalLink
} from 'lucide-react';
import { INITIAL_LEADS, getStatusBadge } from '../leads/LeadsHeaderStats';

export default function MySideLeadsSection({ currentSalesPerson = 'Ajay Sharma' }) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'hot' | 'closing'
  const [searchQuery, setSearchQuery] = useState('');

  // Top active leads contributing to Ajay Sharma's target
  const defaultAjayLeads = useMemo(() => {
    // Collect from INITIAL_LEADS and supplement with Ajay's active pipeline accounts
    const initialMatched = INITIAL_LEADS.filter((l) => l.assignedRep === currentSalesPerson);

    const extraHotLeads = [
      {
        id: 'LD-1021',
        name: 'Vikram Malhotra',
        title: 'CTO & Tech VP',
        company: 'CloudNova Systems',
        email: 'vikram.m@cloudnova.io',
        phone: '+91 98765 43210',
        value: 520000,
        status: 'Negotiation',
        priority: 'Urgent',
        score: 96,
        scoreGrade: 'Hot',
        quotaContribution: '+17.3%',
      },
      {
        id: 'LD-1022',
        name: 'Kavita Pillai',
        title: 'VP of Product Eng.',
        company: 'Nexus FinTech Labs',
        email: 'kavita@nexusfintech.com',
        phone: '+91 91234 56789',
        value: 350000,
        status: 'Proposal Sent',
        priority: 'High',
        score: 91,
        scoreGrade: 'Hot',
        quotaContribution: '+11.7%',
      },
      {
        id: 'LD-1023',
        name: 'Rohan Mehra',
        title: 'Head of Operations',
        company: 'Apex Retailers India',
        email: 'rohan.m@apexretail.in',
        phone: '+91 99887 76655',
        value: 180000,
        status: 'Qualified',
        priority: 'High',
        score: 87,
        scoreGrade: 'Hot',
        quotaContribution: '+6.0%',
      },
    ];

    const combined = [...initialMatched, ...extraHotLeads].map((lead) => ({
      ...lead,
      quotaContribution:
        lead.quotaContribution ||
        `+${((lead.value / 3000000) * 100).toFixed(1)}%`,
    }));

    return combined;
  }, [currentSalesPerson]);

  const filteredLeads = useMemo(() => {
    return defaultAjayLeads.filter((lead) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.status.toLowerCase().includes(q);

      let matchTab = true;
      if (filterTab === 'hot') {
        matchTab = lead.score >= 88 || lead.scoreGrade === 'Hot';
      } else if (filterTab === 'closing') {
        matchTab = lead.status === 'Negotiation' || lead.status === 'Proposal Sent';
      }

      return matchSearch && matchTab;
    });
  }, [defaultAjayLeads, searchQuery, filterTab]);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5 flex flex-col justify-between h-full">
      {/* 1. Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Users size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Target Driving Leads
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  {defaultAjayLeads.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Key accounts directly impacting your Q4 quota.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Flame size={12} className="text-amber-500" />
            <span>High Intent</span>
          </span>
        </div>

        {/* 2. Search & Tab Filter Strip */}
        <div className="pt-2.5 space-y-2">
          {/* Quick Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search target leads..."
              className="w-full pl-7 pr-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs transition-all"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Leads
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('hot')}
              className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                filterTab === 'hot'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hot Leads 🔥
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('closing')}
              className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                filterTab === 'closing'
                  ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Closing Soon
            </button>
          </div>
        </div>

        {/* 3. Scrollable List of Target Leads */}
        <div className="space-y-2.5 pt-2 max-h-[310px] overflow-y-auto pr-1">
          {filteredLeads.length === 0 ? (
            <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <Users size={20} className="mx-auto mb-1 text-slate-300" />
              <p className="text-xs font-bold">No leads matching filter</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const valueLakh = (lead.value / 100000).toFixed(2);
              const statusClass = getStatusBadge(lead.status);

              return (
                <div
                  key={lead.id}
                  className="group bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Top: Company & Value */}
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Building2 size={13} className="text-emerald-600 shrink-0" />
                        <span className="font-extrabold text-slate-900 text-xs truncate">
                          {lead.company}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md font-black text-xs bg-emerald-100 text-emerald-900 shrink-0">
                        ₹{valueLakh}L
                      </span>
                    </div>

                    {/* Contact Person */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <span className="flex items-center gap-1 truncate font-medium text-slate-700">
                        <User size={11} className="text-slate-400 shrink-0" />
                        <span>{lead.name}</span>
                        {lead.title && <span className="text-slate-400 truncate">({lead.title})</span>}
                      </span>
                      {lead.score && (
                        <span className="font-extrabold text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                          {lead.score} Hot
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Status & Quota Contribution Pill */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold border ${statusClass}`}
                    >
                      {lead.status}
                    </span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {lead.quotaContribution} Quota
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Footer Link */}
      <div className="pt-2 border-t border-slate-100">
        <Link
          to="/leads"
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
        >
          <span>View All Leads in Board</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
