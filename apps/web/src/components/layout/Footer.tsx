import { APP_NAME } from '@pastebin/shared';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50/50 py-6 dark:border-slate-800 dark:bg-slate-950/20 mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <span className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </span>
        <div className="flex gap-6 text-xs font-medium text-slate-500">
          <a href="#" className="hover:text-indigo-500 transition-colors">
            API Docs
          </a>
          <a
            href="https://github.com/asvandkanakaraj/PasteBin"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-500 transition-colors"
          >
            GitHub
          </a>
          <a href="#" className="hover:text-indigo-500 transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
