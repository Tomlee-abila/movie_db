import React, { useState } from 'react';
import { Bookmark, Clock, CheckCircle, Filter, Calendar, Star } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { WatchlistItem } from '../types/movie';
import { tmdbService } from '../services/tmdb';
import { Button } from '../components/ui/Button';

export function WatchlistPage() {
  const { watchlist, removeFromWatchlist, toggleWatched } = useWatchlist();
  const [filter, setFilter] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [sortBy, setSortBy] = useState<'added_date' | 'title' | 'release_date' | 'rating'>('added_date');

  const filteredWatchlist = watchlist.filter(item => {
    if (filter === 'watched') return item.watched;
    if (filter === 'unwatched') return !item.watched;
    return true;
  });

  const sortedWatchlist = [...filteredWatchlist].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'release_date':
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      case 'rating':
        return b.vote_average - a.vote_average;
      case 'added_date':
      default:
        return new Date(b.added_date).getTime() - new Date(a.added_date).getTime();
    }
  });

  const stats = {
    total: watchlist.length,
    watched: watchlist.filter(item => item.watched).length,
    unwatched: watchlist.filter(item => !item.watched).length
  };

  if (watchlist.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Watchlist is Empty</h2>
        <p className="text-gray-600 mb-6">
          Start adding movies and TV shows to keep track of what you want to watch.
        </p>
        <Button onClick={() => window.location.href = '/discover'}>
          Discover Content
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center mb-4">
          <Bookmark className="h-8 w-8 mr-3" />
          <h1 className="text-3xl font-bold">My Watchlist</h1>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-purple-200 text-sm">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.unwatched}</div>
            <div className="text-purple-200 text-sm">To Watch</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.watched}</div>
            <div className="text-purple-200 text-sm">Watched</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'all' as const, label: 'All', icon: Bookmark },
              { value: 'unwatched' as const, label: 'To Watch', icon: Clock },
              { value: 'watched' as const, label: 'Watched', icon: CheckCircle }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === value
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="added_date">Recently Added</option>
            <option value="title">Title A-Z</option>
            <option value="release_date">Release Date</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      {/* Watchlist Items */}
      <div className="space-y-4">
        {sortedWatchlist.map((item) => (
          <WatchlistItemCard
            key={`${item.type}-${item.id}`}
            item={item}
            onRemove={() => removeFromWatchlist(item.id, item.type)}
            onToggleWatched={() => toggleWatched(item.id, item.type)}
          />
        ))}
      </div>
    </div>
  );
}

function WatchlistItemCard({ 
  item, 
  onRemove, 
  onToggleWatched 
}: { 
  item: WatchlistItem;
  onRemove: () => void;
  onToggleWatched: () => void;
}) {
  const year = item.release_date ? new Date(item.release_date).getFullYear() : '';
  const addedDate = new Date(item.added_date).toLocaleDateString();

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
      item.watched ? 'border-green-500' : 'border-blue-500'
    }`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Poster */}
        <div className="flex-shrink-0">
          <img
            src={tmdbService.getImageUrl(item.poster_path, 'w154')}
            alt={item.title}
            className="w-24 h-36 object-cover rounded-lg"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 ml-4">
              {item.vote_average > 0 && (
                <div className="flex items-center text-yellow-600">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  <span className="text-sm font-medium">{item.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {year}
            </div>
            <div className="capitalize">
              {item.type === 'tv' ? 'TV Show' : 'Movie'}
            </div>
            <div>
              Added {addedDate}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant={item.watched ? 'secondary' : 'primary'}
              onClick={onToggleWatched}
            >
              {item.watched ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Watched
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  Mark as Watched
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}