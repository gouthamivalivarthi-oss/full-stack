import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  FolderArchive,
  MailCheck,
  ShieldAlert,
  UserCheck,
  Plus,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'My Tasks', href: '/my-tasks', icon: CheckSquare },
    { name: 'Team Chat', href: '/chat', icon: MessageSquare },
    { name: 'File Vault', href: '/files', icon: FolderArchive },
    { name: 'Invitations', href: '/invitations', icon: MailCheck },
  ];

  if (isAdmin) {
    navigation.push({ name: 'Admin Portal', href: '/admin', icon: ShieldAlert, adminOnly: true });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight font-sans">
                  Collab<span className="text-sky-400">Space</span>
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Workspace Pro
                </span>
              </div>
            </div>
          </div>

          {/* Quick Create Project Button */}
          <div className="px-4 py-4">
            <button
              onClick={() => {
                navigate('/projects?create=true');
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-400 font-semibold border-l-2 border-sky-400 shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                    } ${item.adminOnly ? 'text-purple-300 hover:text-purple-200 hover:bg-purple-950/40' : ''}`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.adminOnly && (
                    <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                      Admin
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer User card & status */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-sky-400 border border-slate-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
