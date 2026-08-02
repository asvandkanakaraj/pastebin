import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Terminal,
  Lock,
  Clock,
  Eye,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Edit,
  Share2,
  Users,
  Bookmark,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../components/theme-provider.js';
import { useAuth } from '../components/auth-provider.js';
import { API_BASE_URL } from '../lib/utils.js';

export function ViewPaste() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user, token } = useAuth();

  const [showCredentialsBanner, setShowCredentialsBanner] = useState(() => {
    return !!(location.state as any)?.justCreated;
  });
  const createdPin = (location.state as any)?.pin;

  const [paste, setPaste] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Sharing Modal States
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const fetchPaste = useCallback(
    async (pw = '') => {
      setLoading(true);
      setError(null);
      setPasswordError(null);

      const isGuest = !token;

      try {
        const headers: any = {};
        if (pw) {
          headers['x-paste-password'] = pw;
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.get(`${API_BASE_URL}/api/pastes/${id}`, { headers });
        setPaste(response.data);
        setRequiresPassword(false);
        setIsForbidden(false);

        // Bookmark checking
        if (isGuest) {
          const localSaved = JSON.parse(localStorage.getItem('pb_guest_saved_pastes') || '[]');
          setIsBookmarked(localSaved.some((p: any) => p.id === response.data.id));

          // Track Recently Viewed (max 5, duplicate moves to top)
          const localViews = JSON.parse(
            localStorage.getItem('pb_guest_recently_viewed_pastes') || '[]'
          );
          const filtered = localViews.filter((p: any) => p.id !== response.data.id);
          filtered.unshift(response.data);
          localStorage.setItem(
            'pb_guest_recently_viewed_pastes',
            JSON.stringify(filtered.slice(0, 5))
          );
        } else {
          setIsBookmarked(response.data.isSaved || false);
        }
      } catch (err: any) {
        const status = err.response?.status;
        const errorName = err.response?.data?.error;
        if (status === 401) {
          // Password required
          setRequiresPassword(true);
          setIsForbidden(false);
          if (pw) setPasswordError('Incorrect password. Try again.');
        } else if (status === 403 && errorName === 'ForbiddenError') {
          // Private paste — no password prompt
          setRequiresPassword(false);
          setIsForbidden(true);
        } else if (status === 410) {
          setError('This paste has expired and is no longer accessible.');
        } else if (status === 404) {
          setError('404 — Paste Not Found');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch paste from server');
        }
      } finally {
        setLoading(false);
      }
    },
    [id, token]
  );

  const handleToggleBookmark = async () => {
    if (!paste) return;
    const isGuest = !token;

    if (isGuest) {
      const localSaved = JSON.parse(localStorage.getItem('pb_guest_saved_pastes') || '[]');
      const alreadyBookmarked = localSaved.some((p: any) => p.id === paste.id);
      let updated = [];
      if (alreadyBookmarked) {
        updated = localSaved.filter((p: any) => p.id !== paste.id);
        setIsBookmarked(false);
      } else {
        localSaved.unshift(paste);
        updated = localSaved;
        setIsBookmarked(true);
      }
      localStorage.setItem('pb_guest_saved_pastes', JSON.stringify(updated));
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (isBookmarked) {
        await axios.delete(`${API_BASE_URL}/api/pastes/${paste.id}/save`, { headers });
        setIsBookmarked(false);
      } else {
        await axios.post(`${API_BASE_URL}/api/pastes/${paste.id}/save`, {}, { headers });
        setIsBookmarked(true);
      }
    } catch {
      // Ignore bookmark toggle failures silently
    }
  };

  useEffect(() => {
    fetchPaste();
  }, [fetchPaste]);

  // Fetch paste shares on modal open
  const fetchShares = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_BASE_URL}/api/pastes/${id}/shares`, {
        headers,
      });
      setSharedUsers(response.data || []);
    } catch {
      // Ignore share fetch failures — modal will be empty
    }
  }, [id, token]);

  useEffect(() => {
    if (showAdvanced) {
      fetchShares();
    }
  }, [showAdvanced, fetchShares]);

  // Debounced User Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await axios.get(
          `${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`,
          { headers }
        );
        // Exclude users already added
        const matched = (res.data.users || []).filter((u: any) => {
          return !sharedUsers.some((su) => su.userId === u.id);
        });
        setSearchResults(matched);
      } catch {
        // Silently ignore user search failures in share dropdown
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, sharedUsers, token]);

  // KeydownESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAdvanced) {
          setShowAdvanced(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAdvanced, showDeleteConfirm]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    await fetchPaste(password);
    setUnlocking(false);
  };

  const handleCopy = async () => {
    const codeToCopy = isEditing ? editContent : paste?.content;
    if (codeToCopy) {
      try {
        await navigator.clipboard.writeText(codeToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard not available — ignore silently
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
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await axios.delete(`${API_BASE_URL}/api/pastes/${id}`, { headers });
      navigate('/browse');
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete paste. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleStartEdit = () => {
    setEditTitle(paste?.title || '');
    setEditDescription(paste?.description || '');
    setEditContent(paste?.content || '');
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await axios.put(
        `${API_BASE_URL}/api/pastes/${id}`,
        {
          title: editTitle.trim(),
          description: editDescription.trim(),
          content: editContent,
          language: paste.language,
        },
        { headers }
      );
      setPaste(response.data);
      setIsEditing(false);
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || 'Unable to save changes. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Real-time sharing modifications
  const handleAddShare = async (selectedUser: any) => {
    if (!token) return;
    setShareError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `${API_BASE_URL}/api/pastes/${id}/share`,
        {
          usernameOrEmail: selectedUser.username,
          permission: 'READ',
        },
        { headers }
      );
      setSearchQuery('');
      setSearchResults([]);
      setShareSuccess('Paste shared successfully');
      setTimeout(() => setShareSuccess(null), 2000);
      await fetchShares();
    } catch (err: any) {
      setShareError(err.response?.data?.message || 'Unable to share paste. Please try again.');
    }
  };

  const handleUpdateSharePermission = async (targetUser: any, permission: 'READ' | 'WRITE') => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `${API_BASE_URL}/api/pastes/${id}/share`,
        {
          usernameOrEmail: targetUser.username,
          permission,
        },
        { headers }
      );
      await fetchShares();
    } catch {
      // Silently ignore permission update failures
    }
  };

  const handleRemoveShare = async (targetUserId: string) => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE_URL}/api/pastes/${id}/share/${targetUserId}`, {
        headers,
      });
      await fetchShares();
    } catch {
      // Silently ignore share removal failures
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
        <div className="mx-auto p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 dark:text-amber-400 w-fit">
          <Lock size={28} className="animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Password Required
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            This snippet is encrypted. Enter the password to unlock its content.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3 text-left">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter paste password..."
            autoFocus
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-slate-800 dark:bg-slate-955 dark:placeholder-slate-500 transition-all"
          />
          {passwordError && (
            <div className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
              <AlertCircle size={12} />
              {passwordError}
            </div>
          )}
          <button
            type="submit"
            disabled={unlocking}
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-bold text-white shadow-md hover:bg-amber-400 focus:outline-none dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors disabled:opacity-50"
          >
            <Lock size={13} />
            <span>{unlocking ? 'Unlocking...' : 'Decrypt & View'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <Link
            to="/"
            className="text-indigo-500 hover:underline flex items-center justify-center gap-1"
          >
            <ArrowLeft size={10} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl relative z-10 text-center space-y-6">
        <div className="mx-auto p-3.5 bg-slate-500/10 border border-slate-500/20 rounded-2xl text-slate-500 dark:text-slate-400 w-fit">
          <Lock size={28} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Private Paste</h2>
          <p className="text-xs text-slate-500 mt-1">
            This snippet is private and only accessible by its creator. If you believe you should
            have access, ask the owner to share a direct link.
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <Link
            to="/"
            className="text-indigo-500 hover:underline flex items-center justify-center gap-1"
          >
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
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Error Loading Paste
          </h2>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <Link
            to="/"
            className="text-indigo-500 hover:underline flex items-center justify-center gap-1"
          >
            <ArrowLeft size={10} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && paste && paste.userId === user.id;
  const isWriter = paste && paste.sharePermission === 'WRITE';
  const canEdit = isOwner || isWriter;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 relative animate-in fade-in duration-300">
      {showCredentialsBanner && createdPin && (
        <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3 shadow-xs select-none">
          <Lock className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">
              Save Paste Credentials
            </h4>
            <p className="text-[11px] text-amber-600 dark:text-amber-500/80 leading-normal">
              Make sure to save these details before leaving:
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 font-mono text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-350">
                Code: <span className="text-blue-600 dark:text-blue-400 select-all">{id}</span>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-700 dark:text-slate-350">
                PIN:{' '}
                <span className="text-amber-600 dark:text-amber-400 select-all">{createdPin}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCredentialsBanner(false)}
            className="text-amber-500 hover:text-amber-700 font-bold px-1.5 py-0.5 rounded transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Centered Sharing Advanced Settings Dialog Modal */}
      {showAdvanced && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-155 relative text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 select-none">
              <div className="flex items-center gap-2">
                <Users className="text-blue-500 h-5 w-5" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                  Advanced Sharing Settings
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 select-none">
              {/* User search input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Search Username or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type name or email address..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors"
                  />

                  {/* Suggestions dropdown */}
                  {searchQuery && (searchResults.length > 0 || searching) && (
                    <div className="absolute left-0 right-0 mt-1.5 z-55 max-h-48 overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-lg shadow-lg">
                      {searching ? (
                        <div className="p-3 text-xs text-slate-450 dark:text-slate-500 text-center">
                          Searching...
                        </div>
                      ) : (
                        searchResults.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleAddShare(u)}
                            className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-100 dark:border-slate-800 last:border-b-0 text-left text-xs text-slate-700 dark:text-slate-300"
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold uppercase text-[9px]">
                                {u.username.slice(0, 2)}
                              </span>
                              <div>
                                <p className="font-bold">{u.username}</p>
                                <p className="text-[9px] text-slate-400">{u.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-blue-600 dark:text-blue-450 font-bold">
                              Share
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Followers List Placeholder */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Quick Share (Followers)
                </label>
                <span className="text-[11px] text-slate-455 dark:text-slate-500 italic block pl-1">
                  No followers yet.
                </span>
              </div>

              {/* Shared list table */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Shared With
                </label>

                {sharedUsers.length === 0 ? (
                  <span className="text-[11px] text-slate-400 dark:text-slate-600 italic block pl-1">
                    Not shared with anyone yet.
                  </span>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                    {sharedUsers.map((item) => (
                      <div
                        key={item.userId}
                        className="flex items-center justify-between p-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-650 dark:bg-slate-900 dark:text-slate-400 font-bold uppercase text-[10px]">
                            {(item.user?.username || '').slice(0, 2)}
                          </span>
                          <div>
                            <p className="font-bold text-slate-700 dark:text-slate-300">
                              {item.user?.username}
                            </p>
                            <p className="text-[9px] text-slate-400">{item.user?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={item.permission}
                            onChange={(e) =>
                              handleUpdateSharePermission(item.user, e.target.value as any)
                            }
                            className="bg-transparent border-none text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-450 focus:outline-none cursor-pointer"
                          >
                            <option value="READ" className="bg-white dark:bg-slate-900">
                              Read Only
                            </option>
                            <option value="WRITE" className="bg-white dark:bg-slate-900">
                              Read & Write
                            </option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRemoveShare(item.userId)}
                            className="text-rose-500 hover:text-rose-700 font-bold p-1 transition-colors"
                            title="Remove Access"
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

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center">
              {shareSuccess && (
                <span className="text-[11px] text-emerald-500 font-bold mr-auto">
                  {shareSuccess}
                </span>
              )}
              {shareError && (
                <span className="text-[11px] text-rose-500 font-bold mr-auto">{shareError}</span>
              )}
              <button
                type="button"
                onClick={() => setShowAdvanced(false)}
                className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (AlertDialog Mock) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 dark:text-rose-400 w-fit">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">
                Delete Snippet?
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to delete this paste? This will permanently delete the content
                from the cloud database. This action is irreversible.
              </p>
            </div>
            {deleteError && (
              <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-lg px-3 py-2 font-medium text-left">
                {deleteError}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
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

      {/* Main Header / Edit Header details */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-2.5 flex-1">
          {isEditing ? (
            <div className="space-y-3 max-w-2xl">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter paste title..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors"
              />
              <textarea
                rows={2}
                maxLength={300}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value.slice(0, 300))}
                placeholder="Update paste description..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-955 resize-none dark:text-slate-300 transition-colors"
              />
              <span className="text-[9px] text-slate-400 block -mt-1 select-none text-right">
                {editDescription.length} / 300
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="text-indigo-500 h-5 w-5" /> {paste.title || 'Untitled Paste'}
              </h1>
              {paste.description && (
                <p className="text-xs text-slate-550 dark:text-slate-400 pl-7 leading-relaxed whitespace-pre-wrap">
                  {paste.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pl-7">
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-md font-semibold text-slate-600 dark:text-slate-300">
                  {paste.language}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Expiration:{' '}
                  {paste.expiresAt ? new Date(paste.expiresAt).toLocaleString() : 'Never'}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} /> Visibility:{' '}
                  <span className="capitalize">{paste.visibility.toLowerCase()}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 select-none">
          {/* Share/Advanced settings button (Owner only) */}
          {isOwner && !isEditing && (
            <button
              onClick={() => setShowAdvanced(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 size={12} />
              <span>Share</span>
            </button>
          )}

          {/* Bookmark / Save Button */}
          {paste && (
            <button
              onClick={handleToggleBookmark}
              className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-4 text-xs font-bold shadow-sm focus:outline-none transition-colors ${
                isBookmarked
                  ? 'bg-blue-650 border-blue-600 text-white hover:bg-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark size={12} className={isBookmarked ? 'fill-current' : ''} />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          {/* Edit / Update Controls */}
          {canEdit &&
            (isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={updating}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-805 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-650 hover:bg-emerald-600 px-4 text-xs font-bold text-white shadow-md transition-colors disabled:opacity-50"
                >
                  <Check size={12} />
                  <span>{updating ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEdit}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit size={12} />
                <span>Edit Paste</span>
              </button>
            ))}

          {/* Delete Button (Owner only) */}
          {isOwner && !isEditing && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-4 text-xs font-bold text-rose-600 shadow-sm hover:bg-rose-50/50 focus:outline-none dark:border-rose-900/40 dark:bg-slate-900 dark:text-rose-450 dark:hover:bg-rose-950/20 transition-colors"
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {updateError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-xl text-rose-650 dark:text-rose-400 text-xs font-bold animate-in shake duration-300 flex items-center gap-1.5">
          <AlertCircle size={12} />
          <span>{updateError}</span>
        </div>
      )}

      {/* Editor container area */}
      <div className="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Editor
          height="450px"
          language={paste.language}
          value={isEditing ? editContent : paste.content}
          onChange={(val) => isEditing && setEditContent(val || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly: !isEditing,
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
