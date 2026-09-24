import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 border border-sky-100 shadow-sm">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The project, resource, or destination you are looking for does not exist or has been moved.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link to="/dashboard" className="btn-primary text-xs px-5 py-2.5">
          <Home className="w-4 h-4" /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
