import { TMDBService } from "./tmdb";
import { MediaItem, PaginatedResult } from "../types";

export class SearchService {
  public static async multiSearch(query: string, page: number = 1, language: string = 'en-US'): Promise<PaginatedResult<any>> {
    if (!query || !query.trim()) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
    return TMDBService.fetchEndpoint<PaginatedResult<any>>("search/multi", {
      query: query.trim(),
      page,
      language,
      include_adult: false,
    });
  }

  public static async searchMovies(query: string, page: number = 1, language: string = 'en-US', year?: number | string): Promise<PaginatedResult<MediaItem>> {
    if (!query || !query.trim()) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
    const params: Record<string, any> = {
      query: query.trim(),
      page,
      language,
      include_adult: false,
    };
    if (year && year !== 'all') {
      params.primary_release_year = year;
    }
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("search/movie", params);
    return {
      ...data,
      results: (data.results || []).map(m => ({ ...m, media_type: 'movie' as const })),
    };
  }

  public static async searchSeries(query: string, page: number = 1, language: string = 'en-US', year?: number | string): Promise<PaginatedResult<MediaItem>> {
    if (!query || !query.trim()) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
    const params: Record<string, any> = {
      query: query.trim(),
      page,
      language,
      include_adult: false,
    };
    if (year && year !== 'all') {
      params.first_air_date_year = year;
    }
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("search/tv", params);
    return {
      ...data,
      results: (data.results || []).map(s => ({ ...s, media_type: 'tv' as const })),
    };
  }

  public static async searchActors(query: string, page: number = 1, language: string = 'en-US'): Promise<PaginatedResult<any>> {
    if (!query || !query.trim()) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
    return TMDBService.fetchEndpoint<PaginatedResult<any>>("search/person", {
      query: query.trim(),
      page,
      language,
      include_adult: false,
    });
  }
}
