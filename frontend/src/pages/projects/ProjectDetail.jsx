import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { StatusBadge, PriorityBadge, RoleBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  FolderKanban,
  Kanban,
  ListTodo,
  Users,
  FileText,
  Activity,
  Settings,
  Plus,
  Calendar,
  Clock,
  ArrowRight,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Trash2,
  Upload,
  Download,
  Send,
  UserPlus,
  Share2,
  Shield,
  ChevronRight,
  MoreVertical,
  Filter,
} from 'lucide-react';

export const ProjectDetail = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinProject, leaveProject } = useSocket() || {};
  const { addToast } = useNotifications();

  // Active Tab: 'overview' | 'kanban' | 'tasks' | 'team' | 'files' | 'activity' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Main Data States
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [files, setFiles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Users list for invite & assignment
  const [allUsers, setAllUsers] = useState([]);

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskComments, setTaskComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'TODO',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteLoading, setInviteLoading] = useState(false);

  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Settings Edit State
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    priority: 'Medium',
    status: 'Active',
    deadline: '',
  });

  // Socket room join
  useEffect(() => {
    if (projectId) {
      if (joinProject) joinProject(projectId);
      return () => {
        if (leaveProject) leaveProject(projectId);
      };
    }
  }, [projectId, joinProject, leaveProject]);

  // Fetch Project Data
  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes, membersRes, filesRes, actRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}/members`),
        api.get(`/projects/${projectId}/files`),
        api.get(`/projects/${projectId}/activity`),
      ]);

      if (projRes.data.success) {
        setProject(projRes.data.project);
        setEditForm({
          name: projRes.data.project.name || '',
          description: projRes.data.project.description || '',
          category: projRes.data.project.category || 'Web Development',
          priority: projRes.data.project.priority || 'Medium',
          status: projRes.data.project.status || 'Active',
          deadline: projRes.data.project.deadline
            ? new Date(projRes.data.project.deadline).toISOString().split('T')[0]
            : '',
        });
      }
      if (tasksRes.data.success) setTasks(tasksRes.data.tasks || []);
      if (membersRes.data.success) setMembers(membersRes.data.members || []);
      if (filesRes.data.success) setFiles(filesRes.data.files || []);
      if (actRes.data.success) setActivity(actRes.data.activities || []);
    } catch (err) {
      console.error('Failed to load project details', err);
      addToast({
        title: 'Error',
        message: 'Unable to load project workspace',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, addToast]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Fetch users for invite dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        if (res.data.success) {
          setAllUsers(res.data.users || []);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchUsers();
  }, []);

  // Real-time socket event listeners for project
  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdated = () => {
      api.get(`/projects/${projectId}/tasks`).then((res) => {
        if (res.data.success) setTasks(res.data.tasks);
      });
      api.get(`/projects/${projectId}/activity`).then((res) => {
        if (res.data.success) setActivity(res.data.activities);
      });
    };

    socket.on('task_created', handleTaskUpdated);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_deleted', handleTaskUpdated);
    socket.on('file_uploaded', () => {
      api.get(`/projects/${projectId}/files`).then((res) => {
        if (res.data.success) setFiles(res.data.files);
      });
    });

    return () => {
      socket.off('task_created', handleTaskUpdated);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_deleted', handleTaskUpdated);
    };
  }, [socket, projectId]);

  // Handle Task Status Change (Kanban movement)
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
        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      addToast({
        title: 'Update failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  // Open Task Detail Modal & Fetch Comments
  const handleOpenTask = async (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
    try {
      const res = await api.get(`/tasks/${task._id}/comments`);
      if (res.data.success) {
        setTaskComments(res.data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments', err);
    }
  };

  // Add Comment on Task
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    setCommentLoading(true);
    try {
      const res = await api.post(`/tasks/${selectedTask._id}/comments`, {
        message: newComment.trim(),
      });
      if (res.data.success) {
        setTaskComments((prev) => [...prev, res.data.comment]);
        setNewComment('');
        addToast({
          title: 'Comment added',
          message: 'Your reply was posted.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Failed to post comment',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    } finally {
      setCommentLoading(false);
    }
  };

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${projectId}/tasks`, taskForm);
      if (res.data.success) {
        setTasks((prev) => [...prev, res.data.task]);
        setCreateTaskModalOpen(false);
        setTaskForm({
          title: '',
          description: '',
          assignedTo: '',
          priority: 'Medium',
          status: 'TODO',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        addToast({
          title: 'Task Created',
          message: 'Task added to sprint board.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Error creating task',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        if (selectedTask?._id === taskId) {
          setTaskModalOpen(false);
        }
        addToast({
          title: 'Task Deleted',
          message: 'Task was removed from project.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Failed to delete task',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  // Invite Member
  const handleInviteMember = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });
      if (res.data.success) {
        addToast({
          title: 'Invitation Sent',
          message: `Invited ${inviteEmail} as ${inviteRole}`,
          type: 'success',
        });
        setInviteModalOpen(false);
        setInviteEmail('');
        // Refresh members
        const membersRes = await api.get(`/projects/${projectId}/members`);
        if (membersRes.data.success) setMembers(membersRes.data.members);
      }
    } catch (err) {
      addToast({
        title: 'Invite failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    } finally {
      setInviteLoading(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (userId) => {
    try {
      const res = await api.delete(`/projects/${projectId}/members/${userId}`);
      if (res.data.success) {
        setMembers((prev) => prev.filter((m) => m.user?._id !== userId));
        addToast({
          title: 'Member Removed',
          message: 'User removed from this project.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Failed to remove member',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  // File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFiles((prev) => [res.data.file, ...prev]);
        addToast({
          title: 'File Uploaded',
          message: `"${file.name}" uploaded successfully.`,
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Upload failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    } finally {
      setFileUploadLoading(false);
      e.target.value = '';
    }
  };

  // Delete File
  const handleDeleteFile = async (fileId) => {
    try {
      const res = await api.delete(`/files/${fileId}`);
      if (res.data.success) {
        setFiles((prev) => prev.filter((f) => f._id !== fileId));
        addToast({
          title: 'File Deleted',
          message: 'File removed from vault.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Failed to delete file',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/projects/${projectId}`, editForm);
      if (res.data.success) {
        setProject(res.data.project);
        addToast({
          title: 'Project Updated',
          message: 'Project workspace settings saved.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Update failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  // Delete Project
  const handleDeleteProject = async () => {
    try {
      const res = await api.delete(`/projects/${projectId}`);
      if (res.data.success) {
        addToast({
          title: 'Project Deleted',
          message: 'Project workspace was deleted.',
          type: 'success',
        });
        navigate('/projects');
      }
    } catch (err) {
      addToast({
        title: 'Failed to delete project',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading project workspace..." />;
  }

  if (!project) {
    return (
      <div className="glass-card p-12 text-center max-w-xl mx-auto">
        <FolderKanban className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <h3 className="text-base font-bold text-slate-800">Project Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          This project may have been deleted or you don't have access permissions.
        </p>
        <Link to="/projects" className="btn-primary text-xs mt-4">
          Back to Projects
        </Link>
      </div>
    );
  }

  // Kanban Columns Data
  const columns = [
    { id: 'TODO', title: 'To Do / Backlog', color: 'border-amber-400' },
    { id: 'IN PROGRESS', title: 'In Progress', color: 'border-sky-500' },
    { id: 'REVIEW', title: 'In Review', color: 'border-purple-500' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-500' },
  ];

  const kanbanTasks = {
    TODO: tasks.filter((t) => t.status === 'TODO' || t.status === 'PLANNING' || t.status === 'BACKLOG'),
    'IN PROGRESS': tasks.filter((t) => t.status === 'IN PROGRESS'),
    REVIEW: tasks.filter((t) => t.status === 'REVIEW'),
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'DONE'),
  };

  const isOwnerOrManager =
    project.owner?._id === user?._id ||
    members.some((m) => m.user?._id === user?._id && (m.role === 'Owner' || m.role === 'Manager')) ||
    user?.role === 'admin';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link
                to="/projects"
                className="text-xs font-semibold text-[#8D6E63] hover:text-[#E9785B] transition-colors"
              >
                Projects
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#EDE0CE]" />
              <span className="text-xs font-bold text-[#E9785B] bg-[#FDF2EF] px-2.5 py-0.5 rounded-xl border border-[#F7C9BE]">
                {project.category || 'General'}
              </span>
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>

            <h1 className="text-2xl font-extrabold text-[#3D2B24] tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs text-[#8D6E63] mt-1 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Top Actions: Add Task, Invite Member */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setInviteModalOpen(true)}
              className="btn-secondary text-xs px-3.5 py-2"
            >
              <UserPlus className="w-4 h-4 text-[#8D6E63]" />
              Invite Teammate
            </button>
            <button
              onClick={() => setCreateTaskModalOpen(true)}
              className="btn-primary text-xs px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              Add Sprint Task
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-t border-[#F6EBDD] mt-6 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FolderKanban },
            { id: 'kanban', label: 'Kanban Board', icon: Kanban, count: tasks.length },
            { id: 'tasks', label: 'Task List', icon: ListTodo },
            { id: 'team', label: 'Team Members', icon: Users, count: members.length },
            { id: 'files', label: 'Files & Vault', icon: FileText, count: files.length },
            { id: 'activity', label: 'Activity Log', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E9785B] to-[#C85C45] text-white shadow-md shadow-[#E9785B]/25'
                    : 'text-[#3D2B24]/75 hover:bg-[#FFF8ED] hover:text-[#E9785B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#F6EBDD] text-[#8D6E63]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4">Sprint Progress Overview</h3>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span>Total Task Completion</span>
                <span className="font-bold text-slate-800">{project.progress || 0}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Total Tasks</span>
                  <span className="text-lg font-bold text-slate-800 mt-0.5 block">{tasks.length}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-medium block">In Progress</span>
                  <span className="text-lg font-bold text-sky-600 mt-0.5 block">
                    {kanbanTasks['IN PROGRESS'].length}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-medium block">In Review</span>
                  <span className="text-lg font-bold text-purple-600 mt-0.5 block">
                    {kanbanTasks['REVIEW'].length}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Completed</span>
                  <span className="text-lg font-bold text-emerald-600 mt-0.5 block">
                    {kanbanTasks['COMPLETED'].length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Kanban Preview */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800">Sprint Tasks Quick Access</h3>
                <button
                  onClick={() => setActiveTab('kanban')}
                  className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1"
                >
                  Go to Kanban Board <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {tasks.slice(0, 5).map((t) => (
                  <div
                    key={t._id}
                    onClick={() => handleOpenTask(t)}
                    className="p-3 bg-slate-50 hover:bg-sky-50/50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 truncate">{t.title}</h5>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {t.assignedTo ? `Assigned to: ${t.assignedTo.name}` : 'Unassigned'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Project Specs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Workspace Details</h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Owner</span>
                  <span className="font-semibold text-slate-700">{project.owner?.name || 'Lead'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Start Date</span>
                  <span className="font-medium text-slate-700">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Milestone Deadline</span>
                  <span className="font-medium text-rose-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Open ended'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400">Active Members</span>
                  <span className="font-semibold text-slate-700">{members.length} teammates</span>
                </div>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">Technologies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Team Roster Snippet */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Team Members</h3>
                <button
                  onClick={() => setActiveTab('team')}
                  className="text-xs text-sky-600 hover:underline font-semibold"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {members.slice(0, 4).map((m) => (
                  <div key={m._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={m.user?.name} src={m.user?.avatar} size="xs" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{m.user?.name}</p>
                        <p className="text-[10px] text-slate-400">{m.user?.email}</p>
                      </div>
                    </div>
                    <RoleBadge role={m.role} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">Interactive Sprint Board:</span>
              <span className="text-slate-400">Click any task to view discussions & update status</span>
            </div>
            <button
              onClick={() => setCreateTaskModalOpen(true)}
              className="btn-primary text-xs px-3.5 py-2"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {columns.map((col) => {
              const colTasks = kanbanTasks[col.id] || [];
              return (
                <div
                  key={col.id}
                  className="bg-slate-100/70 border border-slate-200/90 rounded-2xl p-4 flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div
                    className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${col.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {col.title}
                      </h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-xs">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setTaskForm({ ...taskForm, status: col.id });
                        setCreateTaskModalOpen(true);
                      }}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                      title="Add task in this column"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colTasks.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-slate-300/80 rounded-xl flex items-center justify-center text-xs text-slate-400">
                        No tasks in this lane
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task._id}
                          onClick={() => handleOpenTask(task)}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <PriorityBadge priority={task.priority} />
                            <span className="text-[10px] text-slate-400">
                              {task.deadline
                                ? new Date(task.deadline).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : ''}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2">
                            {task.title}
                          </h5>

                          {task.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              {task.assignedTo ? (
                                <div className="flex items-center gap-1.5">
                                  <Avatar name={task.assignedTo.name} size="xs" />
                                  <span className="text-[10px] text-slate-600 font-medium truncate max-w-[80px]">
                                    {task.assignedTo.name.split(' ')[0]}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                              )}
                            </div>

                            {/* Move Column Dropdown */}
                            <select
                              value={task.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                              className="text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md px-1.5 py-0.5 border border-slate-200 focus:outline-none"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN PROGRESS">In Progress</option>
                              <option value="REVIEW">Review</option>
                              <option value="COMPLETED">Done</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Task List Table */}
      {activeTab === 'tasks' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Sprint Task Table</h3>
            <button
              onClick={() => setCreateTaskModalOpen(true)}
              className="btn-primary text-xs px-3.5 py-1.5"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Task Title</th>
                  <th className="px-6 py-3.5">Assignee</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                      No tasks found in this project.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task._id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => handleOpenTask(task)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 text-sm block">
                          {task.title}
                        </span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {task.description || 'No description'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={task.assignedTo.name} size="xs" />
                            <span className="text-slate-700 font-medium">{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                          className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN PROGRESS">IN PROGRESS</option>
                          <option value="REVIEW">REVIEW</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Team Members */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Project Members ({members.length})</h3>
              <p className="text-xs text-slate-500">
                Manage roles and collaborator permissions for this project repository.
              </p>
            </div>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="btn-primary text-xs px-4 py-2"
            >
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div
                key={member._id}
                className="glass-card p-5 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    name={member.user?.name}
                    src={member.user?.avatar}
                    size="md"
                    isOnline
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{member.user?.name}</h4>
                    <p className="text-xs text-slate-400">{member.user?.email}</p>
                    <div className="mt-2">
                      <RoleBadge role={member.role} />
                    </div>
                  </div>
                </div>

                {isOwnerOrManager && member.user?._id !== user?._id && (
                  <button
                    onClick={() => handleRemoveMember(member.user?._id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                    title="Remove from project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Files & Vault */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div className="glass-card p-8 border-2 border-dashed border-slate-300/80 text-center relative hover:border-sky-400 transition-colors">
            <Upload className="w-10 h-10 text-sky-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Upload Project Documents & Deliverables</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Share architecture diagrams, PDF specifications, ZIP files, or design assets.
            </p>

            <label className="mt-4 btn-primary text-xs px-5 py-2 inline-flex items-center gap-2 cursor-pointer">
              {fileUploadLoading ? 'Uploading...' : 'Select File to Upload'}
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={fileUploadLoading}
                className="hidden"
              />
            </label>
          </div>

          {/* Files Grid */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Project File Vault ({files.length})</h3>

            {files.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No files uploaded to this project workspace yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((f) => (
                  <div
                    key={f._id}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 hover:bg-sky-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate" title={f.originalName}>
                          {f.originalName}
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {(f.size / 1024).toFixed(1)} KB • {new Date(f.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={`${API_BASE_URL}/files/${f._id}/download?token=${localStorage.getItem('token') || ''}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteFile(f._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Activity Log */}
      {activeTab === 'activity' && (
        <div className="glass-card p-6 max-w-3xl">
          <h3 className="text-base font-bold text-slate-800 mb-6">Workspace Activity Timeline</h3>

          {activity.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No activity recorded yet.</p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activity.map((act) => (
                <div key={act._id} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-white" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">
                      {act.user?.name || 'Teammate'}
                    </p>
                    <p className="text-slate-600 mt-0.5">{act.details}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">Project Workspace Settings</h3>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="input-field text-xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="input-field text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Planning">Planning</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="input-field text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Deadline
                </label>
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  className="input-field text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button type="submit" className="btn-primary text-xs px-5 py-2">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          {isOwnerOrManager && (
            <div className="glass-card p-6 border-rose-200/80 bg-rose-50/20">
              <h4 className="text-sm font-bold text-rose-700">Danger Zone</h4>
              <p className="text-xs text-slate-500 mt-1">
                Permanently delete this project workspace and all attached tasks, files, and comments.
              </p>
              <button
                onClick={() => setConfirmDeleteOpen(true)}
                className="btn-danger text-xs mt-4"
              >
                <Trash2 className="w-4 h-4" /> Delete Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Task Details & Discussion Modal */}
      {taskModalOpen && selectedTask && (
        <Modal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          title={selectedTask.title}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Status & Priority Row */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateStatus(selectedTask._id, e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <PriorityBadge priority={selectedTask.priority} />
                <span className="text-xs text-slate-500">
                  Due: {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                {selectedTask.description || 'No description provided for this task.'}
              </p>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assignee:
              </span>
              {selectedTask.assignedTo ? (
                <div className="flex items-center gap-2">
                  <Avatar name={selectedTask.assignedTo.name} size="xs" />
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedTask.assignedTo.name}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">None</span>
              )}
            </div>

            {/* Comments & Discussion Thread */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-sky-600" />
                <h5 className="text-xs font-bold text-slate-800">
                  Task Discussion ({taskComments.length})
                </h5>
              </div>

              {/* Comments List */}
              <div className="max-h-56 overflow-y-auto space-y-3 mb-4 pr-1">
                {taskComments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No comments yet. Start the conversation below!
                  </p>
                ) : (
                  taskComments.map((c) => (
                    <div key={c._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Avatar name={c.user?.name} size="xs" />
                          <span className="text-xs font-bold text-slate-800">{c.user?.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 pl-7 leading-relaxed">{c.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post an update or feedback..."
                  className="input-field text-xs flex-1"
                />
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="btn-primary text-xs px-4 py-2"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        title="Add Sprint Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g., Integrate JWT Auth Middleware"
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Acceptance Criteria
            </label>
            <textarea
              rows="3"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Provide context and requirements..."
              className="input-field text-xs"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignee
              </label>
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="input-field text-xs"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user?._id} value={m.user?._id}>
                    {m.user?.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="input-field text-xs"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical 🔥</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="input-field text-xs"
              >
                <option value="TODO">To Do</option>
                <option value="IN PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateTaskModalOpen(false)}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs px-5 py-2">
              Add Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Teammate to Project"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Registered User or Type Email *
            </label>
            <input
              type="email"
              required
              list="user-suggestions"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="input-field text-xs"
            />
            <datalist id="user-suggestions">
              {allUsers.map((u) => (
                <option key={u._id} value={u.email}>
                  {u.name} ({u.role})
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="input-field text-xs"
            >
              <option value="Member">Member (Create & Update Tasks, Upload Files)</option>
              <option value="Manager">Manager (Assign Tasks, Manage Team)</option>
              <option value="Viewer">Viewer (Read-only)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteLoading}
              className="btn-primary text-xs px-5 py-2"
            >
              {inviteLoading ? 'Sending Invite...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project Workspace"
        message="Are you sure you want to delete this project? All associated tasks, files, and discussions will be permanently deleted."
        confirmText="Yes, Delete Project"
      />
    </div>
  );
};

export default ProjectDetail;
