import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ThreeCard from '../../components/3d/ThreeCard';
import ThreeButton from '../../components/3d/ThreeButton';
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
  Zap,
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
    return <LoadingSpinner size="lg" text="Loading 3D workspace metrics..." />;
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
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Welcome 3D Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#E9785B] via-[#C85C45] to-[#8F78C8] rounded-3xl p-6 sm:p-8 text-white shadow-[0_15px_40px_-5px_rgba(233,120,91,0.35)]">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md mb-2 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#F5B895]" /> Welcome back, {user?.name}!
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              3D Workspace Hub
            </h1>
            <p className="text-white/85 text-xs sm:text-sm mt-1 max-w-xl font-light">
              Track active sprint milestones, coordinate with your teammates, and ship deliverables on schedule.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/projects"
              className="px-4 py-2.5 bg-white/95 text-[#3D2B24] hover:bg-[#FFF8ED] rounded-2xl text-xs font-bold shadow-sm transition-all duration-150 inline-flex items-center gap-2 cursor-pointer"
            >
              <FolderKanban className="w-4 h-4 text-[#E9785B]" />
              View Projects
            </Link>
            <button
              onClick={() => navigate('/projects?create=true')}
              className="px-4 py-2.5 bg-[#3D2B24] hover:bg-[#2A1D18] text-white rounded-2xl text-xs font-bold shadow-sm transition-all duration-150 inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Dimensional 3D Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 - Coral */}
        <ThreeCard maxTilt={6} className="p-5 flex items-center justify-between bg-white/95">
          <div>
            <p className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider">
              Total Projects
            </p>
            <h3 className="text-2xl font-extrabold text-[#3D2B24] mt-1">{totalProjects}</h3>
            <p className="text-xs text-[#E9785B] mt-1 flex items-center gap-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> {activeProjects} active now
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2EF] text-[#E9785B] flex items-center justify-center border border-[#F7C9BE] shadow-xs">
            <FolderKanban className="w-6 h-6" />
          </div>
        </ThreeCard>

        {/* Metric 2 - Peach */}
        <ThreeCard maxTilt={6} className="p-5 flex items-center justify-between bg-white/95">
          <div>
            <p className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider">
              Active Sprint Tasks
            </p>
            <h3 className="text-2xl font-extrabold text-[#3D2B24] mt-1">{pendingTasks}</h3>
            <p className="text-xs text-[#EE9467] mt-1 flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5" /> In progress & review
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FEF6F0] text-[#EE9467] flex items-center justify-center border border-[#FAD6BE] shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
        </ThreeCard>

        {/* Metric 3 - Sage */}
        <ThreeCard maxTilt={6} className="p-5 flex items-center justify-between bg-white/95">
          <div>
            <p className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider">
              Completed Tasks
            </p>
            <h3 className="text-2xl font-extrabold text-[#3D2B24] mt-1">{completedTasks}</h3>
            <p className="text-xs text-[#648362] mt-1 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {taskCompletionRate}% completion rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F6F9F6] text-[#7FA07D] flex items-center justify-center border border-[#D9E6D8] shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </ThreeCard>

        {/* Metric 4 - Lavender */}
        <ThreeCard maxTilt={6} className="p-5 flex items-center justify-between bg-white/95">
          <div>
            <p className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider">
              Quick Chat
            </p>
            <h3 className="text-base font-extrabold text-[#3D2B24] mt-1">Direct Messages</h3>
            <Link
              to="/chat"
              className="text-xs text-[#8F78C8] mt-1 inline-flex items-center gap-1 font-bold hover:underline"
            >
              Open chat room <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F8F6FD] text-[#8F78C8] flex items-center justify-center border border-[#E0D8F6] shadow-xs">
            <MessageSquare className="w-6 h-6" />
          </div>
        </ThreeCard>
      </div>

      {/* Main Grid: Projects & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Recent Projects */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F6EBDD] shadow-[0_10px_30px_-5px_rgba(61,43,36,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#E9785B]" />
                <h3 className="text-base font-extrabold text-[#3D2B24]">Your Active Projects</h3>
              </div>
              <Link
                to="/projects"
                className="text-xs font-bold text-[#E9785B] hover:text-[#C85C45] flex items-center gap-1"
              >
                View all ({totalProjects}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-center py-12 text-[#8D6E63] text-sm">
                <FolderKanban className="w-10 h-10 mx-auto mb-2 text-[#F5B895]" />
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
                    className="p-4 rounded-3xl border border-[#F6EBDD] bg-[#FFFDF9] hover:border-[#F5B895] hover:shadow-[0_10px_25px_rgba(233,120,91,0.1)] transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <StatusBadge status={p.status} />
                        <PriorityBadge priority={p.priority} />
                      </div>
                      <h4 className="font-extrabold text-[#3D2B24] group-hover:text-[#E9785B] transition-colors text-sm line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-xs text-[#8D6E63] mt-1 line-clamp-2 leading-relaxed">
                        {p.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F6EBDD]">
                      <div className="flex items-center justify-between text-xs text-[#8D6E63] mb-1.5 font-medium">
                        <span>Sprint Progress</span>
                        <span className="font-bold text-[#3D2B24]">{p.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#F6EBDD] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#E9785B] to-[#C85C45] rounded-full transition-all duration-300"
                          style={{ width: `${p.progress || 0}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-3 text-[11px] text-[#8D6E63]">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#E9785B]" />
                          {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                        <span className="font-bold text-[#E9785B] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
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
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F6EBDD] shadow-[0_10px_30px_-5px_rgba(61,43,36,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#8F78C8]" />
                <h3 className="text-base font-extrabold text-[#3D2B24]">Team Activity Feed</h3>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-[#8D6E63] py-4 text-center">No recent activity logged yet.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#F6EBDD]">
                {recentActivity.slice(0, 6).map((act, idx) => (
                  <div key={act._id || idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#E9785B] ring-4 ring-white" />
                    <div className="text-xs">
                      <p className="font-medium text-[#3D2B24]">
                        <span className="font-bold text-[#3D2B24]">
                          {act.user?.name || 'Teammate'}
                        </span>{' '}
                        {act.details || act.action?.replace('_', ' ')}
                      </p>
                      <span className="text-[11px] text-[#8D6E63] mt-0.5 block">
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
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F6EBDD] shadow-[0_10px_30px_-5px_rgba(61,43,36,0.05)]">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-[#E9785B]" />
              <h3 className="text-base font-extrabold text-[#3D2B24]">Upcoming Milestones</h3>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-[#8D6E63] py-4 text-center">
                No upcoming task deadlines found.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-[#FFFDF9] hover:bg-[#FFF8ED] border border-[#F6EBDD] rounded-2xl transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h5 className="text-xs font-bold text-[#3D2B24] line-clamp-1">
                        {task.title}
                      </h5>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#8D6E63] mt-2 font-medium">
                      <span className="text-[#C85C45] font-bold flex items-center gap-1">
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
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F6EBDD] shadow-[0_10px_30px_-5px_rgba(61,43,36,0.05)]">
            <h3 className="text-sm font-extrabold text-[#3D2B24] mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/my-tasks"
                className="p-3 rounded-2xl bg-[#FFFDF9] hover:bg-[#FFF8ED] border border-[#F6EBDD] transition-colors flex items-center gap-3 text-xs font-semibold text-[#3D2B24]"
              >
                <div className="p-2 rounded-xl bg-[#FDF2EF] text-[#E9785B] border border-[#F7C9BE]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold">My Assigned Tasks</span>
                  <span className="text-[11px] text-[#8D6E63]">View tasks across all sprints</span>
                </div>
              </Link>

              <Link
                to="/files"
                className="p-3 rounded-2xl bg-[#FFFDF9] hover:bg-[#FFF8ED] border border-[#F6EBDD] transition-colors flex items-center gap-3 text-xs font-semibold text-[#3D2B24]"
              >
                <div className="p-2 rounded-xl bg-[#F6F9F6] text-[#7FA07D] border border-[#D9E6D8]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold">Project File Vault</span>
                  <span className="text-[11px] text-[#8D6E63]">Documents, specs, and assets</span>
                </div>
              </Link>

              <Link
                to="/invitations"
                className="p-3 rounded-2xl bg-[#FFFDF9] hover:bg-[#FFF8ED] border border-[#F6EBDD] transition-colors flex items-center gap-3 text-xs font-semibold text-[#3D2B24]"
              >
                <div className="p-2 rounded-xl bg-[#F8F6FD] text-[#8F78C8] border border-[#E0D8F6]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold">Project Invitations</span>
                  <span className="text-[11px] text-[#8D6E63]">Pending team invites</span>
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
