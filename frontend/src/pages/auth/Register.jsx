import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import ThreeBackground from '../../components/3d/ThreeBackground';
import ThreeButton from '../../components/3d/ThreeButton';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Briefcase,
  Eye,
  EyeOff,
  Sparkles,
  Tag,
  Phone,
  CheckCircle2,
} from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    bio: '',
    phone: '',
    skills: 'React, Node.js, JavaScript',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        skills: formData.skills
          ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };
      delete payload.confirmPassword;

      await register(payload);
      addToast({
        title: 'Account Created!',
        message: 'Welcome to your CollabSpace 3D platform.',
        type: 'success',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-[#3D2B24] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient Three.js Background */}
      <ThreeBackground intensity={0.7} showObjects={true} />

      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(61,43,36,0.12)] border border-[#F6EBDD] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left Brand Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#E9785B] via-[#C85C45] to-[#8F78C8] p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold border border-white/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">CollabSpace</span>
            </Link>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug mb-3">
              Join Innovators in a Living 3D Workspace
            </h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6 font-light">
              Build your team profile, join capstone projects, manage Kanban tasks, chat with peers, and ship milestone deliverables on time.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#F5B895]" />
                <span>Real-Time Interactive Kanban</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#9DB79B]" />
                <span>Socket.IO Direct & Channel Messaging</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#B9A7E8]" />
                <span>Document & Architecture Vault</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-white/90 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <span className="font-bold block text-white mb-0.5">3D Collaborative Ecosystem</span>
            Smooth WebGL particle physics, tactile card tilts, and zero-latency cloud state.
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white/95">
          <div className="max-w-xl mx-auto">
            <div className="mb-6">
              <span className="px-3 py-1 rounded-full bg-[#FFF8ED] border border-[#F6EBDD] text-[11px] font-bold text-[#E9785B] inline-block mb-2">
                New Account
              </span>
              <h1 className="text-2xl font-extrabold text-[#3D2B24] tracking-tight">
                Create your Account
              </h1>
              <p className="text-[#8D6E63] text-xs mt-1">
                Fill in your details to launch your collaboration workspace
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#3D2B24] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]/60" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFF8ED]/50 border border-[#F6EBDD] rounded-2xl text-[#3D2B24] placeholder-[#8D6E63]/40 focus:outline-none focus:ring-2 focus:ring-[#E9785B]/25 focus:border-[#E9785B] text-xs shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3D2B24] mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]/60" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFF8ED]/50 border border-[#F6EBDD] rounded-2xl text-[#3D2B24] placeholder-[#8D6E63]/40 focus:outline-none focus:ring-2 focus:ring-[#E9785B]/25 focus:border-[#E9785B] text-xs shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#3D2B24] mb-1">
                    Account Role *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]/60" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFF8ED]/50 border border-[#F6EBDD] rounded-2xl text-[#3D2B24] text-xs focus:outline-none focus:ring-2 focus:ring-[#E9785B]/25 focus:border-[#E9785B] shadow-inner"
                    >
                      <option value="student">Student / Team Member</option>
                      <option value="manager">Project Lead / Manager</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3D2B24] mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]/60" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFF8ED]/50 border border-[#F6EBDD] rounded-2xl text-[#3D2B24] placeholder-[#8D6E63]/40 focus:outline-none focus:ring-2 focus:ring-[#E9785B]/25 focus:border-[#E9785B] text-xs shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D2B24] mb-1">
                  Skills (comma separated)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]/60" />
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Three.js, Node.js, Python"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FFF8ED]/50 border border-[#F6EBDD] rounded-2xl text-[#3D2B24] placeholder-[#8D6E63]/40 focus:outline-none focus:ring-2 focus:ring-[#E9785B]/25 focus:border-[#E9785B] text-xs shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#3D2B24] mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-2.5 bg-[#FFF8ED]/50 border border-[#F6EBDD] rounded-2xl text-[#3D2B24] placeholder-[#8D6E63]/40 focus:outline-none focus:ring-2 focus:ring-[#E9785B]/25 focus:border-[#E9785B] text-xs shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D6E63]/60 hover:text-[#3D2B24]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3D2B24] mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D6E63]/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFF8ED]/50 border border-[#F6EBDD] rounded-2xl text-[#3D2B24] placeholder-[#8D6E63]/40 focus:outline-none focus:ring-2 focus:ring-[#E9785B]/25 focus:border-[#E9785B] text-xs shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3D2B24] mb-1">
                  Short Bio / Major
                </label>
                <textarea
                  name="bio"
                  rows="2"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell your team about your experience and interests..."
                  className="w-full p-3 bg-[#FFF8ED]/50 border border-[#F6EBDD] rounded-2xl text-[#3D2B24] placeholder-[#8D6E63]/40 focus:outline-none focus:ring-2 focus:ring-[#E9785B]/25 focus:border-[#E9785B] text-xs shadow-inner"
                ></textarea>
              </div>

              <ThreeButton
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full py-3 mt-1"
                icon={UserPlus}
              >
                {loading ? 'Creating account...' : 'Complete Registration'}
              </ThreeButton>
            </form>

            <div className="mt-5 text-center text-xs text-[#8D6E63]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#E9785B] hover:text-[#C85C45] hover:underline">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
