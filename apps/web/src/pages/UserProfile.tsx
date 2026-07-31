import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, FileText, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import type { SearchUser, SearchPaste } from '../features/search/types/index.js';

interface UserProfileData {
  user: SearchUser;
  pastes: SearchPaste[];
}

export function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get<UserProfileData>(`http://localhost:5000/api/users/${username}`)
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch user profile error:', err);
        const status = err.response?.status;
        if (status === 404) {
          setError('User profile not found.');
        } else {
          setError('Unable to load user profile.');
        }
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-64" />
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} /> Back to workspace
        </Link>
      </div>

      {/* User Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-450 shrink-0 shadow-inner">
          <User size={28} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {profile.user.username}
          </h1>
          <p className="text-xs text-slate-550 truncate mt-0.5">{profile.user.email}</p>
        </div>
      </div>

      {/* Pastes Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Public Pastes ({profile.pastes.length})
        </h2>

        {profile.pastes.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2 flex flex-col items-center">
            <FileText size={28} className="text-slate-350 dark:text-slate-650" />
            <span className="text-xs font-semibold">No public pastes.</span>
            <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
              This user hasn't created any public code snippets yet, or all their pastes have
              expired.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-850">
            {profile.pastes.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <Link
                    to={`/v/${p.id}`}
                    className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
                  >
                    {p.title || 'Untitled Paste'}
                  </Link>
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
                  <Link
                    to={`/v/${p.id}`}
                    className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 px-4 text-xs font-bold transition-colors"
                  >
                    View Paste
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
