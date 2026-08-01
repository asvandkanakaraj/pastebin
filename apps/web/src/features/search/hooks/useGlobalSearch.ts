import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { SearchResults } from '../types/index.js';
import { fetchSearchResults } from '../services/api.js';

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce query input
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDebouncedQuery('');
      setResults(null);
      setLoading(false);
      setError(null);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      return;
    }

    const abortController = new AbortController();
    setLoading(true);
    setError(null);
    setIsOpen(true);
    setSelectedIndex(-1);

    fetchSearchResults(debouncedQuery, abortController.signal)
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          return;
        }
        setError('Unable to load search results.');
        setLoading(false);
        setResults(null);
      });

    return () => {
      abortController.abort();
    };
  }, [debouncedQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
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
  };
}
