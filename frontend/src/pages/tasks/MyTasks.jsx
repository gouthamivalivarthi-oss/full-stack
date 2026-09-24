import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  CheckSquare,
  Clock,
  Calendar,
  FolderKanban,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useNotifications();

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks/my-tasks');
      if (res.data.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load my tasks', err);
      addToast({
        title: 'Error',
        message: 'Could not fetch your assigned tasks',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
        );
        addToast({
          title: 'Status Updated',
          message: `Task moved to ${newStatus}`,
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Failed to update status',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.project?.name && t.project.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || t.status?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Assigned Tasks</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review and update sprint deliverables assigned to you across all project repositories.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by task title or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'TODO', 'IN PROGRESS', 'REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Tasks' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading your tasks..." />
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Tasks Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No tasks matched your current filter criteria.'
              : 'You have no assigned tasks right now! Great job.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="glass-card p-5 flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100 truncate max-w-[140px]">
                    {task.project?.name || 'Project'}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>

                <h3 className="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2">
                  {task.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {task.description || 'No detailed instructions provided.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString()
                      : 'No deadline'}
                  </span>

                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                    className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                {task.project?._id && (
                  <Link
                    to={`/projects/${task.project._id}`}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between pt-2 border-t border-slate-50"
                  >
                    <span>Open Project Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
