import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export function NotFound() {
  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6 select-none animate-in fade-in duration-200">
      <div className="mx-auto p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 dark:text-rose-450 w-fit flex items-center justify-center">
        <FileQuestion size={36} className="animate-pulse" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">
          404 — Page Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed dark:text-slate-400">
          The requested page does not exist or has been moved. If you are looking for a shared
          snippet, check the URL or contact the owner.
        </p>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
        <Link
          to="/"
          className="inline-flex h-9.5 items-center justify-center gap-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 px-5 text-xs font-bold text-white shadow-md transition-colors"
        >
          <ArrowLeft size={12} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
