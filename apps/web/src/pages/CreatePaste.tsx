import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Save, Lock } from 'lucide-react';
import { CreatePasteSchema } from '@pastebin/shared';
import { CodeEditor } from '../components/editor/CodeEditor.js';
import { useAuth } from '../components/auth-provider.js';

const LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
];

const EXPIRATION_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: '3600', label: '1 Hour' },
  { value: '86400', label: '1 Day' },
  { value: '604800', label: '1 Week' },
];

export function CreatePaste() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [expiration, setExpiration] = useState('never');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('// Type your code here...');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title: title.trim() || undefined,
      content,
      language,
      isPublic,
      password: password.trim() || undefined,
      expiresInSeconds: expiration === 'never' ? undefined : parseInt(expiration),
    };

    // Client-side schema validation via Zod
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="text-indigo-500 h-6 w-6" /> Create New Paste
          </h1>
          <p className="text-xs text-slate-500">Share your snippet securely with custom expiration and syntax highlights.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Title (Optional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name of this paste..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Content
              </label>
              <CodeEditor value={content} onChange={(val) => setContent(val || '')} language={language} />
            </div>
          </div>
        </div>

        {/* Configurations Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Settings</h2>

            {/* Language Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="language" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiration Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="expiration" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Expiration
              </label>
              <select
                id="expiration"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                {EXPIRATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex flex-col gap-0.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Public Visibility
                </label>
                <span className="text-[10px] text-slate-400">List on feed page</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isPublic ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Password Protection */}
            <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Lock size={12} /> Password (Optional)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-medium leading-normal">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-bold text-white shadow-md hover:bg-indigo-500 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              <span>{loading ? 'Creating...' : 'Create Paste'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
