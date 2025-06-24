import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Genre } from '../types/movie';
import { tmdbService } from '../services/tmdb';
import { storageService } from '../services/storage';

interface AppContextType {
  movieGenres: Genre[];
  tvGenres: Genre[];
  preferences: any;
  updatePreferences: (prefs: any) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTVGenres] = useState<Genre[]>([]);
  const [preferences, setPreferences] = useState(storageService.getPreferences());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const [movieGenresData, tvGenresData] = await Promise.all([
          tmdbService.getGenres('movie'),
          tmdbService.getGenres('tv')
        ]);
        
        setMovieGenres(movieGenresData.genres);
        setTVGenres(tvGenresData.genres);
      } catch (error) {
        console.error('Failed to load genres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGenres();
  }, []);

  const updatePreferences = (newPrefs: any) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    storageService.savePreferences(updated);
  };

  return (
    <AppContext.Provider value={{
      movieGenres,
      tvGenres,
      preferences,
      updatePreferences,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}