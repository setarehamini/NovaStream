import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Bookmark,
  Clock,
  Heart,
  History,
  Trash2,
  Play,
  Film,
  Tv,
  Sparkles,
  LogIn,
  LogOut,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  CheckCircle,
  Search,
  ChevronRight,
  Upload,
  Camera,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RouteState, Language, Theme, UserWatchlistItem, UserHistoryItem } from '../types';
import { translations } from '../i18n/translations';
import { TMDBService } from '../services';

interface AccountViewProps {
  initialTab?: 'profile' | 'watchlist' | 'watchlater' | 'favorites' | 'history';
  onNavigate: (route: RouteState) => void;
  language: Language;
  onToggleLanguage?: () => void;
  theme: Theme;
  onToggleTheme?: () => void;
}

interface PresetAvatar {
  id: string;
  name: string;
  url: string;
}

const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'director',
    name: 'Film Director',
    url: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g_dir%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23e11d48%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%239f1239%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2226%22%20fill%3D%22url(%23g_dir)%22%2F%3E%3Cpath%20d%3D%22M22%2032h38v36H22z%22%20rx%3D%226%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%226%22%2F%3E%3Cpath%20d%3D%22M60%2042l18-12v40l-18-12z%22%20fill%3D%22white%22%2F%3E%3Ccircle%20cx%3D%2241%22%20cy%3D%2250%22%20r%3D%228%22%20fill%3D%22white%22%20fill-opacity%3D%220.8%22%2F%3E%3C%2Fsvg%3E',
  },
  {
    id: 'star',
    name: 'Golden Star',
    url: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g_star%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23f59e0b%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23b45309%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2226%22%20fill%3D%22url(%23g_star)%22%2F%3E%3Cpath%20d%3D%22M50%2018l8.8%2017.8%2019.6%202.9-14.2%2013.8%203.4%2019.5L50%2062.8%2032.4%2072l3.4-19.5-14.2-13.8%2019.6-2.9z%22%20fill%3D%22white%22%2F%3E%3C%2Fsvg%3E',
  },
  {
    id: 'cyber',
    name: 'Cyberpunk',
    url: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g_cy%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%238b5cf6%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%2306b6d4%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2226%22%20fill%3D%22url(%23g_cy)%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2246%22%20r%3D%2224%22%20fill%3D%22white%22%20fill-opacity%3D%220.9%22%2F%3E%3Crect%20x%3D%2232%22%20y%3D%2238%22%20width%3D%2236%22%20height%3D%2214%22%20rx%3D%227%22%20fill%3D%22%231e1b4b%22%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2245%22%20r%3D%223%22%20fill%3D%22%2306b6d4%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2245%22%20r%3D%223%22%20fill%3D%22%2306b6d4%22%2F%3E%3Cpath%20d%3D%22M26%2084c2-12%2012-20%2024-20s22%208%2024%2020%22%20stroke%3D%22white%22%20stroke-width%3D%226%22%20stroke-linecap%3D%22round%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Voyager',
    url: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g_cos%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%236366f1%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%234338ca%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2226%22%20fill%3D%22url(%23g_cos)%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2218%22%20fill%3D%22white%22%2F%3E%3Cellipse%20cx%3D%2250%22%20cy%3D%2250%22%20rx%3D%2232%22%20ry%3D%2211%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%20transform%3D%22rotate(-25%2050%2050)%22%2F%3E%3Ccircle%20cx%3D%2226%22%20cy%3D%2226%22%20r%3D%223%22%20fill%3D%22white%22%20fill-opacity%3D%220.8%22%2F%3E%3Ccircle%20cx%3D%2274%22%20cy%3D%2272%22%20r%3D%222%22%20fill%3D%22white%22%20fill-opacity%3D%220.8%22%2F%3E%3C%2Fsvg%3E',
  },
  {
    id: 'popcorn',
    name: 'Popcorn Pro',
    url: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g_pop%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23f97316%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23c2410c%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2226%22%20fill%3D%22url(%23g_pop)%22%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2232%22%20r%3D%228%22%20fill%3D%22white%22%2F%3E%3Ccircle%20cx%3D%2252%22%20cy%3D%2227%22%20r%3D%229%22%20fill%3D%22white%22%2F%3E%3Ccircle%20cx%3D%2263%22%20cy%3D%2232%22%20r%3D%228%22%20fill%3D%22white%22%2F%3E%3Cpath%20d%3D%22M32%2042h36l-5%2036H37z%22%20fill%3D%22white%22%2F%3E%3Cpath%20d%3D%22M43%2042l-2%2036m9-36l-1%2036m9-36l-1%2036%22%20stroke%3D%22%23ea580c%22%20stroke-width%3D%223%22%2F%3E%3C%2Fsvg%3E',
  },
  {
    id: 'hero',
    name: 'Action Hero',
    url: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g_he%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23f43f5e%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23881337%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2226%22%20fill%3D%22url(%23g_he)%22%2F%3E%3Cpath%20d%3D%22M50%2018l24%209v20c0%2016-10%2027-24%2032-14-5-24-16-24-32V27z%22%20fill%3D%22white%22%2F%3E%3Cpath%20d%3D%22M50%2034l4.5%209%2010%201.5-7.2%207%201.7%209.8L50%2056.8l-9%204.5%201.7-9.8-7.2-7%2010-1.5z%22%20fill%3D%22%23be123c%22%2F%3E%3C%2Fsvg%3E',
  },
  {
    id: 'emerald',
    name: 'Emerald Cinema',
    url: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g_em%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%2310b981%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23047857%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2226%22%20fill%3D%22url(%23g_em)%22%2F%3E%3Cpolygon%20points%3D%2250%2022%2078%2038%2078%2070%2050%2086%2022%2070%2022%2038%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%226%22%2F%3E%3Cpolygon%20points%3D%2244%2038%2064%2050%2044%2062%22%20fill%3D%22white%22%2F%3E%3C%2Fsvg%3E',
  },
  {
    id: 'noir',
    name: 'Midnight Noir',
    url: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g_no%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23334155%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230f172a%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2226%22%20fill%3D%22url(%23g_no)%22%2F%3E%3Crect%20x%3D%2222%22%20y%3D%2228%22%20width%3D%2256%22%20height%3D%2244%22%20rx%3D%228%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%2F%3E%3Cpath%20d%3D%22M22%2042h56M36%2028l-5%2014m19-14l-5%2014m19-14l-5%2014%22%20stroke%3D%22white%22%20stroke-width%3D%224%22%2F%3E%3C%2Fsvg%3E',
  },
];

export const AccountView: React.FC<AccountViewProps> = ({
  initialTab = 'profile',
  onNavigate,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) => {
  const {
    user,
    isAuthenticated,
    watchlist,
    watchLater,
    favorites,
    history,
    removeFromWatchlist,
    removeFromWatchLater,
    removeFromFavorites,
    clearHistory,
    updateProfile,
    changePassword,
    logout,
    openAuthModal,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'watchlist' | 'watchlater' | 'favorites' | 'history'>(initialTab);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Profile Edit & Avatar Upload State
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [heroAvatarError, setHeroAvatarError] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
      setAvatarPreview(user.avatar || null);
      setHeroAvatarError(false);
    }
  }, [user]);

  // Keep activeTab in sync with initialTab if it changes from outside navigation
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const processImageFile = (file: File) => {
    const isImageMime = file.type && file.type.startsWith('image/');
    const isImageExt = /\.(jpe?g|png|webp|gif|svg|bmp|avif)$/i.test(file.name);
    if (!isImageMime && !isImageExt) {
      setProfileMessage({
        type: 'error',
        text: language === 'fa' ? 'لطفاً یک فایل تصویری معتبر (JPG، PNG، WebP، SVG) انتخاب کنید.' : 'Please select a valid image file (JPG, PNG, WebP, SVG).',
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setProfileMessage({
        type: 'error',
        text: language === 'fa' ? 'حجم تصویر نباید بیشتر از ۸ مگابایت باشد.' : 'Image size cannot exceed 8MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setProfileMessage({
        type: 'error',
        text: language === 'fa' ? 'خطا در خواندن فایل تصویری.' : 'Failed to read image file. Please try another image.',
      });
    };

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;

      // 1. Immediately display preview so user gets instant visual confirmation!
      setAvatarPreview(rawDataUrl);
      setProfileMessage(null);

      // If SVG, preserve vector code directly
      if (file.type && file.type.includes('svg')) {
        return;
      }

      // Optimize raster avatar to a crisp 320x320 square
      try {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const targetSize = 320;
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Center crop to square
              const minDim = Math.min(img.width, img.height);
              const sx = (img.width - minDim) / 2;
              const sy = (img.height - minDim) / 2;
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);
              const compressed = canvas.toDataURL('image/jpeg', 0.88);
              if (compressed && compressed.length > 100) {
                setAvatarPreview(compressed);
              }
            }
          } catch (canvasErr) {
            console.warn('Canvas optimization fallback to raw:', canvasErr);
          }
        };
        img.src = rawDataUrl;
      } catch (err) {
        console.warn('Image optimization skipped:', err);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset value so choosing the exact same file again will still fire onChange
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      const finalName = displayName.trim() || user?.name || '';
      const finalAvatar = avatarPreview || '';

      const res = await updateProfile({
        name: finalName,
        avatar: finalAvatar,
      });

      if (res.success) {
        setProfileMessage({
          type: 'success',
          text: t.avatarSaved,
        });
        setTimeout(() => setProfileMessage(null), 4000);
      } else {
        setProfileMessage({
          type: 'error',
          text: res.message || 'Failed to update profile',
        });
      }
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err?.message || 'Error updating profile',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({
        type: 'error',
        text: language === 'fa' ? 'لطفاً رمز عبور فعلی خود را وارد کنید.' : 'Please enter your current password.',
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: t.passwordLengthError,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: t.passwordMismatch,
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordMessage({
          type: 'success',
          text: t.passwordChangedSuccess,
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(null), 5000);
      } else {
        setPasswordMessage({
          type: 'error',
          text: res.message || (language === 'fa' ? 'خطا در تغییر رمز عبور' : 'Failed to change password'),
        });
      }
    } catch (err: any) {
      setPasswordMessage({
        type: 'error',
        text: err?.message || 'Error changing password',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const t = translations[language];

  // If not authenticated, show welcoming sign-in screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-600/20">
          <UserIcon className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
          {t.myAccount}
        </h1>
        <p className={`text-base sm:text-lg max-w-lg mx-auto mb-8 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {language === 'fa'
            ? 'برای دسترسی به کتابخانه شخصی، لیست تماشا، علاقه‌مندی‌ها و تماشای بعدی، لطفاً وارد حساب خود شوید.'
            : 'Sign in to access your personal streaming library, Watchlist, Watch Later queue, favorites, and synchronized history.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-12">
          <button
            onClick={() => openAuthModal('login', 'Sign in to access your account and personal collections.')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{t.signIn}</span>
          </button>
          <button
            onClick={() => openAuthModal('register', 'Create an account to start saving movies and series to your library.')}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border font-bold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.signUp}</span>
          </button>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left rtl:text-right">
          <div className={`p-6 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-lg' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3.5">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">{t.watchlist}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'fa' ? 'عناوین دلخواه خود را ذخیره کنید تا هر زمان به آن‌ها دسترسی داشته باشید.' : 'Save movies & shows you plan to watch across any device.'}
            </p>
          </div>
          <div className={`p-6 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-lg' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3.5">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">{t.watchLater}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'fa' ? 'فیلم‌ها و قسمت‌های بعدی را برای پخش سریع نشانه‌گذاری کنید.' : 'Queue up your immediate next viewings for instant playback.'}
            </p>
          </div>
          <div className={`p-6 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-lg' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3.5">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">{t.history}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'fa' ? 'ادامه تماشای فیلم‌ها و قسمت‌های سریال از همان جایی که رها کردید.' : 'Resume playback and pick up right where you left off.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get items based on current collection tab
  const getRawItems = (): (UserWatchlistItem | UserHistoryItem)[] => {
    switch (activeTab) {
      case 'watchlist':
        return watchlist;
      case 'watchlater':
        return watchLater;
      case 'favorites':
        return favorites;
      case 'history':
        return history;
      default:
        return [];
    }
  };

  const rawItems = getRawItems();

  const filteredItems = rawItems.filter((item) => {
    if (filterType !== 'all' && item.mediaType !== filterType) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const title = (item.title || item.name || '').toLowerCase();
      return title.includes(q);
    }
    return true;
  });

  const memberSinceFormatted = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : language === 'fa' ? 'عضو فعال' : 'Active Member';

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen">
      {/* User Hero Header */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 mb-8 backdrop-blur-md ${
        theme === 'dark'
          ? 'bg-slate-900/70 border-slate-800 shadow-2xl'
          : 'bg-white/90 border-slate-200 shadow-lg'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              onClick={() => setActiveTab('profile')}
              className="relative group cursor-pointer shrink-0"
              title={t.changeAvatar}
            >
              {user?.avatar && !heroAvatarError ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User Avatar'}
                  onError={() => setHeroAvatarError(true)}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-xl border-2 border-indigo-500"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-xl shadow-indigo-600/30">
                  {userInitial}
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight">
                  {user?.name || 'Member'}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t.member}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {user?.email}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>{t.memberSince}: <strong className="text-slate-200 font-semibold">{memberSinceFormatted}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer border border-slate-700 hover:border-slate-600"
              title={t.signOut}
            >
              <LogOut className="w-4 h-4" />
              <span>{t.signOut}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`p-4 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-indigo-600/15 border-indigo-500 shadow-md'
                : theme === 'dark' ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/70' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">{t.watchlist}</span>
              <Bookmark className={`w-4 h-4 ${activeTab === 'watchlist' ? 'text-indigo-400' : 'text-slate-400'}`} />
            </div>
            <div className={`text-xl sm:text-2xl font-black ${activeTab === 'watchlist' ? 'text-indigo-400' : ''}`}>{watchlist.length}</div>
          </button>

          <button
            onClick={() => setActiveTab('watchlater')}
            className={`p-4 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer ${
              activeTab === 'watchlater'
                ? 'bg-indigo-600/15 border-indigo-500 shadow-md'
                : theme === 'dark' ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/70' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">{t.watchLater}</span>
              <Clock className={`w-4 h-4 ${activeTab === 'watchlater' ? 'text-indigo-400' : 'text-slate-400'}`} />
            </div>
            <div className={`text-xl sm:text-2xl font-black ${activeTab === 'watchlater' ? 'text-indigo-400' : ''}`}>{watchLater.length}</div>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`p-4 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-indigo-600/15 border-indigo-500 shadow-md'
                : theme === 'dark' ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/70' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">{t.favorites}</span>
              <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'text-indigo-400' : 'text-slate-400'}`} />
            </div>
            <div className={`text-xl sm:text-2xl font-black ${activeTab === 'favorites' ? 'text-indigo-400' : ''}`}>{favorites.length}</div>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`p-4 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-600/15 border-indigo-500 shadow-md'
                : theme === 'dark' ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/70' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">{t.history}</span>
              <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-indigo-400' : 'text-slate-400'}`} />
            </div>
            <div className={`text-xl sm:text-2xl font-black ${activeTab === 'history' ? 'text-indigo-400' : ''}`}>{history.length}</div>
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6 border-b border-slate-800 pb-4">
        <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto max-w-full ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200 shadow-xs'
        }`}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{t.profile}</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'watchlist'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{t.watchlist}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'watchlist' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {watchlist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('watchlater')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'watchlater'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.watchLater}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'watchlater' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {watchLater.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t.favorites}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {favorites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t.history}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {history.length}
            </span>
          </button>
        </div>

        {/* Collection Controls (Search & Clear history) */}
        {activeTab !== 'profile' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={language === 'fa' ? 'فیلتر در این لیست...' : 'Filter in list...'}
                className={`w-36 sm:w-48 pl-8 pr-3 rtl:pr-8 rtl:pl-3 py-1.5 text-xs rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 opacity-50" />
            </div>

            {activeTab === 'history' && history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(language === 'fa' ? 'آیا از پاک کردن کامل تاریخچه تماشا مطمئن هستید؟' : 'Are you sure you want to clear your entire watch history?')) {
                    clearHistory();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors border border-slate-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.clearHistory}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Profile & Preferences Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Profile Photo & Display Name Card */}
            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/15 flex items-center justify-center text-indigo-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">{t.uploadProfile}</h3>
                  <p className="text-xs text-slate-500">{t.changeAvatar}</p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Avatar Drag & Drop / Preview Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`p-5 rounded-2xl border-2 border-dashed transition-all mb-5 flex flex-col sm:flex-row items-center gap-5 ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-600/10'
                    : theme === 'dark'
                    ? 'border-slate-700 bg-slate-900/60'
                    : 'border-slate-300 bg-slate-50'
                }`}
              >
                {/* Avatar Preview */}
                <div className="relative group shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-lg border-2 border-indigo-500"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg">
                      {userInitial}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  >
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold">{t.chooseFile}</span>
                  </button>
                </div>

                {/* Upload Action Buttons & Drag Prompt */}
                <div className="flex-1 text-center sm:text-left rtl:sm:text-right">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start rtl:sm:justify-start gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t.chooseFile}</span>
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview(null)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.removePhoto}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {language === 'fa'
                      ? 'تصاویر JPG، PNG یا WebP تا حداکثر ۸ مگابایت (فایل را بکشید و رها کنید)'
                      : 'JPG, PNG, or WebP up to 8MB. Auto-optimized for crisp quality.'}
                  </p>
                </div>
              </div>

              {/* Preset Cinema Avatars */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400">
                    {t.choosePresetAvatar}
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {language === 'fa' ? '۸ آواتار سینمایی فوری' : '8 Instant Cinema Avatars'}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.name}
                      onClick={() => {
                        setAvatarPreview(preset.url);
                        setProfileMessage(null);
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group hover:scale-105 active:scale-95 p-1 ${
                        avatarPreview === preset.url
                          ? 'border-indigo-500 ring-2 ring-indigo-600/40 shadow-lg shadow-indigo-600/20 bg-indigo-600/10'
                          : theme === 'dark'
                          ? 'border-slate-800 hover:border-slate-600 bg-slate-900'
                          : 'border-slate-200 hover:border-slate-400 bg-slate-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                      {avatarPreview === preset.url && (
                        <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-[1px] flex items-center justify-center text-white rounded-lg">
                          <Check className="w-5 h-5 stroke-[3] drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name Input */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  {t.name}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  maxLength={50}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Feedback Message */}
              {profileMessage && (
                <div
                  className={`p-3.5 rounded-xl mb-4 text-xs font-medium flex items-center gap-2 ${
                    profileMessage.type === 'success'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {profileMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              {/* Save Profile Button */}
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSavingProfile ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.updating}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.saveChanges}</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Security & Change Password Card */}
            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">{t.changePassword}</h3>
                  <p className="text-xs text-slate-500">{language === 'fa' ? 'امنیت و گذرواژه حساب' : 'Account credentials & security'}</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">
                    {t.currentPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-4 pr-10 rtl:pr-4 rtl:pl-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        theme === 'dark'
                          ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">
                    {t.newPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                      className={`w-full pl-4 pr-10 rtl:pr-4 rtl:pl-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        theme === 'dark'
                          ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'fa' ? 'حداقل ۶ کاراکتر باشد.' : 'Must be at least 6 characters.'}
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">
                    {t.confirmPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                      className={`w-full pl-4 pr-10 rtl:pr-4 rtl:pl-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        theme === 'dark'
                          ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Feedback Message */}
                {passwordMessage && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      passwordMessage.type === 'success'
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {passwordMessage.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                {/* Submit Password Change Button */}
                <button
                  type="submit"
                  disabled={isChangingPassword || !currentPassword || !newPassword}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.updating}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-white" />
                      <span>{t.changePassword}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* 3. Account Details & Preferences (Bottom Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details Card */}
            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/15 flex items-center justify-center text-indigo-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base sm:text-lg">{t.accountOverview}</h3>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between py-2.5 border-b border-slate-800">
                  <span className="text-slate-400">{t.name}</span>
                  <span className="font-semibold">{user?.name || 'Member'}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-slate-800">
                  <span className="text-slate-400">{t.email}</span>
                  <span className="font-semibold font-mono text-xs">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-slate-800">
                  <span className="text-slate-400">{t.memberSince}</span>
                  <span className="font-semibold">{memberSinceFormatted}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-400">{language === 'fa' ? 'وضعیت دسترسی' : 'Streaming Access'}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {language === 'fa' ? 'پخش با کیفیت بالا نامحدود' : 'Unlimited Full HD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Preferences Card */}
            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base sm:text-lg">{t.accountSettings}</h3>
              </div>

              <div className="space-y-4 text-sm">
                {/* Language Switcher */}
                <div className="flex items-center justify-between py-2.5 border-b border-slate-800">
                  <div>
                    <div className="font-semibold">{language === 'fa' ? 'زبان رابط کاربری' : 'Interface Language'}</div>
                    <div className="text-xs text-slate-400">{language === 'en' ? 'English (LTR)' : 'فارسی (RTL)'}</div>
                  </div>
                  {onToggleLanguage && (
                    <button
                      onClick={onToggleLanguage}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold text-indigo-400 border-indigo-500/40 hover:bg-indigo-600/10 cursor-pointer transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'فارسی' : 'English'}</span>
                    </button>
                  )}
                </div>

                {/* Theme Switcher */}
                <div className="flex items-center justify-between py-2.5 border-b border-slate-800">
                  <div>
                    <div className="font-semibold">{language === 'fa' ? 'پوسته ظاهری' : 'Appearance'}</div>
                    <div className="text-xs text-slate-400">{theme === 'dark' ? (language === 'fa' ? 'حالت تاریک' : 'Dark Mode') : (language === 'fa' ? 'حالت روشن' : 'Light Mode')}</div>
                  </div>
                  {onToggleTheme && (
                    <button
                      onClick={onToggleTheme}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                        theme === 'dark'
                          ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700'
                          : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                      <span>{theme === 'dark' ? (language === 'fa' ? 'روشن' : 'Light') : (language === 'fa' ? 'تاریک' : 'Dark')}</span>
                    </button>
                  )}
                </div>

                {/* Security & Sign out */}
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="font-semibold">{language === 'fa' ? 'نشست کاربری' : 'Active Session'}</div>
                    <div className="text-xs text-slate-400">{language === 'fa' ? 'اتصال ایمن با شناسه امن' : 'Encrypted JWT token session'}</div>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.signOut}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Collection Tabs (Watchlist, Watch Later, Favorites, History) */}
      {activeTab !== 'profile' && (
        <div>
          {/* Sub-bar: Filter pills (All / Movies / Series) */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : theme === 'dark' ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' : 'bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200'
              }`}
            >
              {t.all} ({rawItems.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterType === 'movie'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : theme === 'dark' ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' : 'bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{t.movies}</span>
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterType === 'tv'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : theme === 'dark' ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' : 'bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{t.series}</span>
            </button>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 ? (
            <div className={`p-12 sm:p-16 rounded-3xl border text-center ${
              theme === 'dark' ? 'bg-slate-900/60 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
                {activeTab === 'watchlist' ? (
                  <Bookmark className="w-8 h-8 text-indigo-400" />
                ) : activeTab === 'watchlater' ? (
                  <Clock className="w-8 h-8 text-amber-400" />
                ) : activeTab === 'favorites' ? (
                  <Heart className="w-8 h-8 text-rose-400" />
                ) : (
                  <History className="w-8 h-8 text-indigo-400" />
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                {activeTab === 'watchlist'
                  ? t.emptyWatchlist
                  : activeTab === 'watchlater'
                  ? t.emptyWatchLater
                  : activeTab === 'favorites'
                  ? (language === 'fa' ? 'لیست علاقه‌مندی‌های شما خالی است' : 'No favorite titles yet')
                  : t.emptyHistory}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-6">
                {activeTab === 'watchlist'
                  ? t.emptyWatchlistDesc
                  : activeTab === 'watchlater'
                  ? t.emptyWatchLaterDesc
                  : activeTab === 'favorites'
                  ? (language === 'fa' ? 'عناوینی که قلب می‌زنید اینجا ذخیره می‌شوند.' : 'Titles you favorite will appear here for fast access.')
                  : (language === 'fa' ? 'عناوینی که شروع به تماشا می‌کنید اینجا ثبت می‌شوند.' : 'Movies and episodes you stream will be remembered here.')}
              </p>
              <button
                onClick={() => onNavigate({ view: 'movies' })}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'fa' ? 'کاوش فیلم‌ها و سریال‌ها' : 'Discover Movies & Shows'}</span>
              </button>
            </div>
          ) : (
            /* Items Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredItems.map((item) => {
                const isMovie = item.mediaType === 'movie';
                const displayTitle = item.title || item.name || 'Untitled';
                const posterUrl = TMDBService.getImageUrl(item.posterPath, 'w342');
                const releaseYear = (('releaseDate' in item ? item.releaseDate : '') || ('firstAirDate' in item ? item.firstAirDate : ''))?.split('-')[0] || '';
                const voteAvg = 'voteAverage' in item && typeof item.voteAverage === 'number' ? item.voteAverage : undefined;

                return (
                  <div
                    key={item.id}
                    className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-103 hover:shadow-2xl hover:shadow-indigo-500/10 ${
                      theme === 'dark' ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    {/* Poster */}
                    <div
                      className="relative aspect-2/3 bg-slate-950 overflow-hidden cursor-pointer"
                      onClick={() => {
                        if (isMovie) {
                          onNavigate({ view: 'watch-movie', id: item.mediaId });
                        } else {
                          const hist = item as any;
                          onNavigate({
                            view: 'watch-tv',
                            id: item.mediaId,
                            season: hist.season || 1,
                            episode: hist.episode || 1,
                          });
                        }
                      }}
                    >
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={displayTitle}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-500">
                          <Film className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs line-clamp-2">{displayTitle}</span>
                        </div>
                      )}

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </div>
                      </div>

                      {/* Media Type Badge */}
                      <span className="absolute top-2.5 ltr:left-2.5 rtl:right-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                        {isMovie ? 'FILM' : 'SERIES'}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeTab === 'watchlist') {
                            removeFromWatchlist(item.mediaType, item.mediaId);
                          } else if (activeTab === 'watchlater') {
                            removeFromWatchLater(item.mediaType, item.mediaId);
                          } else if (activeTab === 'favorites') {
                            removeFromFavorites(item.mediaType, item.mediaId);
                          }
                        }}
                        className="absolute top-2.5 ltr:right-2.5 rtl:left-2.5 p-1.5 rounded-full bg-black/70 backdrop-blur-md text-slate-300 hover:text-rose-400 hover:bg-black/90 transition-colors cursor-pointer"
                        title={language === 'fa' ? 'حذف از این لیست' : 'Remove item'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3 flex flex-col flex-1 justify-between">
                      <div>
                        <h4
                          onClick={() => {
                            if (isMovie) {
                              onNavigate({ view: 'movie-detail', id: item.mediaId });
                            } else {
                              onNavigate({ view: 'series-detail', id: item.mediaId });
                            }
                          }}
                          className="font-bold text-xs sm:text-sm line-clamp-1 hover:text-indigo-400 transition-colors cursor-pointer"
                          title={displayTitle}
                        >
                          {displayTitle}
                        </h4>

                        {/* Sub info */}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          {releaseYear && <span>{releaseYear}</span>}
                          {voteAvg !== undefined && (
                            <span className="text-amber-400">★ {voteAvg.toFixed(1)}</span>
                          )}
                          {(item as any).season && (
                            <span className="text-indigo-400 font-semibold">
                              S{(item as any).season}:E{(item as any).episode || 1}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action button */}
                      <button
                        onClick={() => {
                          if (isMovie) {
                            onNavigate({ view: 'watch-movie', id: item.mediaId });
                          } else {
                            const hist = item as any;
                            onNavigate({
                              view: 'watch-tv',
                              id: item.mediaId,
                              season: hist.season || 1,
                              episode: hist.episode || 1,
                            });
                          }
                        }}
                        className="mt-3 w-full py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{language === 'fa' ? 'تماشا' : 'Stream'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
