import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Lock, Clock, Eye, AlertCircle, ArrowLeft, Copy, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../components/theme-provider.js';

export function ViewPaste() {
  const { id } = useParams();
  const { theme } = useTheme();
  const [paste, setPaste] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchPaste = async (pw = '') => {
    setLoading(true);
    setError(null);
    setPasswordError(null);

    try {
      const headers: any = {};
      if (pw) {
        headers['x-paste-password'] = pw;
      }
      const response = await axios.get(`http://localhost:5000/api/pastes/${id}`, { headers });
      setPaste(response.data);
      setRequiresPassword(false);
    } catch (err: any) {
      console.error('Fetch paste error:', err);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setRequiresPassword(true);
        if (pw) {
          setPasswordError('Incorrect password');
        }
      } else if (status === 410) {
        setError('404 - Paste has expired and is no longer accessible.');
      } else if (status === 404) {
        setError('404 - Paste Not Found');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch paste from server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaste();
  }, [id]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPaste(password);
  };

  const handleCopy = async () => {
    if (paste?.content) {
      try {
        await navigator.clipboard.writeText(paste.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  if (loading && !requiresPassword) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-pulse">
        {/* Metadata Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-2.5 flex-1">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
            <div className="flex items-center gap-3">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-28" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-20" />
            </div>
          </div>
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
        </div>

        {/* Editor Area Skeleton */}
        <div className="w-full h-[450px] border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 p-6 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl relative z-10 text-center space-y-6">
        <div className="mx-auto p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-500 dark:text-indigo-400 w-fit">
          <Lock size={28} className="animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Password Required</h2>
          <p className="text-xs text-slate-500 mt-1">This snippet is protected by a password hash.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-500"
          />
          {passwordError && (
            <div className="text-xs text-rose-500 font-medium">{passwordError}</div>
          )}
          <button
            type="submit"
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-bold text-white shadow-md hover:bg-indigo-500 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
          >
            <span>Decrypt & View</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <Link to="/" className="text-indigo-500 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft size={10} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl relative z-10 text-center space-y-5">
        <div className="mx-auto p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 dark:text-rose-400 w-fit">
          <AlertCircle size={28} className="animate-bounce" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Error Loading Paste</h2>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <Link to="/" className="text-indigo-500 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft size={10} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="text-indigo-500 h-5 w-5" /> {paste.title || 'Untitled Paste'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-md font-semibold text-slate-600 dark:text-slate-300">
              {paste.language}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> Expiration: {paste.expiresAt ? new Date(paste.expiresAt).toLocaleString() : 'Never'}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {paste.isPublic ? 'Public' : 'Private link'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          
          <Link
            to="/"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-bold text-white shadow-md hover:bg-indigo-500 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
          >
            <ArrowLeft size={12} />
            <span>New Paste</span>
          </Link>
        </div>
      </div>

      <div className="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-950">
        <Editor
          height="450px"
          language={paste.language}
          value={paste.content}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
          }}
        />
      </div>
    </div>
  );
}
