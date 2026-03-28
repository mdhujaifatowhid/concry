import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Heart, Flame } from 'lucide-react';

const TreeLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 20V10" />
    <path d="M18 10c0-3.314-2.686-6-6-6s-6 2.686-6 6c0 1.105.298 2.138.818 3.023L12 20l5.182-6.977A5.98 5.98 0 0 0 18 10Z" />
    <path d="M12 10V4" />
    <path d="m9 14 3-3 3 3" />
  </svg>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black/10">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center group-hover:scale-105 transition-transform">
              <TreeLogo />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">CONCRY</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/create" 
              className="px-4 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
            >
              Confess
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pb-8 min-h-[calc(100vh-160px)] overflow-x-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-black transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <a href="mailto:report@concry.com" className="hover:text-black transition-colors">Report Abuse</a>
          </div>
          <div className="flex items-center gap-2">
            <span>© 2026 CONCRY.</span>
            <div className="flex gap-1">
              <Heart className="w-3 h-3 text-blue-500" />
              <Flame className="w-3 h-3 text-red-500" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
