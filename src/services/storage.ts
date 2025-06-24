import { WatchlistItem } from '../types/movie';

class StorageService {
  private readonly WATCHLIST_KEY = 'movieapp_watchlist';
  private readonly PREFERENCES_KEY = 'movieapp_preferences';

  getWatchlist(): WatchlistItem[] {
    try {
      const stored = localStorage.getItem(this.WATCHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading watchlist:', error);
      return [];
    }
  }

  saveWatchlist(watchlist: WatchlistItem[]): void {
    try {
      localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  }

  addToWatchlist(item: Omit<WatchlistItem, 'added_date' | 'watched'>): void {
    const watchlist = this.getWatchlist();
    const exists = watchlist.find(w => w.id === item.id && w.type === item.type);
    
    if (!exists) {
      const newItem: WatchlistItem = {
        ...item,
        watched: false,
        added_date: new Date().toISOString()
      };
      
      watchlist.unshift(newItem);
      this.saveWatchlist(watchlist);
    }
  }

  removeFromWatchlist(id: number, type: 'movie' | 'tv'): void {
    const watchlist = this.getWatchlist();
    const filtered = watchlist.filter(item => !(item.id === id && item.type === type));
    this.saveWatchlist(filtered);
  }

  toggleWatched(id: number, type: 'movie' | 'tv'): void {
    const watchlist = this.getWatchlist();
    const item = watchlist.find(w => w.id === id && w.type === type);
    
    if (item) {
      item.watched = !item.watched;
      this.saveWatchlist(watchlist);
    }
  }

  isInWatchlist(id: number, type: 'movie' | 'tv'): boolean {
    const watchlist = this.getWatchlist();
    return watchlist.some(item => item.id === id && item.type === type);
  }

  getPreferences(): any {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : {
        theme: 'dark',
        defaultView: 'grid',
        autoPlay: false
      };
    } catch (error) {
      console.error('Error loading preferences:', error);
      return {
        theme: 'dark',
        defaultView: 'grid',
        autoPlay: false
      };
    }
  }

  savePreferences(preferences: any): void {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }
}

export const storageService = new StorageService();