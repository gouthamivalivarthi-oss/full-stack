import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LogIn, Lock, Mail, Eye, EyeOff, Sparkles, CheckCircle2, Shield, User, Award } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      addToast({
        title: 'Welcome Back!',
        message: 'You have signed in successfully.',
        type: 'success',
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Visual Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-800 p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Sparkles className="w-5 h-5 text-sky-200" />
              </div>
              <span className="text-xl font-black tracking-tight">CollabSpace</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight leading-tight mb-4">
              Next-Gen Student & Team Project Collaboration
            </h2>
            <p className="text-sky-100/80 text-sm leading-relaxed mb-6">
              Empower engineering teams, students, and project managers to plan sprints, track Kanban workflows, chat in real-time, and share deliverables seamlessly.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-sky-100">
                <CheckCircle2 className="w-4 h-4 text-sky-300" />
                <span>Live Interactive Kanban Board & Task Sprints</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-sky-100">
                <CheckCircle2 className="w-4 h-4 text-sky-300" />
                <span>Real-time Chat with Typing Indicators & Notifications</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-sky-100">
                <CheckCircle2 className="w-4 h-4 text-sky-300" />
                <span>Role-Based Access Control & Document File Vault</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Accounts Banner */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-xs font-semibold text-sky-200 uppercase tracking-wider mb-2.5">
              1-Click Demo Accounts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@example.com', 'Admin')}
                className="px-2.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-medium border border-white/20 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-purple-300" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager@example.com', 'Manager')}
                className="px-2.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-medium border border-white/20 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('student@example.com', 'Student')}
                className="px-2.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-medium border border-white/20 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-sky-300" />
                Student
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h3>
              <p className="text-slate-500 text-sm mt-1">
                Enter your credentials to access your collaboration workspace
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-slate-400">Default Password: Password123!</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-sm font-semibold mt-2"
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700 hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
