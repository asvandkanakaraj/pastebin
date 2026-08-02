import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FilePlus2,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  Lock,
  Loader2,
} from 'lucide-react';
import { CreatePasteSchema } from '@pastebin/shared';
import { CodeEditor } from '../components/editor/CodeEditor.js';
import { useAuth } from '../components/auth-provider.js';
import { API_BASE_URL } from '../lib/utils.js';

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
  { value: '3600', label: '1 Hour' },
  { value: '86400', label: '24 Hours' },
  { value: '604800', label: '7 Days' },
  { value: '2592000', label: '30 Days' },
];

export function CreatePaste() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const isGuest = !token;

  // Paste Form Data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [expiration, setExpiration] = useState(isGuest ? '3600' : 'never');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'SECRET'>(
    isGuest ? 'PRIVATE' : 'PUBLIC'
  );
  const [pinOption, setPinOption] = useState<'auto' | 'custom'>('auto');
  const [customPin, setCustomPin] = useState(() =>
    Math.floor(100000 + Math.random() * 900000).toString()
  );
  const [showPin, setShowPin] = useState(false);
  const [content, setContent] = useState('');

  // Editor Preferences & UI States
  const [editorTheme, _setEditorTheme] = useState<'vs-dark' | 'light'>(
    (localStorage.getItem('pb_editor_theme') as 'vs-dark' | 'light') || 'vs-dark'
  );
  const [showLineNumbers, _setShowLineNumbers] = useState<'on' | 'off'>(
    (localStorage.getItem('pb_editor_line_numbers') as 'on' | 'off') || 'on'
  );
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sharing states (Owner only)
  const [sharedUsers, setSharedUsers] = useState<
    Array<{ id: string; username: string; email: string; permission: 'READ' | 'WRITE' }>
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; username: string; email: string }>
  >([]);
  const [searching, setSearching] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  // Creation State Controls
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guest Success Modal Details
  const [createdPasteData, setCreatedPasteData] = useState<any | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  useEffect(() => {
    if (isGuest) {
      setExpiration('3600');
      setVisibility('PRIVATE');
      setPinOption('auto');
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setCustomPin(generated);
    }
  }, [isGuest]);

  const setEditorTheme = (theme: 'vs-dark' | 'light') => {
    _setEditorTheme(theme);
    localStorage.setItem('pb_editor_theme', theme);
  };

  const setShowLineNumbers = (mode: 'on' | 'off') => {
    _setShowLineNumbers(mode);
    localStorage.setItem('pb_editor_line_numbers', mode);
  };

  const handleEditorMount = (editor: any) => {
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPos({
        line: e.position.lineNumber,
        col: e.position.column,
      });
    });
  };

  // Keyboard accessibility listeners (ESC fullscreen exits & modals close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setShowAdvanced(false);
        setCreatedPasteData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced User Lookup inside Sharing modal
  useEffect(() => {
    if (!searchQuery.trim() || isGuest) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(
          `${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`,
          { headers }
        );
        // Exclude users already added
        const matched = (response.data.users || []).filter((u: any) => {
          return !sharedUsers.some((su) => su.id === u.id);
        });
        setSearchResults(matched);
      } catch {
        // Silently ignore user search failures
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, sharedUsers, token, isGuest]);

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — ignore silently
    }
  };

  const getExpirationDescription = (val: string) => {
    if (isGuest) return 'Fixed: 1 hour for Guest Mode.';
    switch (val) {
      case 'never':
        return 'Keep this snippet stored indefinitely.';
      case '3600':
        return 'Inaccessible after 1 hour.';
      case '86400':
        return 'Inaccessible after 24 hours.';
      case '604800':
        return 'Inaccessible after 7 days.';
      case '2592000':
        return 'Inaccessible after 30 days.';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalPin = customPin.trim();
    if ((isGuest || visibility === 'PRIVATE') && !finalPin) {
      finalPin = Math.floor(100000 + Math.random() * 900000).toString();
      setCustomPin(finalPin);
    }

    const payload: any = {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      content,
      language,
      visibility: isGuest ? 'PRIVATE' : visibility,
      isPublic: isGuest ? false : visibility === 'PUBLIC',
      password: isGuest || visibility === 'PRIVATE' ? finalPin : undefined,
      expiresInSeconds: isGuest ? 3600 : expiration === 'never' ? undefined : parseInt(expiration),
      shares: isGuest
        ? undefined
        : sharedUsers.map((su) => ({ userId: su.id, permission: su.permission })),
    };

    // Validation checks
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
      const response = await axios.post(`${API_BASE_URL}/api/pastes`, payload, { headers });

      if (isGuest) {
        // Save Guest transient details inside browser localStorage
        const recents = JSON.parse(localStorage.getItem('pb_guest_recent_pastes') || '[]');
        recents.unshift(response.data);
        localStorage.setItem('pb_guest_recent_pastes', JSON.stringify(recents));

        // Open guest success modal
        setCreatedPasteData(response.data);
      } else {
        navigate(`/v/${response.data.id}`);
      }
    } catch (err: any) {
      if (err.response?.status === 401 && token) {
        logout();
        setError('Session expired. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Unable to create paste. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-2 md:py-6 space-y-6 page-fade-in">
      {/* Success Dialog Modal Overlay */}
      {createdPasteData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative text-left">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Paste Created</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Publishing complete. Record these credentials to access this private paste.
              </p>
            </div>

            <div className="space-y-4 py-2 border-y border-slate-100 dark:border-slate-800">
              {/* Paste Code */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Paste Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={createdPasteData.id}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 pr-10 text-xs font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400 dark:border-slate-800 dark:bg-slate-950 select-all"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(createdPasteData.id);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title="Copy Paste Code"
                  >
                    {copiedCode ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* PIN code (Private pastes) */}
              {(isGuest || visibility === 'PRIVATE') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Access PIN
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={customPin}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 pr-10 text-xs font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 dark:border-slate-800 dark:bg-slate-900 select-all"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(customPin);
                        setCopiedPin(true);
                        setTimeout(() => setCopiedPin(false), 2000);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title="Copy PIN"
                    >
                      {copiedPin ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Small Action to Copy URL Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `${window.location.origin}/v/${createdPasteData.id}`
                  );
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-blue-500 dark:text-slate-450 dark:hover:text-blue-400 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                {copiedUrl ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copiedUrl ? 'Copied Link!' : 'Copy Share Link'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedPasteData(null);
                  setTitle('');
                  setDescription('');
                  setContent('');
                  // Regene random pin
                  setCustomPin(Math.floor(100000 + Math.random() * 900000).toString());
                }}
                className="flex-1 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
              >
                Create Another
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(`/v/${createdPasteData.id}`, {
                    state: { justCreated: true, pin: customPin },
                  })
                }
                className="flex-1 h-10 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none transition-colors"
              >
                Open Paste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings Modal (Authenticated Users only) */}
      {!isGuest && showAdvanced && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-155 relative text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 select-none">
              <div className="flex items-center gap-2">
                <Settings className="text-blue-500 h-5 w-5" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                  Advanced Sharing Configurations
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvanced(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 font-bold p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Search Username or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type username or email address..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                  {searchQuery && (searchResults.length > 0 || searching) && (
                    <div className="absolute left-0 right-0 mt-1.5 z-55 max-h-48 overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg">
                      {searching ? (
                        <div className="p-3 text-xs text-slate-400 text-center">Searching...</div>
                      ) : (
                        searchResults.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setSharedUsers([...sharedUsers, { ...u, permission: 'READ' }]);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-100 dark:border-slate-800 last:border-b-0 text-left text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-700 dark:text-slate-300">
                                {u.username}
                              </p>
                              <p className="text-[9px] text-slate-400">{u.email}</p>
                            </div>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                              + Add
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Quick Share (Followers)
                </label>
                <span className="text-[11px] text-slate-450 italic block pl-1">
                  No followers yet.
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Shared With
                </label>
                {sharedUsers.length === 0 ? (
                  <span className="text-[11px] text-slate-400 dark:text-slate-600 italic block pl-1">
                    Not shared with anyone yet.
                  </span>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-805 bg-white dark:bg-slate-950">
                    {sharedUsers.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-150 text-slate-650 dark:bg-slate-900 font-bold uppercase text-[10px]">
                            {item.username.slice(0, 2)}
                          </span>
                          <div>
                            <p className="font-bold text-slate-700 dark:text-slate-300">
                              {item.username}
                            </p>
                            <p className="text-[9px] text-slate-400">{item.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={item.permission}
                            onChange={(e) => {
                              setSharedUsers(
                                sharedUsers.map((su) =>
                                  su.id === item.id
                                    ? { ...su, permission: e.target.value as any }
                                    : su
                                )
                              );
                            }}
                            className="bg-transparent border-none text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 focus:outline-none cursor-pointer"
                          >
                            <option
                              value="READ"
                              className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                            >
                              Read Only
                            </option>
                            <option
                              value="WRITE"
                              className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                            >
                              Read & Write
                            </option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              setSharedUsers(sharedUsers.filter((su) => su.id !== item.id))
                            }
                            className="text-rose-500 hover:text-rose-700 font-bold p-1 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 items-center">
              {shareSuccess && (
                <span className="text-[11px] text-emerald-500 font-bold mr-auto">
                  {shareSuccess}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setShareSuccess('Configuration applied');
                  setTimeout(() => {
                    setShareSuccess(null);
                    setShowAdvanced(false);
                  }, 800);
                }}
                disabled={sharedUsers.length === 0}
                className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-colors"
              >
                Apply Sharing Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-955/40 dark:text-blue-450 shadow-sm shrink-0">
          <FilePlus2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            New Paste
          </h1>
          <p className="text-xs text-slate-500">Create a transient or persistent code snippet.</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start select-none"
      >
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5 animate-in fade-in-50 duration-200">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="title-input"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Title
              </label>
              <input
                id="title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-655 transition-colors"
              />
            </div>

            <div
              className={`border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col ${
                isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 p-4' : 'relative'
              }`}
            >
              <div className="bg-slate-55/50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="appearance-none h-8 rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none dark:border-slate-800 dark:bg-slate-900 transition-colors"
                    >
                      {LANGUAGES.map((lang) => (
                        <option
                          key={lang.value}
                          value={lang.value}
                          className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                        >
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-455 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-660 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                    title="Toggle Editor Theme"
                  >
                    {editorTheme === 'vs-dark' ? <Sun size={14} /> : <Moon size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLineNumbers(showLineNumbers === 'on' ? 'off' : 'on')}
                    className={`h-8 px-2.5 inline-flex items-center justify-center gap-1 rounded-lg border text-xs font-bold transition-colors ${
                      showLineNumbers === 'on'
                        ? 'bg-blue-50 border-blue-200 text-blue-650 dark:bg-blue-955/20 dark:border-blue-900/40 dark:text-blue-400'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                    }`}
                    title="Toggle Line Numbers"
                  >
                    <span>123</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-660 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyClipboard}
                    className="h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-slate-660 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                    title="Copy Full Code"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-[380px]">
                <CodeEditor
                  value={content}
                  language={language}
                  editorTheme={editorTheme}
                  lineNumbers={showLineNumbers}
                  onChange={(val) => setContent(val || '')}
                  tabSize={2}
                  height={isFullscreen ? 'calc(100vh - 120px)' : '400px'}
                  onMount={handleEditorMount}
                />
              </div>

              <div className="bg-slate-55/30 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-[10px] text-slate-455 font-semibold select-none">
                <span>{language.toUpperCase()} WORKSPACE</span>
                <div className="flex items-center gap-4">
                  <span>
                    Ln {cursorPos.line}, Col {cursorPos.col}
                  </span>
                  <span>{content.length} characters</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-5 animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 select-none">
              <Settings className="text-slate-450 h-4.5 w-4.5" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">Settings</h2>
            </div>

            {/* Description Textarea */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="desc-input"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Description
              </label>
              <textarea
                id="desc-input"
                rows={3}
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                placeholder="Describe what this paste contains..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 resize-none dark:placeholder-slate-600 leading-normal transition-colors"
              />
              <span className="text-[9px] text-slate-405 text-right pr-0.5">
                {description.length} / 300
              </span>
            </div>

            {/* Expiration Selection */}
            <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-805 pt-4">
              <label
                htmlFor="exp-select"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Expiration
              </label>
              <div className="relative">
                <select
                  id="exp-select"
                  disabled={isGuest}
                  value={isGuest ? '3600' : expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="appearance-none h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 pr-10 text-xs font-medium focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 text-slate-800 disabled:opacity-80 transition-colors"
                >
                  {isGuest ? (
                    <option
                      value="3600"
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    >
                      1 Hour (Guest Mode)
                    </option>
                  ) : (
                    EXPIRATION_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                      >
                        {opt.label}
                      </option>
                    ))
                  )}
                </select>
                {!isGuest && (
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-455 pointer-events-none" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal pl-0.5 select-none">
                {getExpirationDescription(isGuest ? '3600' : expiration)}
              </span>
              {isGuest && (
                <span className="text-[9px] text-amber-500 font-semibold leading-relaxed mt-0.5 italic pl-0.5">
                  Guest pastes are fixed to 1 Hour limits. Please sign in to extend expirations.
                </span>
              )}
            </div>

            {/* Visibility Selector */}
            <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                Visibility
              </label>
              {isGuest ? (
                <>
                  <div className="py-2.5 px-3 rounded-lg border border-slate-250 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 text-xs font-bold flex items-center gap-2 select-none shadow-xs">
                    <Lock size={12} className="text-slate-400" />
                    <span>Private (Guest Mode)</span>
                  </div>
                  <span className="text-[9px] text-amber-500 font-semibold leading-normal pl-0.5 select-none block mt-1 italic animate-in fade-in duration-200">
                    Guest pastes default to Private and can only be accessed using their generated
                    URL or Paste Code.
                  </span>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1.5 animate-in fade-in duration-200">
                    {[
                      { id: 'PUBLIC', label: 'Public', icon: <Eye size={12} /> },
                      { id: 'PRIVATE', label: 'Private', icon: <Lock size={12} /> },
                      { id: 'SECRET', label: 'Secret', icon: <EyeOff size={12} /> },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setVisibility(opt.id as any)}
                        className={`py-2 px-1 text-center rounded-lg border text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                          visibility === opt.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 leading-normal pl-0.5 select-none block mt-1">
                    Select who can browse, search or access this code snippet.
                  </span>
                </>
              )}

              {/* Private PIN configs (Authenticated users only) */}
              {!isGuest && visibility === 'PRIVATE' && (
                <div className="space-y-3 mt-3 p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl animate-in fade-in duration-200">
                  <label className="text-[9px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                    PIN Protection
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPinOption('auto');
                        const generated = Math.floor(100000 + Math.random() * 900000).toString();
                        setCustomPin(generated);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-colors ${
                        pinOption === 'auto'
                          ? 'bg-blue-50 border-blue-200 text-blue-650 dark:bg-blue-950/20 dark:border-blue-900/30'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      Auto PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPinOption('custom');
                        setCustomPin('');
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-colors ${
                        pinOption === 'custom'
                          ? 'bg-blue-50 border-blue-200 text-blue-650 dark:bg-blue-950/20 dark:border-blue-900/30'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      Custom PIN
                    </button>
                  </div>

                  {pinOption === 'auto' && (
                    <div className="flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="font-mono text-blue-600 dark:text-blue-400 tracking-widest">
                        {customPin || 'Generating...'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-normal">Generated PIN</span>
                    </div>
                  )}

                  {pinOption === 'custom' && (
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={customPin}
                        onChange={(e) =>
                          setCustomPin(e.target.value.replace(/\D/g, '').slice(0, 8))
                        }
                        placeholder="4 to 8 digits PIN"
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  )}

                  {visibility === 'PRIVATE' && (customPin.length < 4 || customPin.length > 8) && (
                    <span className="text-[9px] text-rose-500 font-medium leading-none block pt-0.5">
                      PIN must be 4 to 8 digits
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Sharing rules info / modal launch */}
            {isGuest ? (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-[10px] text-slate-450 italic">
                Advanced sharing configurations require a registered account.
              </div>
            ) : (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(true)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  <span>Advanced Settings</span>
                  <ChevronDown size={14} />
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-medium leading-normal animate-in shake duration-300">
                {error}
              </div>
            )}

            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <FilePlus2 size={14} />}
                <span>{loading ? 'Creating...' : 'Create Paste'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
