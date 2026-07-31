import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Calendar, Eye, FileText, ChevronLeft, ChevronRight, Lock, Search, X } from 'lucide-react';

const POPULAR_LANGUAGES = [
  { value: '', label: 'All Languages' },
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' }
];

export function BrowsePastes() {
  const [pastes, setPastes] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1') || 1;
  const search = searchParams.get('search') || '';
  const language = searchParams.get('language') || '';

  const [searchInput, setSearchInput] = useState(search);

  const fetchPublicPastes = async (pageVal = 1, searchVal = '', languageVal = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/pastes?page=${pageVal}&limit=9&search=${encodeURIComponent(
          searchVal
        )}&language=${encodeURIComponent(languageVal)}`
      );
      const { pastes: fetchedPastes, totalPages: pages, totalCount: count } = response.data;
      setPastes(fetchedPastes || []);
      setTotalPages(pages || 1);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Fetch public pastes failed:', err);
      setError(err.response?.data?.message || 'Failed to retrieve public pastes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page, search or language searchParams change
  useEffect(() => {
    fetchPublicPastes(page, search, language);
  }, [page, search, language]);

  // Sync local searchInput state with URL param search changes
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounced URL updates for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== search) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (searchInput.trim()) {
            next.set('search', searchInput.trim());
          } else {
            next.delete('search');
          }
          next.set('page', '1'); // reset page on search update
          return next;
        });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, search, setSearchParams]);

  const handleLanguageChange = (lang: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (lang) {
        next.set('language', lang);
      } else {
        next.delete('language');
      }
      next.set('page', '1'); // reset page on language filter
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(page - 1));
        return next;
      });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(page + 1));
        return next;
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal className="text-indigo-500 h-6 w-6" /> Public Pastes
        </h1>
        <p className="text-xs text-slate-500 mt-1">Discover snippets shared publicly by other developers ({totalCount} total).</p>
      </div>

      {/* Search and Filters Panel */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search public pastes by title or content..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:placeholder-slate-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            {POPULAR_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {(search || language) && (
            <button
              onClick={handleClearFilters}
              className="h-10 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-355 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-20 bg-slate-200 dark:bg-slate-850 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && pastes.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-4 shadow-sm">
          <div className="mx-auto p-4 bg-slate-100 dark:bg-slate-850 rounded-2xl w-fit text-slate-400">
            <FileText size={32} />
          </div>
          {search || language ? (
            <>
              <div>
                <h2 className="text-md font-bold text-slate-800 dark:text-slate-200">No Search Results Found</h2>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or language filters to find what you need.</p>
              </div>
              <button
                onClick={handleClearFilters}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 focus:outline-none dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors"
              >
                Clear Search Filters
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {!loading && pastes.length > 0 && (
        <div className="space-y-8 animate-in fade-in duration-205">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastes.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 h-60"
              >
                <div className="space-y-2 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate flex-1">
                      {p.title || 'Untitled Paste'}
                    </h2>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.hasPassword && (
                        <span className="p-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-500 dark:text-amber-400" title="Password Protected">
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
                disabled={page === 1 || loading}
                className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs text-slate-500 font-mono">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages || loading}
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
