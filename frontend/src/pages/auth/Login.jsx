import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import HeroScene from '../../components/3d/HeroScene';
import ThreeButton from '../../components/3d/ThreeButton';
import ThreeBackground from '../../components/3d/ThreeBackground';
import {
  LogIn,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Shield,
  User,
  Award,
  ArrowRight,
} from 'lucide-react';

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

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      addToast({
        title: 'Welcome Back!',
        message: 'Signed in successfully to your 3D workspace.',
        type: 'success',
      });
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error details:', err);

      if (!err.response) {
        setError('Unable to reach the server. Please verify backend is running.');
      } else if (err.response.status === 401) {
        setError('Invalid email or password.');
      } else if (err.response.status === 400) {
        setError(err.response.data?.message || 'Please enter your email and password.');
      } else {
        setError(err.response.data?.message || 'Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-[#3D2B24] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient Three.js Background */}
      <ThreeBackground intensity={0.7} showObjects={true} />

      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(61,43,36,0.12)] border border-[#F6EBDD] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] relative z-10">
        {/* Left: Authentication Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white/95">
          <div>
            {/* Brand Header */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E9785B] to-[#C85C45] flex items-center justify-center text-white shadow-md shadow-[#E9785B]/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-[#3D2B24] text-lg tracking-tight">
                  Collab<span className="text-[#E9785B]">Space</span>
                </span>
              </Link>

              <span className="px-3 py-1 rounded-full bg-[#FFF8ED] border border-[#F6EBDD] text-[11px] font-bold text-[#E9785B]">
                3D Auth
              </span>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D2B24] tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-[#8D6E63] text-xs sm:text-sm mt-1">
                Access your real-time Kanban sprints and project boards
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3D2B24] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]/60" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#FFF8ED]/50 border border-[#F6EBDD] rounded-2xl text-[#3D2B24] placeholder-[#8D6E63]/40 focus:outline-none focus:ring-2 focus:ring-[#E9785B]/25 focus:border-[#E9785B] text-sm shadow-inner transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D2B24] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#FFF8ED]/50 border border-[#F6EBDD] rounded-2xl text-[#3D2B24] placeholder-[#8D6E63]/40 focus:outline-none focus:ring-2 focus:ring-[#E9785B]/25 focus:border-[#E9785B] text-sm shadow-inner transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8D6E63]/60 hover:text-[#3D2B24] p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-[#8D6E63] cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-[#E9785B] focus:ring-[#E9785B] border-[#F6EBDD]"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-[#8D6E63]/70">Password: Password123!</span>
              </div>

              <ThreeButton
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full py-3.5 mt-2"
                icon={LogIn}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </ThreeButton>
            </form>
          </div>

          {/* Quick Demo Accounts Banner */}
          <div className="mt-8 pt-5 border-t border-[#F6EBDD]">
            <p className="text-[11px] font-bold text-[#8D6E63] uppercase tracking-wider mb-2">
              1-Click Demo Accounts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@example.com')}
                className="px-2.5 py-2 bg-[#F8F6FD] hover:bg-[#F0ECFA] text-[#8F78C8] rounded-xl text-[11px] font-bold border border-[#E0D8F6] transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager@example.com')}
                className="px-2.5 py-2 bg-[#FEF6F0] hover:bg-[#FDECE0] text-[#EE9467] rounded-xl text-[11px] font-bold border border-[#FAD6BE] transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('student@example.com')}
                className="px-2.5 py-2 bg-[#FDF2EF] hover:bg-[#FBE4DF] text-[#E9785B] rounded-xl text-[11px] font-bold border border-[#F7C9BE] transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                Student
              </button>
            </div>

            <div className="mt-5 text-center text-xs text-[#8D6E63]">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-[#E9785B] hover:text-[#C85C45] hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Interactive Three.js 3D Visual */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#FFF8ED] via-[#F6EBDD] to-[#F5B895]/20 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-l border-[#F6EBDD]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#F6EBDD] text-xs font-bold text-[#E9785B] mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E9785B]" />
              <span>ThreeUI 3D Experience</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3D2B24] tracking-tight leading-snug">
              Interactive workspace for modern engineering teams.
            </h2>
            <p className="text-xs sm:text-sm text-[#8D6E63] mt-2">
              Coordinate sprints, chat in real-time, and track milestones with tactile 3D responsiveness.
            </p>
          </div>

          {/* Embedded 3D Scene Viewport */}
          <div className="relative my-4 flex items-center justify-center">
            <HeroScene className="h-[280px] sm:h-[320px]" />
          </div>

          {/* Feature Bullets */}
          <div className="space-y-2 relative z-10 pt-2 border-t border-[#F6EBDD]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#3D2B24]">
              <CheckCircle2 className="w-4 h-4 text-[#9DB79B] shrink-0" />
              <span>Real-time Kanban Board & Drag-Drop Sprints</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#3D2B24]">
              <CheckCircle2 className="w-4 h-4 text-[#E9785B] shrink-0" />
              <span>Team Chat with Instant Typing Indicators</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
