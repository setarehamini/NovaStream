import { TMDBService } from "./tmdb";
import { FilterOptions, MediaItem, MovieDetails, PaginatedResult } from "../types";

export class MovieService {
  public static async getPopular(page: number = 1, language: string = 'en-US'): Promise<PaginatedResult<MediaItem>> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("movie/popular", { page, language });
    return {
      ...data,
      results: (data.results || []).map(m => ({ ...m, media_type: 'movie' as const })),
    };
  }

  public static async getTopRated(page: number = 1, language: string = 'en-US'): Promise<PaginatedResult<MediaItem>> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("movie/top_rated", { page, language });
    return {
      ...data,
      results: (data.results || []).map(m => ({ ...m, media_type: 'movie' as const })),
    };
  }

  public static async getNowPlaying(page: number = 1, language: string = 'en-US'): Promise<PaginatedResult<MediaItem>> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("movie/now_playing", { page, language });
    return {
      ...data,
      results: (data.results || []).map(m => ({ ...m, media_type: 'movie' as const })),
    };
  }

  public static async getDetails(id: number, language: string = 'en-US'): Promise<MovieDetails> {
    const data = await TMDBService.fetchEndpoint<MovieDetails>(`movie/${id}`, {
      language,
      append_to_response: "credits,videos,similar,recommendations",
    });
    return {
      ...data,
      media_type: 'movie' as const,
    };
  }

  public static async getSimilar(id: number, page: number = 1, language: string = 'en-US'): Promise<MediaItem[]> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>(`movie/${id}/similar`, { page, language });
    return (data.results || []).map(m => ({ ...m, media_type: 'movie' as const }));
  }

  public static async getRecommendations(id: number, page: number = 1, language: string = 'en-US'): Promise<MediaItem[]> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>(`movie/${id}/recommendations`, { page, language });
    return (data.results || []).map(m => ({ ...m, media_type: 'movie' as const }));
  }

  public static async discover(options: FilterOptions = {}): Promise<PaginatedResult<MediaItem>> {
    const params: Record<string, any> = {
      page: options.page || 1,
      language: options.language || 'en-US',
      sort_by: options.sortBy || 'popularity.desc',
      include_adult: false,
    };

    if (options.genreId && options.genreId !== 'all') {
      params.with_genres = options.genreId;
    }
    if (options.year && options.year !== 'all') {
      params.primary_release_year = options.year;
    }
    if (options.minRating && options.minRating !== 'all') {
      params["vote_average.gte"] = options.minRating;
      params["vote_count.gte"] = 50; // ensure meaningful ratings
    }

    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("discover/movie", params);
    return {
      ...data,
      results: (data.results || []).map(m => ({ ...m, media_type: 'movie' as const })),
    };
  }
}
