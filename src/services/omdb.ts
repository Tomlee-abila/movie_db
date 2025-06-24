import { OMDBMovie } from '../types/movie';

const BASE_URL = 'https://www.omdbapi.com/';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

class OMDBService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  private async fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Response === 'False') {
        throw new Error(data.Error || 'OMDB API Error');
      }
      
      // Cache the response
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('OMDB API Error:', error);
      throw error;
    }
  }

  async getMovieByIMDbID(imdbID: string): Promise<OMDBMovie> {
    const url = `${BASE_URL}?i=${imdbID}&apikey=${API_KEY}&plot=full`;
    return this.fetchWithCache<OMDBMovie>(url, `omdb-${imdbID}`);
  }

  async searchByTitle(title: string, year?: string, type?: 'movie' | 'series'): Promise<OMDBMovie> {
    const params = new URLSearchParams({
      t: title,
      apikey: API_KEY,
      plot: 'full'
    });

    if (year) params.append('y', year);
    if (type) params.append('type', type);

    const url = `${BASE_URL}?${params}`;
    return this.fetchWithCache<OMDBMovie>(url, `omdb-search-${title}-${year || ''}-${type || ''}`);
  }

  extractIMDbRating(ratings: any[]): string | null {
    const imdbRating = ratings?.find(rating => rating.Source === 'Internet Movie Database');
    return imdbRating ? imdbRating.Value.split('/')[0] : null;
  }

  extractRottenTomatoesRating(ratings: any[]): string | null {
    const rtRating = ratings?.find(rating => rating.Source === 'Rotten Tomatoes');
    return rtRating ? rtRating.Value : null;
  }

  extractMetacriticRating(ratings: any[]): string | null {
    const metacriticRating = ratings?.find(rating => rating.Source === 'Metacritic');
    return metacriticRating ? metacriticRating.Value.split('/')[0] : null;
  }
}

export const omdbService = new OMDBService();