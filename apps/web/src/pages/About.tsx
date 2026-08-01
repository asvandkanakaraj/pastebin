import { Shield, Zap, Code, Link2, Info, BookOpen, Layers } from 'lucide-react';

export function About() {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 space-y-10 animate-in fade-in-50 duration-200 select-none">
      {/* Title Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-955/40 dark:text-blue-450 shadow-sm shrink-0">
          <Info className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            About PasteBin
          </h1>
          <p className="text-sm text-slate-500">
            A high-performance, modern, profile-centric code-sharing workstation.
          </p>
        </div>
      </div>

      {/* Main Description */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-md font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <BookOpen className="text-indigo-500 h-5 w-5" /> Description
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          PasteBin is a code sharing tool designed for transient or persistent code storage. It supports anonymous guest uploads, password-protected private pastes, and multi-user team workspaces with access permission settings.
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          It uses Monaco Editor for editing and rendering, providing full syntax highlighting and workspace listing options.
        </p>
      </div>

      {/* Core Features Grid */}
      <div className="space-y-4">
        <h2 className="text-md font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Layers className="text-indigo-500 h-5 w-5" /> Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-955/40 dark:text-blue-450 shadow-sm shrink-0">
              <Shield size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Private visibility
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal dark:text-slate-400">
              Guest uploads default to Private. Registered accounts can configure visibility options (Public, Private, or Secret).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-955/40 dark:text-amber-400">
              <Zap size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              High performance
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal dark:text-slate-400">
              Fast database storage, clean API responses, and low latency page loading.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Code size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Monaco Editor
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal dark:text-slate-400">
              Includes line number toggling, language selectors, theme switching, and fullscreen support.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Link2 size={16} />
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Collaboration
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal dark:text-slate-400">
              Access pastes via 8-character codes or direct links. Grant Read-Only or Read-Write permissions to specific users.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack & Versioning Card */}
      <div className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="space-y-1">
          <p className="font-bold text-slate-500 dark:text-slate-450 uppercase text-[9px] tracking-wider">
            Technology Stack
          </p>
          <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
            React, TypeScript, Vite, TailwindCSS, Express.js, PostgreSQL, and Prisma.
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-bold text-slate-500 dark:text-slate-450 uppercase text-[9px] tracking-wider">
            Project Purpose & Creator
          </p>
          <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
            Created by Asvand as a modern, premium, secure code sharing solution for development teams and individual programmers.
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-bold text-slate-500 dark:text-slate-450 uppercase text-[9px] tracking-wider">
            Platform Metadata
          </p>
          <div className="flex flex-col gap-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <span>Version: v1.0.0</span>
            <span>Database: Serverless Neon PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
