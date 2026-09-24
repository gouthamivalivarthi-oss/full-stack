import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../../components/common/Avatar';
import { RoleBadge } from '../../components/common/Badge';
import {
  User,
  Mail,
  Phone,
  Tag,
  Lock,
  Camera,
  CheckCircle2,
  Shield,
  Save,
} from 'lucide-react';

export const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useNotifications();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    skills: user?.skills ? user.skills.join(', ') : '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Update Profile Info
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const payload = {
        name: profileForm.name,
        bio: profileForm.bio,
        phone: profileForm.phone,
        skills: profileForm.skills
          ? profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        updateUser(res.data.user);
        addToast({
          title: 'Profile Updated',
          message: 'Your personal information was saved.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Update failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.',
        type: 'error',
      });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.data.success) {
        addToast({
          title: 'Password Changed',
          message: 'Your password has been updated securely.',
          type: 'success',
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      addToast({
        title: 'Failed to update password',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // Upload Avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        updateUser(res.data.user);
        addToast({
          title: 'Avatar Updated',
          message: 'Your profile photo has been refreshed.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Avatar upload failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile & Preferences</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your student profile, skillset tags, account credentials, and avatar.
        </p>
      </div>

      {/* User Header Card */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative group">
            <Avatar name={user?.name} src={user?.avatar} size="lg" isOnline />
            <label className="absolute bottom-0 right-0 p-1.5 bg-sky-500 text-white rounded-full cursor-pointer hover:bg-sky-600 shadow-md transition-colors">
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={avatarLoading}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
              <RoleBadge role={user?.role} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-slate-500 mt-1.5 italic max-w-md">
              "{user?.bio || 'Collaborator at CollabSpace platform'}"
            </p>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Form: Profile Details */}
        <div className="md:col-span-7 glass-card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" /> Personal Information
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Read Only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="input-field text-xs bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skills & Tech Stack (comma separated)
              </label>
              <input
                type="text"
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                placeholder="React, Node.js, Python, Figma"
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                About / Bio
              </label>
              <textarea
                rows="3"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Tell your team about your strengths and background..."
                className="input-field text-xs"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="btn-primary text-xs px-5 py-2"
              >
                <Save className="w-3.5 h-3.5" />
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Form: Security / Password */}
        <div className="md:col-span-5 glass-card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-600" /> Security & Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                placeholder="••••••••"
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="••••••••"
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                className="input-field text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="btn-secondary text-xs px-5 py-2 text-slate-700 hover:text-slate-900"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
