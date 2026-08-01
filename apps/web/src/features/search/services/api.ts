import axios from 'axios';
import type { SearchResults } from '../types/index.js';
import { API_BASE_URL } from '../../../lib/utils.js';

export async function fetchSearchResults(
  query: string,
  signal: AbortSignal
): Promise<SearchResults> {
  const response = await axios.get<SearchResults>(
    `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
    { signal }
  );
  return response.data;
}
