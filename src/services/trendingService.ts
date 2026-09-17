import { TMDBService } from "./tmdb";
import { MediaItem, PaginatedResult } from "../types";

export class TrendingService {
  public static async getAllTrending(timeWindow: 'day' | 'week' = 'day', language: string = 'en-US'): Promise<MediaItem[]> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>(`trending/all/${timeWindow}`, { language });
    return (data.results || []).filter(item => item.poster_path || item.backdrop_path);
  }

  public static async getTrendingMovies(timeWindow: 'day' | 'week' = 'day', language: string = 'en-US'): Promise<MediaItem[]> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>(`trending/movie/${timeWindow}`, { language });
    return (data.results || []).map(item => ({ ...item, media_type: 'movie' as const }));
  }

  public static async getTrendingSeries(timeWindow: 'day' | 'week' = 'day', language: string = 'en-US'): Promise<MediaItem[]> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>(`trending/tv/${timeWindow}`, { language });
    return (data.results || []).map(item => ({ ...item, media_type: 'tv' as const }));
  }
}
