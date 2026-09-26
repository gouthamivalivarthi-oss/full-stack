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
  Compass,
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
          className="fixed inset-0 bg-[#3D2B24]/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#FFFDF9]/95 backdrop-blur-2xl text-[#3D2B24] flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#F6EBDD] shadow-[4px_0_30px_rgba(61,43,36,0.03)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#F6EBDD]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E9785B] via-[#E9785B] to-[#C85C45] flex items-center justify-center text-white font-bold shadow-md shadow-[#E9785B]/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-[#3D2B24] text-base tracking-tight">
                  Collab<span className="text-[#E9785B]">Space</span>
                </span>
                <span className="block text-[10px] text-[#8D6E63] uppercase tracking-widest font-bold">
                  3D Workspace
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
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E9785B] to-[#C85C45] hover:from-[#DF5E3E] hover:to-[#B04B35] text-white rounded-2xl text-xs font-bold shadow-[0_8px_20px_-3px_rgba(233,120,91,0.45)] hover:shadow-[0_12px_25px_-3px_rgba(233,120,91,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer border-t border-white/20"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#E9785B] via-[#E9785B] to-[#C85C45] text-white shadow-[0_8px_20px_-4px_rgba(233,120,91,0.4)] border-l-4 border-[#3D2B24]'
                        : 'text-[#3D2B24]/75 hover:bg-[#F0ECFA] hover:text-[#755DB5]'
                    } ${item.adminOnly && !isActive ? 'text-[#8F78C8] hover:bg-[#F0ECFA]' : ''}`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                  {item.adminOnly && (
                    <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-[#E0D8F6] text-[#755DB5] font-bold">
                      Admin
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer User card & status */}
        <div className="p-4 border-t border-[#F6EBDD] bg-[#FFF8ED]/60">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white transition-all border border-transparent hover:border-[#F6EBDD] hover:shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-[#FDF2EF] flex items-center justify-center text-xs font-bold text-[#E9785B] border border-[#F7C9BE]">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#3D2B24] truncate">{user?.name}</p>
              <p className="text-[11px] text-[#8D6E63] truncate">{user?.email}</p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
