import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Calendar } from 'lucide-react';
import { TMDBMovie, TMDBTVShow } from '../types/movie';
import { tmdbService } from '../services/tmdb';
import { MediaGrid } from '../components/common/MediaGrid';
import { Button } from '../components/ui/Button';

export function TrendingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>(
    (searchParams.get('type') as 'movie' | 'tv') || 'movie'
  );
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>(
    (searchParams.get('time') as 'day' | 'week') || 'week'
  );
  const [results, setResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrending();
  }, [mediaType, timeWindow]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('type', mediaType);
    params.set('time', timeWindow);
    setSearchParams(params);
  }, [mediaType, timeWindow]);

  const loadTrending = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = mediaType === 'movie' 
        ? await tmdbService.getTrendingMovies(timeWindow)
        : await tmdbService.getTrendingTVShows(timeWindow);

      setResults(response.results);
    } catch (err) {
      setError('Failed to load trending content');
      console.error('Trending error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-8 w-8 mr-3" />
          <h1 className="text-3xl font-bold">Trending Now</h1>
        </div>
        <p className="text-orange-100 text-lg">
          Discover what's popular {timeWindow === 'day' ? 'today' : 'this week'}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Media Type Toggle */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { type: 'movie' as const, label: 'Movies' },
              { type: 'tv' as const, label: 'TV Shows' }
            ].map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setMediaType(type)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mediaType === type
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Time Window Toggle */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { time: 'day' as const, label: 'Today', icon: Calendar },
              { time: 'week' as const, label: 'This Week', icon: Calendar }
            ].map(({ time, label, icon: Icon }) => (
              <button
                key={time}
                onClick={() => setTimeWindow(time)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeWindow === time
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <MediaGrid 
        items={results} 
        type={mediaType}
        loading={loading}
        error={error}
      />
    </div>
  );
}