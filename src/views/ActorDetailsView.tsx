import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, MapPin, Award, Film, Tv, ChevronDown, ChevronUp } from 'lucide-react';
import { ActorDetails, RouteState, Theme, Language, ActorCombinedCreditItem } from '../types';
import { ActorService, TMDBService } from '../services';
import { MovieCard } from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { translations } from '../i18n/translations';

interface ActorDetailsViewProps {
  id: number;
  onNavigate: (route: RouteState) => void;
  language: Language;
  theme: Theme;
}

export const ActorDetailsView: React.FC<ActorDetailsViewProps> = ({
  id,
  onNavigate,
  language,
  theme,
}) => {
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all');

  const t = translations[language];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    window.scrollTo(0, 0);

    async function loadActor() {
      try {
        const langParam = language === 'fa' ? 'fa-IR' : 'en-US';
        const data = await ActorService.getDetails(id, langParam);
        if (isMounted) setActor(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || t.errorLoading);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadActor();
    return () => { isMounted = false; };
  }, [id, language]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="w-full h-80 bg-slate-900 rounded-3xl animate-pulse mb-8" />
        <SkeletonGrid count={6} theme={theme} />
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <p className="text-rose-500 font-bold">{error || 'Actor details not found.'}</p>
        <button
          onClick={() => onNavigate({ view: 'home' })}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const profileUrl = TMDBService.getProfileUrl(actor.profile_path);

  // Process and sort combined credits
  const rawCredits: ActorCombinedCreditItem[] = (actor.combined_credits?.cast || [])
    .filter((item) => item.poster_path || item.backdrop_path);

  // Remove duplicates
  const seenIds = new Set<number>();
  const uniqueCredits = rawCredits.filter((item) => {
    if (seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  });

  // Sort by popularity / vote count
  const sortedCredits = uniqueCredits.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  const filteredCredits = sortedCredits.filter((item) => {
    if (mediaFilter === 'movie') return item.media_type === 'movie' || (!item.media_type && !item.first_air_date);
    if (mediaFilter === 'tv') return item.media_type === 'tv' || !!item.first_air_date;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Back</span>
        </button>
      </div>

      {/* Actor Profile Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Image */}
        <div className="w-48 sm:w-60 shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800/80 bg-slate-900">
          <img
            src={profileUrl}
            alt={actor.name}
            className="w-full aspect-2/3 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Actor Info */}
        <div className="flex-1 space-y-4 text-left rtl:text-right">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>{actor.known_for_department || t.actors}</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {actor.name}
          </h1>

          {/* Quick info badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            {actor.birthday && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>{t.born}: {actor.birthday}</span>
              </div>
            )}

            {actor.place_of_birth && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{actor.place_of_birth}</span>
              </div>
            )}

            {actor.popularity ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>Popularity score: {actor.popularity.toFixed(0)}</span>
              </div>
            ) : null}
          </div>

          {/* Biography */}
          <div className="space-y-2 pt-2">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {t.biography}
            </h3>

            <div className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {actor.biography ? (
                <div>
                  <p className={!isBioExpanded ? 'line-clamp-4' : ''}>
                    {actor.biography}
                  </p>
                  {actor.biography.length > 250 && (
                    <button
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="mt-2 text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isBioExpanded ? t.readLess : t.readMore}</span>
                      {isBioExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">No biography is currently available for this actor.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filmography Section */}
      <div className="pt-8 border-t border-slate-800/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t.filmography}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredCredits.length} featured movies and series
            </p>
          </div>

          {/* Filmography Filters */}
          <div className={`flex items-center p-1 rounded-xl border transition-colors ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setMediaFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mediaFilter === 'all'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              {t.all}
            </button>

            <button
              onClick={() => setMediaFilter('movie')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mediaFilter === 'movie'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Film className="w-3 h-3" />
              <span>{t.movies}</span>
            </button>

            <button
              onClick={() => setMediaFilter('tv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mediaFilter === 'tv'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>{t.series}</span>
            </button>
          </div>
        </div>

        {/* Filmography Cards Grid */}
        {filteredCredits.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            {t.noResults}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredCredits.map((item) => (
              <MovieCard
                key={`${item.id}-${item.media_type || 'credit'}`}
                item={item}
                onNavigate={onNavigate}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
