import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useGlobalSearch } from '../hooks/useGlobalSearch.js';
import { SearchDropdown } from './SearchDropdown.js';

export function SearchInput() {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    containerRef,
  } = useGlobalSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Listen to keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        e.key === '/' &&
        activeEl?.tagName !== 'INPUT' &&
        activeEl?.tagName !== 'TEXTAREA' &&
        !activeEl?.getAttribute('contenteditable')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleItemClick = (type: 'user' | 'paste' | 'view-all', item?: any) => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.blur();

    if (type === 'user') {
      navigate(`/profile/${item.username}`);
    } else if (type === 'paste') {
      navigate(`/v/${item.id}`);
    } else if (type === 'view-all') {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = query.trim();
      const usersList = results?.users.slice(0, 5) || [];
      const pastesList = results?.pastes.slice(0, 5) || [];
      const hasMore = (results?.users.length || 0) > 5 || (results?.pastes.length || 0) > 5;

      const items: any[] = [];
      usersList.forEach((u) => items.push({ type: 'user', ...u }));
      pastesList.forEach((p) => items.push({ type: 'paste', ...p }));
      if (hasMore) {
        items.push({ type: 'view-all' });
      }

      if (selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        const selected = items[selectedIndex];
        handleItemClick(selected.type, selected);
        return;
      }

      if (/^[a-zA-Z0-9]{8}$/.test(trimmed)) {
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(-1);
        inputRef.current?.blur();
        navigate(`/v/${trimmed.toUpperCase()}`);
        return;
      }

      if (trimmed) {
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(-1);
        inputRef.current?.blur();
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      }
      return;
    }

    if (!isOpen || !results) return;

    const usersList = results.users.slice(0, 5);
    const pastesList = results.pastes.slice(0, 5);
    const hasMore = results.users.length > 5 || results.pastes.length > 5;

    const items: any[] = [];
    usersList.forEach((u) => items.push({ type: 'user', ...u }));
    pastesList.forEach((p) => items.push({ type: 'paste', ...p }));
    if (hasMore) {
      items.push({ type: 'view-all' });
    }

    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Search users or pastes..."
          aria-label="Search users or pastes"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-10 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/50 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-950 pointer-events-none select-none">
          /
        </div>
      </div>

      {isOpen && query.trim().length > 0 && (
        <SearchDropdown
          loading={loading}
          error={error}
          results={results}
          selectedIndex={selectedIndex}
          onItemClick={handleItemClick}
        />
      )}
    </div>
  );
}
