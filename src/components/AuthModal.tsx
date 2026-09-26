import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Eye, EyeOff, Film, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Language, Theme } from '../types';
import { translations } from '../i18n/translations';

interface AuthModalProps {
  language: Language;
  theme: Theme;
}

export const AuthModal: React.FC<AuthModalProps> = ({ language, theme }) => {
  const {
    isAuthModalOpen,
    authModalMode,
    authPromptMessage,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode with context mode when opened
  React.useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage(language === 'fa' ? 'لطفاً تمامی فیلدها را پر کنید.' : 'Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(language === 'fa' ? 'رمز عبور باید حداقل ۶ کاراکتر باشد.' : 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.message || 'Login failed');
        } else {
          setSuccessMessage(language === 'fa' ? 'ورود موفقیت‌آمیز بود.' : 'Signed in successfully!');
        }
      } else {
        const res = await register(email, password, name);
        if (!res.success) {
          setErrorMessage(res.message || 'Registration failed');
        } else {
          setSuccessMessage(language === 'fa' ? 'حساب کاربری با موفقیت ساخته شد.' : 'Account created successfully!');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full max-w-md rounded-xl border shadow-2xl p-6 sm:p-8 z-10 transition-all ${
          theme === 'dark'
            ? 'bg-[#141414] border-zinc-800 text-zinc-100 shadow-black'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className={`absolute top-5 ltr:right-5 rtl:left-5 p-2 rounded-md cursor-pointer transition-colors ${
            theme === 'dark'
              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
              : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
          }`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand / Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {mode === 'login' ? t.signIn : t.createAccount}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {mode === 'login'
              ? (language === 'fa' ? 'برای پخش ویدیو و مدیریت لیست تماشا وارد شوید' : 'Sign in to stream movies and sync your Watchlist')
              : (language === 'fa' ? 'ثبت‌نام رایگان برای دسترسی کامل به پخش آنلاین' : 'Join free for instant streaming & personal queue')}
          </p>
        </div>

        {/* Prompt Alert (e.g. when blocked from watching) */}
        {authPromptMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-amber-400">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-snug">{authPromptMessage}</div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs sm:text-sm text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs sm:text-sm text-emerald-500">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode Switch Tabs */}
        <div className={`grid grid-cols-2 p-1 rounded-xl mb-5 ${
          theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100 border border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.signIn}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(null); }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.signUp}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-300">
                {t.name}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className={`w-full ltr:pl-10 rtl:pr-10 py-2.5 px-4 rounded-xl text-xs sm:text-sm border outline-hidden transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-300">
              {t.email} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full ltr:pl-10 rtl:pr-10 py-2.5 px-4 rounded-xl text-xs sm:text-sm border outline-hidden transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-300">
              {t.password} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full ltr:pl-10 rtl:pr-10 ltr:pr-10 rtl:pl-10 py-2.5 px-4 rounded-xl text-xs sm:text-sm border outline-hidden transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{mode === 'login' ? t.signIn : t.createAccount}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              {t.dontHaveAccount}{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(null); }}
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold cursor-pointer"
              >
                {t.signUp}
              </button>
            </p>
          ) : (
            <p>
              {t.alreadyHaveAccount}{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); }}
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold cursor-pointer"
              >
                {t.signIn}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
