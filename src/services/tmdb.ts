import { 
  TMDBMovie, 
  TMDBTVShow, 
  TMDBMovieDetails, 
  TMDBTVDetails, 
  SearchResponse, 
  Genre,
  MediaType,
  SortBy 
} from '../types/movie';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const headers = {
  accept: 'application/json',
  Authorization: `Bearer ${TOKEN}`
};

class TMDBService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private async fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('TMDB API Error:', error);
      throw error;
    }
  }

  async searchMulti(query: string, page = 1): Promise<SearchResponse> {
    const url = `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}`;
    return this.fetchWithCache<SearchResponse>(url, `search-${query}-${page}`);
  }

  async searchMovies(query: string, page = 1): Promise<SearchResponse> {
    const url = `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`;
    return this.fetchWithCache<SearchResponse>(url, `search-movies-${query}-${page}`);
  }

  async searchTVShows(query: string, page = 1): Promise<SearchResponse> {
    const url = `${BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`;
    return this.fetchWithCache<SearchResponse>(url, `search-tv-${query}-${page}`);
  }

  async getMovieDetails(id: number): Promise<TMDBMovieDetails> {
    const url = `${BASE_URL}/movie/${id}?append_to_response=credits`;
    return this.fetchWithCache<TMDBMovieDetails>(url, `movie-${id}`);
  }

  async getTVDetails(id: number): Promise<TMDBTVDetails> {
    const url = `${BASE_URL}/tv/${id}?append_to_response=credits`;
    return this.fetchWithCache<TMDBTVDetails>(url, `tv-${id}`);
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<SearchResponse> {
    const url = `${BASE_URL}/trending/movie/${timeWindow}`;
    return this.fetchWithCache<SearchResponse>(url, `trending-movies-${timeWindow}`);
  }

  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<SearchResponse> {
    const url = `${BASE_URL}/trending/tv/${timeWindow}`;
    return this.fetchWithCache<SearchResponse>(url, `trending-tv-${timeWindow}`);
  }

  async getPopularMovies(page = 1): Promise<SearchResponse> {
    const url = `${BASE_URL}/movie/popular?page=${page}`;
    return this.fetchWithCache<SearchResponse>(url, `popular-movies-${page}`);
  }

  async getPopularTVShows(page = 1): Promise<SearchResponse> {
    const url = `${BASE_URL}/tv/popular?page=${page}`;
    return this.fetchWithCache<SearchResponse>(url, `popular-tv-${page}`);
  }

  async getTopRatedMovies(page = 1): Promise<SearchResponse> {
    const url = `${BASE_URL}/movie/top_rated?page=${page}`;
    return this.fetchWithCache<SearchResponse>(url, `top-rated-movies-${page}`);
  }

  async getTopRatedTVShows(page = 1): Promise<SearchResponse> {
    const url = `${BASE_URL}/tv/top_rated?page=${page}`;
    return this.fetchWithCache<SearchResponse>(url, `top-rated-tv-${page}`);
  }

  async discoverMovies(params: {
    page?: number;
    sort_by?: SortBy;
    with_genres?: string;
    primary_release_year?: number;
    'vote_average.gte'?: number;
    'vote_average.lte'?: number;
    'runtime.gte'?: number;
    'runtime.lte'?: number;
  } = {}): Promise<SearchResponse> {
    const queryParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      sort_by: params.sort_by || 'popularity.desc',
      ...Object.fromEntries(
        Object.entries(params).filter(([key, value]) => 
          key !== 'page' && key !== 'sort_by' && value !== undefined
        ).map(([key, value]) => [key, value.toString()])
      )
    });

    const url = `${BASE_URL}/discover/movie?${queryParams}`;
    return this.fetchWithCache<SearchResponse>(url, `discover-movies-${queryParams.toString()}`);
  }

  async discoverTVShows(params: {
    page?: number;
    sort_by?: SortBy;
    with_genres?: string;
    first_air_date_year?: number;
    'vote_average.gte'?: number;
    'vote_average.lte'?: number;
  } = {}): Promise<SearchResponse> {
    const queryParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      sort_by: params.sort_by || 'popularity.desc',
      ...Object.fromEntries(
        Object.entries(params).filter(([key, value]) => 
          key !== 'page' && key !== 'sort_by' && value !== undefined
        ).map(([key, value]) => [key, value.toString()])
      )
    });

    const url = `${BASE_URL}/discover/tv?${queryParams}`;
    return this.fetchWithCache<SearchResponse>(url, `discover-tv-${queryParams.toString()}`);
  }

  async getGenres(type: 'movie' | 'tv'): Promise<{ genres: Genre[] }> {
    const url = `${BASE_URL}/genre/${type}/list`;
    return this.fetchWithCache<{ genres: Genre[] }>(url, `genres-${type}`);
  }

  async getRecommendations(type: 'movie' | 'tv', id: number, page = 1): Promise<SearchResponse> {
    const url = `${BASE_URL}/${type}/${id}/recommendations?page=${page}`;
    return this.fetchWithCache<SearchResponse>(url, `recommendations-${type}-${id}-${page}`);
  }

  async getSimilar(type: 'movie' | 'tv', id: number, page = 1): Promise<SearchResponse> {
    const url = `${BASE_URL}/${type}/${id}/similar?page=${page}`;
    return this.fetchWithCache<SearchResponse>(url, `similar-${type}-${id}-${page}`);
  }

  getImageUrl(path: string | null, size: 'w154' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
    if (!path) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    if (!path) return '/placeholder-backdrop.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const tmdbService = new TMDBService();