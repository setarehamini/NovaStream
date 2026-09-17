import fs from 'fs';
import path from 'path';
import pg from 'pg';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface WatchlistRecord {
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

export interface FavoriteRecord {
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

export interface HistoryRecord {
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

export type WatchLaterRecord = WatchlistRecord;

interface LocalDatabaseSchema {
  users: UserRecord[];
  watchlist: WatchlistRecord[];
  watchLater: WatchlistRecord[];
  favorites: FavoriteRecord[];
  history: HistoryRecord[];
}

let pgPool: pg.Pool | null = null;
let isPgActive = false;

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'novastream_db.json');

function readLocalDb(): LocalDatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: LocalDatabaseSchema = {
        users: [],
        watchlist: [],
        watchLater: [],
        favorites: [],
        history: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      users: parsed.users || [],
      watchlist: parsed.watchlist || [],
      watchLater: parsed.watchLater || [],
      favorites: parsed.favorites || [],
      history: parsed.history || [],
    };
  } catch (error) {
    console.error('Error reading local DB, using memory fallback:', error);
    return { users: [], watchlist: [], watchLater: [], favorites: [], history: [] };
  }
}

function writeLocalDb(data: LocalDatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error('Error writing local DB:', error);
  }
}

export async function initDatabase(): Promise<void> {
  let dbUrl = process.env.DATABASE_URL?.trim();
  if (dbUrl && dbUrl !== 'undefined' && dbUrl !== 'null') {
    // Check if running inside a Docker container
    const isInsideDocker = fs.existsSync('/.dockerenv') || process.env.IS_DOCKER === 'true';
    if (isInsideDocker && (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1'))) {
      console.log(`[Database] Detected Docker environment with 'localhost' in DATABASE_URL. Automatically routing to Docker service 'db'...`);
      dbUrl = dbUrl.replace('@localhost:', '@db:').replace('@127.0.0.1:', '@db:');
    }

    const isLocalOrInternal =
      dbUrl.includes('localhost') ||
      dbUrl.includes('127.0.0.1') ||
      dbUrl.includes('@db:') ||
      dbUrl.includes('@postgres:');

    // Attempt connection with retries (useful in Docker Compose while Postgres initializes)
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting PostgreSQL connection (attempt ${attempt}/${maxRetries}) to ${dbUrl.replace(/:[^:@]+@/, ':****@')}...`);
        const pool = new pg.Pool({
          connectionString: dbUrl,
          connectionTimeoutMillis: 4000,
          ssl: isLocalOrInternal ? false : (dbUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false),
        });

        // Attach error handler so uncaught pool errors do not terminate process
        pool.on('error', (err) => {
          console.warn('PostgreSQL pool background error, switching to local file store:', err.message);
          isPgActive = false;
        });

        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            avatar VARCHAR(500),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS watchlist (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            media_id INT NOT NULL,
            media_type VARCHAR(20) NOT NULL,
            title VARCHAR(255),
            name VARCHAR(255),
            poster_path VARCHAR(255),
            backdrop_path VARCHAR(255),
            vote_average NUMERIC,
            release_date VARCHAR(50),
            first_air_date VARCHAR(50),
            overview TEXT,
            added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, media_id, media_type)
          );

          CREATE TABLE IF NOT EXISTS favorites (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            media_id INT NOT NULL,
            media_type VARCHAR(20) NOT NULL,
            title VARCHAR(255),
            name VARCHAR(255),
            poster_path VARCHAR(255),
            backdrop_path VARCHAR(255),
            vote_average NUMERIC,
            release_date VARCHAR(50),
            first_air_date VARCHAR(50),
            overview TEXT,
            added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, media_id, media_type)
          );

          CREATE TABLE IF NOT EXISTS watch_later (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            media_id INT NOT NULL,
            media_type VARCHAR(20) NOT NULL,
            title VARCHAR(255),
            name VARCHAR(255),
            poster_path VARCHAR(255),
            backdrop_path VARCHAR(255),
            vote_average NUMERIC,
            release_date VARCHAR(50),
            first_air_date VARCHAR(50),
            overview TEXT,
            added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, media_id, media_type)
          );

          CREATE TABLE IF NOT EXISTS watch_history (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL,
            media_id INT NOT NULL,
            media_type VARCHAR(20) NOT NULL,
            title VARCHAR(255),
            name VARCHAR(255),
            poster_path VARCHAR(255),
            season INT,
            episode INT,
            episode_title VARCHAR(255),
            progress_percent INT DEFAULT 0,
            watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        pgPool = pool;
        isPgActive = true;
        console.log('PostgreSQL database connected and tables initialized successfully');
        return;
      } catch (err: any) {
        console.warn(`PostgreSQL attempt ${attempt} failed: ${err?.message || err}`);
        if (attempt < maxRetries) {
          // Wait 1.5 seconds before retrying
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }
    console.warn('All PostgreSQL connection attempts failed. Falling back to zero-config persistent local file database.');
    isPgActive = false;
  }

  // Fallback to local persistent JSON file
  readLocalDb();
  console.log(`NovaStream persistent storage initialized at ${DB_FILE}`);
}

export const db = {
  isPostgres: () => isPgActive,

  // Users
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const normalized = email.trim().toLowerCase();
    if (isPgActive && pgPool) {
      const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalized]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        name: row.name,
        avatar: row.avatar,
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      };
    }
    const local = readLocalDb();
    return local.users.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  async findUserById(id: string): Promise<UserRecord | null> {
    if (isPgActive && pgPool) {
      const res = await pgPool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        name: row.name,
        avatar: row.avatar,
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      };
    }
    const local = readLocalDb();
    return local.users.find((u) => u.id === id) || null;
  },

  async createUser(user: UserRecord): Promise<UserRecord> {
    if (isPgActive && pgPool) {
      await pgPool.query(
        'INSERT INTO users (id, email, password_hash, name, avatar, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [user.id, user.email.toLowerCase(), user.passwordHash, user.name, user.avatar || null, user.createdAt]
      );
      return user;
    }
    const local = readLocalDb();
    local.users.push(user);
    writeLocalDb(local);
    return user;
  },

  // Watchlist
  async getWatchlist(userId: string): Promise<WatchlistRecord[]> {
    if (isPgActive && pgPool) {
      const res = await pgPool.query(
        'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC',
        [userId]
      );
      return res.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        mediaId: row.media_id,
        mediaType: row.media_type,
        title: row.title,
        name: row.name,
        posterPath: row.poster_path,
        backdropPath: row.backdrop_path,
        voteAverage: row.vote_average ? Number(row.vote_average) : undefined,
        releaseDate: row.release_date,
        firstAirDate: row.first_air_date,
        overview: row.overview,
        addedAt: row.added_at?.toISOString() || new Date().toISOString(),
      }));
    }
    const local = readLocalDb();
    return local.watchlist
      .filter((w) => w.userId === userId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  },

  async addToWatchlist(item: WatchlistRecord): Promise<WatchlistRecord> {
    if (isPgActive && pgPool) {
      await pgPool.query(
        `INSERT INTO watchlist (id, user_id, media_id, media_type, title, name, poster_path, backdrop_path, vote_average, release_date, first_air_date, overview, added_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (user_id, media_id, media_type) DO UPDATE SET added_at = EXCLUDED.added_at`,
        [
          item.id,
          item.userId,
          item.mediaId,
          item.mediaType,
          item.title || null,
          item.name || null,
          item.posterPath || null,
          item.backdropPath || null,
          item.voteAverage || null,
          item.releaseDate || null,
          item.firstAirDate || null,
          item.overview || null,
          item.addedAt,
        ]
      );
      return item;
    }
    const local = readLocalDb();
    const existingIdx = local.watchlist.findIndex(
      (w) => w.userId === item.userId && w.mediaId === item.mediaId && w.mediaType === item.mediaType
    );
    if (existingIdx >= 0) {
      local.watchlist[existingIdx] = item;
    } else {
      local.watchlist.push(item);
    }
    writeLocalDb(local);
    return item;
  },

  async removeFromWatchlist(userId: string, mediaType: string, mediaId: number): Promise<boolean> {
    if (isPgActive && pgPool) {
      const res = await pgPool.query(
        'DELETE FROM watchlist WHERE user_id = $1 AND media_type = $2 AND media_id = $3',
        [userId, mediaType, mediaId]
      );
      return (res.rowCount ?? 0) > 0;
    }
    const local = readLocalDb();
    const prevLen = local.watchlist.length;
    local.watchlist = local.watchlist.filter(
      (w) => !(w.userId === userId && w.mediaType === mediaType && w.mediaId === mediaId)
    );
    if (local.watchlist.length !== prevLen) {
      writeLocalDb(local);
      return true;
    }
    return false;
  },

  // Favorites
  async getFavorites(userId: string): Promise<FavoriteRecord[]> {
    if (isPgActive && pgPool) {
      const res = await pgPool.query(
        'SELECT * FROM favorites WHERE user_id = $1 ORDER BY added_at DESC',
        [userId]
      );
      return res.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        mediaId: row.media_id,
        mediaType: row.media_type,
        title: row.title,
        name: row.name,
        posterPath: row.poster_path,
        backdropPath: row.backdrop_path,
        voteAverage: row.vote_average ? Number(row.vote_average) : undefined,
        releaseDate: row.release_date,
        firstAirDate: row.first_air_date,
        overview: row.overview,
        addedAt: row.added_at?.toISOString() || new Date().toISOString(),
      }));
    }
    const local = readLocalDb();
    return local.favorites
      .filter((f) => f.userId === userId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  },

  async addToFavorites(item: FavoriteRecord): Promise<FavoriteRecord> {
    if (isPgActive && pgPool) {
      await pgPool.query(
        `INSERT INTO favorites (id, user_id, media_id, media_type, title, name, poster_path, backdrop_path, vote_average, release_date, first_air_date, overview, added_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (user_id, media_id, media_type) DO UPDATE SET added_at = EXCLUDED.added_at`,
        [
          item.id,
          item.userId,
          item.mediaId,
          item.mediaType,
          item.title || null,
          item.name || null,
          item.posterPath || null,
          item.backdropPath || null,
          item.voteAverage || null,
          item.releaseDate || null,
          item.firstAirDate || null,
          item.overview || null,
          item.addedAt,
        ]
      );
      return item;
    }
    const local = readLocalDb();
    const existingIdx = local.favorites.findIndex(
      (f) => f.userId === item.userId && f.mediaId === item.mediaId && f.mediaType === item.mediaType
    );
    if (existingIdx >= 0) {
      local.favorites[existingIdx] = item;
    } else {
      local.favorites.push(item);
    }
    writeLocalDb(local);
    return item;
  },

  async removeFromFavorites(userId: string, mediaType: string, mediaId: number): Promise<boolean> {
    if (isPgActive && pgPool) {
      const res = await pgPool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND media_type = $2 AND media_id = $3',
        [userId, mediaType, mediaId]
      );
      return (res.rowCount ?? 0) > 0;
    }
    const local = readLocalDb();
    const prevLen = local.favorites.length;
    local.favorites = local.favorites.filter(
      (f) => !(f.userId === userId && f.mediaType === mediaType && f.mediaId === mediaId)
    );
    if (local.favorites.length !== prevLen) {
      writeLocalDb(local);
      return true;
    }
    return false;
  },

  // Watch Later
  async getWatchLater(userId: string): Promise<WatchLaterRecord[]> {
    if (isPgActive && pgPool) {
      const res = await pgPool.query(
        'SELECT * FROM watch_later WHERE user_id = $1 ORDER BY added_at DESC',
        [userId]
      );
      return res.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        mediaId: row.media_id,
        mediaType: row.media_type,
        title: row.title,
        name: row.name,
        posterPath: row.poster_path,
        backdropPath: row.backdrop_path,
        voteAverage: row.vote_average ? Number(row.vote_average) : undefined,
        releaseDate: row.release_date,
        firstAirDate: row.first_air_date,
        overview: row.overview,
        addedAt: row.added_at?.toISOString() || new Date().toISOString(),
      }));
    }
    const local = readLocalDb();
    return (local.watchLater || [])
      .filter((w) => w.userId === userId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  },

  async addToWatchLater(item: WatchLaterRecord): Promise<WatchLaterRecord> {
    if (isPgActive && pgPool) {
      await pgPool.query(
        `INSERT INTO watch_later (id, user_id, media_id, media_type, title, name, poster_path, backdrop_path, vote_average, release_date, first_air_date, overview, added_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (user_id, media_id, media_type) DO UPDATE SET added_at = EXCLUDED.added_at`,
        [
          item.id,
          item.userId,
          item.mediaId,
          item.mediaType,
          item.title || null,
          item.name || null,
          item.posterPath || null,
          item.backdropPath || null,
          item.voteAverage || null,
          item.releaseDate || null,
          item.firstAirDate || null,
          item.overview || null,
          item.addedAt,
        ]
      );
      return item;
    }
    const local = readLocalDb();
    if (!local.watchLater) local.watchLater = [];
    const existingIdx = local.watchLater.findIndex(
      (w) => w.userId === item.userId && w.mediaId === item.mediaId && w.mediaType === item.mediaType
    );
    if (existingIdx >= 0) {
      local.watchLater[existingIdx] = item;
    } else {
      local.watchLater.push(item);
    }
    writeLocalDb(local);
    return item;
  },

  async removeFromWatchLater(userId: string, mediaType: string, mediaId: number): Promise<boolean> {
    if (isPgActive && pgPool) {
      const res = await pgPool.query(
        'DELETE FROM watch_later WHERE user_id = $1 AND media_type = $2 AND media_id = $3',
        [userId, mediaType, mediaId]
      );
      return (res.rowCount ?? 0) > 0;
    }
    const local = readLocalDb();
    if (!local.watchLater) local.watchLater = [];
    const prevLen = local.watchLater.length;
    local.watchLater = local.watchLater.filter(
      (w) => !(w.userId === userId && w.mediaType === mediaType && w.mediaId === mediaId)
    );
    if (local.watchLater.length !== prevLen) {
      writeLocalDb(local);
      return true;
    }
    return false;
  },

  // Watch History
  async getHistory(userId: string): Promise<HistoryRecord[]> {
    if (isPgActive && pgPool) {
      const res = await pgPool.query(
        'SELECT * FROM watch_history WHERE user_id = $1 ORDER BY watched_at DESC LIMIT 50',
        [userId]
      );
      return res.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        mediaId: row.media_id,
        mediaType: row.media_type,
        title: row.title,
        name: row.name,
        posterPath: row.poster_path,
        season: row.season,
        episode: row.episode,
        episodeTitle: row.episode_title,
        progressPercent: row.progress_percent,
        watchedAt: row.watched_at?.toISOString() || new Date().toISOString(),
      }));
    }
    const local = readLocalDb();
    return local.history
      .filter((h) => h.userId === userId)
      .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
      .slice(0, 50);
  },

  async addToHistory(item: HistoryRecord): Promise<HistoryRecord> {
    if (isPgActive && pgPool) {
      // Remove any prior history for exact same media/episode to keep list fresh
      await pgPool.query(
        'DELETE FROM watch_history WHERE user_id = $1 AND media_id = $2 AND media_type = $3 AND (season = $4 OR ($4 IS NULL AND season IS NULL)) AND (episode = $5 OR ($5 IS NULL AND episode IS NULL))',
        [item.userId, item.mediaId, item.mediaType, item.season || null, item.episode || null]
      );
      await pgPool.query(
        `INSERT INTO watch_history (id, user_id, media_id, media_type, title, name, poster_path, season, episode, episode_title, progress_percent, watched_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          item.id,
          item.userId,
          item.mediaId,
          item.mediaType,
          item.title || null,
          item.name || null,
          item.posterPath || null,
          item.season || null,
          item.episode || null,
          item.episodeTitle || null,
          item.progressPercent || 0,
          item.watchedAt,
        ]
      );
      return item;
    }
    const local = readLocalDb();
    local.history = local.history.filter(
      (h) => !(h.userId === item.userId && h.mediaId === item.mediaId && h.mediaType === item.mediaType && h.season === item.season && h.episode === item.episode)
    );
    local.history.unshift(item);
    if (local.history.length > 200) {
      local.history = local.history.slice(0, 200);
    }
    writeLocalDb(local);
    return item;
  },

  async clearHistory(userId: string): Promise<boolean> {
    if (isPgActive && pgPool) {
      await pgPool.query('DELETE FROM watch_history WHERE user_id = $1', [userId]);
      return true;
    }
    const local = readLocalDb();
    local.history = local.history.filter((h) => h.userId !== userId);
    writeLocalDb(local);
    return true;
  },
};
