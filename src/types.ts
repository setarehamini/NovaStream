export type MediaType = 'movie' | 'tv' | 'person';

export interface Genre {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string; // for TV shows
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type?: MediaType;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: Genre[];
  original_language?: string;
  adult?: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  original_name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string | null;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  runtime?: number;
}

export interface SeasonDetails extends Season {
  episodes: Episode[];
}

export interface MovieDetails extends MediaItem {
  tagline: string | null;
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  genres: Genre[];
  credits?: Credits;
  videos?: { results: VideoItem[] };
  similar?: { results: MediaItem[] };
  recommendations?: { results: MediaItem[] };
}

export interface TVDetails extends MediaItem {
  tagline: string | null;
  episode_run_time: number[];
  number_of_episodes: number;
  number_of_seasons: number;
  status: string;
  genres: Genre[];
  seasons: Season[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  credits?: Credits;
  videos?: { results: VideoItem[] };
  similar?: { results: MediaItem[] };
  recommendations?: { results: MediaItem[] };
}

export interface ActorCombinedCreditItem extends MediaItem {
  character?: string;
  job?: string;
  department?: string;
}

export interface ActorDetails {
  id: number;
  name: string;
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  combined_credits?: {
    cast: ActorCombinedCreditItem[];
    crew: ActorCombinedCreditItem[];
  };
}

export interface PaginatedResult<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface FilterOptions {
  page?: number;
  searchQuery?: string;
  genreId?: number | string;
  genres?: number[] | string[];
  year?: number | string;
  yearFrom?: number | string;
  yearTo?: number | string;
  minRating?: number | string;
  maxRating?: number | string;
  minVotes?: number | string;
  originalLanguage?: string;
  certification?: string;
  sortBy?: string;
  language?: string;
  country?: string;
}

export type Language = 'en' | 'fa';
export type Theme = 'dark' | 'light';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface UserWatchlistItem {
  id: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title?: string;
  name?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  releaseDate?: string;
  firstAirDate?: string;
  overview?: string;
  addedAt: string;
}

export interface UserHistoryItem {
  id: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title?: string;
  name?: string;
  posterPath?: string | null;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  progressPercent?: number;
  watchedAt: string;
}

export interface RouteState {
  view: 'home' | 'movies' | 'series' | 'movie-detail' | 'series-detail' | 'actor-detail' | 'watch-movie' | 'watch-tv' | 'search' | 'watchlist' | 'history' | 'account';
  id?: number;
  season?: number;
  episode?: number;
  query?: string;
  tab?: 'watchlist' | 'watchlater' | 'favorites' | 'history' | 'profile';
}
