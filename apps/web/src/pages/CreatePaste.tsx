import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FilePlus2,
  Sun,
  Moon,
  List,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Lock,
  Unlock,
  Settings,
  Shield,
  Zap,
  Code as CodeIcon,
  Link2,
  Lightbulb,
  Eye,
  EyeOff,
  Save,
  ChevronDown,
} from 'lucide-react';
import { CreatePasteSchema } from '@pastebin/shared';
import { CodeEditor } from '../components/editor/CodeEditor.js';
import { useAuth } from '../components/auth-provider.js';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' },
];

const EXPIRATION_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: '600', label: '10 Minutes' },
  { value: '3600', label: '1 Hour' },
  { value: '86400', label: '1 Day' },
  { value: '604800', label: '1 Week' },
  { value: '2592000', label: '1 Month' },
];

export function CreatePaste() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Paste Form Data
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [expiration, setExpiration] = useState('never');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(`// // PasteBin is awesome! 🚀
function greetUser(name) {
  const greeting = \`Hello, \${name}!\`;
  return greeting;
}

function calculateSum(a, b) {
  return a + b;
}

const user = 'Developer';
console.log(greetUser(user));
console.log(2 + 2);`);

  // Editor Preferences & UI States
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('light');
  const [showLineNumbers, setShowLineNumbers] = useState<'on' | 'off'>('on');
  const [tabSize, setTabSize] = useState<number>(2);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings UI controls
  const [hasPassword, setHasPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditorMount = (editor: any) => {
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPos({
        line: e.position.lineNumber,
        col: e.position.column,
      });
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExpirationDescription = (val: string) => {
    switch (val) {
      case 'never':
        return 'The paste will never expire.';
      case '600':
        return 'The paste will expire in 10 minutes.';
      case '3600':
        return 'The paste will expire in 1 hour.';
      case '86400':
        return 'The paste will expire in 1 day.';
      case '604800':
        return 'The paste will expire in 1 week.';
      case '2592000':
        return 'The paste will expire in 1 month.';
      default:
        return '';
    }
  };

  const getVisibilityDescription = (val: boolean) => {
    return val
      ? 'Anyone with the link can view this paste.'
      : 'Only people with the direct URL can view this paste.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title: title.trim() || undefined,
      content,
      language,
      isPublic,
      password: hasPassword && password.trim() ? password.trim() : undefined,
      expiresInSeconds: expiration === 'never' ? undefined : parseInt(expiration),
    };

    // Schema Validation
    const validation = CreatePasteSchema.safeParse(payload);
    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || 'Validation failed';
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await axios.post('http://localhost:5000/api/pastes', payload, { headers });
      navigate(`/v/${response.data.id}`);
    } catch (err: any) {
      console.error('Create paste failed:', err);
      const serverError = err.response?.data?.message || 'Failed to save paste to server';
      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-2 md:py-6 space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-955/40 dark:text-blue-450 shadow-sm shrink-0">
          <FilePlus2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            Create New Paste
          </h1>
          <p className="text-sm text-slate-500">
            Share your code, notes, or any text securely with custom options.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left main editor card column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
            {/* Title block */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="title-input"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Title <span className="text-[10px] text-slate-400 lowercase">(optional)</span>
              </label>
              <input
                id="title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name of this paste..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 text-sm placeholder-slate-400 focus:border-blue-550 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-650 dark:focus:border-blue-500"
              />
            </div>

            {/* Code editor container */}
            <div
              className={`border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col ${
                isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 p-4' : 'relative'
              }`}
            >
              {/* Editor Toolbar */}
              <div className="bg-slate-55/50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
                <div className="flex items-center gap-3">
                  {/* Language Selector */}
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="appearance-none h-8 rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-450 pointer-events-none" />
                  </div>

                  {/* Auto detect label */}
                  <div className="relative">
                    <select
                      disabled
                      className="appearance-none h-8 rounded-lg border border-slate-200 bg-white/50 pl-3 pr-8 text-xs font-medium text-slate-400 cursor-not-allowed dark:border-slate-800 dark:bg-slate-950/50"
                    >
                      <option>Auto-detect</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Tab Size Dropdown */}
                  <div className="relative">
                    <select
                      value={tabSize}
                      onChange={(e) => setTabSize(parseInt(e.target.value))}
                      className="appearance-none h-8 rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                      <option value="2">Tab size: 2</option>
                      <option value="4">Tab size: 4</option>
                      <option value="8">Tab size: 8</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-450 pointer-events-none" />
                  </div>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Theme Button */}
                  <button
                    type="button"
                    onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                    title="Toggle Editor Theme"
                  >
                    {editorTheme === 'vs-dark' ? <Sun size={14} /> : <Moon size={14} />}
                  </button>

                  {/* Line Numbers Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowLineNumbers(showLineNumbers === 'on' ? 'off' : 'on')}
                    className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors ${
                      showLineNumbers === 'on' ? 'ring-1 ring-blue-500' : ''
                    }`}
                    title="Toggle Line Numbers"
                  >
                    <List size={14} />
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-850 transition-colors"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-850 transition-colors"
                    title="Copy Editor Code"
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Code editor */}
              <CodeEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                language={language}
                editorTheme={editorTheme}
                lineNumbers={showLineNumbers}
                tabSize={tabSize}
                onMount={handleEditorMount}
              />

              {/* Status bar */}
              <div className="bg-slate-55/50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-450 dark:text-slate-500 select-none">
                <div className="flex items-center gap-1.5 capitalize font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>{language}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>
                    Ln {cursorPos.line}, Col {cursorPos.col}
                  </span>
                  <span>{content.length} characters</span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 select-none">
            {/* Private card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Shield size={16} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                Private by Default
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your pastes are private until you choose to share
              </p>
            </div>

            {/* Fast card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <Zap size={16} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                Fast & Reliable
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instant creation and lightning-fast access
              </p>
            </div>

            {/* Highlighting card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <CodeIcon size={16} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                Syntax Highlighting
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Supports 100+ programming languages
              </p>
            </div>

            {/* Sharing card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Link2 size={16} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Easy Sharing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Share with anyone via unique link
              </p>
            </div>
          </div>
        </div>

        {/* Configurations Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 select-none">
              <Settings className="text-slate-450 h-4.5 w-4.5" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">Settings</h2>
            </div>

            {/* Language Selection */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="lang-select"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Language
              </label>
              <div className="relative">
                <select
                  id="lang-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 pr-10 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Expiration Selection */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="exp-select"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Expiration
              </label>
              <div className="relative">
                <select
                  id="exp-select"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="appearance-none h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 pr-10 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  {EXPIRATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal pl-0.5 select-none">
                {getExpirationDescription(expiration)}
              </span>
            </div>

            {/* Visibility Toggle */}
            <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                  Visibility
                </label>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    isPublic ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      isPublic ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal pl-0.5 select-none">
                {getVisibilityDescription(isPublic)}
              </span>
            </div>

            {/* Password Protection Toggle */}
            <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
                  {hasPassword ? (
                    <Lock size={12} className="text-blue-500" />
                  ) : (
                    <Unlock size={12} className="text-slate-400" />
                  )}
                  Password Protection{' '}
                  <span className="text-[9px] text-slate-400 lowercase">(optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setHasPassword(!hasPassword)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    hasPassword ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      hasPassword ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal pl-0.5 select-none">
                Add a password to protect this paste.
              </span>

              {/* Dynamic Password Input Field */}
              {hasPassword && (
                <div className="relative mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-3.5 pr-10 text-xs placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-medium leading-normal animate-in shake duration-300">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                <span>{loading ? 'Creating...' : 'Create Paste'}</span>
              </button>

              <button
                type="button"
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <Eye size={14} />
                <span>Preview Paste</span>
              </button>
            </div>
          </div>

          {/* Tip Box */}
          <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl p-4 flex gap-3 text-xs text-slate-600 dark:text-slate-400 shadow-xs">
            <Lightbulb className="text-amber-500 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Tip:</span>
              <p className="leading-relaxed">
                You can always edit or delete your paste from the link page.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
