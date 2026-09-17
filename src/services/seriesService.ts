import { TMDBService } from "./tmdb";
import { FilterOptions, MediaItem, PaginatedResult, SeasonDetails, TVDetails } from "../types";

export class SeriesService {
  public static async getPopular(page: number = 1, language: string = 'en-US'): Promise<PaginatedResult<MediaItem>> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("tv/popular", { page, language });
    return {
      ...data,
      results: (data.results || []).map(s => ({ ...s, media_type: 'tv' as const })),
    };
  }

  public static async getTopRated(page: number = 1, language: string = 'en-US'): Promise<PaginatedResult<MediaItem>> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("tv/top_rated", { page, language });
    return {
      ...data,
      results: (data.results || []).map(s => ({ ...s, media_type: 'tv' as const })),
    };
  }

  public static async getOnTheAir(page: number = 1, language: string = 'en-US'): Promise<PaginatedResult<MediaItem>> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("tv/on_the_air", { page, language });
    return {
      ...data,
      results: (data.results || []).map(s => ({ ...s, media_type: 'tv' as const })),
    };
  }

  public static async getDetails(id: number, language: string = 'en-US'): Promise<TVDetails> {
    const data = await TMDBService.fetchEndpoint<TVDetails>(`tv/${id}`, {
      language,
      append_to_response: "credits,videos,similar,recommendations",
    });
    return {
      ...data,
      media_type: 'tv' as const,
    };
  }

  public static async getSeasonDetails(tvId: number, seasonNumber: number, language: string = 'en-US'): Promise<SeasonDetails> {
    return TMDBService.fetchEndpoint<SeasonDetails>(`tv/${tvId}/season/${seasonNumber}`, { language });
  }

  public static async getSimilar(id: number, page: number = 1, language: string = 'en-US'): Promise<MediaItem[]> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>(`tv/${id}/similar`, { page, language });
    return (data.results || []).map(s => ({ ...s, media_type: 'tv' as const }));
  }

  public static async getRecommendations(id: number, page: number = 1, language: string = 'en-US'): Promise<MediaItem[]> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>(`tv/${id}/recommendations`, { page, language });
    return (data.results || []).map(s => ({ ...s, media_type: 'tv' as const }));
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
      params.first_air_date_year = options.year;
    }
    if (options.minRating && options.minRating !== 'all') {
      params["vote_average.gte"] = options.minRating;
      params["vote_count.gte"] = 25;
    }

    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("discover/tv", params);
    return {
      ...data,
      results: (data.results || []).map(s => ({ ...s, media_type: 'tv' as const })),
    };
  }
}
