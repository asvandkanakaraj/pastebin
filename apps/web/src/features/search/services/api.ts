import axios from 'axios';
import type { SearchResults } from '../types/index.js';

export async function fetchSearchResults(
  query: string,
  signal: AbortSignal
): Promise<SearchResults> {
  const response = await axios.get<SearchResults>(
    `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`,
    { signal }
  );
  return response.data;
}
