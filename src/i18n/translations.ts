export interface Dictionary {
  appName: string;
  tagline: string;
  home: string;
  movies: string;
  series: string;
  search: string;
  actors: string;
  watchNow: string;
  watchMovie: string;
  watchEpisode: string;
  trailer: string;
  moreInfo: string;
  trendingNow: string;
  trendingMovies: string;
  popularMovies: string;
  topRatedMovies: string;
  popularSeries: string;
  topRatedSeries: string;
  latestReleases: string;
  viewAll: string;
  genres: string;
  allGenres: string;
  year: string;
  allYears: string;
  rating: string;
  allRatings: string;
  sortBy: string;
  sortPopularityDesc: string;
  sortRatingDesc: string;
  sortDateDesc: string;
  sortTitleAsc: string;
  overview: string;
  cast: string;
  director: string;
  creators: string;
  seasons: string;
  episodes: string;
  season: string;
  episode: string;
  episodeCount: string;
  runtime: string;
  minutes: string;
  releaseDate: string;
  firstAirDate: string;
  status: string;
  similarMovies: string;
  similarSeries: string;
  recommendations: string;
  biography: string;
  born: string;
  placeOfBirth: string;
  knownFor: string;
  filmography: string;
  asRole: string;
  all: string;
  nextEpisode: string;
  prevEpisode: string;
  server: string;
  serverPrimary: string;
  serverBackup1: string;
  serverBackup2: string;
  serverBackup3: string;
  streamingNotice: string;
  searchPlaceholder: string;
  searchTitle: string;
  searchFilterType: string;
  noResults: string;
  loading: string;
  errorLoading: string;
  retry: string;
  readMore: string;
  readLess: string;
  page: string;
  of: string;
  footerRights: string;
  footerDisclaimer: string;
}

export const translations: Record<'en' | 'fa', Dictionary> = {
  en: {
    appName: "NovaStream",
    tagline: "Stream Cinema & Series in High Definition",
    home: "Home",
    movies: "Movies",
    series: "TV Series",
    search: "Search",
    actors: "Actors",
    watchNow: "Watch Now",
    watchMovie: "▶ Watch Movie",
    watchEpisode: "▶ Watch Episode",
    trailer: "Watch Trailer",
    moreInfo: "Details",
    trendingNow: "Trending Now",
    trendingMovies: "Trending Movies",
    popularMovies: "Popular Movies",
    topRatedMovies: "Top Rated Movies",
    popularSeries: "Popular TV Series",
    topRatedSeries: "Top Rated Series",
    latestReleases: "Latest Releases",
    viewAll: "View All",
    genres: "Genres",
    allGenres: "All Genres",
    year: "Year",
    allYears: "All Years",
    rating: "Rating",
    allRatings: "All Ratings",
    sortBy: "Sort By",
    sortPopularityDesc: "Most Popular",
    sortRatingDesc: "Highest Rated",
    sortDateDesc: "Newest First",
    sortTitleAsc: "Title (A-Z)",
    overview: "Overview",
    cast: "Top Cast",
    director: "Director",
    creators: "Creators",
    seasons: "Seasons",
    episodes: "Episodes",
    season: "Season",
    episode: "Episode",
    episodeCount: "Episodes",
    runtime: "Runtime",
    minutes: "min",
    releaseDate: "Release Date",
    firstAirDate: "First Air Date",
    status: "Status",
    similarMovies: "Similar Movies",
    similarSeries: "Similar Series",
    recommendations: "Recommended For You",
    biography: "Biography",
    born: "Born",
    placeOfBirth: "Place of Birth",
    knownFor: "Known For",
    filmography: "Filmography",
    asRole: "as",
    all: "All",
    nextEpisode: "Next Episode",
    prevEpisode: "Previous Episode",
    server: "Server",
    serverPrimary: "Server 1 (VidCore)",
    serverBackup1: "Server 2 (VidSrc)",
    serverBackup2: "Server 3 (VidCC)",
    serverBackup3: "Server 4 (EmbedSU)",
    streamingNotice: "Free dynamic stream player. If one server is buffering, switch to a backup server.",
    searchPlaceholder: "Search movies, TV series, or actors...",
    searchTitle: "Advanced Discovery & Search",
    searchFilterType: "Type",
    noResults: "No results found matching your criteria.",
    loading: "Loading content...",
    errorLoading: "Failed to load content from stream network.",
    retry: "Try Again",
    readMore: "Read more",
    readLess: "Read less",
    page: "Page",
    of: "of",
    footerRights: "All rights reserved.",
    footerDisclaimer: "NovaStream is a modern streaming discovery catalog and player interface. All media is dynamically streamed from public third-party video providers.",
  },
  fa: {
    appName: "نوااستریم",
    tagline: "تماشای آنلاین جدیدترین فیلم‌ها و سریال‌های روز دنیا با کیفیت عالی",
    home: "خانه",
    movies: "فیلم‌ها",
    series: "سریال‌ها",
    search: "جستجو",
    actors: "بازیگران",
    watchNow: "تماشا کنید",
    watchMovie: "▶ تماشای فیلم",
    watchEpisode: "▶ تماشای قسمت",
    trailer: "پیش‌نمایش (تریلر)",
    moreInfo: "اطلاعات بیشتر",
    trendingNow: "محبوب‌ترین‌های امروز",
    trendingMovies: "فیلم‌های داغ و پرطرفدار",
    popularMovies: "فیلم‌های برتر",
    topRatedMovies: "بالاترین امتیاز فیلم‌ها",
    popularSeries: "سریال‌های پرمخاطب",
    topRatedSeries: "برترین سریال‌ها",
    latestReleases: "تازه‌ترین انتشارات",
    viewAll: "مشاهده همه",
    genres: "ژانرها",
    allGenres: "همه ژانرها",
    year: "سال انتشار",
    allYears: "همه سال‌ها",
    rating: "امتیاز",
    allRatings: "همه امتیازها",
    sortBy: "مرتب‌سازی بر اساس",
    sortPopularityDesc: "محبوب‌ترین",
    sortRatingDesc: "بالاترین امتیاز",
    sortDateDesc: "جدیدترین",
    sortTitleAsc: "عنوان (الف تا ی)",
    overview: "خلاصه داستان",
    cast: "بازیگران اصلی",
    director: "کارگردان",
    creators: "سازندگان",
    seasons: "فصل‌ها",
    episodes: "قسمت‌ها",
    season: "فصل",
    episode: "قسمت",
    episodeCount: "قسمت",
    runtime: "مدت زمان",
    minutes: "دقیقه",
    releaseDate: "تاریخ اکران",
    firstAirDate: "آغاز پخش",
    status: "وضعیت پخش",
    similarMovies: "فیلم‌های مشابه",
    similarSeries: "سریال‌های مشابه",
    recommendations: "پیشنهادات منتخب برای شما",
    biography: "زندگینامه",
    born: "تاریخ تولد",
    placeOfBirth: "محل تولد",
    knownFor: "تخصص هنری",
    filmography: "فیلم‌شناسی",
    asRole: "در نقش",
    all: "همه",
    nextEpisode: "قسمت بعدی",
    prevEpisode: "قسمت قبلی",
    server: "سرور پخش",
    serverPrimary: "سرور ۱ (VidCore)",
    serverBackup1: "سرور ۲ (VidSrc)",
    serverBackup2: "سرور ۳ (VidCC)",
    serverBackup3: "سرور ۴ (EmbedSU)",
    streamingNotice: "پخش‌کننده آنلاین رایگان. در صورت کندی یا مشکل، از سرورهای جایگزین استفاده کنید.",
    searchPlaceholder: "جستجوی نام فیلم، سریال یا بازیگر...",
    searchTitle: "جستجوی پیشرفته و فیلترها",
    searchFilterType: "نوع محتوا",
    noResults: "هیچ موردی با این مشخصات یافت نشد.",
    loading: "در حال بارگذاری محتوا...",
    errorLoading: "خطا در بارگذاری اطلاعات از سرور.",
    retry: "تلاش دوباره",
    readMore: "مشاهده بیشتر",
    readLess: "بستن",
    page: "صفحه",
    of: "از",
    footerRights: "تمامی حقوق محفوظ است.",
    footerDisclaimer: "نوااستریم یک پلتفرم جامع کاوش و پخش استریمینگ آنلاین است. پخش ویدیوها از طریق سرورهای شخص ثالث امن تامین می‌گردد.",
  },
};
