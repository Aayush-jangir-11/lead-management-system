import React from 'react';
import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs max-w-lg mx-auto my-12">
      <div className="text-4xl font-extrabold text-blue-600 mb-2">404</div>
      <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-2 mb-6">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
