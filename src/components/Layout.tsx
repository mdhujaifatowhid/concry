import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Heart, Flame, MoreVertical, Mail, Info, FileText, Lock, X, Search, ChevronDown, Filter, Moon, Sun } from 'lucide-react';
import { cn, CATEGORIES } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';

const TreeLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 20V10" />
    <path d="M18 10c0-3.314-2.686-6-6-6s-6 2.686-6 6c0 1.105.298 2.138.818 3.023L12 20l5.182-6.977A5.98 5.98 0 0 0 18 10Z" />
    <path d="M12 10V4" />
    <path d="m9 14 3-3 3 3" />
  </svg>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dark mode changed:', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('cat') || 'All';

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q') as string;
    
    const newParams = new URLSearchParams(searchParams);
    if (q) newParams.set('q', q);
    else newParams.delete('q');
    
    setSearchParams(newParams);
    if (window.location.pathname !== '/') {
      navigate('/?' + newParams.toString());
    }
  };

  const handleCategorySelect = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('cat');
    else newParams.set('cat', cat);
    
    setSearchParams(newParams);
    setIsCategoryOpen(false);
    if (window.location.pathname !== '/') {
      navigate('/?' + newParams.toString());
    }
  };

  const menuItems = [
    { label: 'About Us', icon: Info, path: '/about' },
    { label: 'Terms & Policy', icon: FileText, path: '/terms' },
    { label: 'Contact', icon: Mail, path: 'mailto:mdhujaifa411@gmail.com', isExternal: true },
    { label: 'Admin Login', icon: Lock, path: '/admin/login' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-black/10 dark:selection:bg-white/10 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Three Dot Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                aria-label="Menu"
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                    {menuItems.map((item) => (
                      item.isExternal ? (
                        <a
                          key={item.label}
                          href={item.path}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.label}</span>
                        </a>
                      ) : (
                        <Link
                          key={item.label}
                          to={item.path}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      )
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="text-white dark:text-black">
                  <TreeLogo />
                </div>
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic dark:text-white">CONCRY</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {/* Search Icon */}
            <div className="relative">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={cn(
                  "p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors",
                  isSearchOpen && "bg-gray-100 dark:bg-neutral-800"
                )}
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-64 md:w-80 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-gray-500" />
                    <input 
                      name="q"
                      type="text"
                      defaultValue={searchQuery}
                      placeholder="Search secrets..."
                      autoFocus
                      className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-black/10 dark:focus:border-white/10 transition-all dark:text-white"
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-[10px] font-black uppercase tracking-widest",
                  selectedCategory !== 'All' 
                    ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200" 
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                <Filter className="w-3 h-3" />
                <span className="hidden sm:inline">{selectedCategory}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", isCategoryOpen && "rotate-180")} />
              </button>

              {isCategoryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 max-h-[60vh] overflow-y-auto no-scrollbar">
                    <button
                      onClick={() => handleCategorySelect('All')}
                      className={cn(
                        "w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors",
                        selectedCategory === 'All' ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                      )}
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={cn(
                          "w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors",
                          selectedCategory === cat ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pb-8 min-h-[calc(100vh-160px)] overflow-x-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-neutral-800 py-8 px-4 bg-gray-50 dark:bg-neutral-900 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-black dark:hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
            <a href="mailto:report@concry.com" className="hover:text-black dark:hover:text-white transition-colors">Report Abuse</a>
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
