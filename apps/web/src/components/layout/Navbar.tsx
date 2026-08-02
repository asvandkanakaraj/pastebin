import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, LogOut, LogIn, ArrowLeft } from 'lucide-react';
import { ModeToggle } from '../mode-toggle.js';
import { useAuth } from '../auth-provider.js';
import { SearchInput } from '../../features/search/components/SearchInput.js';
import { Logo } from './Logo.js';

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

  // Display name is username (prefixed with @) if available, otherwise email
  const displayIdentifier = user ? (user.username ? `@${user.username}` : user.email) : '';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200 transition-colors shadow-sm">
            <Logo size={18} />
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
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link
              to="/browse"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Browse
            </Link>
            <Link
              to="/about"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About
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

            {/* Authentication States */}
            {user ? (
              <div className="flex items-center gap-3.5">
                {/* Clickable Profile Element */}
                <Link
                  to={`/profile/${user.username || user.email}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  aria-label="View user profile"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username || 'user avatar'}
                      className="h-7 w-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold uppercase text-[10px]">
                      {(user.username || user.email).slice(0, 2)}
                    </span>
                  )}
                  <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[140px] truncate">
                    {displayIdentifier}
                  </span>
                </Link>

                {/* Inline Logout Trigger */}
                <button
                  onClick={handleLogout}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-rose-500 dark:border-slate-800 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
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
