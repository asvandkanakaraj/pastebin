import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Terminal,
  Calendar,
  Eye,
  Trash2,
  ShieldAlert,
  Plus,
  Lock,
  Unlock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../components/auth-provider.js';

export function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [pastes, setPastes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const fetchMyPastes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/pastes/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPastes(response.data || []);
      } catch (err: any) {
        console.error('Fetch my pastes failed:', err);
        setError(err.response?.data?.message || 'Failed to retrieve your pastes');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPastes();
  }, [user, token, navigate]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/pastes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPastes((prev) => prev.filter((p) => p.id !== id));
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error('Delete paste failed:', err);
      alert(err.response?.data?.message || 'Failed to delete paste');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
        </div>
        <div className="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-5">
        <div className="mx-auto p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 dark:text-rose-400 w-fit">
          <AlertCircle size={28} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Error Loading Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <Link to="/" className="text-indigo-500 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 relative">
      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 dark:text-rose-400 w-fit">
              <ShieldAlert size={24} />
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 h-9.5 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-355 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleting}
                className="flex-1 h-9.5 inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white shadow-md hover:bg-rose-500 focus:outline-none dark:bg-rose-500 dark:hover:bg-rose-400 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal className="text-indigo-500 h-6 w-6" /> My Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage and audit snippets associated with {user?.email}.
        </p>
      </div>

      {pastes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-4 shadow-sm">
          <div className="mx-auto p-4 bg-slate-100 dark:bg-slate-850 rounded-2xl w-fit text-slate-400">
            <Plus size={32} />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-800 dark:text-slate-200">
              No Pastes Created Yet
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              You haven't uploaded any code snippets under this user account yet.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex h-9.5 items-center justify-center rounded-lg bg-indigo-600 px-4.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
          >
            Create Your First Paste
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Title
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Language
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Created Date
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Visibility
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {pastes.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors"
                  >
                    <td className="p-4 text-xs font-semibold text-slate-955 dark:text-white max-w-[200px] truncate">
                      {p.title || 'Untitled Paste'}
                    </td>
                    <td className="p-4 text-xs">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-md font-semibold text-[10px] text-slate-600 dark:text-slate-350 capitalize">
                        {p.language}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-mono flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-xs">
                      {p.hasPassword ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                          <Lock size={10} /> Password
                        </span>
                      ) : p.isPublic ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">
                          <Unlock size={10} /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.5 rounded-md">
                          <Unlock size={10} /> Private link
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/v/${p.id}`}
                        className="inline-flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-bold text-slate-650 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye size={10} className="mr-1" />
                        <span>View</span>
                      </Link>

                      <button
                        onClick={() => setShowDeleteConfirm(p.id)}
                        className="inline-flex h-7 items-center justify-center rounded-lg border border-rose-200 bg-white px-2.5 text-[10px] font-bold text-rose-600 shadow-sm hover:bg-rose-50/50 focus:outline-none dark:border-rose-900/40 dark:bg-slate-900 dark:text-rose-450 dark:hover:bg-rose-950/20 transition-colors"
                      >
                        <Trash2 size={10} className="mr-1" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
