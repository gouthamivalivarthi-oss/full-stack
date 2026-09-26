import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import { RoleBadge } from '../common/Badge';
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  ShieldCheck,
  CheckCheck,
  Trash2,
  Menu,
  MessageSquare,
  Sparkles,
  Home,
} from 'lucide-react';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-xl border-b border-[#F6EBDD] px-4 sm:px-6 flex items-center justify-between shadow-[0_4px_25px_rgba(61,43,36,0.03)]">
      {/* Left section: Hamburger button & Quick Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-lg">
        <button
          onClick={toggleSidebar}
          className="p-2 text-[#3D2B24]/70 hover:text-[#E9785B] hover:bg-[#FFF8ED] rounded-2xl transition-all md:hidden cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]/60" />
          <input
            type="text"
            placeholder="Search projects, tasks, or teammates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FFF8ED]/80 hover:bg-[#FFF8ED] focus:bg-white text-sm text-[#3D2B24] rounded-2xl border border-[#F6EBDD] focus:border-[#E9785B] focus:ring-2 focus:ring-[#E9785B]/20 focus:outline-none transition-all placeholder:text-[#8D6E63]/50 shadow-inner"
          />
        </form>
      </div>

      {/* Right section: Quick actions, notifications, user menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Direct Messages Link */}
        <Link
          to="/chat"
          className="p-2 text-[#3D2B24]/70 hover:text-[#E9785B] hover:bg-[#FFF8ED] rounded-2xl transition-all relative cursor-pointer"
          title="Direct Messages"
        >
          <MessageSquare className="w-5 h-5" />
        </Link>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#3D2B24]/70 hover:text-[#E9785B] hover:bg-[#FFF8ED] rounded-2xl transition-all relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#E9785B] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_15px_40px_-5px_rgba(61,43,36,0.15)] border border-[#F6EBDD] py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-[#F6EBDD]">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#3D2B24] text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="badge bg-[#FDF2EF] text-[#E9785B] text-[10px] font-bold border border-[#F7C9BE]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#E9785B] hover:text-[#C85C45] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#F6EBDD]/60 py-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#8D6E63]/70 text-sm">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#F5B895]" />
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className={`p-3.5 hover:bg-[#FFF8ED] transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                        !n.isRead ? 'bg-[#FFF8ED]/80' : ''
                      }`}
                    >
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#E9785B]"></span>
                          )}
                          <span className="font-semibold text-[#3D2B24] capitalize">
                            {n.type?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[#3D2B24]/80 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-[#8D6E63] mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n._id);
                        }}
                        className="text-[#8D6E63]/50 hover:text-rose-500 p-1 cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-[#FFF8ED] transition-colors text-left cursor-pointer border border-transparent hover:border-[#F6EBDD]"
          >
            <Avatar name={user?.name} src={user?.avatar} size="sm" isOnline />
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-[#3D2B24] leading-tight">
                {user?.name}
              </div>
              <div className="text-[11px] text-[#8D6E63] capitalize font-medium">{user?.role}</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_15px_40px_-5px_rgba(61,43,36,0.15)] border border-[#F6EBDD] py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-[#F6EBDD]">
                <p className="text-xs text-[#8D6E63]">Signed in as</p>
                <p className="text-sm font-bold text-[#3D2B24] truncate">{user?.email}</p>
                <div className="mt-1">
                  <RoleBadge role={user?.role} />
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#3D2B24] hover:bg-[#FFF8ED] hover:text-[#E9785B] transition-colors"
                >
                  <User className="w-4 h-4 text-[#8D6E63]" /> My Profile
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#8F78C8] hover:bg-[#F0ECFA] transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#8F78C8]" /> Admin Portal
                  </Link>
                )}

                <Link
                  to="/invitations"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#3D2B24] hover:bg-[#FFF8ED] hover:text-[#E9785B] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#8D6E63]" /> Project Invitations
                </Link>
              </div>

              <div className="pt-1 border-t border-[#F6EBDD]">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
