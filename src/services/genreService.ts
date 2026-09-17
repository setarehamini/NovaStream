import { TMDBService } from "./tmdb";
import { Genre } from "../types";

export class GenreService {
  private static movieGenresCache: Record<string, Genre[]> = {};
  private static tvGenresCache: Record<string, Genre[]> = {};

  public static async getMovieGenres(language: string = 'en-US'): Promise<Genre[]> {
    if (this.movieGenresCache[language]) {
      return this.movieGenresCache[language];
    }
    try {
      const data = await TMDBService.fetchEndpoint<{ genres: Genre[] }>("genre/movie/list", { language });
      this.movieGenresCache[language] = data.genres || [];
      return data.genres || [];
    } catch {
      return [];
    }
  }

  public static async getTvGenres(language: string = 'en-US'): Promise<Genre[]> {
    if (this.tvGenresCache[language]) {
      return this.tvGenresCache[language];
    }
    try {
      const data = await TMDBService.fetchEndpoint<{ genres: Genre[] }>("genre/tv/list", { language });
      this.tvGenresCache[language] = data.genres || [];
      return data.genres || [];
    } catch {
      return [];
    }
  }
}
