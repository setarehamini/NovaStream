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

  public static async getUpcoming(page: number = 1, language: string = 'en-US'): Promise<PaginatedResult<MediaItem>> {
    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("movie/upcoming", { page, language });
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

    if (options.genres && options.genres.length > 0) {
      params.with_genres = Array.isArray(options.genres) ? options.genres.join(',') : options.genres;
    } else if (options.genreId && options.genreId !== 'all') {
      params.with_genres = options.genreId;
    }

    if (options.yearFrom && options.yearFrom !== 'all') {
      params["primary_release_date.gte"] = `${options.yearFrom}-01-01`;
    }
    if (options.yearTo && options.yearTo !== 'all') {
      params["primary_release_date.lte"] = `${options.yearTo}-12-31`;
    }
    if (options.year && options.year !== 'all' && !options.yearFrom && !options.yearTo) {
      params.primary_release_year = options.year;
    }

    if (options.minRating && options.minRating !== 'all') {
      params["vote_average.gte"] = options.minRating;
    }
    if (options.maxRating && options.maxRating !== 'all') {
      params["vote_average.lte"] = options.maxRating;
    }

    if (options.minVotes && options.minVotes !== 'all') {
      params["vote_count.gte"] = options.minVotes;
    } else if (options.minRating && options.minRating !== 'all') {
      params["vote_count.gte"] = 20;
    }

    if (options.originalLanguage && options.originalLanguage !== 'all') {
      params.with_original_language = options.originalLanguage;
    }

    if (options.certification && options.certification !== 'all') {
      params.certification_country = 'US';
      params.certification = options.certification;
    }

    const data = await TMDBService.fetchEndpoint<PaginatedResult<MediaItem>>("discover/movie", params);
    return {
      ...data,
      results: (data.results || []).map(m => ({ ...m, media_type: 'movie' as const })),
    };
  }
}
