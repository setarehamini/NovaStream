import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserWatchlistItem, UserHistoryItem } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  watchlist: UserWatchlistItem[];
  favorites: UserWatchlistItem[];
  history: UserHistoryItem[];
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addToWatchlist: (item: {
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
  }) => Promise<boolean>;
  removeFromWatchlist: (mediaType: 'movie' | 'tv', mediaId: number) => Promise<boolean>;
  isInWatchlist: (mediaType: string, mediaId: number) => boolean;
  addToFavorites: (item: {
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
  }) => Promise<boolean>;
  removeFromFavorites: (mediaType: 'movie' | 'tv', mediaId: number) => Promise<boolean>;
  isFavorite: (mediaType: string, mediaId: number) => boolean;
  logWatchHistory: (item: {
    mediaId: number;
    mediaType: 'movie' | 'tv';
    title?: string;
    name?: string;
    posterPath?: string | null;
    season?: number;
    episode?: number;
    episodeTitle?: string;
    progressPercent?: number;
  }) => Promise<void>;
  clearHistory: () => Promise<void>;
  // Auth Modal Controls
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authPromptMessage: string | null;
  openAuthModal: (mode?: 'login' | 'register', prompt?: string, onAuthSuccess?: () => void) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'novastream_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [watchlist, setWatchlist] = useState<UserWatchlistItem[]>([]);
  const [favorites, setFavorites] = useState<UserWatchlistItem[]>([]);
  const [history, setHistory] = useState<UserHistoryItem[]>([]);

  // Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);
  const [authCallback, setAuthCallback] = useState<(() => void) | null>(null);

  // Load user data (Watchlist, Favorites, History)
  const refreshUserData = useCallback(async (authToken: string) => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const [wlRes, favRes, histRes] = await Promise.all([
        fetch('/api/user/watchlist', { headers }),
        fetch('/api/user/favorites', { headers }),
        fetch('/api/user/history', { headers }),
      ]);

      if (wlRes.ok) {
        const data = await wlRes.json();
        if (data.items) setWatchlist(data.items);
      }
      if (favRes.ok) {
        const data = await favRes.json();
        if (data.items) setFavorites(data.items);
      }
      if (histRes.ok) {
        const data = await histRes.json();
        if (data.items) setHistory(data.items);
      }
    } catch (err) {
      console.error('Failed to sync user collections:', err);
    }
  }, []);

  // Check existing session on mount
  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          await refreshUserData(token);
        } else {
          // Token expired or invalid
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session verify failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    verifySession();
  }, [token, refreshUserData]);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login', prompt?: string, onAuthSuccess?: () => void) => {
    setAuthModalMode(mode);
    setAuthPromptMessage(prompt || null);
    setAuthCallback(() => onAuthSuccess || null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
    setAuthCallback(null);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { success: false, message: data.message || 'Login failed' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      await refreshUserData(data.token);

      if (authCallback) {
        authCallback();
      }
      closeAuthModal();
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Network error during login' };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      await refreshUserData(data.token);

      if (authCallback) {
        authCallback();
      }
      closeAuthModal();
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Network error during registration' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setWatchlist([]);
    setFavorites([]);
    setHistory([]);
  };

  const addToWatchlist = async (item: {
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
  }) => {
    if (!token) {
      openAuthModal('login', 'Sign in or create an account to save movies and shows to your Watchlist.');
      return false;
    }

    try {
      const res = await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlist((prev) => {
          const filtered = prev.filter(
            (w) => !(w.mediaId === item.mediaId && w.mediaType === item.mediaType)
          );
          return [data.item, ...filtered];
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Add to watchlist failed:', err);
      return false;
    }
  };

  const removeFromWatchlist = async (mediaType: 'movie' | 'tv', mediaId: number) => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/user/watchlist/${mediaType}/${mediaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWatchlist((prev) =>
          prev.filter((w) => !(w.mediaId === mediaId && w.mediaType === mediaType))
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Remove from watchlist failed:', err);
      return false;
    }
  };

  const isInWatchlist = (mediaType: string, mediaId: number): boolean => {
    return watchlist.some((w) => w.mediaId === mediaId && w.mediaType === mediaType);
  };

  const addToFavorites = async (item: {
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
  }) => {
    if (!token) {
      openAuthModal('login', 'Sign in to add favorites to your personal collection.');
      return false;
    }

    try {
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites((prev) => {
          const filtered = prev.filter(
            (f) => !(f.mediaId === item.mediaId && f.mediaType === item.mediaType)
          );
          return [data.item, ...filtered];
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Add to favorites failed:', err);
      return false;
    }
  };

  const removeFromFavorites = async (mediaType: 'movie' | 'tv', mediaId: number) => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/user/favorites/${mediaType}/${mediaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavorites((prev) =>
          prev.filter((f) => !(f.mediaId === mediaId && f.mediaType === mediaType))
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Remove from favorites failed:', err);
      return false;
    }
  };

  const isFavorite = (mediaType: string, mediaId: number): boolean => {
    return favorites.some((f) => f.mediaId === mediaId && f.mediaType === mediaType);
  };

  const logWatchHistory = async (item: {
    mediaId: number;
    mediaType: 'movie' | 'tv';
    title?: string;
    name?: string;
    posterPath?: string | null;
    season?: number;
    episode?: number;
    episodeTitle?: string;
    progressPercent?: number;
  }) => {
    if (!token) return;
    try {
      const res = await fetch('/api/user/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setHistory((prev) => {
          const filtered = prev.filter(
            (h) => !(h.mediaId === item.mediaId && h.mediaType === item.mediaType && h.season === item.season && h.episode === item.episode)
          );
          return [data.item, ...filtered];
        });
      }
    } catch (err) {
      console.error('Log watch history failed:', err);
    }
  };

  const clearHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/user/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error('Clear history failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        watchlist,
        favorites,
        history,
        login,
        register,
        logout,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        logWatchHistory,
        clearHistory,
        isAuthModalOpen,
        authModalMode,
        authPromptMessage,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
