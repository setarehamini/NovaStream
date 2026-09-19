import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, UserRecord } from './db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'novastream_jwt_secure_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.substring(7).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: true, message: 'Session expired or invalid. Please sign in again.' });
  }
}

// Optional Auth (populates req.user if token is valid, but does not block)
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
      req.user = decoded;
    } catch {
      // Ignore invalid token in optional auth
    }
  }
  next();
}

function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: true, message: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: true, message: 'Password must be at least 6 characters long.' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: true, message: 'An account with this email already exists. Please log in.' });
    }

    const displayName = (name && typeof name === 'string' && name.trim()) 
      ? name.trim() 
      : email.split('@')[0];

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `u_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newUser: UserRecord = {
      id: userId,
      email: email.trim().toLowerCase(),
      passwordHash,
      name: displayName,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(displayName)}`,
      createdAt: new Date().toISOString(),
    };

    await db.createUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: true, message: error?.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email and password are required.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: true, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: true, message: error?.message || 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await db.findUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: true, message: 'User account not found' });
    }
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: error?.message || 'Failed to fetch user profile' });
  }
});

// PUT & POST /api/auth/profile (Update Name & Avatar)
const handleUpdateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user!.id;

    const updates: { name?: string; avatar?: string } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: true, message: 'Display name cannot be empty.' });
      }
      updates.name = name.trim();
    }

    if (avatar !== undefined) {
      if (typeof avatar !== 'string') {
        return res.status(400).json({ error: true, message: 'Invalid avatar format.' });
      }
      updates.avatar = avatar;
    }

    const updatedUser = await db.updateUserProfile(userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: true, message: 'User account not found.' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser),
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: true, message: error?.message || 'Failed to update profile' });
  }
};

router.put('/profile', requireAuth, handleUpdateProfile);
router.post('/profile', requireAuth, handleUpdateProfile);

// PUT & POST /api/auth/change-password
const handleChangePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ error: true, message: 'Current password is required.' });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: true, message: 'New password must be at least 6 characters long.' });
    }

    const user = await db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: 'User account not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: true, message: 'The current password you entered is incorrect.' });
    }

    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      return res.status(400).json({ error: true, message: 'New password cannot be the same as your current password.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const updated = await db.updateUserPassword(userId, newHash);

    if (!updated) {
      return res.status(500).json({ error: true, message: 'Failed to update password.' });
    }

    return res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: true, message: error?.message || 'Failed to change password' });
  }
};

router.put('/change-password', requireAuth, handleChangePassword);
router.post('/change-password', requireAuth, handleChangePassword);
router.put('/password', requireAuth, handleChangePassword);
router.post('/password', requireAuth, handleChangePassword);

// WATCHLIST ENDPOINTS
router.get('/watchlist', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await db.getWatchlist(req.user!.id);
    return res.json({ success: true, items });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to fetch watchlist' });
  }
});

router.post('/watchlist', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mediaId, mediaType, title, name, posterPath, backdropPath, voteAverage, releaseDate, firstAirDate, overview } = req.body;
    if (!mediaId || !mediaType) {
      return res.status(400).json({ error: true, message: 'mediaId and mediaType are required' });
    }

    const record = await db.addToWatchlist({
      id: `w_${req.user!.id}_${mediaType}_${mediaId}`,
      userId: req.user!.id,
      mediaId: Number(mediaId),
      mediaType,
      title,
      name,
      posterPath,
      backdropPath,
      voteAverage: voteAverage ? Number(voteAverage) : undefined,
      releaseDate,
      firstAirDate,
      overview,
      addedAt: new Date().toISOString(),
    });

    return res.json({ success: true, item: record });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to save to watchlist' });
  }
});

router.delete('/watchlist/:mediaType/:mediaId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mediaType, mediaId } = req.params;
    await db.removeFromWatchlist(req.user!.id, mediaType, Number(mediaId));
    return res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to remove from watchlist' });
  }
});

// FAVORITES ENDPOINTS
router.get('/favorites', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await db.getFavorites(req.user!.id);
    return res.json({ success: true, items });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to fetch favorites' });
  }
});

router.post('/favorites', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mediaId, mediaType, title, name, posterPath, backdropPath, voteAverage, releaseDate, firstAirDate, overview } = req.body;
    if (!mediaId || !mediaType) {
      return res.status(400).json({ error: true, message: 'mediaId and mediaType are required' });
    }

    const record = await db.addToFavorites({
      id: `f_${req.user!.id}_${mediaType}_${mediaId}`,
      userId: req.user!.id,
      mediaId: Number(mediaId),
      mediaType,
      title,
      name,
      posterPath,
      backdropPath,
      voteAverage: voteAverage ? Number(voteAverage) : undefined,
      releaseDate,
      firstAirDate,
      overview,
      addedAt: new Date().toISOString(),
    });

    return res.json({ success: true, item: record });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to save to favorites' });
  }
});

router.delete('/favorites/:mediaType/:mediaId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mediaType, mediaId } = req.params;
    await db.removeFromFavorites(req.user!.id, mediaType, Number(mediaId));
    return res.json({ success: true, message: 'Removed from favorites' });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to remove from favorites' });
  }
});

// WATCH LATER ENDPOINTS
const handleGetWatchLater = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await db.getWatchLater(req.user!.id);
    return res.json({ success: true, items });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to fetch watch later list' });
  }
};

const handlePostWatchLater = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mediaId, mediaType, title, name, posterPath, backdropPath, voteAverage, releaseDate, firstAirDate, overview } = req.body;
    if (!mediaId || !mediaType) {
      return res.status(400).json({ error: true, message: 'mediaId and mediaType are required' });
    }

    const record = await db.addToWatchLater({
      id: `wl_${req.user!.id}_${mediaType}_${mediaId}`,
      userId: req.user!.id,
      mediaId: Number(mediaId),
      mediaType,
      title,
      name,
      posterPath,
      backdropPath,
      voteAverage: voteAverage ? Number(voteAverage) : undefined,
      releaseDate,
      firstAirDate,
      overview,
      addedAt: new Date().toISOString(),
    });

    return res.json({ success: true, item: record });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to save to watch later' });
  }
};

const handleDeleteWatchLater = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mediaType, mediaId } = req.params;
    await db.removeFromWatchLater(req.user!.id, mediaType, Number(mediaId));
    return res.json({ success: true, message: 'Removed from watch later' });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to remove from watch later' });
  }
};

router.get('/watchlater', requireAuth, handleGetWatchLater);
router.get('/watch-later', requireAuth, handleGetWatchLater);
router.post('/watchlater', requireAuth, handlePostWatchLater);
router.post('/watch-later', requireAuth, handlePostWatchLater);
router.delete('/watchlater/:mediaType/:mediaId', requireAuth, handleDeleteWatchLater);
router.delete('/watch-later/:mediaType/:mediaId', requireAuth, handleDeleteWatchLater);

// WATCH HISTORY ENDPOINTS
router.get('/history', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await db.getHistory(req.user!.id);
    return res.json({ success: true, items });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to fetch watch history' });
  }
});

router.post('/history', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mediaId, mediaType, title, name, posterPath, season, episode, episodeTitle, progressPercent } = req.body;
    if (!mediaId || !mediaType) {
      return res.status(400).json({ error: true, message: 'mediaId and mediaType are required' });
    }

    const record = await db.addToHistory({
      id: `h_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: req.user!.id,
      mediaId: Number(mediaId),
      mediaType,
      title,
      name,
      posterPath,
      season: season ? Number(season) : undefined,
      episode: episode ? Number(episode) : undefined,
      episodeTitle,
      progressPercent: progressPercent ? Number(progressPercent) : 100,
      watchedAt: new Date().toISOString(),
    });

    return res.json({ success: true, item: record });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to log watch history' });
  }
});

router.delete('/history', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.clearHistory(req.user!.id);
    return res.json({ success: true, message: 'Watch history cleared' });
  } catch (error: any) {
    return res.status(500).json({ error: true, message: 'Failed to clear history' });
  }
});

export default router;
