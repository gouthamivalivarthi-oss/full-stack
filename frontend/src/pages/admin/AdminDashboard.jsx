import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { RoleBadge, StatusBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  ShieldAlert,
  Users,
  FolderKanban,
  CheckSquare,
  Activity,
  Trash2,
  UserCheck,
  UserX,
  Search,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'projects' | 'activity'

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '',
    id: null,
    title: '',
    message: '',
  });

  const { addToast } = useNotifications();

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, projRes, actRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/projects'),
        api.get('/admin/activity'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
      if (projRes.data.success) setProjects(projRes.data.projects || []);
      if (actRes.data.success) setActivity(actRes.data.activity || []);
    } catch (err) {
      console.error('Failed to load admin panel', err);
      addToast({
        title: 'Access Denied',
        message: 'Could not load administrative governance portal',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
        );
        addToast({
          title: 'User Status Updated',
          message: `User is now ${newStatus}.`,
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Status update failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        addToast({
          title: 'Role Updated',
          message: `User role changed to ${newRole}.`,
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Role update failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  const handleConfirmDelete = async () => {
    const { type, id } = confirmDialog;
    try {
      if (type === 'user') {
        const res = await api.delete(`/admin/users/${id}`);
        if (res.data.success) {
          setUsers((prev) => prev.filter((u) => u._id !== id));
          addToast({ title: 'User Deleted', message: 'User account removed.', type: 'success' });
        }
      } else if (type === 'project') {
        const res = await api.delete(`/admin/projects/${id}`);
        if (res.data.success) {
          setProjects((prev) => prev.filter((p) => p._id !== id));
          addToast({ title: 'Project Removed', message: 'Project was deleted.', type: 'success' });
        }
      }
    } catch (err) {
      addToast({
        title: 'Action failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    } finally {
      setConfirmDialog({ isOpen: false, type: '', id: null, title: '', message: '' });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading governance admin portal..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System Governance & Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Platform metrics, user role governance, workspace audits, and access logs.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Accounts
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats?.totalUsers || users.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Projects
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats?.totalProjects || projects.length}</h3>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sprint Tasks
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats?.totalTasks || 0}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Vault Documents
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats?.totalFiles || 0}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-xs font-bold transition-all ${
            activeTab === 'projects'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Workspace Repositories ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 text-xs font-bold transition-all ${
            activeTab === 'activity'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Platform Audit Logs
        </button>
      </div>

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden space-y-4">
          <div className="p-4 bg-slate-50/50 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Current Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Registered Date</th>
                  <th className="px-6 py-3.5 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} src={u.avatar} size="sm" isOnline />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                      >
                        <option value="student">Student</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(u._id, u.status || 'active')}
                          className={`p-1.5 rounded-lg border text-xs font-semibold ${
                            u.status === 'active'
                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200'
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                          }`}
                          title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        >
                          {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              type: 'user',
                              id: u._id,
                              title: 'Delete User Account',
                              message: `Are you sure you want to delete "${u.name}"? This action cannot be reversed.`,
                            })
                          }
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Project Name</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Progress</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                    <td className="px-6 py-4 text-slate-600">{p.owner?.name || 'Owner'}</td>
                    <td className="px-6 py-4 text-slate-500">{p.category || 'General'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{p.progress || 0}%</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            type: 'project',
                            id: p._id,
                            title: 'Delete Project Workspace',
                            message: `Are you sure you want to remove project "${p.name}"?`,
                          })
                        }
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Activity */}
      {activeTab === 'activity' && (
        <div className="glass-card p-6 max-w-3xl">
          <h3 className="text-base font-bold text-slate-800 mb-6">Global Platform Audit Trail</h3>
          <div className="space-y-4">
            {activity.map((act) => (
              <div
                key={act._id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {act.user?.name || 'User'} <span className="font-normal text-slate-600">{act.details}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: '', id: null, title: '', message: '' })}
        onConfirm={handleConfirmDelete}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};

export default AdminDashboard;
