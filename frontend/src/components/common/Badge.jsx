import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  switch (normalized) {
    case 'ACTIVE':
    case 'IN PROGRESS':
      return (
        <span className="badge bg-[#FDF2EF] text-[#E9785B] border border-[#F7C9BE] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E9785B] animate-pulse"></span>
          {status}
        </span>
      );
    case 'COMPLETED':
    case 'DONE':
      return (
        <span className="badge bg-[#F6F9F6] text-[#648362] border border-[#D9E6D8] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#648362]"></span>
          {status}
        </span>
      );
    case 'REVIEW':
    case 'IN REVIEW':
      return (
        <span className="badge bg-[#F8F6FD] text-[#8F78C8] border border-[#E0D8F6] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8F78C8]"></span>
          {status}
        </span>
      );
    case 'PLANNING':
    case 'TODO':
    case 'BACKLOG':
      return (
        <span className="badge bg-[#FEF6F0] text-[#EE9467] border border-[#FAD6BE] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EE9467]"></span>
          {status}
        </span>
      );
    case 'ARCHIVED':
    case 'ON HOLD':
      return (
        <span className="badge bg-[#FFF8ED] text-[#8D6E63] border border-[#EDE0CE] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8D6E63]"></span>
          {status}
        </span>
      );
    default:
      return (
        <span className="badge bg-[#FFF8ED] text-[#3D2B24] border border-[#EDE0CE] font-bold">
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
        <span className="badge bg-rose-50 text-rose-700 border border-rose-200 font-bold">
          🔥 Critical
        </span>
      );
    case 'high':
      return (
        <span className="badge bg-[#FDF2EF] text-[#C85C45] border border-[#F7C9BE] font-bold">
          ▲ High
        </span>
      );
    case 'medium':
      return (
        <span className="badge bg-[#FEF6F0] text-[#EE9467] border border-[#FAD6BE] font-bold">
          ■ Medium
        </span>
      );
    case 'low':
      return (
        <span className="badge bg-[#F6F9F6] text-[#648362] border border-[#D9E6D8] font-bold">
          ▼ Low
        </span>
      );
    default:
      return (
        <span className="badge bg-[#FFF8ED] text-[#8D6E63] border border-[#EDE0CE] font-bold">
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
        <span className="badge bg-[#F8F6FD] text-[#8F78C8] border border-[#E0D8F6] font-bold">
          Admin
        </span>
      );
    case 'manager':
    case 'owner':
      return (
        <span className="badge bg-[#FEF6F0] text-[#C85C45] border border-[#FAD6BE] font-bold">
          {role}
        </span>
      );
    case 'student':
    case 'member':
      return (
        <span className="badge bg-[#F6F9F6] text-[#648362] border border-[#D9E6D8] font-bold">
          {role}
        </span>
      );
    default:
      return (
        <span className="badge bg-[#FFF8ED] text-[#8D6E63] border border-[#EDE0CE] font-bold">
          {role || 'Viewer'}
        </span>
      );
  }
};

export default StatusBadge;
