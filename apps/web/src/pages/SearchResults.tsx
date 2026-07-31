import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, User, FileText, AlertCircle, FileQuestion, ArrowLeft } from 'lucide-react';
import type { SearchResults as SearchResultsType } from '../features/search/types/index.js';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResultsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const abortController = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get<SearchResultsType>(
        `http://localhost:5000/api/search?q=${encodeURIComponent(query.trim())}`,
        {
          signal: abortController.signal,
        }
      )
      .then((res) => {
        setResults(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          return;
        }
        console.error('Search results page error:', err);
        setError('Unable to load search results.');
        setLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [query]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} /> Back to workspace
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="text-indigo-500 h-6 w-6" /> Search Results
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Showing matched profiles and snippets for "{query}".
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className="h-9 w-9 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-rose-500 space-y-2 flex flex-col items-center">
          <AlertCircle size={32} />
          <h2 className="text-md font-bold">Search Error</h2>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      )}

      {/* Results state */}
      {!loading && !error && results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Users ({results.users.length})
            </h2>
            {results.users.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching user accounts found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-850/30 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                      <User size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {user.username}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pastes Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Pastes ({results.pastes.length})
            </h2>
            {results.pastes.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching code pastes found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {results.pastes.map((paste) => (
                  <Link
                    key={paste.id}
                    to={`/v/${paste.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-850/30 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400 shrink-0">
                        <FileText size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {paste.title || 'Untitled Paste'}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded capitalize">
                      {paste.language}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Empty State */}
      {!loading &&
        !error &&
        results &&
        results.users.length === 0 &&
        results.pastes.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-4 shadow-sm flex flex-col items-center">
            <div className="p-4 bg-slate-100 dark:bg-slate-850 rounded-2xl text-slate-400 w-fit">
              <FileQuestion size={36} />
            </div>
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-slate-200">
                No Matches Found
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                We couldn't find any users or pastes matching "{query}".
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
