/**
 * Base TMDBService to interface with the secure backend proxy
 */
export class TMDBService {
  private static BASE_PROXY_URL = "/api/tmdb";

  public static async fetchEndpoint<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${this.BASE_PROXY_URL}/${endpoint.replace(/^\//, "")}`, window.location.origin);
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch ${endpoint} (Status: ${response.status})`);
    }

    return response.json();
  }

  public static getImageUrl(path: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string {
    if (!path) {
      return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";
    }
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  public static getBackdropUrl(path: string | null | undefined, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w780'): string {
    if (!path) {
      return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1280&q=80";
    }
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  public static getProfileUrl(path: string | null | undefined): string {
    if (!path) {
      return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
    }
    return `https://image.tmdb.org/t/p/w342${path}`;
  }
}
