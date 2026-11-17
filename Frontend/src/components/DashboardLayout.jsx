import React from 'react';
import { Outlet } from 'react-router';
import Navbar from './Navbar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100/80 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
      {/* Ambient background glow accents for a rich gradient feel */}
      <div className="pointer-events-none fixed -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-300/40 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -right-24 h-96 w-96 rounded-full bg-teal-300/35 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 left-1/3 h-96 w-96 rounded-full bg-green-300/30 blur-3xl" />

      {/* Sticky LeadFlow Dashboard Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
