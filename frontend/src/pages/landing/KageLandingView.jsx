import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KageLandingPage } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import { Sparkles, ArrowRight, LogIn, LayoutDashboard, Eye, EyeOff } from 'lucide-react';

export const KageLandingView = () => {
  const { isAuthenticated, user } = useAuth();
  const [showPortalBadge, setShowPortalBadge] = useState(true);

  return (
    <div className="shader-frame">
      <KageLandingPage
        headingFont="onest"
        bodyFont="onest"
        headingWeight="400"
        bodyWeight="300"
        primaryColor="#e0231c"
        headingSize={46}
        bodySize={17}
        headingLetterSpacing={-0.012}
      />

      {/* Floating Workspace Portal Bridge */}
      <aside 
        aria-label="Workspace Quick Access" 
        className="fixed top-4 right-4 z-[999] pointer-events-auto"
      >
        {showPortalBadge ? (
          <div className="flex items-center gap-3 bg-neutral-950/80 backdrop-blur-md border border-neutral-700/60 shadow-2xl rounded-full px-3.5 py-1.5 transition-all duration-300 hover:border-neutral-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e0231c] animate-pulse"></span>
              <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-300 hidden sm:inline">
                Collab<span className="text-[#ff5a3c]">Space</span>
              </span>
            </div>

            <div className="h-3 w-px bg-neutral-700 hidden sm:block"></div>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#e0231c] to-[#c01d17] hover:from-[#f02b23] hover:to-[#d0201a] text-white text-xs font-medium rounded-full shadow-md shadow-red-950/50 transition-all active:scale-95"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#e0231c] to-[#c01d17] hover:from-[#f02b23] hover:to-[#d0201a] text-white text-xs font-medium rounded-full shadow-md shadow-red-950/50 transition-all active:scale-95"
                >
                  <span>Open App</span>
                </Link>
              </div>
            )}

            <button
              onClick={() => setShowPortalBadge(false)}
              className="text-neutral-500 hover:text-neutral-300 p-0.5 ml-1 transition-colors"
              title="Hide overlay for pure scene view"
              aria-label="Hide workspace access"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPortalBadge(true)}
            className="flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-md border border-neutral-700/60 shadow-xl rounded-full px-3 py-1.5 text-neutral-400 hover:text-white text-xs transition-all hover:border-neutral-500"
            title="Show CollabSpace portal"
          >
            <Eye className="w-3.5 h-3.5 text-[#e0231c]" />
            <span className="hidden sm:inline text-[11px] font-medium tracking-wide">CollabSpace</span>
          </button>
        )}
      </aside>
    </div>
  );
};

export default KageLandingView;
