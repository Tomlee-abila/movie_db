import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Compass } from 'lucide-react';
import { TMDBMovie, TMDBTVShow, Genre, SortBy } from '../types/movie';
import { tmdbService } from '../services/tmdb';
import { useApp } from '../context/AppContext';
import { MediaGrid } from '../components/common/MediaGrid';
import { Pagination } from '../components/common/Pagination';
import { FilterPanel } from '../components/filters/FilterPanel';
import { Button } from '../components/ui/Button';

export function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { movieGenres, tvGenres } = useApp();
  
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>(
    (searchParams.get('type') as 'movie' | 'tv') || 'movie'
  );
  const [results, setResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  
  // Filter states
  const [sortBy, setSortBy] = useState<SortBy>(
    (searchParams.get('sort') as SortBy) || 'popularity.desc'
  );
  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    searchParams.get('genres')?.split(',').map(Number) || []
  );
  const [yearRange, setYearRange] = useState<[number, number]>([
    parseInt(searchParams.get('year_from') || '1990'),
    parseInt(searchParams.get('year_to') || new Date().getFullYear().toString())
  ]);
  const [ratingRange, setRatingRange] = useState<[number, number]>([
    parseFloat(searchParams.get('rating_from') || '0'),
    parseFloat(searchParams.get('rating_to') || '10')
  ]);

  useEffect(() => {
    discover(currentPage);
  }, [mediaType, sortBy, selectedGenres, yearRange, ratingRange]);

  useEffect(() => {
    // Update URL with current filters
    const params = new URLSearchParams();
    params.set('type', mediaType);
    params.set('page', currentPage.toString());
    params.set('sort', sortBy);
    
    if (selectedGenres.length > 0) {
      params.set('genres', selectedGenres.join(','));
    }
    if (yearRange[0] !== 1990) params.set('year_from', yearRange[0].toString());
    if (yearRange[1] !== new Date().getFullYear()) params.set('year_to', yearRange[1].toString());
    if (ratingRange[0] !== 0) params.set('rating_from', ratingRange[0].toString());
    if (ratingRange[1] !== 10) params.set('rating_to', ratingRange[1].toString());
    
    setSearchParams(params);
  }, [mediaType, currentPage, sortBy, selectedGenres, yearRange, ratingRange]);

  const discover = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        sort_by: sortBy,
      };

      if (selectedGenres.length > 0) {
        params.with_genres = selectedGenres.join(',');
      }

      if (yearRange[0] !== 1990 || yearRange[1] !== new Date().getFullYear()) {
        if (mediaType === 'movie') {
          params.primary_release_year = yearRange[0] === yearRange[1] ? yearRange[0] : undefined;
          if (yearRange[0] !== yearRange[1]) {
            params['primary_release_date.gte'] = `${yearRange[0]}-01-01`;
            params['primary_release_date.lte'] = `${yearRange[1]}-12-31`;
          }
        } else {
          params.first_air_date_year = yearRange[0] === yearRange[1] ? yearRange[0] : undefined;
          if (yearRange[0] !== yearRange[1]) {
            params['first_air_date.gte'] = `${yearRange[0]}-01-01`;
            params['first_air_date.lte'] = `${yearRange[1]}-12-31`;
          }
        }
      }

      if (ratingRange[0] !== 0) {
        params['vote_average.gte'] = ratingRange[0];
      }
      if (ratingRange[1] !== 10) {
        params['vote_average.lte'] = ratingRange[1];
      }

      const response = mediaType === 'movie' 
        ? await tmdbService.discoverMovies(params)
        : await tmdbService.discoverTVShows(params);

      setResults(response.results);
      setCurrentPage(response.page);
      setTotalPages(Math.min(response.total_pages, 500));
    } catch (err) {
      setError('Failed to load content');
      console.error('Discover error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    discover(page);
  };

  const handleClearFilters = () => {
    setSelectedGenres([]);
    setYearRange([1990, new Date().getFullYear()]);
    setRatingRange([0, 10]);
    setSortBy('popularity.desc');
  };

  const currentGenres = mediaType === 'movie' ? movieGenres : tvGenres;
  const activeFiltersCount = selectedGenres.length + 
    (yearRange[0] !== 1990 || yearRange[1] !== new Date().getFullYear() ? 1 : 0) +
    (ratingRange[0] !== 0 || ratingRange[1] !== 10 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Compass className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
          </div>
          
          <Button
            onClick={() => setFilterPanelOpen(true)}
            variant="outline"
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Media Type Toggle */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-xs">
          {[
            { type: 'movie' as const, label: 'Movies' },
            { type: 'tv' as const, label: 'TV Shows' }
          ].map(({ type, label }) => (
            <button
              key={type}
              onClick={() => {
                setMediaType(type);
                setCurrentPage(1);
              }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mediaType === type
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <MediaGrid 
        items={results} 
        type={mediaType}
        loading={loading}
        error={error}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Filter Panel */}
      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        genres={currentGenres}
        selectedGenres={selectedGenres}
        onGenreChange={setSelectedGenres}
        sortBy={sortBy}
        onSortChange={setSortBy}
        yearRange={yearRange}
        onYearRangeChange={setYearRange}
        ratingRange={ratingRange}
        onRatingRangeChange={setRatingRange}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}