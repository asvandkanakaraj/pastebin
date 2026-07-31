import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Plus, Search, Globe, LogOut, LogIn, User } from 'lucide-react';
import { ModeToggle } from '../mode-toggle.js';
import { useAuth } from '../auth-provider.js';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-45 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
            <Terminal className="h-4.5 w-4.5" />
          </div>
          <span className="text-md font-bold tracking-tight text-slate-900 dark:text-white">
            PasteBin
          </span>
        </Link>

        {/* Search Placeholder */}
        <div className="hidden max-w-xs flex-1 px-8 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search public pastes..."
              disabled
              className="h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-355 dark:hover:text-white transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>Browse</span>
          </Link>

          <Link
            to="/"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Paste</span>
          </Link>

          {/* Authentication States */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden lg:flex items-center gap-1 text-xs text-slate-500 font-medium max-w-[150px]">
                <User size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 transition-colors"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-850 transition-colors"
            >
              <LogIn size={12} />
              <span>Login</span>
            </Link>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
