import { useState, useEffect } from 'react';
import { WatchlistItem } from '../types/movie';
import { storageService } from '../services/storage';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setWatchlist(storageService.getWatchlist());
  }, []);

  const addToWatchlist = (item: Omit<WatchlistItem, 'added_date' | 'watched'>) => {
    storageService.addToWatchlist(item);
    setWatchlist(storageService.getWatchlist());
  };

  const removeFromWatchlist = (id: number, type: 'movie' | 'tv') => {
    storageService.removeFromWatchlist(id, type);
    setWatchlist(storageService.getWatchlist());
  };

  const toggleWatched = (id: number, type: 'movie' | 'tv') => {
    storageService.toggleWatched(id, type);
    setWatchlist(storageService.getWatchlist());
  };

  const isInWatchlist = (id: number, type: 'movie' | 'tv') => {
    return storageService.isInWatchlist(id, type);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatched,
    isInWatchlist
  };
}