import { Terminal, Plus, Search } from 'lucide-react';
import { ModeToggle } from '../mode-toggle.js';

export function Navbar() {
  return (
    <header className="sticky top-0 z-45 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
            <Terminal className="h-4.5 w-4.5" />
          </div>
          <span className="text-md font-bold tracking-tight text-slate-900 dark:text-white">
            PasteBin
          </span>
        </div>

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
        <div className="flex items-center gap-3">
          <button className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>New Paste</span>
          </button>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
