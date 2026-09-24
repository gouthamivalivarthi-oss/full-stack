import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  switch (normalized) {
    case 'ACTIVE':
    case 'IN PROGRESS':
      return (
        <span className="badge bg-sky-50 text-sky-700 border border-sky-200">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
          {status}
        </span>
      );
    case 'COMPLETED':
    case 'DONE':
      return (
        <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {status}
        </span>
      );
    case 'REVIEW':
    case 'IN REVIEW':
      return (
        <span className="badge bg-purple-50 text-purple-700 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          {status}
        </span>
      );
    case 'PLANNING':
    case 'TODO':
    case 'BACKLOG':
      return (
        <span className="badge bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {status}
        </span>
      );
    case 'ARCHIVED':
    case 'ON HOLD':
      return (
        <span className="badge bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          {status}
        </span>
      );
    default:
      return (
        <span className="badge bg-slate-100 text-slate-700 border border-slate-200">
          {status || 'Unknown'}
        </span>
      );
  }
};

export const PriorityBadge = ({ priority }) => {
  const normalized = (priority || '').toLowerCase();

  switch (normalized) {
    case 'critical':
      return (
        <span className="badge bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
          🔥 Critical
        </span>
      );
    case 'high':
      return (
        <span className="badge bg-orange-50 text-orange-700 border border-orange-200">
          ▲ High
        </span>
      );
    case 'medium':
      return (
        <span className="badge bg-amber-50 text-amber-700 border border-amber-200">
          ■ Medium
        </span>
      );
    case 'low':
      return (
        <span className="badge bg-slate-100 text-slate-600 border border-slate-200">
          ▼ Low
        </span>
      );
    default:
      return (
        <span className="badge bg-slate-100 text-slate-600 border border-slate-200">
          {priority || 'Normal'}
        </span>
      );
  }
};

export const RoleBadge = ({ role }) => {
  const normalized = (role || '').toLowerCase();
  switch (normalized) {
    case 'admin':
      return (
        <span className="badge bg-violet-100 text-violet-800 border border-violet-200 font-medium">
          Admin
        </span>
      );
    case 'manager':
    case 'owner':
      return (
        <span className="badge bg-blue-100 text-blue-800 border border-blue-200 font-medium">
          {role}
        </span>
      );
    case 'student':
    case 'member':
      return (
        <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium">
          {role}
        </span>
      );
    default:
      return (
        <span className="badge bg-slate-100 text-slate-700 border border-slate-200">
          {role || 'Viewer'}
        </span>
      );
  }
};
