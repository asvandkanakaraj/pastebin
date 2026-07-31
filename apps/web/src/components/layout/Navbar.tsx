import { Link, useNavigate } from 'react-router-dom';
import { Code, Search, LogOut, LogIn, User, LayoutDashboard } from 'lucide-react';
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
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search public pastes..."
              disabled
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-10 text-sm placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              /
            </div>
          </div>
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
            <a
              href="/docs/API.md"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              API
            </a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            {user && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                title="Go to Dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>
            )}

            <Link
              to="/"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
            >
              <span className="font-bold">+ New Paste</span>
            </Link>

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
