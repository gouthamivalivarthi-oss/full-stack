import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HeroScene from '../../components/3d/HeroScene';
import ThreeCard from '../../components/3d/ThreeCard';
import ThreeButton from '../../components/3d/ThreeButton';
import ThreeBackground from '../../components/3d/ThreeBackground';
import {
  Sparkles,
  ArrowRight,
  FolderKanban,
  MessageSquare,
  ShieldCheck,
  FolderArchive,
  CheckCircle2,
  Users,
  Layers,
  Zap,
  Globe,
  Award,
} from 'lucide-react';

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-[#3D2B24] relative overflow-hidden selection:bg-[#E9785B] selection:text-white">
      {/* Ambient Three.js Background with warm floating objects */}
      <ThreeBackground intensity={0.8} showObjects={true} />

      {/* Floating Modern Header / Navbar */}
      <nav className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white/85 backdrop-blur-xl border border-[#F6EBDD] rounded-3xl px-6 py-3.5 flex items-center justify-between shadow-[0_10px_30px_-5px_rgba(61,43,36,0.06)]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E9785B] via-[#E9785B] to-[#C85C45] flex items-center justify-center text-white font-bold shadow-md shadow-[#E9785B]/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-[#3D2B24] text-lg tracking-tight">
                Collab<span className="text-[#E9785B]">Space</span>
              </span>
              <span className="block text-[10px] text-[#8D6E63] uppercase tracking-widest font-bold">
                3D Workspace
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-[#3D2B24]/80">
            <a href="#features" className="hover:text-[#E9785B] transition-colors">
              Features
            </a>
            <a href="#scene" className="hover:text-[#E9785B] transition-colors">
              3D Experience
            </a>
            <a href="#metrics" className="hover:text-[#E9785B] transition-colors">
              Architecture
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-gradient-to-r from-[#E9785B] to-[#C85C45] hover:from-[#DF5E3E] hover:to-[#B04B35] text-white text-xs font-bold rounded-2xl shadow-[0_6px_20px_-3px_rgba(233,120,91,0.45)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-1.5"
              >
                <span>Dashboard ({user?.name?.split(' ')[0]})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-[#3D2B24] hover:text-[#E9785B] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#E9785B] to-[#C85C45] hover:from-[#DF5E3E] hover:to-[#B04B35] text-white text-xs font-bold rounded-2xl shadow-[0_6px_20px_-3px_rgba(233,120,91,0.45)] hover:-translate-y-0.5 active:scale-[0.98] transition-all inline-flex items-center gap-1.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, description, CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#F6EBDD] text-xs font-bold text-[#E9785B] shadow-sm backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#E9785B]" />
              <span>Next-Gen 3D Team Collaboration</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-[#3D2B24]">
              Plan, Build & Ship Faster in a{' '}
              <span className="bg-gradient-to-r from-[#E9785B] via-[#C85C45] to-[#8F78C8] bg-clip-text text-transparent">
                Living 3D
              </span>{' '}
              Workspace.
            </h1>

            <p className="text-base sm:text-lg text-[#8D6E63] font-normal leading-relaxed max-w-2xl">
              Empower engineering teams, students, and agile squads to coordinate live Kanban boards, collaborate with real-time socket chat, store files, and manage role governance with ease.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <ThreeButton
                variant="primary"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="text-base py-4 px-8"
                icon={Zap}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Launch Workspace Free'}
              </ThreeButton>

              <ThreeButton
                variant="secondary"
                onClick={() => navigate(isAuthenticated ? '/projects' : '/login')}
                className="text-base py-4 px-8"
                icon={FolderKanban}
              >
                {isAuthenticated ? 'Explore Projects' : 'Sign In & Demo'}
              </ThreeButton>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#8D6E63] font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#9DB79B]" />
                <span>Live Three.js 3D Physics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E9785B]" />
                <span>Real-Time Socket.IO</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B9A7E8]" />
                <span>Production MongoDB Atlas</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Three.js 3D Scene */}
          <div id="scene" className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full">
              {/* Soft decorative glow backdrops */}
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#F5B895]/25 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-[#B9A7E8]/25 rounded-full blur-3xl pointer-events-none"></div>

              {/* 3D Scene Viewport Card */}
              <ThreeCard maxTilt={8} className="p-3 bg-white/70 backdrop-blur-2xl border border-[#F6EBDD] shadow-[0_20px_50px_rgba(233,120,91,0.15)]">
                <HeroScene />
                <div className="p-4 bg-white/90 rounded-2xl border border-[#F6EBDD] flex items-center justify-between text-xs text-[#3D2B24]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9DB79B] animate-ping"></span>
                    <span className="font-bold">Interactive 3D Centerpiece</span>
                  </div>
                  <span className="text-[#8D6E63] text-[11px]">Move cursor to rotate & interact</span>
                </div>
              </ThreeCard>
            </div>
          </div>
        </div>
      </section>

      {/* Dimensional 3D Feature Cards */}
      <section id="features" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8ED] border border-[#F6EBDD] text-xs font-bold text-[#E9785B] mb-3">
            <Layers className="w-3.5 h-3.5 text-[#E9785B]" />
            <span>Built for Modern High-Velocity Teams</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D2B24] tracking-tight">
            Everything your team needs, engineered in 3D.
          </h2>
          <p className="text-sm sm:text-base text-[#8D6E63] mt-2">
            Eliminate fragmented tools. CollabSpace brings agile tracking, direct messaging, and file distribution into one warm, harmonious interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Kanban (Coral) */}
          <ThreeCard className="p-6 flex flex-col justify-between h-full bg-white/90">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FDF2EF] border border-[#F7C9BE] flex items-center justify-center text-[#E9785B] mb-5 shadow-xs">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#3D2B24] mb-2">Live Kanban Sprints</h3>
              <p className="text-xs text-[#8D6E63] leading-relaxed">
                Drag and drop tasks across Backlog, In Progress, Review, and Completed stages with instant team-wide sync.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F6EBDD] flex items-center justify-between text-xs font-bold text-[#E9785B]">
              <span>Dynamic Workflows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </ThreeCard>

          {/* Card 2: Team Chat (Lavender) */}
          <ThreeCard className="p-6 flex flex-col justify-between h-full bg-white/90">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F8F6FD] border border-[#E0D8F6] flex items-center justify-center text-[#8F78C8] mb-5 shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#3D2B24] mb-2">Real-Time Team Chat</h3>
              <p className="text-xs text-[#8D6E63] leading-relaxed">
                Zero-latency messaging with typing indicators, project discussion threads, and instant sound notifications.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F6EBDD] flex items-center justify-between text-xs font-bold text-[#8F78C8]">
              <span>Socket.IO Powered</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </ThreeCard>

          {/* Card 3: File Vault (Sage) */}
          <ThreeCard className="p-6 flex flex-col justify-between h-full bg-white/90">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F6F9F6] border border-[#D9E6D8] flex items-center justify-center text-[#7FA07D] mb-5 shadow-xs">
                <FolderArchive className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#3D2B24] mb-2">Document File Vault</h3>
              <p className="text-xs text-[#8D6E63] leading-relaxed">
                Centralized cloud file storage for architecture diagrams, sprint specs, project slides, and binary assets.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F6EBDD] flex items-center justify-between text-xs font-bold text-[#7FA07D]">
              <span>Multi-Format Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </ThreeCard>

          {/* Card 4: Governance (Peach) */}
          <ThreeCard className="p-6 flex flex-col justify-between h-full bg-white/90">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FEF6F0] border border-[#FAD6BE] flex items-center justify-center text-[#EE9467] mb-5 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#3D2B24] mb-2">Role-Based Access</h3>
              <p className="text-xs text-[#8D6E63] leading-relaxed">
                Granular permission controls for Admins, Project Managers, and Students with JWT authentication and audit trails.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F6EBDD] flex items-center justify-between text-xs font-bold text-[#EE9467]">
              <span>Enterprise RBAC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </ThreeCard>
        </div>
      </section>

      {/* Metrics Banner */}
      <section id="metrics" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-[#E9785B] via-[#C85C45] to-[#8F78C8] rounded-3xl p-8 sm:p-12 text-white shadow-[0_20px_50px_rgba(233,120,91,0.25)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight">99.8%</div>
              <p className="text-xs sm:text-sm text-white/80 font-medium mt-1">On-Time Sprints</p>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight">&lt;40ms</div>
              <p className="text-xs sm:text-sm text-white/80 font-medium mt-1">Real-Time Sync</p>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight">100%</div>
              <p className="text-xs sm:text-sm text-white/80 font-medium mt-1">Three.js Accelerated</p>
            </div>
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight">24/7</div>
              <p className="text-xs sm:text-sm text-white/80 font-medium mt-1">Cloud Reliability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-[#F6EBDD] bg-white/80 backdrop-blur-xl mt-12 py-8 text-center text-xs text-[#8D6E63]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E9785B]" />
            <span className="font-bold text-[#3D2B24]">CollabSpace 3D Platform</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link to="/login" className="hover:text-[#E9785B] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-[#E9785B] transition-colors">
              Create Account
            </Link>
            <Link to="/dashboard" className="hover:text-[#E9785B] transition-colors">
              Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
