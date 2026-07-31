import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Calendar, Eye, FileText, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

export function BrowsePastes() {
  const [pastes, setPastes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicPastes = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/pastes?page=${page}&limit=9`);
      const { pastes: fetchedPastes, totalPages: pages, totalCount: count } = response.data;
      setPastes(fetchedPastes || []);
      setTotalPages(pages || 1);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Fetch public pastes failed:', err);
      setError(err.response?.data?.message || 'Failed to retrieve public pastes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicPastes(currentPage);
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading && pastes.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-20 bg-slate-200 dark:bg-slate-850 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal className="text-indigo-500 h-6 w-6" /> Public Pastes
        </h1>
        <p className="text-xs text-slate-500 mt-1">Discover snippets shared publicly by other developers ({totalCount} total).</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {!loading && pastes.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="mx-auto p-4 bg-slate-100 dark:bg-slate-850 rounded-2xl w-fit text-slate-400">
            <FileText size={32} />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-800 dark:text-slate-200">No Public Pastes Found</h2>
            <p className="text-xs text-slate-500 mt-1">Be the first to create and publish a code snippet!</p>
          </div>
          <Link
            to="/"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-bold text-white shadow-md hover:bg-indigo-500 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
          >
            Create Paste
          </Link>
        </div>
      )}

      {pastes.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastes.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-60"
              >
                <div className="space-y-2 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate flex-1">
                      {p.title || 'Untitled Paste'}
                    </h2>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.hasPassword && (
                        <span className="p-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-500 dark:text-amber-400 animate-pulse" title="Password Protected">
                          <Lock size={10} />
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-md font-semibold text-[10px] text-slate-600 dark:text-slate-350 capitalize">
                        {p.language}
                      </span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar size={10} />
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Code Preview */}
                  <pre className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-lg text-[10px] font-mono text-slate-600 dark:text-slate-300 overflow-hidden select-none h-24 mt-2 leading-relaxed">
                    <code>
                      {p.content.split('\n').slice(0, 4).join('\n') || ' '}
                      {p.content.split('\n').length > 4 && '\n...'}
                    </code>
                  </pre>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/v/${p.id}`}
                    className="w-full h-8.5 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
                  >
                    <Eye size={12} className="mr-1.5" />
                    <span>View Paste</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || loading}
                className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs text-slate-500 font-mono">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || loading}
                className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
