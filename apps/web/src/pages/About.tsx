import {
  Info,
  BookOpen,
  User,
  Terminal,
  Cpu,
  Layers,
  ExternalLink,
  Github,
  Instagram,
  Link2,
  ListTodo,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export function About() {
  return (
    <div className="w-full max-w-5xl mx-auto py-4 md:py-8 space-y-10 page-fade-in select-none">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-955/40 dark:text-blue-450 shadow-sm shrink-0">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              About & Portfolio
            </h1>
            <p className="text-sm text-slate-500">
              An engineering-first look into PasteBin and its developer.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/asvandkanakaraj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Github size={14} />
            <span>GitHub</span>
          </a>
          <a
            href="https://the-linear.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md transition-colors"
          >
            <ExternalLink size={14} />
            <span>Portfolio</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns (Col Span 2) - Text Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: About PasteBin */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <Terminal className="text-blue-500 h-4.5 w-4.5" /> 1. The PasteBin Concept
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3.5 leading-relaxed">
              <p>
                <strong>PasteBin</strong> is a full-stack code-sharing environment designed for
                developers who need a secure, rapid way to share snippets. It supports anonymous
                guest storage, custom workspace sandboxes, and collaborative sharing permissions.
              </p>
              <p>
                Rather than building a standard, single-app CRUD demo, this platform was designed as
                an enterprise-grade monorepo containing multiple packages. Every layer—from JWT
                verification and cryptographic PIN generation to database triggers—was engineered
                with scalability, security, and developer experience in mind.
              </p>
            </div>
          </div>

          {/* Section 2: Why I Built This */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <BookOpen className="text-emerald-500 h-4.5 w-4.5" /> 2. Why I Built This
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3.5 leading-relaxed">
              <p>
                Most code-sharing applications solve exactly one problem: text storage. I wanted to
                build something that felt like a professional production tool.
              </p>
              <p>
                My objective was to master clean architecture boundaries, type consistency across
                frontend and backend boundaries, database migrations, and CI/CD automation rules.
                This project represents my philosophy of product development: focusing on
                maintainable structures and user experience over cutting corners.
              </p>
            </div>
          </div>

          {/* Section 3: About the Developer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <User className="text-indigo-500 h-4.5 w-4.5" /> 3. About the Developer
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3.5 leading-relaxed">
              <p>
                Hi, I'm <strong>Asvand Kanakaraj</strong>, a second-year Computer Science and
                Engineering student at Rajalakshmi Engineering College, Chennai.
              </p>
              <p>
                I am passionate about creating products that solve real problems. I enjoy planning
                backend architectures, designing clean user interfaces, and auditing systems for
                deployment. I believe that software engineering is about making deliberate technical
                choices that result in robust, scalable products.
              </p>
            </div>
          </div>

          {/* Section 4: Why DEVS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="text-purple-500 h-4.5 w-4.5" /> 4. Why I Want to Join DEVS
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3.5 leading-relaxed">
              <p>
                I see <strong>DEVS</strong> as a community of builders who share a genuine interest
                in software quality, architectural scaling, and shipping products that matter.
              </p>
              <p>
                I want to join to collaborate on challenging technical problems, learn from more
                experienced peers, and contribute my product-focused engineering mindset to the
                team's projects.
              </p>
            </div>
          </div>

          {/* Section 5: Other Projects */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <Layers className="text-amber-500 h-4.5 w-4.5" /> 5. Other Projects I'm Building
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center justify-between">
                  <span>The Linear</span>
                  <a
                    href="https://the-linear.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-500"
                  >
                    <Link2 size={12} />
                  </a>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  A platform connecting businesses with student developers through curated website
                  templates and streamlined delivery workflows.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">HOME</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  A unified family operating dashboard designed to organize finances, household
                  checklists, calendars, and goal tracking.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Finacate</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  A gamified financial literacy application that uses interactive quizzes, learning
                  paths, and AI feedback loops.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Athlete OS</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  A workout companion focused on calisthenics skill progressions, custom program
                  scheduling, and progress logging.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Col Span 1) - Sidebars */}
        <div className="space-y-6">
          {/* Tech Stack Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Cpu className="text-blue-500 h-4.5 w-4.5" />
              <h2 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                Tech Stack
              </h2>
            </div>

            <div className="space-y-3.5 text-[11px]">
              <div>
                <p className="font-bold text-slate-450 dark:text-slate-550 uppercase tracking-widest text-[9px] mb-1">
                  Frontend
                </p>
                <p className="font-semibold text-slate-700 dark:text-slate-350">
                  React, TypeScript, Vite, Tailwind CSS, Monaco Editor
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-805 pt-2.5">
                <p className="font-bold text-slate-450 dark:text-slate-550 uppercase tracking-widest text-[9px] mb-1">
                  Backend
                </p>
                <p className="font-semibold text-slate-700 dark:text-slate-350">
                  Node.js, Express.js, Prisma ORM, JSON Web Tokens (JWT)
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-850 pt-2.5">
                <p className="font-bold text-slate-450 dark:text-slate-550 uppercase tracking-widest text-[9px] mb-1">
                  Database & Devops
                </p>
                <p className="font-semibold text-slate-700 dark:text-slate-350">
                  Serverless Neon PostgreSQL, Render, GitHub Actions
                </p>
              </div>
            </div>
          </div>

          {/* Project Statistics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <CheckCircle className="text-emerald-500 h-4.5 w-4.5" />
              <h2 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                Project Quality
              </h2>
            </div>

            <ul className="space-y-2 text-[11px] font-semibold text-slate-600 dark:text-slate-350">
              <li className="flex items-center gap-2">✓ TypeScript Monorepo Architecture</li>
              <li className="flex items-center gap-2">✓ Zero TypeScript/Compiler Errors</li>
              <li className="flex items-center gap-2">✓ Zero ESLint / Oxlint Warnings</li>
              <li className="flex items-center gap-2">✓ 11/11 Automated Tests Passing</li>
              <li className="flex items-center gap-2">✓ 15+ Core Features Integrated</li>
              <li className="flex items-center gap-2">✓ Safe Parameterized SQL Queries</li>
              <li className="flex items-center gap-2">✓ Complete Mobile Responsiveness</li>
            </ul>
          </div>

          {/* Future Roadmap */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ListTodo className="text-purple-500 h-4.5 w-4.5" />
              <h2 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                Future Roadmap
              </h2>
            </div>

            <ul className="space-y-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">□ Paste Version History</li>
              <li className="flex items-center gap-2">□ Paste Expiration Scheduler</li>
              <li className="flex items-center gap-2">□ Custom Keyboard Shortcuts</li>
              <li className="flex items-center gap-2">□ Export Snippet as File</li>
              <li className="flex items-center gap-2">□ OpenGraph Shared Rich Preview</li>
              <li className="flex items-center gap-2">□ Monaco Editor Autosave Drafts</li>
            </ul>
          </div>

          {/* Links Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">
              Quick Connections
            </h2>

            <div className="flex flex-col gap-2.5 text-[11px] font-semibold">
              <a
                href="https://the-linear.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-slate-650 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-450 transition-colors"
              >
                <span>🌐 Portfolio</span>
                <ExternalLink size={11} />
              </a>
              <a
                href="https://github.com/asvandkanakaraj"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-slate-650 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-450 transition-colors"
              >
                <span>💻 GitHub Profile</span>
                <ExternalLink size={11} />
              </a>
              <a
                href="https://instagram.com/jusbyblue"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-slate-650 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-450 transition-colors"
              >
                <span>📷 Instagram</span>
                <Instagram size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Closing Note */}
      <div className="text-center py-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
        <p className="font-bold">Final Note</p>
        <p className="mt-1">
          Thank you for taking the time to explore this workspace. Every project I design teaches me
          more about software structures, client-server performance bottlenecks, and user
          interaction design. I hope this application highlights the standard of craftsmanship I
          strive to deliver.
        </p>
      </div>
    </div>
  );
}
