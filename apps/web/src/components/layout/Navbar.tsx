import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Code, Search, LogOut, LogIn, User, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { ModeToggle } from '../mode-toggle.js';
import { useAuth } from '../auth-provider.js';
import { SearchInput } from '../../features/search/components/SearchInput.js';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isMobileSearchOpen) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => setIsMobileSearchOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
            aria-label="Close search"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <SearchInput />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Code className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            PasteBin
          </span>
        </Link>

        {/* Search Bar */}
        <div className="hidden max-w-md flex-1 px-8 md:flex justify-center">
          <SearchInput />
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link
              to="/browse"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Browse
            </Link>
          </nav>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 md:hidden dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
              aria-label="Open search"
            >
              <Search size={14} />
            </button>

            {user && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                title="Manage Workspace"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden lg:inline">Manage Workspace</span>
              </Link>
            )}

            {/* Authentication States */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-1 text-xs text-slate-500 font-medium max-w-[120px]">
                  <User size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut size={12} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <LogIn size={12} />
                <span>Login</span>
              </Link>
            )}

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
