import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.musicinsights.in';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    } else if (error.response?.status === 404) {
      console.error('Endpoint not found:', error.config.url);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API Types
export interface Track {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    release_date: string;
  };
  preview_url?: string;
  external_urls: {
    spotify: string;
  };
  popularity: number;
  rank?: number;
}

export interface Artist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  followers: {
    total: number;
  };
  popularity: number;
  external_urls: {
    spotify: string;
  };
  genres: string[];
}

export interface Genre {
  name: string;
  count: number;
  percentage: number;
}

export interface ChartResponse {
  tracks: Track[];
  snapshot_id: string;
  last_updated: string;
  total: number;
}

export interface SearchResponse {
  artists?: {
    items: Artist[];
    total: number;
  };
  tracks?: {
    items: Track[];
    total: number;
  };
  playlists?: {
    items: any[];
    total: number;
  };
}

// API Functions
export const apiService = {
  // Charts
  getTopToday: async (market: string = 'IN'): Promise<ChartResponse> => {
    const response = await apiClient.get(`/charts/top-today?market=${market}`);
    return response.data;
  },

  getTopYear: async (year: number, market: string = 'IN'): Promise<ChartResponse> => {
    const response = await apiClient.get(`/charts/top-year?year=${year}&market=${market}`);
    return response.data;
  },

  // Artists
  getTopArtists: async (year: number, market: string = 'IN'): Promise<{ artists: Artist[] }> => {
    const response = await apiClient.get(`/artists/top?year=${year}&market=${market}`);
    return response.data;
  },

  getArtistTopTracks: async (id: string, market: string = 'IN'): Promise<{ tracks: Track[] }> => {
    const response = await apiClient.get(`/artists/${id}/top-tracks?market=${market}`);
    return response.data;
  },

  getArtistDetails: async (id: string): Promise<Artist> => {
    const response = await apiClient.get(`/artists/${id}`);
    return response.data;
  },

  // Genres
  getTopGenres: async (year: number, market: string = 'IN'): Promise<{ genres: Genre[] }> => {
    const response = await apiClient.get(`/genres/top?year=${year}&market=${market}`);
    return response.data;
  },

  // Search
  search: async (
    query: string, 
    type: 'artist' | 'track' | 'playlist' = 'track',
    limit: number = 20
  ): Promise<SearchResponse> => {
    const response = await apiClient.get(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
    return response.data;
  },

  // Compare
  compareGenres: async (year: number, markets: string[] = ['IN', 'US', 'GB']): Promise<any> => {
    const marketParams = markets.join(',');
    const response = await apiClient.get(`/compare/genres?year=${year}&markets=${marketParams}`);
    return response.data;
  },

  // Analytics
  getKPIStats: async (): Promise<{
    lastSnapshotDate: string;
    totalTracks: number;
    totalArtists: number;
    totalGenres: number;
  }> => {
    const response = await apiClient.get('/analytics/kpi');
    return response.data;
  },
};

export default apiClient;