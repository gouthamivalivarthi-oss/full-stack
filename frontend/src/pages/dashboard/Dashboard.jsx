import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  Plus,
  Flame,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity,
  MessageSquare,
  FileText,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error loading dashboard stats', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading dashboard metrics..." />;
  }

  const {
    totalProjects = stats?.data?.summary?.totalProjects ?? stats?.totalProjects ?? 0,
    activeProjects = stats?.data?.summary?.activeProjects ?? stats?.activeProjects ?? 0,
    totalTasks = stats?.data?.summary?.totalTasks ?? (stats?.data?.summary?.completedTasks || 0) + (stats?.data?.summary?.pendingTasks || 0) ?? stats?.totalTasks ?? 0,
    completedTasks = stats?.data?.summary?.completedTasks ?? stats?.completedTasks ?? 0,
    pendingTasks = stats?.data?.summary?.pendingTasks ?? stats?.pendingTasks ?? 0,
    recentProjects = stats?.data?.projectCards ?? stats?.recentProjects ?? [],
    upcomingDeadlines = stats?.data?.upcomingDeadlines ?? stats?.upcomingDeadlines ?? [],
    recentActivity = stats?.data?.recentActivity ?? stats?.recentActivity ?? [],
  } = stats || {};

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-500/10">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sky-100 text-xs font-semibold backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Welcome back, {user?.name}!
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Project Collaboration Hub
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
              Track project milestones, coordinate with your engineering teammates, and deliver results on schedule.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/projects"
              className="px-4 py-2.5 bg-white text-slate-800 hover:bg-sky-50 rounded-xl text-xs font-semibold shadow-sm transition-all duration-150 inline-flex items-center gap-2"
            >
              <FolderKanban className="w-4 h-4 text-sky-600" />
              View Projects
            </Link>
            <button
              onClick={() => navigate('/projects?create=true')}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-150 inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Projects
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalProjects}</h3>
            <p className="text-xs text-sky-600 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> {activeProjects} active now
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Sprint Tasks
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{pendingTasks}</h3>
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" /> In progress & review
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Completed Tasks
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{completedTasks}</h3>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {taskCompletionRate}% completion rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quick Chat
            </p>
            <h3 className="text-base font-bold text-slate-800 mt-1">Direct Messages</h3>
            <Link
              to="/chat"
              className="text-xs text-indigo-600 mt-1 inline-flex items-center gap-1 font-medium hover:underline"
            >
              Open chat room <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Recent Projects */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-800">Your Active Projects</h3>
              </div>
              <Link
                to="/projects"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                View all ({totalProjects}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                <FolderKanban className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p>No active projects yet.</p>
                <button
                  onClick={() => navigate('/projects?create=true')}
                  className="mt-3 btn-primary text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Create your first project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentProjects.map((p) => (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-sky-300 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <StatusBadge status={p.status} />
                        <PriorityBadge priority={p.priority} />
                      </div>
                      <h4 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {p.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span>Sprint Progress</span>
                        <span className="font-bold text-slate-700">{p.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${p.progress || 0}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                        <span className="font-medium text-sky-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Open workspace <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">Team Activity Feed</h3>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent activity logged yet.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {recentActivity.slice(0, 6).map((act, idx) => (
                  <div key={act._id || idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-white" />
                    <div className="text-xs">
                      <p className="font-medium text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {act.user?.name || 'Teammate'}
                        </span>{' '}
                        {act.details || act.action?.replace('_', ' ')}
                      </p>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Upcoming Deadlines & Quick Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Deadlines */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-slate-800">Upcoming Milestones</h3>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No upcoming task deadlines found.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-slate-50 hover:bg-sky-50/50 border border-slate-200/80 rounded-xl transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h5 className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {task.title}
                      </h5>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="text-rose-600 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </span>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Collaboration Shortcuts */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/my-tasks"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-3 text-xs font-medium text-slate-700"
              >
                <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold">My Assigned Tasks</span>
                  <span className="text-[11px] text-slate-400">View tasks across all sprints</span>
                </div>
              </Link>

              <Link
                to="/files"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-3 text-xs font-medium text-slate-700"
              >
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold">Project File Vault</span>
                  <span className="text-[11px] text-slate-400">Documents, specs, and assets</span>
                </div>
              </Link>

              <Link
                to="/invitations"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-3 text-xs font-medium text-slate-700"
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold">Project Invitations</span>
                  <span className="text-[11px] text-slate-400">Pending team invites</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
