import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, Film, Tv, ChevronRight } from 'lucide-react';
import { TMDBMovie, TMDBTVShow } from '../types/movie';
import { tmdbService } from '../services/tmdb';
import { MediaGrid } from '../components/common/MediaGrid';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function HomePage() {
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<TMDBTVShow[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [
          trendingMoviesData,
          trendingTVData,
          popularMoviesData,
          topRatedData
        ] = await Promise.all([
          tmdbService.getTrendingMovies('week'),
          tmdbService.getTrendingTVShows('week'),
          tmdbService.getPopularMovies(),
          tmdbService.getTopRatedMovies()
        ]);

        setTrendingMovies(trendingMoviesData.results.slice(0, 10) as TMDBMovie[]);
        setTrendingTVShows(trendingTVData.results.slice(0, 10) as TMDBTVShow[]);
        setPopularMovies(popularMoviesData.results.slice(0, 10) as TMDBMovie[]);
        setTopRatedMovies(topRatedData.results.slice(0, 10) as TMDBMovie[]);
      } catch (err) {
        setError('Failed to load content');
        console.error('HomePage load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  const Section = ({ title, items, type, viewAllLink, icon: Icon }: {
    title: string;
    items: (TMDBMovie | TMDBTVShow)[];
    type: 'movie' | 'tv';
    viewAllLink: string;
    icon: React.ComponentType<any>;
  }) => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Icon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
          {title}
        </h2>
        <Link
          to={viewAllLink}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center transition-colors"
        >
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <MediaGrid items={items} type={type} />
    </section>
  );

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 rounded-lg p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Discover Your Next Favorite Movie or TV Show
          </h1>
          <p className="text-xl mb-6 text-blue-100 dark:text-blue-200">
            Explore trending content, manage your watchlist, and never miss what's worth watching.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/trending"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Explore Trending
            </Link>
            <Link
              to="/discover"
              className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Discover Movies
            </Link>
          </div>
        </div>
      </div>

      {/* Trending Movies */}
      <Section
        title="Trending Movies"
        items={trendingMovies}
        type="movie"
        viewAllLink="/trending?type=movie"
        icon={TrendingUp}
      />

      {/* Trending TV Shows */}
      <Section
        title="Trending TV Shows"
        items={trendingTVShows}
        type="tv"
        viewAllLink="/trending?type=tv"
        icon={Tv}
      />

      {/* Popular Movies */}
      <Section
        title="Popular Movies"
        items={popularMovies}
        type="movie"
        viewAllLink="/discover?type=movie&sort=popularity.desc"
        icon={Film}
      />

      {/* Top Rated Movies */}
      <Section
        title="Top Rated Movies"
        items={topRatedMovies}
        type="movie"
        viewAllLink="/discover?type=movie&sort=vote_average.desc"
        icon={Star}
      />
    </div>
  );
}