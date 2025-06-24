import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { TMDBMovie, TMDBTVShow, SearchResponse } from '../types/movie';
import { tmdbService } from '../services/tmdb';
import { MediaGrid } from '../components/common/MediaGrid';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { useDebounce } from '../hooks/useDebounce';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'multi' | 'movie' | 'tv'>('multi');

  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery, 1);
      // Update URL without causing navigation
      setSearchParams({ q: debouncedQuery });
    } else {
      setResults([]);
      setTotalPages(0);
      setTotalResults(0);
    }
  }, [debouncedQuery, searchType]);

  const performSearch = async (query: string, page: number) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      let response: SearchResponse;
      
      switch (searchType) {
        case 'movie':
          response = await tmdbService.searchMovies(query, page);
          break;
        case 'tv':
          response = await tmdbService.searchTVShows(query, page);
          break;
        default:
          response = await tmdbService.searchMulti(query, page);
      }

      setResults(response.results);
      setCurrentPage(response.page);
      setTotalPages(Math.min(response.total_pages, 500)); // TMDB limits to 500 pages
      setTotalResults(response.total_results);
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery, page);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setTotalPages(0);
    setTotalResults(0);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Search className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        </div>
        
        {/* Search Input */}
        <div className="mb-4">
          <SearchInput
            placeholder="Search for movies and TV shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={handleClearSearch}
            loading={loading}
            className="text-lg py-4"
          />
        </div>

        {/* Search Type Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'multi', label: 'All' },
            { value: 'movie', label: 'Movies' },
            { value: 'tv', label: 'TV Shows' }
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setSearchType(type.value as 'multi' | 'movie' | 'tv')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                searchType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Results Info */}
        {totalResults > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Found {totalResults.toLocaleString()} results for "{debouncedQuery}"
          </div>
        )}
      </div>

      {/* Search Results */}
      {debouncedQuery.trim() ? (
        <>
          <MediaGrid 
            items={results} 
            type={searchType}
            loading={loading}
            error={error}
          />
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Start typing to search for movies and TV shows</p>
        </div>
      )}
    </div>
  );
}