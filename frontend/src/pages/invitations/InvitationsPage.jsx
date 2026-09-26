import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { RoleBadge } from '../../components/common/Badge';
import { MailCheck, Check, X, FolderKanban, Calendar, Sparkles } from 'lucide-react';

export const InvitationsPage = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotifications();

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invitations/my-invitations');
      if (res.data.success) {
        setInvitations(res.data.invitations || []);
      }
    } catch (err) {
      console.error('Failed to load invitations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (inviteId, accept) => {
    try {
      const endpoint = accept
        ? `/invitations/${inviteId}/accept`
        : `/invitations/${inviteId}/reject`;
      const res = await api.post(endpoint);
      if (res.data.success) {
        setInvitations((prev) => prev.filter((i) => i._id !== inviteId));
        addToast({
          title: accept ? 'Invitation Accepted!' : 'Invitation Declined',
          message: accept
            ? 'You are now a member of the project workspace.'
            : 'Invitation was dismissed.',
          type: accept ? 'success' : 'info',
        });
      }
    } catch (err) {
      addToast({
        title: 'Action failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Invitations</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review invitations to join project repositories and collaborate with other teams.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner size="lg" text="Checking your invitations..." />
      ) : invitations.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <MailCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">Inbox is Clear</h3>
          <p className="text-xs text-slate-400 mt-1">
            You don't have any pending project invitations right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invite) => (
            <div
              key={invite._id}
              className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-[#FDF2EF] text-[#E9785B] border border-[#F7C9BE] flex-shrink-0">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      {invite.project?.name || 'Project Workspace'}
                    </h3>
                    <RoleBadge role={invite.role} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {invite.project?.description || 'You were invited to collaborate.'}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-2 block">
                    Invited on {new Date(invite.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <button
                  onClick={() => handleRespond(invite._id, false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  <X className="w-4 h-4 text-slate-500" /> Decline
                </button>
                <button
                  onClick={() => handleRespond(invite._id, true)}
                  className="btn-primary text-xs px-4 py-2"
                >
                  <Check className="w-4 h-4" /> Accept & Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvitationsPage;
