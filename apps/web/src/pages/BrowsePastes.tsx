import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Terminal,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Search,
  X,
  Share2,
  Trash2,
  Edit,
  Copy,
  Bookmark,
  Clock,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../components/auth-provider.js';
import { API_BASE_URL } from '../lib/utils.js';

interface Paste {
  id: string;
  title: string | null;
  content: string;
  language: string;
  isPublic: boolean;
  visibility?: string;
  hasPassword?: boolean;
  createdAt: string;
  updatedAt: string;
  ownerUsername?: string;
  sharedAt?: string;
  savedAt?: string;
  viewedAt?: string;
}

interface WorkspaceData {
  myPastes: Paste[];
  sharedWithMe: Paste[];
  saved: Paste[];
  recentlyViewed: Paste[];
}

export function BrowsePastes() {
  const { user, logout } = useAuth();

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state for My Pastes section
  const [myPastesSearch, setMyPastesSearch] = useState('');
  const [myPastesSort, setMyPastesSort] = useState<'newest' | 'oldest' | 'updated' | 'alpha'>(
    'newest'
  );

  // Section View Modes (remembers preference)
  const [viewModes, setViewModes] = useState<{ [key: string]: 'grid' | 'list' }>({
    myPastes: (localStorage.getItem('pb_view_myPastes') as 'grid' | 'list') || 'grid',
    sharedWithMe: (localStorage.getItem('pb_view_sharedWithMe') as 'grid' | 'list') || 'grid',
    saved: (localStorage.getItem('pb_view_saved') as 'grid' | 'list') || 'grid',
  });

  // Action Modals State
  const [selectedPaste, setSelectedPaste] = useState<Paste | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareInput, setShareInput] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLanguage, setEditLanguage] = useState('plaintext');
  const [editVisibility, setEditVisibility] = useState('PUBLIC');
  const [editPassword, setEditPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmPaste, setDeleteConfirmPaste] = useState<Paste | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isGuest = !user;

  const fetchWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isGuest) {
      // Guest Mode: load from local browser storage
      const localRecents = JSON.parse(localStorage.getItem('pb_guest_recent_pastes') || '[]');
      const localSaved = JSON.parse(localStorage.getItem('pb_guest_saved_pastes') || '[]');
      const localViews = JSON.parse(localStorage.getItem('pb_guest_recently_viewed_pastes') || '[]');
      setWorkspace({
        myPastes: localRecents,
        sharedWithMe: [],
        saved: localSaved,
        recentlyViewed: localViews,
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('pb_token');
      const response = await axios.get(`${API_BASE_URL}/api/workspace`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkspace(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
      } else {
        setError(err.response?.data?.message || 'Unable to load workspace. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [isGuest, logout]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const toggleViewMode = (section: string) => {
    const nextMode = viewModes[section] === 'grid' ? 'list' : 'grid';
    setViewModes((prev) => ({ ...prev, [section]: nextMode }));
    localStorage.setItem(`pb_view_${section}`, nextMode);
  };

  // 1. My Pastes Operations
  const handleToggleVisibility = async (paste: Paste) => {
    try {
      const token = localStorage.getItem('pb_token');
      const currentVis = paste.visibility || (paste.isPublic ? 'PUBLIC' : 'PRIVATE');
      const nextVis = currentVis === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
      await axios.put(
        `${API_BASE_URL}/api/pastes/${paste.id}`,
        {
          title: paste.title || '',
          content: paste.content,
          language: paste.language,
          visibility: nextVis,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchWorkspace();
    } catch {
      // Silently ignore visibility toggle failures
    }
  };

  const handleDeletePaste = async (paste: Paste) => {
    setDeleteConfirmPaste(paste);
  };

  const confirmDeletePaste = async () => {
    if (!deleteConfirmPaste) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('pb_token');
      await axios.delete(`${API_BASE_URL}/api/pastes/${deleteConfirmPaste.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteConfirmPaste(null);
      fetchWorkspace();
    } catch {
      setDeleteConfirmPaste(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDuplicatePaste = async (paste: Paste) => {
    try {
      const token = localStorage.getItem('pb_token');
      await axios.post(
        `${API_BASE_URL}/api/pastes`,
        {
          title: paste.title ? `${paste.title} (Copy)` : 'Copy Paste',
          content: paste.content,
          language: paste.language,
          isPublic: paste.isPublic,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchWorkspace();
    } catch {
      // Silently ignore duplicate paste failures
    }
  };

  // 2. Sharing Operations
  const openShareModal = (paste: Paste) => {
    setSelectedPaste(paste);
    setShareInput('');
    setShareError(null);
    setShareSuccess(false);
    setShowShareModal(true);
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaste || !shareInput.trim()) return;
    setShareLoading(true);
    setShareError(null);
    setShareSuccess(false);
    try {
      const token = localStorage.getItem('pb_token');
      await axios.post(
        `${API_BASE_URL}/api/pastes/${selectedPaste.id}/share`,
        { usernameOrEmail: shareInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShareSuccess(true);
      setTimeout(() => setShowShareModal(false), 1500);
    } catch (err: any) {
      setShareError(err.response?.data?.message || 'Failed to share paste.');
    } finally {
      setShareLoading(false);
    }
  };

  // 3. Edit Operations
  const openEditModal = (paste: Paste) => {
    setSelectedPaste(paste);
    setEditTitle(paste.title || '');
    setEditContent(paste.content || '');
    setEditLanguage(paste.language);
    setEditVisibility(paste.visibility || (paste.isPublic ? 'PUBLIC' : 'PRIVATE'));
    setEditPassword('');
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaste) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const token = localStorage.getItem('pb_token');
      await axios.put(
        `${API_BASE_URL}/api/pastes/${selectedPaste.id}`,
        {
          title: editTitle.trim(),
          content: editContent,
          language: editLanguage,
          visibility: editVisibility,
          password: editVisibility === 'PRIVATE' ? editPassword || undefined : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      fetchWorkspace();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update paste.');
    } finally {
      setEditLoading(false);
    }
  };

  // 4. Bookmark Operations
  const handleBookmarkSave = async (paste: Paste) => {
    if (isGuest) {
      const localSaved = JSON.parse(localStorage.getItem('pb_guest_saved_pastes') || '[]');
      if (!localSaved.some((p: any) => p.id === paste.id)) {
        localSaved.unshift(paste);
        localStorage.setItem('pb_guest_saved_pastes', JSON.stringify(localSaved));
      }
      fetchWorkspace();
      return;
    }

    try {
      const token = localStorage.getItem('pb_token');
      await axios.post(
        `${API_BASE_URL}/api/pastes/${paste.id}/save`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchWorkspace();
    } catch {
      // Ignore bookmark failures silently
    }
  };

  const handleBookmarkRemove = async (paste: Paste) => {
    if (isGuest) {
      const localSaved = JSON.parse(localStorage.getItem('pb_guest_saved_pastes') || '[]');
      const updated = localSaved.filter((p: any) => p.id !== paste.id);
      localStorage.setItem('pb_guest_saved_pastes', JSON.stringify(updated));
      fetchWorkspace();
      return;
    }

    try {
      const token = localStorage.getItem('pb_token');
      await axios.delete(`${API_BASE_URL}/api/pastes/${paste.id}/save`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWorkspace();
    } catch {
      // Ignore bookmark removal failures silently
    }
  };

  // Utility copy functions
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const copyLink = (pasteId: string) => {
    const link = `${window.location.origin}/v/${pasteId}`;
    copyToClipboard(link, pasteId);
  };



  // Loading skeleton state
  if (loading && !workspace) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 animate-pulse">
        {[1, 2].map((sec) => (
          <div key={sec} className="space-y-4">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Local filtering logic for My Pastes
  const myPastesFiltered = (workspace?.myPastes || [])
    .filter((p) => (p.title || '').toLowerCase().includes(myPastesSearch.toLowerCase()))
    .sort((a, b) => {
      if (myPastesSort === 'newest')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (myPastesSort === 'oldest')
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (myPastesSort === 'updated')
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (myPastesSort === 'alpha') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="text-indigo-500 h-6 w-6" /> Workspace Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access, manage, and collaborate on code snippets in your personal hub.
          </p>
        </div>
        <button
          onClick={fetchWorkspace}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-250 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-650 dark:text-slate-300 dark:hover:bg-slate-900 shadow-sm"
          title="Refresh Workspace"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchWorkspace} className="underline font-bold hover:opacity-85">
            Retry
          </button>
        </div>
      )}

      {/* SECTION 1 — MY PASTES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-md font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            My Pastes{' '}
            <span className="text-xs text-slate-400 font-normal">({myPastesFiltered.length})</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search my pastes..."
                value={myPastesSearch}
                onChange={(e) => setMyPastesSearch(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 transition-colors"
              />
            </div>

            {/* Sort Select */}
            <select
              value={myPastesSort}
              onChange={(e: any) => setMyPastesSort(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-955 transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="updated">Recently Updated</option>
              <option value="alpha">Alphabetical</option>
            </select>

            {/* Grid / List view toggle */}
            <button
              onClick={() => toggleViewMode('myPastes')}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-500 hover:text-slate-850"
            >
              {viewModes.myPastes === 'grid' ? <List size={14} /> : <LayoutGrid size={14} />}
            </button>
          </div>
        </div>

        {myPastesFiltered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 space-y-3 flex flex-col items-center">
            <FileText size={24} className="text-slate-400" />
            <span className="text-xs font-semibold">No pastes yet.</span>
            <Link
              to="/"
              className="h-8 inline-flex items-center gap-1 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
            >
              <Plus size={14} /> Create Paste
            </Link>
          </div>
        ) : viewModes.myPastes === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPastesFiltered.map((paste) => (
              <div
                key={paste.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-350 dark:hover:border-slate-750 transition-colors relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/v/${paste.id}`}
                      className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-500 transition-colors truncate block max-w-[85%]"
                    >
                      {paste.title || 'Untitled Paste'}
                    </Link>
                    <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-550">
                      {paste.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        paste.isPublic
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-450'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/5 dark:text-rose-450'
                      }`}
                    >
                      {paste.isPublic ? <Eye size={10} /> : <EyeOff size={10} />}
                      {paste.isPublic ? 'Public' : 'Private'}
                    </span>
                    {paste.hasPassword && (
                      <span className="inline-flex items-center text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        <Lock size={8} /> Protected
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                  <div>Created: {new Date(paste.createdAt).toLocaleString()}</div>
                  <div>Updated: {new Date(paste.updatedAt).toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <Link
                    to={`/v/${paste.id}`}
                    className="flex-1 h-8 inline-flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Open
                  </Link>
                  {!isGuest && (
                    <>
                      <button
                        onClick={() => openEditModal(paste)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800"
                        title="Edit Paste"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => openShareModal(paste)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800"
                        title="Share with User"
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(paste)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-800"
                        title="Toggle Public/Private"
                      >
                        {paste.isPublic ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleDuplicatePaste(paste)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800"
                        title="Duplicate"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePaste(paste)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/5 dark:hover:bg-rose-500/10 text-rose-500"
                        title="Delete Paste"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => copyLink(paste.id)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-855"
                    title="Copy URL Link"
                  >
                    {copiedId === paste.id ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-850">
            {myPastesFiltered.map((paste) => (
              <div
                key={paste.id}
                className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/v/${paste.id}`}
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:underline truncate"
                    >
                      {paste.title || 'Untitled Paste'}
                    </Link>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-550 capitalize">
                      {paste.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                    <span>Created: {new Date(paste.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span
                      className={`inline-flex items-center gap-0.5 ${paste.isPublic ? 'text-emerald-500' : 'text-rose-500'}`}
                    >
                      {paste.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/v/${paste.id}`}
                    className="h-8 inline-flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Open
                  </Link>
                  {!isGuest && (
                    <button
                      onClick={() => openEditModal(paste)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => copyLink(paste.id)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-805"
                  >
                    {copiedId === paste.id ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  {!isGuest && (
                    <button
                      onClick={() => handleDeletePaste(paste)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/5 dark:hover:bg-rose-500/10 text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2 — SHARED WITH ME */}
      {!isGuest && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              Shared With Me{' '}
              <span className="text-xs text-slate-400 font-normal">
                ({workspace?.sharedWithMe.length || 0})
              </span>
            </h2>
            <button
              onClick={() => toggleViewMode('sharedWithMe')}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-500 hover:text-slate-800"
            >
              {viewModes.sharedWithMe === 'grid' ? <List size={14} /> : <LayoutGrid size={14} />}
            </button>
          </div>

          {workspace?.sharedWithMe.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 space-y-2">
              <span className="text-xs font-semibold">Nothing has been shared with you.</span>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                When other users explicitly share their code snippets with your username, they will
                appear here.
              </p>
            </div>
          ) : viewModes.sharedWithMe === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspace?.sharedWithMe.map((paste) => (
                <div
                  key={paste.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-350 dark:hover:border-slate-700 transition-colors relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to={`/v/${paste.id}`}
                        className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-500 transition-colors truncate block"
                      >
                        {paste.title || 'Untitled Shared Paste'}
                      </Link>
                      <span className="text-[9px] text-slate-400 mt-1 block">
                        Owner:{' '}
                        <span className="font-bold text-slate-500">@{paste.ownerUsername}</span>
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-550 shrink-0">
                      {paste.language}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                    <div>
                      Shared: {paste.sharedAt ? new Date(paste.sharedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <Link
                      to={`/v/${paste.id}`}
                      className="flex-1 h-8 inline-flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-805 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => copyToClipboard(paste.content, paste.id)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-550 hover:text-slate-800"
                      title="Copy Content"
                    >
                      {copiedId === paste.id ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => handleBookmarkSave(paste)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 text-slate-555 hover:text-slate-800"
                      title="Save Bookmark"
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-850">
              {workspace?.sharedWithMe.map((paste) => (
                <div
                  key={paste.id}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/v/${paste.id}`}
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:underline truncate"
                      >
                        {paste.title || 'Untitled Shared Paste'}
                      </Link>
                      <span className="text-[10px] text-slate-400">by @{paste.ownerUsername}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Shared on:{' '}
                      {paste.sharedAt ? new Date(paste.sharedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/v/${paste.id}`}
                      className="h-8 inline-flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => handleBookmarkSave(paste)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3 — SAVED (BOOKMARKS) */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            Saved Pastes{' '}
            <span className="text-xs text-slate-400 font-normal">
              ({workspace?.saved.length || 0})
            </span>
          </h2>
          <button
            onClick={() => toggleViewMode('saved')}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-500 hover:text-slate-800"
          >
            {viewModes.saved === 'grid' ? <List size={14} /> : <LayoutGrid size={14} />}
          </button>
        </div>

        {workspace?.saved.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 space-y-1">
            <span className="text-xs font-semibold">No saved pastes.</span>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
              Bookmark pastes owned by others to quickly find them here.
            </p>
          </div>
        ) : viewModes.saved === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspace?.saved.map((paste) => (
              <div
                key={paste.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-350 dark:hover:border-slate-700 transition-colors relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/v/${paste.id}`}
                      className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-500 transition-colors truncate block"
                    >
                      {paste.title || 'Untitled Saved Paste'}
                    </Link>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      Owner: <span className="font-bold">@{paste.ownerUsername}</span>
                    </span>
                  </div>
                  <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-550 shrink-0">
                    {paste.language}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                  <div>
                    Saved At: {paste.savedAt ? new Date(paste.savedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <Link
                    to={`/v/${paste.id}`}
                    className="flex-1 h-8 inline-flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => copyToClipboard(paste.content, paste.id)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-550 hover:text-slate-800"
                    title="Copy Content"
                  >
                    {copiedId === paste.id ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => copyLink(paste.id)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-555 hover:text-slate-800"
                    title="Share link"
                  >
                    {copiedId === paste.id ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <ExternalLink size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => handleBookmarkRemove(paste)}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/5 dark:hover:bg-rose-500/10 text-rose-550"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-850">
            {workspace?.saved.map((paste) => (
              <div
                key={paste.id}
                className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/v/${paste.id}`}
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:underline truncate"
                    >
                      {paste.title || 'Untitled Saved Paste'}
                    </Link>
                    <span className="text-[10px] text-slate-400">by @{paste.ownerUsername}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/v/${paste.id}`}
                    className="h-8 inline-flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => handleBookmarkRemove(paste)}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/5 dark:hover:bg-rose-500/10 text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4 — RECENTLY VIEWED */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-md font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          Recently Viewed{' '}
          <span className="text-xs text-slate-400 font-normal">(Last 5 viewed)</span>
        </h2>

        {!workspace || workspace.recentlyViewed.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 space-y-1">
            <span className="text-xs font-semibold">No recently viewed pastes.</span>
            <p className="text-[10px] text-slate-405 max-w-xs mx-auto">
              Any snippet you click or open will be logged here for quick access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspace.recentlyViewed.map((paste) => (
              <div
                key={paste.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-350 dark:hover:border-slate-700 transition-colors relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/v/${paste.id}`}
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-500 transition-colors truncate block max-w-[80%]"
                    >
                      {paste.title || 'Untitled Paste'}
                    </Link>
                    <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-550 shrink-0">
                      {paste.language}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
                    <Clock size={10} /> View log:{' '}
                    {paste.viewedAt ? new Date(paste.viewedAt).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 mt-4 border-t border-slate-100 dark:border-slate-850">
                  <Link
                    to={`/v/${paste.id}`}
                    className="w-full h-8 inline-flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Open Paste
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SHARE MODAL */}
      {showShareModal && selectedPaste && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-xl p-5 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute right-4 top-4 text-slate-450 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <X size={16} />
            </button>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Share2 size={16} className="text-indigo-500" /> Share Paste
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Share "{selectedPaste.title || 'Untitled Paste'}" with another workspace
                collaborator.
              </p>
            </div>
            {shareSuccess ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg font-semibold text-center">
                Paste shared successfully!
              </div>
            ) : (
              <form onSubmit={handleShareSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label
                    htmlFor="shareUser"
                    className="text-[10px] font-bold text-slate-400 uppercase"
                  >
                    Username or Email
                  </label>
                  <input
                    id="shareUser"
                    type="text"
                    required
                    placeholder="collaborator_username"
                    value={shareInput}
                    onChange={(e) => setShareInput(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 transition-colors"
                  />
                </div>
                {shareError && (
                  <div className="text-[10px] text-rose-500 font-semibold">{shareError}</div>
                )}
                <button
                  type="submit"
                  disabled={shareLoading}
                  className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {shareLoading ? 'Sharing...' : 'Share Paste'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedPaste && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-xl p-5 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650"
            >
              <X size={16} />
            </button>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Edit size={16} className="text-indigo-500" /> Edit Paste Details
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Update details or password protection settings.
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label
                  htmlFor="editTitle"
                  className="text-[10px] font-bold text-slate-400 uppercase"
                >
                  Paste Title
                </label>
                <input
                  id="editTitle"
                  type="text"
                  placeholder="Untitled Paste"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="editLang"
                    className="text-[10px] font-bold text-slate-400 uppercase"
                  >
                    Language
                  </label>
                  <select
                    id="editLang"
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 transition-colors"
                  >
                    <option value="plaintext">Plain Text</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="editVis"
                    className="text-[10px] font-bold text-slate-400 uppercase"
                  >
                    Visibility
                  </label>
                  <select
                    id="editVis"
                    value={editVisibility}
                    onChange={(e) => setEditVisibility(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 transition-colors"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                    <option value="SECRET">Secret</option>
                  </select>
                </div>
              </div>

              {editVisibility === 'PRIVATE' && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label
                    htmlFor="editPass"
                    className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between"
                  >
                    <span>Passkey Protection</span>
                    <span className="text-[8px] text-slate-400 capitalize">
                      (Leave blank to keep unchanged)
                    </span>
                  </label>
                  <input
                    id="editPass"
                    type="password"
                    placeholder="••••••••"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="editContent"
                  className="text-[10px] font-bold text-slate-400 uppercase"
                >
                  Paste Code Content
                </label>
                <textarea
                  id="editContent"
                  required
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 transition-colors"
                />
              </div>

              {editError && (
                <div className="text-[10px] text-rose-500 font-semibold">{editError}</div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-900 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmPaste && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-xl p-6 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 dark:text-rose-400 w-fit">
              <Trash2 size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Delete Paste?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Permanently delete <span className="font-semibold text-slate-700 dark:text-slate-300">"{deleteConfirmPaste.title || 'Untitled Paste'}"</span>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmPaste(null)}
                disabled={deleteLoading}
                className="flex-1 h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-900 text-xs font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePaste}
                disabled={deleteLoading}
                className="flex-1 h-9 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
