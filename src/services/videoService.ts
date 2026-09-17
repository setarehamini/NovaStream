import { TMDBService } from "./tmdb";
import { VideoItem } from "../types";

export type StreamServer = 'vidcore' | 'vidsrc_icu' | 'vidsrc_cc' | 'embed_su';

export class VideoService {
  /**
   * Generates dynamic streaming embed URL for movies
   */
  public static getMovieEmbedUrl(tmdbId: number, server: StreamServer = 'vidcore'): string {
    switch (server) {
      case 'vidcore':
        return `https://www.vidcore.org/embed/movie/${tmdbId}`;
      case 'vidsrc_icu':
        return `https://vidsrc.icu/embed/movie/${tmdbId}`;
      case 'vidsrc_cc':
        return `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
      case 'embed_su':
        return `https://embed.su/embed/movie/${tmdbId}`;
      default:
        return `https://www.vidcore.org/embed/movie/${tmdbId}`;
    }
  }

  /**
   * Generates dynamic streaming embed URL for TV series episodes
   */
  public static getTvEmbedUrl(tmdbId: number, season: number, episode: number, server: StreamServer = 'vidcore'): string {
    switch (server) {
      case 'vidcore':
        return `https://www.vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`;
      case 'vidsrc_icu':
        return `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`;
      case 'vidsrc_cc':
        return `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`;
      case 'embed_su':
        return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
      default:
        return `https://www.vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`;
    }
  }

  /**
   * Fetch official trailers & videos for a movie
   */
  public static async getMovieVideos(movieId: number, language: string = 'en-US'): Promise<VideoItem[]> {
    try {
      const data = await TMDBService.fetchEndpoint<{ results: VideoItem[] }>(`movie/${movieId}/videos`, { language });
      return data.results || [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch official trailers & videos for a TV series
   */
  public static async getTvVideos(tvId: number, language: string = 'en-US'): Promise<VideoItem[]> {
    try {
      const data = await TMDBService.fetchEndpoint<{ results: VideoItem[] }>(`tv/${tvId}/videos`, { language });
      return data.results || [];
    } catch {
      return [];
    }
  }

  /**
   * Find the most relevant YouTube trailer
   */
  public static findBestTrailer(videos: VideoItem[]): VideoItem | null {
    if (!videos || videos.length === 0) return null;
    
    // First priority: Official YouTube Trailer
    const officialTrailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official);
    if (officialTrailer) return officialTrailer;

    // Second priority: Any YouTube Trailer
    const anyTrailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
    if (anyTrailer) return anyTrailer;

    // Third priority: Any YouTube Teaser
    const teaser = videos.find(v => v.site === 'YouTube' && v.type === 'Teaser');
    if (teaser) return teaser;

    // Fallback: Any YouTube video
    return videos.find(v => v.site === 'YouTube') || null;
  }
}
