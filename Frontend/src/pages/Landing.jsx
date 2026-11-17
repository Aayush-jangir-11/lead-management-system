import React, { useState } from "react";
import {
    ArrowUpRight, ArrowRight, ArrowDown, Check, Menu, X,
    Users, Target, ChartNoAxesCombined, Zap, Clock3,
    CircleCheck, Search, Bell, Plus, MoreHorizontal,
    Workflow, ShieldCheck, Sparkles, TrendingUp, Star,
    ChevronRight, BarChart3, Filter, CheckCircle2,
    Layers, MessageSquare, Flame, Award, Building2
} from "lucide-react";

export default function LeadLandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const companyLogos = [
        "OrbitLabs", "Acme Corp", "HyperFlow", "NexaTech", "StackPoint", "Horizon"
    ];

    return (
        <main className="min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">

            {/* ======================================================== */}
            {/* 1. FLOATING GLASS HEADER / NAVBAR                        */}
            {/* ======================================================== */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl transition-all">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

                    {/* Brand Logo */}
                    <a href="#home" className="flex items-center gap-3 group select-none">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-transform duration-300 group-hover:scale-105">
                            <Target size={22} className="stroke-[2.5]" />
                            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold tracking-tight text-slate-900">
                                lead<span className="text-emerald-600">flow.</span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 -mt-1 hidden sm:block">
                                CRM & Pipeline
                            </span>
                        </div>
                    </a>

                    {/* Navigation Links */}
                    <nav className="hidden items-center gap-1 md:flex rounded-full border border-slate-200/80 bg-slate-50/70 px-4 py-1.5 shadow-2xs">
                        <a href="#features" className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-white transition-all">Features</a>
                        <a href="#pipeline-demo" className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-white transition-all">Pipeline</a>
                        <a href="#workflow" className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-white transition-all">Workflow</a>
                        <a href="#metrics" className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-white transition-all">Metrics</a>
                    </nav>

                    {/* Actions */}
                    <div className="hidden items-center gap-3.5 md:flex">
                        <a
                            href="/login"
                            className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl transition-colors"
                        >
                            Sign In
                        </a>
                        <a
                            href="/"
                            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5"
                        >
                            Get Started Free
                            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:hidden"
                        aria-label="Toggle navigation"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Dropdown */}
                {menuOpen && (
                    <div className="border-t border-slate-100 bg-white/95 backdrop-blur-xl p-5 md:hidden space-y-2 shadow-xl animate-in fade-in duration-150">
                        <a onClick={() => setMenuOpen(false)} href="#features" className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">Features</a>
                        <a onClick={() => setMenuOpen(false)} href="#pipeline-demo" className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">Pipeline Demo</a>
                        <a onClick={() => setMenuOpen(false)} href="#workflow" className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">How It Works</a>
                        <a onClick={() => setMenuOpen(false)} href="#metrics" className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">Metrics</a>
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <a href="/login" className="block rounded-xl border border-slate-200 py-2.5 text-center text-sm font-bold text-slate-700">Sign In</a>
                            <a href="/" className="block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-center text-sm font-bold text-white shadow-xs">Get Started Free</a>
                        </div>
                    </div>
                )}
            </header>

            {/* ======================================================== */}
            {/* 2. HERO SECTION (Subtle Radial Mesh & Centered Luxury)   */}
            {/* ======================================================== */}
            <section id="home" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50/40 to-white pt-16 pb-20 sm:pt-24 sm:pb-28">

                {/* Ambient Glow Orbs */}
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-emerald-200/40 via-teal-100/30 to-transparent blur-[120px] -z-10" />
                <div className="pointer-events-none absolute top-40 right-10 h-72 w-72 rounded-full bg-emerald-100/40 blur-[90px] -z-10" />

                <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center flex flex-col items-center">

                    {/* Premium Announcement Pill */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-white/90 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-emerald-300 transition-colors cursor-pointer group">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-emerald-800">LeadFlow 2.0</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 group-hover:text-emerald-700">Smart Pipeline Intelligence</span>
                        <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>

                    {/* Master Headline */}
                    <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-[70px] leading-[1.08]">
                        Good leads.{" "}
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                            Better deals.
                        </span>
                        <br />
                        Zero chaos.
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                        The modern CRM built for high-velocity sales teams. Capture incoming prospects, prioritize deals with visual pipeline stages, and close revenue faster than ever.
                    </p>

                    {/* CTA Button Duo */}
                    <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
                        <a
                            href="/dashboard"
                            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-700/25 transition-all hover:shadow-2xl hover:shadow-emerald-700/35 hover:-translate-y-0.5"
                        >
                            Start Managing Leads Free
                            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                        <a
                            href="#pipeline-demo"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-300/90 bg-white/90 backdrop-blur-md px-7 py-4 text-sm font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900"
                        >
                            Watch 2-Min Demo <ArrowRight size={16} />
                        </a>
                    </div>

                    {/* Social Proof Star Review */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-slate-500">
                        <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={15} fill="currentColor" stroke="none" />
                            ))}
                            <span className="ml-1 font-bold text-slate-800">4.9/5</span>
                        </div>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <div className="flex items-center gap-2 font-medium">
                            <span className="font-semibold text-slate-800">1,200+ teams</span> closed over ₹40Cr in deals last month
                        </div>
                    </div>
                </div>

                {/* ======================================================== */}
                {/* FULL-WIDTH ELEVATED SHOWCASE CARD (The "WOW" Factor)     */}
                {/* ======================================================== */}
                {/* ======================================================== */}
                {/* REALISTIC HIGH-FIDELITY CRM DASHBOARD PREVIEW            */}
                {/* ======================================================== */}
                <div id="pipeline-demo" className="mx-auto max-w-6xl px-5 sm:px-8 mt-16 sm:mt-20">
                    <div className="relative rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-emerald-950/10 ring-1 ring-slate-900/5 overflow-hidden">

                        {/* Top Browser Window Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-6">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-rose-400/90" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400/90" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400/90" />
                                </div>
                                <div className="hidden sm:flex items-center gap-1.5 ml-4 px-3 py-1 bg-white border border-slate-200/80 rounded-lg text-[11px] font-mono text-slate-500 shadow-2xs">
                                    <span className="text-emerald-600 font-bold">https://</span>app.leadflow.io/dashboard
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                    Realtime Workspace
                                </span>
                                <a
                                    href="/dashboard"
                                    className="hidden sm:inline-flex text-[11px] font-bold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 px-3 py-1 rounded-lg transition-colors"
                                >
                                    Open Full View ↗
                                </a>
                            </div>
                        </div>

                        {/* Dashboard Inner Canvas */}
                        <div className="p-4 sm:p-7 bg-slate-50/40">

                            {/* Welcome Header Bar inside Preview */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                        Good Morning, Ajay! <span className="inline-block text-xl">👋</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Here's what's happening with your leads and pipeline today.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 shadow-2xs">
                                        <span>Oct 1 – Oct 31, 2025</span>
                                    </div>
                                    <a
                                        href="/dashboard"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                                    >
                                        <Plus size={14} /> Add Lead
                                    </a>
                                </div>
                            </div>

                            {/* 4 KPI Metrics Tiles with Trend Waves */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">

                                {/* Total Leads */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Leads</span>
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                            <Users size={15} />
                                        </div>
                                    </div>
                                    <h4 className="text-2xl font-extrabold text-slate-900 mt-1">248</h4>
                                    <div className="mt-2 flex items-center text-[11px] font-bold text-emerald-600">
                                        <span>↑ 12%</span>
                                        <span className="text-slate-400 font-normal ml-1">vs. last month</span>
                                    </div>
                                </div>

                                {/* Qualified Leads */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Qualified</span>
                                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                            <Target size={15} />
                                        </div>
                                    </div>
                                    <h4 className="text-2xl font-extrabold text-slate-900 mt-1">86</h4>
                                    <div className="mt-2 flex items-center text-[11px] font-bold text-emerald-600">
                                        <span>↑ 18%</span>
                                        <span className="text-slate-400 font-normal ml-1">vs. last month</span>
                                    </div>
                                </div>

                                {/* Converted Leads */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Converted</span>
                                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                                            <Zap size={15} />
                                        </div>
                                    </div>
                                    <h4 className="text-2xl font-extrabold text-slate-900 mt-1">42</h4>
                                    <div className="mt-2 flex items-center text-[11px] font-bold text-emerald-600">
                                        <span>↑ 25%</span>
                                        <span className="text-slate-400 font-normal ml-1">vs. last month</span>
                                    </div>
                                </div>

                                {/* Lost Leads */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lost Leads</span>
                                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                                            <Clock3 size={15} />
                                        </div>
                                    </div>
                                    <h4 className="text-2xl font-extrabold text-slate-900 mt-1">28</h4>
                                    <div className="mt-2 flex items-center text-[11px] font-bold text-rose-600">
                                        <span>↓ 5%</span>
                                        <span className="text-slate-400 font-normal ml-1">improved retention</span>
                                    </div>
                                </div>

                            </div>

                            {/* Kanban Pipeline Columns */}
                            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <Workflow size={15} className="text-emerald-600" />
                                            Live Sales Pipeline Funnel
                                        </h5>
                                        <p className="text-[11px] text-slate-400">Track and advance leads across every stage in real-time</p>
                                    </div>
                                    <a href="/dashboard" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center">
                                        Manage Pipeline <ArrowRight size={13} className="ml-1" />
                                    </a>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

                                    {/* Column 1: New */}
                                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-blue-500" /> New Leads
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">102</span>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-colors">
                                            <p className="text-xs font-bold text-slate-800">Rahul Verma</p>
                                            <p className="text-[10px] text-slate-500">Acme Corp • ₹85,000</p>
                                            <span className="mt-2 inline-block text-[9px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">2h ago</span>
                                        </div>
                                    </div>

                                    {/* Column 2: Contacted */}
                                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-teal-500" /> Contacted
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">78</span>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs hover:border-teal-300 transition-colors">
                                            <p className="text-xs font-bold text-slate-800">Neha Gupta</p>
                                            <p className="text-[10px] text-slate-500">Global Media • ₹64,000</p>
                                            <span className="mt-2 inline-block text-[9px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">3h ago</span>
                                        </div>
                                    </div>

                                    {/* Column 3: Qualified */}
                                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Qualified
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">46</span>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors">
                                            <p className="text-xs font-bold text-slate-800">Vikram Joshi</p>
                                            <p className="text-[10px] text-slate-500">WebCreators • ₹1,20,000</p>
                                            <span className="mt-2 inline-block text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">4h ago</span>
                                        </div>
                                    </div>

                                    {/* Column 4: Converted */}
                                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-600" /> Converted
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">12</span>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200 shadow-2xs hover:border-emerald-400 transition-colors">
                                            <p className="text-xs font-bold text-slate-800">Arjun Mehta</p>
                                            <p className="text-[10px] text-slate-500">Growth Corp • ₹1,50,000</p>
                                            <span className="mt-2 inline-block text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Won Deal 🏆</span>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Company Logos Strip */}
                <div className="mx-auto max-w-6xl px-5 sm:px-8 mt-16 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
                        Trusted by fast-growing sales organizations
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all">
                        {companyLogos.map((logo) => (
                            <span key={logo} className="text-sm font-extrabold tracking-tight text-slate-700 flex items-center gap-1.5">
                                <Building2 size={16} className="text-emerald-600" />
                                {logo}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======================================================== */}
            {/* 3. BENTO-GRID FEATURES SECTION                            */}
            {/* ======================================================== */}
            <section id="features" className="px-5 py-20 sm:px-8 lg:py-28 bg-white border-t border-slate-100">
                <div className="mx-auto max-w-7xl">

                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                            Everything you need to <span className="text-emerald-600">close more deals.</span>
                        </h2>
                        <p className="mt-4 text-sm text-slate-600">
                            Replace messy spreadsheets and clunky legacy tools with one elegant, high-performance workspace.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-6xl mx-auto">
                        {[
                            {
                                icon: Users,
                                title: "Lead Organization & Intelligence",
                                desc: "Capture prospect info, custom tags, company size, and previous conversations in one unified, searchable view.",
                                badge: "Core Feature",
                            },
                            {
                                icon: Workflow,
                                title: "Visual Kanban Funnel",
                                desc: "Drag-and-drop deals across customized stages. Never guess what step to take next with clear pipeline visibility.",
                                badge: "Interactive",
                            },
                            {
                                icon: ChartNoAxesCombined,
                                title: "Revenue Forecasting & Analytics",
                                desc: "Real-time visual charts on conversion rates, sales cycle duration, and team revenue velocity.",
                                badge: "Analytics",
                            },
                            {
                                icon: Clock3,
                                title: "Smart Follow-Up Reminders",
                                desc: "Automated task triggers ensure every prospect receives timely follow-ups without manual tracking.",
                                badge: "Automation",
                            },
                        ].map((feat) => {
                            const Icon = feat.icon;
                            return (
                                <div
                                    key={feat.title}
                                    className="group relative rounded-3xl border border-slate-200/90 bg-slate-50/60 p-8 sm:p-9 transition-all duration-300 hover:bg-white hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-2xs">
                                            <Icon size={24} />
                                        </div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                                            {feat.badge}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-2.5">{feat.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>

                                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                                        Explore feature <ArrowUpRight size={14} className="ml-1.5" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ======================================================== */}
            {/* 4. WORKFLOW / AUTOMATION ENGINE (Reimagined & Premium)    */}
            {/* ======================================================== */}
            <section id="workflow" className="relative overflow-hidden bg-gradient-to-b from-slate-50/70 via-emerald-50/25 to-white px-5 py-24 sm:px-8 lg:py-32 border-y border-slate-100">

                {/* Ambient Glow */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-emerald-100/30 blur-[130px] -z-10" />

                <div className="mx-auto max-w-7xl">

                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 bg-emerald-100/70 border border-emerald-200/80 px-4 py-1.5 rounded-full shadow-2xs">
                            <Sparkles size={13} className="text-emerald-600" /> Automated Workflow Engine
                        </span>
                        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                            From first hello to signed deal, <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                                completely on autopilot.
                            </span>
                        </h2>
                        <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto">
                            No more manual data entry or forgotten follow-ups. LeadFlow routes, qualifies, and schedules activities automatically so your reps can focus purely on closing.
                        </p>
                    </div>

                    {/* Connected 4-Step Interactive Horizontal Pipeline Journey (2x2 Layout with wide width & compact height) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto relative">

                        {/* Step 1 */}
                        <div className="relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                                            <Layers size={20} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                STEP 01
                                            </span>
                                            <h3 className="text-base font-bold text-slate-900 mt-0.5">Omnichannel Capture</h3>
                                        </div>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Instant Webhook
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Incoming leads from website forms, WhatsApp, referrals, and ads sync into one unified feed within 0.2 seconds.
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Auto-Source Tagging</span>
                                <span className="font-semibold text-emerald-600">0.2s sync time</span>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-2xs">
                                            <Target size={20} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                STEP 02
                                            </span>
                                            <h3 className="text-base font-bold text-slate-900 mt-0.5">Smart Qualification</h3>
                                        </div>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60">
                                        <Flame size={12} className="text-teal-600" />
                                        Score: 94/100 (Hot)
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Lead score algorithms instantly analyze deal value, company scale, and budget to filter high-intent prospects.
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">AI Prospect Scoring</span>
                                <span className="font-semibold text-teal-600">Instant qualification</span>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                STEP 03
                                            </span>
                                            <h3 className="text-base font-bold text-slate-900 mt-0.5">Rep Auto-Assignment</h3>
                                        </div>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                                        <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[9px] font-bold">AS</span>
                                        Assigned to Ajay
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Intelligent round-robin routing assigns the deal to the best available sales executive with automated notifications.
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Round-Robin Balancing</span>
                                <span className="font-semibold text-emerald-600">Zero drop-off</span>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative rounded-2xl border border-emerald-300/90 bg-gradient-to-br from-white via-emerald-50/30 to-white p-5 sm:p-6 shadow-md hover:shadow-xl hover:border-emerald-400 transition-all duration-300 group flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                                            <Award size={20} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                                WON DEAL
                                            </span>
                                            <h3 className="text-base font-bold text-slate-900 mt-0.5">Closed & Revenue Won</h3>
                                        </div>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-extrabold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                                        <CheckCircle2 size={13} className="text-emerald-700" />
                                        ₹1,20,000 Won
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Automated reminders, calendar booking, and 1-click proposal templates turn opportunities into revenue smoothly.
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Contract Executed</span>
                                <span className="font-bold text-emerald-700">+28% Speed</span>
                            </div>
                        </div>

                    </div>

                    {/* Realtime Lead Flow Stream (Clean Pipeline Flow, Zero Heavy Boxes, Flow Arrows) */}
                    <div className="mt-16 max-w-6xl mx-auto">
                        
                        {/* Section Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-slate-200/80 gap-4">
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    See how an incoming lead flows in real time
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    From submission to conditional SLA routing and instant rep dispatch in sub-second speed.
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full self-start md:self-auto">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                All Automations Active & Healthy
                            </div>
                        </div>

                        {/* Connected 3-Stage Pipeline Flow - Simple & Clean */}
                        <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-4">

                            {/* STEP 1: TRIGGER EVENT */}
                            <div className="w-full lg:flex-1 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    STEP 1 • TRIGGER EVENT
                                </span>
                                <h4 className="text-base font-bold text-slate-900 mt-1">
                                    Form Submission
                                </h4>
                                <p className="text-xs text-slate-600 mt-1">
                                    "Acme Corp" filled enterprise quote
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-semibold text-emerald-600">₹85,000 Deal</span>
                                    <span>•</span>
                                    <span>Triggered at 10:42 AM</span>
                                </div>
                            </div>

                            {/* ARROW 1 */}
                            <div className="flex shrink-0 items-center justify-center text-slate-400 py-1 lg:py-0">
                                <ArrowRight size={20} className="hidden lg:block text-slate-400" />
                                <ArrowDown size={20} className="block lg:hidden text-slate-400" />
                            </div>

                            {/* STEP 2: CONDITIONAL ROUTING */}
                            <div className="w-full lg:flex-1 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    STEP 2 • CONDITIONAL ROUTING
                                </span>
                                <h4 className="text-base font-bold text-slate-900 mt-1">
                                    Value &gt; ₹50,000
                                </h4>
                                <p className="text-xs text-slate-600 mt-1">
                                    Enterprise SLA Tier Assigned
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-semibold text-emerald-600">Condition Matched</span>
                                    <span>•</span>
                                    <span>Hot Score: 94/100</span>
                                </div>
                            </div>

                            {/* ARROW 2 */}
                            <div className="flex shrink-0 items-center justify-center text-slate-400 py-1 lg:py-0">
                                <ArrowRight size={20} className="hidden lg:block text-slate-400" />
                                <ArrowDown size={20} className="block lg:hidden text-slate-400" />
                            </div>

                            {/* STEP 3: OUTCOME EXECUTED */}
                            <div className="w-full lg:flex-1 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    STEP 3 • OUTCOME EXECUTED
                                </span>
                                <h4 className="text-base font-bold text-slate-900 mt-1">
                                    Lead Assigned & Alerted
                                </h4>
                                <p className="text-xs text-slate-600 mt-1">
                                    Push notification sent to Ajay Sharma
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-semibold text-emerald-600">Completed in 0.8s</span>
                                    <span>•</span>
                                    <span>Zero Delay</span>
                                </div>
                            </div>

                        </div>

                        {/* Bottom Bar: Customizable Triggers + Dashboard Link */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                                <Workflow size={16} className="text-emerald-600 shrink-0" />
                                <span className="font-medium">Customizable drag-and-drop triggers for any lead pipeline rule</span>
                            </div>
                            <a 
                                href="/dashboard" 
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white px-4 py-2 font-bold transition-all cursor-pointer shrink-0"
                            >
                                <span>Configure Workflows in Dashboard</span>
                                <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>

                </div>
            </section>


            {/* ======================================================== */}
            {/* 5. CALL TO ACTION (CTA)                                 */}
            {/* ======================================================== */}
            <section id="about" className="px-5 py-20 sm:px-8 lg:py-28 bg-white">
                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 px-6 py-16 text-center text-white shadow-2xl shadow-emerald-900/20 sm:px-12 sm:py-20">

                    {/* Subtle Ambient Light Glow */}
                    <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[450px] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-[100px]" />

                    <div className="relative">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/20 px-4 py-1 text-xs font-semibold text-emerald-200">
                            <Sparkles size={14} /> YOUR NEXT DEAL STARTS HERE
                        </span>

                        <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                            Make room for
                            <span className="text-emerald-300"> more wins.</span>
                        </h2>

                        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-emerald-100 sm:text-base">
                            Join over 1,200 sales teams managing their pipeline with LeadFlow. Start free today with no credit card required.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                            <a
                                href="/"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-emerald-900 shadow-lg transition-all hover:bg-emerald-50 hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Get Started Free <ArrowUpRight size={17} />
                            </a>
                            <a
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md px-7 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all"
                            >
                                Sign In to Account
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======================================================== */}
            {/* 6. LIGHT FOOTER                                          */}
            {/* ======================================================== */}
            <footer className="border-t border-slate-200 bg-slate-50/60 px-5 py-8 sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                    <a href="#home" className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Target size={18} className="text-emerald-600" />
                        <span>lead<span className="text-emerald-600">flow.</span></span>
                    </a>

                    <p className="text-center text-xs text-slate-500 font-medium">
                        © {new Date().getFullYear()} LeadFlow. All rights reserved. Built with precision.
                    </p>

                    <div className="flex gap-6 text-xs font-bold text-slate-500">
                        <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
                        <a href="#pipeline-demo" className="hover:text-emerald-600 transition-colors">Pipeline</a>
                        <a href="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
