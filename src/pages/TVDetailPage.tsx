import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  Calendar, 
  Users, 
  Award, 
  Bookmark, 
  BookmarkCheck,
  ArrowLeft,
  Tv,
  Play
} from 'lucide-react';
import { TMDBTVDetails, OMDBMovie } from '../types/movie';
import { tmdbService } from '../services/tmdb';
import { omdbService } from '../services/omdb';
import { useWatchlist } from '../hooks/useWatchlist';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { MediaGrid } from '../components/common/MediaGrid';

export function TVDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTVShow] = useState<TMDBTVDetails | null>(null);
  const [omdbData, setOmdbData] = useState<OMDBMovie | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    if (id) {
      loadTVDetails(parseInt(id));
    }
  }, [id]);

  const loadTVDetails = async (tvId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Load TMDB data
      const tmdbData = await tmdbService.getTVDetails(tvId);
      setTVShow(tmdbData);

      // Load recommendations
      const recsData = await tmdbService.getRecommendations('tv', tvId);
      setRecommendations(recsData.results.slice(0, 10));

      // Try to load OMDB data
      try {
        const omdbResponse = await omdbService.searchByTitle(tmdbData.name, 
          tmdbData.first_air_date ? new Date(tmdbData.first_air_date).getFullYear().toString() : undefined, 
          'series'
        );
        setOmdbData(omdbResponse);
      } catch (omdbError) {
        console.warn('OMDB data not available:', omdbError);
      }
    } catch (err) {
      setError('Failed to load TV show details');
      console.error('TV details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = () => {
    if (!tvShow) return;

    const inWatchlist = isInWatchlist(tvShow.id, 'tv');
    
    if (inWatchlist) {
      removeFromWatchlist(tvShow.id, 'tv');
    } else {
      addToWatchlist({
        id: tvShow.id,
        title: tvShow.name,
        type: 'tv',
        poster_path: tvShow.poster_path,
        release_date: tvShow.first_air_date,
        vote_average: tvShow.vote_average
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">{error || 'TV show not found'}</p>
        <Link to="/" className="text-blue-600 hover:text-blue-700">
          Return to Home
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(tvShow.id, 'tv');
  const firstAirYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : '';
  const lastAirYear = tvShow.last_air_date ? new Date(tvShow.last_air_date).getFullYear() : '';
  const yearRange = firstAirYear && lastAirYear && firstAirYear !== lastAirYear 
    ? `${firstAirYear}-${lastAirYear}` 
    : firstAirYear.toString();
  const mainCast = tvShow.credits?.cast.slice(0, 6) || [];
  const creators = tvShow.created_by || [];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link 
        to="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>

      {/* Hero Section */}
      <div className="relative">
        {tvShow.backdrop_path && (
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <img
              src={tmdbService.getBackdropUrl(tvShow.backdrop_path, 'w1280')}
              alt={tvShow.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        )}
        
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-8 text-white min-h-[400px] flex items-end">
          <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={tmdbService.getImageUrl(tvShow.poster_path, 'w342')}
                alt={tvShow.name}
                className="w-64 h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>

            {/* TV Show Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{tvShow.name}</h1>
                {tvShow.tagline && (
                  <p className="text-xl text-gray-300 italic">{tvShow.tagline}</p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                {yearRange && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {yearRange}
                  </div>
                )}
                <div className="flex items-center">
                  <Tv className="h-4 w-4 mr-1" />
                  {tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}, {tvShow.number_of_episodes} Episodes
                </div>
                {tvShow.vote_average > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                    {tvShow.vote_average.toFixed(1)}/10
                  </div>
                )}
              </div>

              {/* Genres */}
              {tvShow.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tvShow.genres.map(genre => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-blue-600 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <p className="text-gray-200 text-lg leading-relaxed max-w-3xl">
                {tvShow.overview}
              </p>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleWatchlistToggle}
                  variant={inWatchlist ? 'secondary' : 'primary'}
                  size="lg"
                >
                  {inWatchlist ? (
                    <>
                      <BookmarkCheck className="h-5 w-5 mr-2" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-5 w-5 mr-2" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cast */}
          {mainCast.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Cast
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mainCast.map(actor => (
                  <div key={actor.id} className="text-center">
                    <img
                      src={tmdbService.getImageUrl(actor.profile_path, 'w154')}
                      alt={actor.name}
                      className="w-20 h-20 object-cover rounded-full mx-auto mb-2"
                    />
                    <p className="font-medium text-gray-900 text-sm">{actor.name}</p>
                    <p className="text-gray-600 text-xs">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Ratings */}
          {omdbData && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-6 w-6 mr-2 text-blue-600" />
                Ratings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {omdbData.imdbRating && omdbData.imdbRating !== 'N/A' && (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {omdbData.imdbRating}/10
                    </div>
                    <div className="text-sm text-gray-600">IMDb</div>
                  </div>
                )}
                {omdbService.extractRottenTomatoesRating(omdbData.Ratings) && (
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {omdbService.extractRottenTomatoesRating(omdbData.Ratings)}
                    </div>
                    <div className="text-sm text-gray-600">Rotten Tomatoes</div>
                  </div>
                )}
                {omdbService.extractMetacriticRating(omdbData.Ratings) && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {omdbService.extractMetacriticRating(omdbData.Ratings)}/100
                    </div>
                    <div className="text-sm text-gray-600">Metacritic</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* TV Show Facts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Show Facts</h3>
            <div className="space-y-3 text-sm">
              {creators.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Created by:</span>
                  <span className="ml-2 text-gray-600">
                    {creators.map(creator => creator.name).join(', ')}
                  </span>
                </div>
              )}
              {tvShow.first_air_date && (
                <div>
                  <span className="font-medium text-gray-700">First Air Date:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(tvShow.first_air_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {tvShow.last_air_date && (
                <div>
                  <span className="font-medium text-gray-700">Last Air Date:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(tvShow.last_air_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-gray-600">{tvShow.status}</span>
              </div>
              {tvShow.networks.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Network:</span>
                  <span className="ml-2 text-gray-600">
                    {tvShow.networks[0].name}
                  </span>
                </div>
              )}
              {tvShow.production_companies.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Studio:</span>
                  <span className="ml-2 text-gray-600">
                    {tvShow.production_companies[0].name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">You Might Also Like</h2>
          <MediaGrid items={recommendations} type="tv" />
        </div>
      )}
    </div>
  );
}