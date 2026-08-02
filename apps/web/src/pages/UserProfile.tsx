import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Edit3,
  Link2,
  Lock,
  EyeOff,
  Bookmark,
  Clock,
  Camera,
  Trash2,
  Check,
} from 'lucide-react';
import { useAuth } from '../components/auth-provider.js';
import { API_BASE_URL } from '../lib/utils.js';

interface UserProfileData {
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    createdAt: string;
  };
  pastes: any[];
  saved: any[];
  recent: any[];
  stats: {
    totalPastes: number;
    publicPastes: number;
    privatePastes?: number;
    secretPastes?: number;
    savedPastes?: number;
  };
}

export function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser, token, updateUserInfo } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'secret' | 'saved' | 'recent'>(
    'public'
  );

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
  }>({ checking: false, available: null, error: null });

  // Action links / Alerts
  const [copiedLink, setCopiedLink] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Private PIN Unlock states
  const [showPinUnlockModal, setShowPinUnlockModal] = useState<any | null>(null);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await axios.get<UserProfileData>(`${API_BASE_URL}/api/users/${username}`, {
        headers,
      });
      setProfile(res.data);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 404) {
        setError('404 — User profile not found');
      } else {
        setError('Unable to load user profile at this time.');
      }
    } finally {
      setLoading(false);
    }
  }, [username, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isOwner = loggedInUser && profile && profile.user.id === loggedInUser.id;

  // Set initial form values when opening edit modal
  const handleOpenEditModal = () => {
    if (!profile) return;
    setEditDisplayName(profile.user.displayName || '');
    setEditUsername(profile.user.username || '');
    setEditEmail(profile.user.email || '');
    setEditBio(profile.user.bio || '');
    setEditAvatarUrl(profile.user.avatarUrl);
    setUsernameStatus({ checking: false, available: null, error: null });
    setSaveError(null);
    setShowEditModal(true);
  };

  // Keyboard accessibility listeners (ESC key closing modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEditModal(false);
        setShowPinUnlockModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced check username availability
  useEffect(() => {
    if (!showEditModal) return;
    if (editUsername.trim().toLowerCase() === profile?.user.username) {
      setUsernameStatus({ checking: false, available: true, error: null });
      return;
    }
    if (!editUsername.trim()) {
      setUsernameStatus({ checking: false, available: false, error: 'Username is required' });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true, available: null, error: null });
      try {
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await axios.get(
          `${API_BASE_URL}/api/users/check-username?username=${encodeURIComponent(
            editUsername
          )}`,
          { headers }
        );
        if (res.data.available) {
          setUsernameStatus({ checking: false, available: true, error: null });
        } else {
          setUsernameStatus({
            checking: false,
            available: false,
            error: res.data.error || 'Username already taken',
          });
        }
      } catch (err: any) {
        setUsernameStatus({
          checking: false,
          available: false,
          error: err.response?.data?.error || 'Validation error',
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [editUsername, showEditModal, profile, token]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setEditAvatarUrl(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus.error || usernameStatus.available === false) {
      return;
    }

    setSavingProfile(true);
    setSaveError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        {
          displayName: editDisplayName.trim(),
          username: editUsername.trim().toLowerCase(),
          email: editEmail.trim(),
          bio: editBio.trim(),
          avatarUrl: editAvatarUrl,
        },
        { headers }
      );

      // Successfully saved profile
      setShowEditModal(false);

      // Update local storage credentials
      updateUserInfo(res.data);

      // If username changed, redirect to new profile path
      if (res.data.username !== profile?.user.username) {
        navigate(`/profile/${res.data.username}`);
      } else {
        fetchProfile();
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Unable to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopyProfileLink = async () => {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard not available — ignore silently
    }
  };

  const handleUnlockPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    setUnlockError(null);
    try {
      const headers: any = {};
      headers['x-paste-password'] = unlockPin;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Hit API view paste verify
      await axios.get(`${API_BASE_URL}/api/pastes/${showPinUnlockModal.id}`, { headers });

      // PIN is correct, close modal and redirect to paste
      setShowPinUnlockModal(null);
      setUnlockPin('');
      navigate(`/v/${showPinUnlockModal.id}`, { state: { unlockPassword: unlockPin } });
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUnlockError('Incorrect PIN code. Access denied.');
      } else {
        setUnlockError('Unable to verify PIN. Please try again.');
      }
    } finally {
      setUnlocking(false);
    }
  };

  const handlePasteClick = (pasteItem: any) => {
    // If visitor and private with password PIN, prompt for unlock PIN modal
    if (!isOwner && pasteItem.visibility === 'PRIVATE' && pasteItem.hasPassword) {
      setShowPinUnlockModal(pasteItem);
      setUnlockPin('');
      setUnlockError(null);
    } else {
      navigate(`/v/${pasteItem.id}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse select-none">
        {/* Profile Card Header Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-5">
          <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-3.5 text-center md:text-left">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mx-auto md:mx-0" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto md:mx-0" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mx-auto md:mx-0" />
          </div>
        </div>
        <div className="h-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-5">
        <div className="mx-auto p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 dark:text-rose-400 w-fit">
          <AlertCircle size={28} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Profile Error</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'Failed to load profile.'}</p>
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

  const { pastes, saved, recent } = profile;
  const filteredPublic = pastes.filter((p) => p.visibility === 'PUBLIC');
  const filteredPrivate = pastes.filter((p) => p.visibility === 'PRIVATE');
  const filteredSecret = pastes.filter((p) => p.visibility === 'SECRET');

  const showPrivateTab = true; // Everyone can see the private tab; content is PIN-gated

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 select-none relative page-fade-in">
      {/* Dynamic Private PIN Unlock Modal */}
      {showPinUnlockModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 dark:text-amber-400 w-fit">
              <Lock size={26} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-slate-200">
                Unlock Private Paste
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter the numeric password PIN to access "
                {showPinUnlockModal.title || 'Untitled Paste'}".
              </p>
            </div>

            <form onSubmit={handleUnlockPinSubmit} className="space-y-4 text-left">
              <input
                type="password"
                value={unlockPin}
                onChange={(e) => setUnlockPin(e.target.value)}
                placeholder="Enter 4-8 digit password PIN..."
                autoFocus
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-500"
              />

              {unlockError && (
                <div className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  {unlockError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPinUnlockModal(null)}
                  className="flex-1 h-9.5 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unlocking}
                  className="flex-1 h-9.5 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white shadow-md hover:bg-amber-400 focus:outline-none dark:bg-amber-600 dark:hover:bg-amber-500"
                >
                  {unlocking ? 'Verifying...' : 'Unlock Paste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Centered Dialog Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 relative text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Edit3 size={15} className="text-indigo-500" />
                <span>Edit Profile Settings</span>
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Scroll */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Avatar management */}
              <div className="flex flex-col items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="relative">
                  {editAvatarUrl ? (
                    <img
                      src={editAvatarUrl}
                      alt="Avatar Preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450 flex items-center justify-center font-bold text-xl uppercase">
                      {(editUsername || editEmail).slice(0, 2)}
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-indigo-650 hover:bg-indigo-600 text-white flex items-center justify-center border border-white dark:border-slate-900 cursor-pointer shadow-md transition-colors"
                    title="Upload New Avatar"
                  >
                    <Camera size={12} />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    JPEG, PNG formats supported.
                  </span>
                  {editAvatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-[10px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5"
                    >
                      <Trash2 size={10} /> Remove Image
                    </button>
                  )}
                </div>
              </div>

              {/* Display name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Display Name
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors"
                />
              </div>

              {/* Username validation block */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) =>
                    setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  placeholder="letters, numbers or underscores..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors"
                />
                <div className="h-4">
                  {usernameStatus.checking && (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Checking availability...
                    </span>
                  )}
                  {editUsername.trim().toLowerCase() !== profile.user.username &&
                    !usernameStatus.checking &&
                    usernameStatus.available !== null && (
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 ${
                          usernameStatus.available ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {usernameStatus.available
                          ? 'Username available'
                          : usernameStatus.error}
                      </span>
                    )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors"
                />
              </div>

              {/* Bio block */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Bio Description
                  </label>
                  <span className="text-[9px] text-slate-400">{editBio.length} / 150</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={150}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value.slice(0, 150))}
                  placeholder="Tell us about yourself..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-955 resize-none dark:text-slate-200 transition-colors"
                />
              </div>

              {saveError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-550/10 border border-rose-100 dark:border-rose-800 rounded-xl text-rose-500 text-xs font-semibold">
                  {saveError}
                </div>
              )}

              {/* Modal Footer actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={savingProfile}
                  className="h-9.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    savingProfile ||
                    (!usernameStatus.available &&
                      editUsername.trim().toLowerCase() !== profile.user.username)
                  }
                  className="h-9.5 px-4 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 min-w-0 w-full">
          {/* Avatar frame */}
          <div className="relative shrink-0">
            {profile.user.avatarUrl ? (
              <img
                src={profile.user.avatarUrl}
                alt={profile.user.username}
                className="h-20 w-20 rounded-full object-cover border-2 border-indigo-500 shadow-md"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450 flex items-center justify-center font-extrabold text-xl uppercase shadow-inner">
                {(profile.user.username || profile.user.email).slice(0, 2)}
              </div>
            )}
          </div>

          {/* User Meta Data */}
          <div className="space-y-2.5 text-center md:text-left min-w-0 w-full">
            <div className="space-y-0.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {profile.user.displayName || profile.user.username}
              </h1>
              <p className="text-xs text-indigo-500 font-semibold select-all">
                @{profile.user.username}
              </p>
            </div>

            {profile.user.bio && (
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed whitespace-pre-wrap">
                {profile.user.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Joined:{' '}
                {new Date(profile.user.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyProfileLink}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900 transition-colors"
            title="Copy Profile Link"
          >
            {copiedLink ? <Check size={12} className="text-emerald-500" /> : <Link2 size={12} />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>

          {isOwner && (
            <button
              onClick={handleOpenEditModal}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 px-4 text-xs font-bold text-white shadow-md transition-colors"
            >
              <Edit3 size={12} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Pastes
          </p>
          <p className="text-xl font-extrabold text-slate-850 dark:text-white mt-1">
            {profile.stats.totalPastes}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Public Pastes
          </p>
          <p className="text-xl font-extrabold text-slate-850 dark:text-white mt-1">
            {profile.stats.publicPastes}
          </p>
        </div>
        {isOwner && (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Private Pastes
              </p>
              <p className="text-xl font-extrabold text-slate-850 dark:text-white mt-1">
                {profile.stats.privatePastes || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Secret Pastes
              </p>
              <p className="text-xl font-extrabold text-slate-850 dark:text-white mt-1">
                {profile.stats.secretPastes || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Saved Bookmarks
              </p>
              <p className="text-xl font-extrabold text-slate-850 dark:text-white mt-1">
                {profile.stats.savedPastes || 0}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Tabs Layout */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 select-none">
          <div className="flex flex-wrap gap-2 -mb-px">
            <button
              onClick={() => setActiveTab('public')}
              className={`h-9 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'public'
                  ? 'border-indigo-500 text-indigo-500'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <FileText size={13} />
              <span>Public ({filteredPublic.length})</span>
            </button>

            {showPrivateTab && (
              <button
                onClick={() => setActiveTab('private')}
                className={`h-9 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'private'
                    ? 'border-indigo-500 text-indigo-500'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Lock size={13} />
                <span>Private ({filteredPrivate.length})</span>
              </button>
            )}

            {isOwner && (
              <>
                <button
                  onClick={() => setActiveTab('secret')}
                  className={`h-9 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'secret'
                      ? 'border-indigo-500 text-indigo-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <EyeOff size={13} />
                  <span>Secret ({filteredSecret.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('saved')}
                  className={`h-9 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'saved'
                      ? 'border-indigo-500 text-indigo-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Bookmark size={13} />
                  <span>Saved ({saved.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('recent')}
                  className={`h-9 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'recent'
                      ? 'border-indigo-500 text-indigo-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Clock size={13} />
                  <span>Recently Viewed ({recent.length})</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[250px]">
          {/* Public Tab */}
          {activeTab === 'public' && (
            <div className="space-y-4">
              {filteredPublic.length === 0 ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <FileText size={28} className="text-slate-300 dark:text-slate-650" />
                  <span className="text-xs font-semibold">No public pastes.</span>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                    This user hasn't created any public code snippets yet, or all their pastes have
                    expired.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredPublic.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <button
                          onClick={() => handlePasteClick(p)}
                          className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors truncate block text-left"
                        >
                          {p.title || 'Untitled Paste'}
                        </button>
                        {p.description && (
                          <p className="text-xs text-slate-450 dark:text-slate-500 line-clamp-1">
                            {p.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded font-semibold capitalize text-slate-550">
                            {p.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <button
                          onClick={() => handlePasteClick(p)}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 px-4 text-xs font-bold transition-colors"
                        >
                          View Paste
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Private Tab */}
          {activeTab === 'private' && (
            <div className="space-y-4">
              {filteredPrivate.length === 0 ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <Lock size={28} className="text-slate-300 dark:text-slate-650" />
                  <span className="text-xs font-semibold">No private pastes.</span>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                    {isOwner
                      ? 'Your private pastes appear here. Create one to get started.'
                      : 'This user has no private pastes yet.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredPrivate.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <button
                          onClick={() => handlePasteClick(p)}
                          className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors truncate flex items-center gap-1.5 text-left"
                        >
                          <Lock size={12} className="text-amber-500 shrink-0" />
                          <span>{p.title || 'Untitled Paste'}</span>
                        </button>
                        {p.description && (
                          <p className="text-xs text-slate-450 dark:text-slate-500 line-clamp-1">
                            {p.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded font-semibold capitalize text-slate-550">
                            {p.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <button
                          onClick={() => handlePasteClick(p)}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 px-4 text-xs font-bold transition-colors"
                        >
                          {isOwner ? 'View' : 'Unlock & View'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Secret Tab (Owner only) */}
          {activeTab === 'secret' && isOwner && (
            <div className="space-y-4">
              {filteredSecret.length === 0 ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <EyeOff size={28} className="text-slate-300 dark:text-slate-650" />
                  <span className="text-xs font-semibold">No secret pastes.</span>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                    Snippet pastes configured as Secret appear here, accessible only to you.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredSecret.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <button
                          onClick={() => handlePasteClick(p)}
                          className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors truncate flex items-center gap-1.5 text-left"
                        >
                          <EyeOff size={12} className="text-slate-400 shrink-0" />
                          <span>{p.title || 'Untitled Paste'}</span>
                        </button>
                        {p.description && (
                          <p className="text-xs text-slate-450 dark:text-slate-500 line-clamp-1">
                            {p.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded font-semibold capitalize text-slate-550">
                            {p.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <button
                          onClick={() => handlePasteClick(p)}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 px-4 text-xs font-bold transition-colors"
                        >
                          View Paste
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Bookmarks Tab (Owner only) */}
          {activeTab === 'saved' && isOwner && (
            <div className="space-y-4">
              {saved.length === 0 ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <Bookmark size={28} className="text-slate-300 dark:text-slate-650" />
                  <span className="text-xs font-semibold">No saved pastes.</span>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                    Bookmarks and saved references will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {saved.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <button
                          onClick={() => handlePasteClick(p)}
                          className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors truncate flex items-center gap-1.5 text-left"
                        >
                          <Bookmark size={12} className="text-indigo-550 shrink-0" />
                          <span>{p.title || 'Untitled Paste'}</span>
                        </button>
                        <p className="text-[10px] text-slate-450">
                          Created by: {p.user?.displayName || p.user?.username || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded font-semibold capitalize text-slate-550">
                            {p.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <button
                          onClick={() => handlePasteClick(p)}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 px-4 text-xs font-bold transition-colors"
                        >
                          View Paste
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recently Viewed Tab (Owner only) */}
          {activeTab === 'recent' && isOwner && (
            <div className="space-y-4">
              {recent.length === 0 ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <Clock size={28} className="text-slate-300 dark:text-slate-650" />
                  <span className="text-xs font-semibold">No history logs.</span>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
                    Your last 5 viewed snippets will be cataloged here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {recent.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <button
                          onClick={() => handlePasteClick(p)}
                          className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors truncate flex items-center gap-1.5 text-left"
                        >
                          <Clock size={12} className="text-slate-400 shrink-0" />
                          <span>{p.title || 'Untitled Paste'}</span>
                        </button>
                        <p className="text-[10px] text-slate-450">
                          Created by: {p.user?.displayName || p.user?.username || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded font-semibold capitalize text-slate-550">
                            {p.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <button
                          onClick={() => handlePasteClick(p)}
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 px-4 text-xs font-bold transition-colors"
                        >
                          View Paste
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
