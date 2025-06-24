import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import { TMDBMovie, TMDBTVShow } from '../../types/movie';
import { tmdbService } from '../../services/tmdb';
import { useWatchlist } from '../../hooks/useWatchlist';
import { Button } from '../ui/Button';

interface MediaCardProps {
  item: TMDBMovie | TMDBTVShow;
  type: 'movie' | 'tv';
}

export function MediaCard({ item, type }: MediaCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  
  const title = type === 'movie' ? (item as TMDBMovie).title : (item as TMDBTVShow).name;
  const releaseDate = type === 'movie' ? (item as TMDBMovie).release_date : (item as TMDBTVShow).first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  
  const inWatchlist = isInWatchlist(item.id, type);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWatchlist) {
      removeFromWatchlist(item.id, type);
    } else {
      addToWatchlist({
        id: item.id,
        title,
        type,
        poster_path: item.poster_path,
        release_date: releaseDate,
        vote_average: item.vote_average
      });
    }
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link to={`/${type}/${item.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={tmdbService.getImageUrl(item.poster_path, 'w342')}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating overlay */}
          {item.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-white text-xs font-medium">
                {item.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          
          {year && (
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{year}</span>
            </div>
          )}

          {item.overview && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3">
              {item.overview}
            </p>
          )}
        </div>
      </Link>

      {/* Watchlist button */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          size="sm"
          variant={inWatchlist ? 'primary' : 'ghost'}
          onClick={handleWatchlistToggle}
          className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 ${
            inWatchlist ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          {inWatchlist ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}