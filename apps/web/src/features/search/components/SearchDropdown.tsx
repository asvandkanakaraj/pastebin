import { User, FileText, AlertCircle, FileQuestion, ArrowRight } from 'lucide-react';
import type { SearchResults } from '../types/index.js';

interface SearchDropdownProps {
  loading: boolean;
  error: string | null;
  results: SearchResults | null;
  selectedIndex: number;
  onItemClick: (type: 'user' | 'paste' | 'view-all', item?: any) => void;
}

export function SearchDropdown({
  loading,
  error,
  results,
  selectedIndex,
  onItemClick,
}: SearchDropdownProps) {
  // Skeletons Loader component
  if (loading) {
    return (
      <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-950 space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-850 animate-pulse" />
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-850 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-850 animate-pulse" />
                <div className="h-2 w-32 rounded bg-slate-100 dark:bg-slate-850 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2">
          <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-850 animate-pulse" />
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-850 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-850 animate-pulse" />
                <div className="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-850 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State display
  if (error) {
    return (
      <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-950 text-center text-rose-500 flex flex-col items-center gap-1.5">
        <AlertCircle size={20} className="text-rose-500" />
        <span className="text-xs font-semibold">Unable to load search results.</span>
        <span className="text-[10px] text-slate-400">Continue typing to retry search.</span>
      </div>
    );
  }

  if (!results) return null;

  const usersList = results.users.slice(0, 5);
  const pastesList = results.pastes.slice(0, 5);
  const hasUsers = usersList.length > 0;
  const hasPastes = pastesList.length > 0;

  // Empty State display
  if (!hasUsers && !hasPastes) {
    return (
      <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950 text-center text-slate-500 flex flex-col items-center gap-2">
        <FileQuestion size={28} className="text-slate-350 dark:text-slate-600 animate-bounce" />
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          No users or pastes found.
        </span>
        <span className="text-[10px] text-slate-400">Try searching for other terms.</span>
      </div>
    );
  }

  // Build combined navigation array matching the layout order
  const hasMore = results.users.length > 5 || results.pastes.length > 5;
  const items: any[] = [];
  usersList.forEach((u) => items.push({ type: 'user', ...u }));
  pastesList.forEach((p) => items.push({ type: 'paste', ...p }));
  if (hasMore) {
    items.push({ type: 'view-all' });
  }

  return (
    <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 max-h-[420px] overflow-y-auto p-1.5 space-y-3">
      {/* Users Section */}
      {hasUsers && (
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
            Users
          </div>
          {usersList.map((user, idx) => {
            const globalIdx = idx;
            const isSelected = selectedIndex === globalIdx;

            return (
              <div
                key={user.id}
                onClick={() => onItemClick('user', user)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-850 text-slate-900 dark:text-white'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-850 dark:text-slate-400 shrink-0">
                  <User size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{user.username}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pastes Section */}
      {hasPastes && (
        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-850/60">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
            Pastes
          </div>
          {pastesList.map((paste, idx) => {
            const globalIdx = usersList.length + idx;
            const isSelected = selectedIndex === globalIdx;

            return (
              <div
                key={paste.id}
                onClick={() => onItemClick('paste', paste)}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-850 text-slate-900 dark:text-white'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shrink-0">
                    <FileText size={14} />
                  </div>
                  <span className="text-xs font-semibold truncate">
                    {paste.title || 'Untitled Paste'}
                  </span>
                </div>
                <span className="text-[9px] font-semibold text-slate-500 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 rounded capitalize">
                  {paste.language}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Results Button */}
      {hasMore && (
        <div
          onClick={() => onItemClick('view-all')}
          className={`flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-850/60 cursor-pointer transition-colors select-none font-bold text-xs text-indigo-500 hover:text-indigo-650 ${
            selectedIndex === items.length - 1
              ? 'bg-slate-100 dark:bg-slate-850 border-transparent text-indigo-600'
              : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
          }`}
        >
          <span>View all results</span>
          <ArrowRight size={13} />
        </div>
      )}
    </div>
  );
}
