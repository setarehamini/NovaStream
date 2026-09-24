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
  latestTrailers: string;
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
  signIn: string;
  signUp: string;
  createAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  email: string;
  password: string;
  name: string;
  signOut: string;
  watchlist: string;
  watchLater: string;
  favorites: string;
  history: string;
  addToWatchlist: string;
  removeFromWatchlist: string;
  inWatchlist: string;
  addToWatchLater: string;
  removeFromWatchLater: string;
  inWatchLater: string;
  emptyWatchLater: string;
  emptyWatchLaterDesc: string;
  myLists: string;
  jumpToEpisode: string;
  searchEpisodes: string;
  allEpisodes: string;
  showingEpisodes: string;
  loginRequiredToWatch: string;
  loginRequiredDesc: string;
  emptyWatchlist: string;
  emptyWatchlistDesc: string;
  emptyHistory: string;
  clearHistory: string;
  streamingLocked: string;
  unlockStreaming: string;
  library: string;
  account: string;
  myAccount: string;
  profile: string;
  accountOverview: string;
  member: string;
  memberSince: string;
  personalLibrary: string;
  accountSettings: string;
  allLists: string;
  uploadProfile: string;
  changeAvatar: string;
  chooseFile: string;
  dragAndDrop: string;
  avatarSaved: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordChangedSuccess: string;
  passwordMismatch: string;
  passwordLengthError: string;
  saveChanges: string;
  updating: string;
  editProfile: string;
  choosePresetAvatar: string;
  removePhoto: string;
}

export const translations: Record<'en' | 'fa', Dictionary> = {
  en: {
    appName: "Nova",
    tagline: "Stream Cinema & Series in High Definition",
    home: "Home",
    movies: "Movies",
    series: "TV Series",
    search: "Search",
    actors: "Actors",
    watchNow: "Watch Now",
    watchMovie: "Watch Movie",
    watchEpisode: "Watch Episode",
    trailer: "Watch Trailer",
    moreInfo: "Details",
    trendingNow: "Trending Now",
    trendingMovies: "Trending Movies",
    popularMovies: "Popular Movies",
    topRatedMovies: "Top Rated Movies",
    popularSeries: "Popular TV Series",
    topRatedSeries: "Top Rated Series",
    latestReleases: "Latest Releases",
    latestTrailers: "Latest Trailers",
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
    serverPrimary: "Server 1 (Ultra HD)",
    serverBackup1: "Server 2 (Fast HD)",
    serverBackup2: "Server 3 (Direct)",
    serverBackup3: "Server 4 (Alternative)",
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
    footerDisclaimer: "Nova is a modern streaming discovery catalog and cinema interface. Browse and stream high-definition movies and series smoothly.",
    signIn: "Sign In",
    signUp: "Sign Up",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    email: "Email address",
    password: "Password",
    name: "Full Name",
    signOut: "Sign Out",
    watchlist: "My Watchlist",
    watchLater: "Watch Later",
    favorites: "Favorites",
    history: "Watch History",
    addToWatchlist: "Add to Watchlist",
    removeFromWatchlist: "Remove from Watchlist",
    inWatchlist: "In Watchlist",
    addToWatchLater: "Watch Later",
    removeFromWatchLater: "Remove from Watch Later",
    inWatchLater: "In Watch Later",
    emptyWatchLater: "Your Watch Later list is empty",
    emptyWatchLaterDesc: "Save titles you want to watch next for quick one-click playback.",
    myLists: "My Lists",
    jumpToEpisode: "Jump to Episode",
    searchEpisodes: "Search episodes...",
    allEpisodes: "All Episodes",
    showingEpisodes: "Showing episodes",
    loginRequiredToWatch: "Sign In to Watch",
    loginRequiredDesc: "Exclusive Member Streaming: Please log in or create a free account to play this title.",
    emptyWatchlist: "Your Watchlist is empty",
    emptyWatchlistDesc: "Explore movies and TV shows and click 'Add to Watchlist' to save your queue.",
    emptyHistory: "No watch history recorded yet",
    clearHistory: "Clear History",
    streamingLocked: "Member Authentication Required",
    unlockStreaming: "Sign in to unlock player & stream in Full HD",
    library: "Library",
    account: "Account",
    myAccount: "My Account",
    profile: "Profile",
    accountOverview: "Account Overview",
    member: "Nova Member",
    memberSince: "Member Since",
    personalLibrary: "Personal Library",
    accountSettings: "Settings & Preferences",
    allLists: "All Collections",
    uploadProfile: "Upload Profile Picture",
    changeAvatar: "Change Avatar",
    chooseFile: "Choose Image",
    dragAndDrop: "or drag & drop here",
    avatarSaved: "Profile updated successfully",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    passwordChangedSuccess: "Password changed successfully",
    passwordMismatch: "New passwords do not match",
    passwordLengthError: "Password must be at least 6 characters",
    saveChanges: "Save Changes",
    updating: "Updating...",
    editProfile: "Edit Profile",
    choosePresetAvatar: "Or Choose a Preset Avatar",
    removePhoto: "Remove Photo",
  },
  fa: {
    appName: "نوا",
    tagline: "تماشای آنلاین جدیدترین فیلم‌ها و سریال‌های روز دنیا با کیفیت عالی",
    home: "خانه",
    movies: "فیلم‌ها",
    series: "سریال‌ها",
    search: "جستجو",
    actors: "بازیگران",
    watchNow: "تماشا کنید",
    watchMovie: "تماشای فیلم",
    watchEpisode: "تماشای قسمت",
    trailer: "پیش‌نمایش (تریلر)",
    moreInfo: "اطلاعات بیشتر",
    trendingNow: "محبوب‌ترین‌های امروز",
    trendingMovies: "فیلم‌های داغ و پرطرفدار",
    popularMovies: "فیلم‌های برتر",
    topRatedMovies: "بالاترین امتیاز فیلم‌ها",
    popularSeries: "سریال‌های پرمخاطب",
    topRatedSeries: "برترین سریال‌ها",
    latestReleases: "تازه‌ترین انتشارات",
    latestTrailers: "جدیدترین تریلرها",
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
    serverPrimary: "سرور ۱ (کیفیت بالا)",
    serverBackup1: "سرور ۲ (پخش سریع)",
    serverBackup2: "سرور ۳ (مستقیم)",
    serverBackup3: "سرور ۴ (جایگزین)",
    streamingNotice: "پخش‌کننده آنلاین سریع و روان. در صورت کندی یا قطعی، از سرورهای جایگزین استفاده کنید.",
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
    footerDisclaimer: "نوااستریم یک پلتفرم جامع کاوش و پخش استریمینگ آنلاین است. از تماشای جدیدترین فیلم‌ها و سریال‌ها لذت ببرید.",
    signIn: "ورود به حساب",
    signUp: "ثبت‌نام",
    createAccount: "ایجاد حساب کاربری جدید",
    alreadyHaveAccount: "قبلاً حساب کاربری ساخته‌اید؟",
    dontHaveAccount: "هنوز حساب کاربری ندارید؟",
    email: "آدرس ایمیل",
    password: "رمز عبور",
    name: "نام و نام خانوادگی",
    signOut: "خروج از حساب",
    watchlist: "لیست تماشای من",
    watchLater: "بعداً تماشا کنید",
    favorites: "علاقه‌مندی‌ها",
    history: "تاریخچه تماشا",
    addToWatchlist: "افزودن به لیست تماشا",
    removeFromWatchlist: "حذف از لیست تماشا",
    inWatchlist: "در لیست تماشا",
    addToWatchLater: "بعداً تماشا کنید",
    removeFromWatchLater: "حذف از تماشای بعدی",
    inWatchLater: "در تماشای بعدی",
    emptyWatchLater: "لیست بعداً تماشا کنید شما خالی است",
    emptyWatchLaterDesc: "عناوینی که می‌خواهید به‌زودی ببینید را ذخیره کنید تا به سرعت به آن‌ها دسترسی داشته باشید.",
    myLists: "لیست‌های من",
    jumpToEpisode: "پرش به قسمت",
    searchEpisodes: "جستجوی قسمت‌ها...",
    allEpisodes: "همه قسمت‌ها",
    showingEpisodes: "نمایش قسمت‌های",
    loginRequiredToWatch: "ورود برای تماشا",
    loginRequiredDesc: "پخش اختصاصی اعضا: لطفاً برای تماشای آنلاین وارد حساب کاربری خود شوید یا حساب جدید بسازید.",
    emptyWatchlist: "لیست تماشای شما خالی است",
    emptyWatchlistDesc: "فیلم‌ها و سریال‌های دلخواه خود را مرور کنید و روی دکمه افزودن به لیست تماشا بزنید.",
    emptyHistory: "هنوز تاریخچه‌ای ثبت نشده است",
    clearHistory: "پاک کردن کل تاریخچه",
    streamingLocked: "نیازمند ورود به حساب کاربری",
    unlockStreaming: "برای فعال‌سازی پخش و تماشای آنلاین با کیفیت بالا وارد شوید",
    library: "کتابخانه من",
    account: "حساب کاربری",
    myAccount: "حساب کاربری من",
    profile: "پروفایل",
    accountOverview: "نمای کلی حساب",
    member: "عضو نوااستریم",
    memberSince: "عضویت از",
    personalLibrary: "کتابخانه شخصی",
    accountSettings: "تنظیمات و ترجیحات",
    allLists: "تمامی لیست‌ها",
    uploadProfile: "آپلود تصویر پروفایل",
    changeAvatar: "تغییر تصویر نمایه",
    chooseFile: "انتخاب تصویر",
    dragAndDrop: "یا تصویر را اینجا بکشید و رها کنید",
    avatarSaved: "اطلاعات پروفایل با موفقیت به‌روز شد",
    changePassword: "تغییر رمز عبور",
    currentPassword: "رمز عبور فعلی",
    newPassword: "رمز عبور جدید",
    confirmPassword: "تکرار رمز عبور جدید",
    passwordChangedSuccess: "رمز عبور با موفقیت به‌روز شد",
    passwordMismatch: "رمز عبور جدید و تکرار آن یکسان نیستند",
    passwordLengthError: "رمز عبور باید حداقل ۶ کاراکتر باشد",
    saveChanges: "ذخیره تغییرات",
    updating: "در حال ثبت...",
    editProfile: "ویرایش پروفایل",
    choosePresetAvatar: "یا یک آواتار آماده انتخاب کنید",
    removePhoto: "حذف تصویر",
  },
};
