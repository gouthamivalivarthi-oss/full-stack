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
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-[#E9785B] to-[#C85C45] text-white shadow-sm shadow-[#E9785B]/25'
                  : 'bg-[#FFFDF9] text-[#8D6E63] hover:bg-[#FFF8ED] border border-[#F6EBDD]'
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
        <div className="glass-card p-12 text-center text-[#8D6E63]">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 text-[#F5B895]" />
          <h3 className="text-base font-bold text-[#3D2B24]">No Tasks Found</h3>
          <p className="text-xs text-[#8D6E63] mt-1">
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
              className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-[#F6EBDD] shadow-[0_10px_30px_-5px_rgba(61,43,36,0.06)] hover:border-[#F5B895] hover:shadow-[0_15px_35px_rgba(233,120,91,0.15)] hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-[#E9785B] bg-[#FDF2EF] px-2.5 py-0.5 rounded-xl border border-[#F7C9BE] truncate max-w-[140px]">
                    {task.project?.name || 'Project'}
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>

                <h3 className="text-sm font-extrabold text-[#3D2B24] group-hover:text-[#E9785B] transition-colors line-clamp-2">
                  {task.title}
                </h3>

                <p className="text-xs text-[#8D6E63] mt-2 line-clamp-3 leading-relaxed">
                  {task.description || 'No detailed instructions provided.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#F6EBDD]">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-[#8D6E63] text-[11px] flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#E9785B]" />
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString()
                      : 'No deadline'}
                  </span>

                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                    className="px-2.5 py-1 bg-[#FFFDF9] border border-[#F6EBDD] rounded-xl text-xs font-bold text-[#3D2B24] focus:outline-none"
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
                    className="text-xs font-bold text-[#E9785B] hover:text-[#C85C45] flex items-center justify-between pt-2 border-t border-[#F6EBDD]"
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
