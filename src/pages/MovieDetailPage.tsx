import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  Bookmark, 
  BookmarkCheck, 
  Play,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { TMDBMovieDetails, OMDBMovie } from '../types/movie';
import { tmdbService } from '../services/tmdb';
import { omdbService } from '../services/omdb';
import { useWatchlist } from '../hooks/useWatchlist';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { MediaGrid } from '../components/common/MediaGrid';

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [omdbData, setOmdbData] = useState<OMDBMovie | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    if (id) {
      loadMovieDetails(parseInt(id));
    }
  }, [id]);

  const loadMovieDetails = async (movieId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Load TMDB data
      const tmdbData = await tmdbService.getMovieDetails(movieId);
      setMovie(tmdbData);

      // Load recommendations
      const recsData = await tmdbService.getRecommendations('movie', movieId);
      setRecommendations(recsData.results.slice(0, 10));

      // Try to load OMDB data if we have an IMDb ID
      if (tmdbData.imdb_id) {
        try {
          const omdbResponse = await omdbService.getMovieByIMDbID(tmdbData.imdb_id);
          setOmdbData(omdbResponse);
        } catch (omdbError) {
          console.warn('OMDB data not available:', omdbError);
        }
      }
    } catch (err) {
      setError('Failed to load movie details');
      console.error('Movie details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = () => {
    if (!movie) return;

    const inWatchlist = isInWatchlist(movie.id, 'movie');
    
    if (inWatchlist) {
      removeFromWatchlist(movie.id, 'movie');
    } else {
      addToWatchlist({
        id: movie.id,
        title: movie.title,
        type: 'movie',
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average
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

  if (error || !movie) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">{error || 'Movie not found'}</p>
        <Link to="/" className="text-blue-600 hover:text-blue-700">
          Return to Home
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id, 'movie');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';
  const director = movie.credits?.crew.find(person => person.job === 'Director');
  const mainCast = movie.credits?.cast.slice(0, 6) || [];

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
        {movie.backdrop_path && (
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <img
              src={tmdbService.getBackdropUrl(movie.backdrop_path, 'w1280')}
              alt={movie.title}
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
                src={tmdbService.getImageUrl(movie.poster_path, 'w342')}
                alt={movie.title}
                className="w-64 h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-xl text-gray-300 italic">{movie.tagline}</p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                {releaseYear && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {releaseYear}
                  </div>
                )}
                {runtime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {runtime}
                  </div>
                )}
                {movie.vote_average > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
                    {movie.vote_average.toFixed(1)}/10
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
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
                {movie.overview}
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
          {/* Movie Facts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Movie Facts</h3>
            <div className="space-y-3 text-sm">
              {director && (
                <div>
                  <span className="font-medium text-gray-700">Director:</span>
                  <span className="ml-2 text-gray-600">{director.name}</span>
                </div>
              )}
              {movie.release_date && (
                <div>
                  <span className="font-medium text-gray-700">Release Date:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(movie.release_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {movie.budget > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Budget:</span>
                  <span className="ml-2 text-gray-600">
                    ${movie.budget.toLocaleString()}
                  </span>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Revenue:</span>
                  <span className="ml-2 text-gray-600">
                    ${movie.revenue.toLocaleString()}
                  </span>
                </div>
              )}
              {movie.production_companies.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Studio:</span>
                  <span className="ml-2 text-gray-600">
                    {movie.production_companies[0].name}
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
          <MediaGrid items={recommendations} type="movie" />
        </div>
      )}
    </div>
  );
}