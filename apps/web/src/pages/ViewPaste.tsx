import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Lock, Clock, Eye, AlertCircle, ArrowLeft, Copy, Check, Trash2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../components/theme-provider.js';

export function ViewPaste() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [paste, setPaste] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const headers: any = {};
      if (password) {
        headers['x-paste-password'] = password;
      }
      await axios.delete(`http://localhost:5000/api/pastes/${id}`, { headers });
      navigate('/browse');
    } catch (err: any) {
      console.error('Delete paste failed:', err);
      alert(err.response?.data?.message || 'Failed to delete paste');
      setDeleting(false);
      setShowDeleteConfirm(false);
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
    <div className="w-full max-w-5xl mx-auto space-y-6 relative">
      {/* Delete Confirmation Modal (AlertDialog Mock) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 dark:text-rose-400 w-fit">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">Delete Snippet?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to delete this paste? This will permanently delete the content from the cloud database. This action is irreversible.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 h-9.5 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-9.5 inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white shadow-md hover:bg-rose-500 focus:outline-none dark:bg-rose-500 dark:hover:bg-rose-400 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-4 text-xs font-bold text-rose-600 shadow-sm hover:bg-rose-50/50 focus:outline-none dark:border-rose-900/40 dark:bg-slate-900 dark:text-rose-450 dark:hover:bg-rose-950/20 transition-colors"
          >
            <Trash2 size={12} />
            <span>Delete</span>
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
