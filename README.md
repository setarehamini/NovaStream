# NovaStream 🎬✨

**NovaStream** is a modern, cinematic movie and TV series streaming web platform built with React 19, TypeScript, Tailwind CSS, Express, and PostgreSQL. It features comprehensive media exploration powered by TMDB, multiple streaming player integrations, personalized user accounts (watchlists, favorites, and watch history), bilingual localization (English and Persian with RTL support), and seamless theme switching.

---

## 🚀 Features

- **Extensive Media Catalog**:
  - Browse Trending, Popular, Top Rated, and Upcoming Movies & TV Series.
  - Explore detailed information: synopsis, genres, runtime, release date, cast, directors, budgets, and revenue.
  - Watch official YouTube trailers embedded directly in the interface.
- **Multi-Server Streaming Players**:
  - Embedded player supporting multiple stream sources (VidCore, AutoEmbed, SuperEmbed, 2Embed, VidSrc, etc.) with instant server switching.
  - Dedicated TV show navigator with interactive season and episode selectors.
  - Theater Mode and wide layout toggles.
- **Actor Profiles & Filmographies**:
  - Detailed actor biography, known-for credits, and full filmography with type filtering.
- **Advanced Search & Filtering**:
  - Instant search-as-you-type modal with quick keyboard shortcut (`Ctrl+K` / `⌘K`).
  - Advanced search view with genre filters, release year, minimum rating, and sort options.
- **User Accounts & Personal Libraries**:
  - Secure authentication via JWT and bcrypt password hashing.
  - Personal **Watchlist** and **Favorites** collections.
  - Automatic **Watch History** tracking across movies and series episodes.
  - Dual database engine: Works with **PostgreSQL** or falls back to an automatic **zero-config local JSON file store** (`./data/novastream_db.json`).
- **Bilingual & Responsive Design**:
  - Full English (LTR) and Persian / فارسی (RTL) localization.
  - Dark and Light mode themes with high-contrast accessibility.
  - Responsive layouts tailored for mobile, tablet, and desktop viewports.
- **Secure Architecture**:
  - Backend API proxies all TMDB requests, keeping API keys safe on the server side with built-in in-memory caching.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide React
- **Backend**: Node.js, Express, tsx, esbuild
- **Database**: PostgreSQL (`pg`) with automatic local JSON fallback
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **External API**: The Movie Database (TMDB) API
- **Containerization**: Docker & Docker Compose

---

## 📋 Prerequisites

Make sure you have installed:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- *(Optional)* **Docker & Docker Compose**: For containerized deployment

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `TMDB_API_KEY` | *(Optional)* Your TMDB v3 API Key or v4 Read Access Token. If omitted, a fallback demo key is used. | `3fd2be6f0c70a2a598f084ddfb75487c` |
| `DATABASE_URL` | PostgreSQL connection string. If omitted or unreachable, NovaStream uses the local JSON database automatically. | `postgres://postgres:postgres@localhost:5432/novastream` |
| `JWT_SECRET` | Secret key used to sign and verify user authentication tokens. | `your_secure_random_secret_here` |
| `PORT` | The port on which the server listens. | `3000` |

---

## 💻 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/setarehamini/novastream.git
cd novastream
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```
*(Optionally provide your own TMDB API key in `.env`)*

### 4. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🐳 Running with Docker & Docker Compose

NovaStream includes complete Docker support with a pre-configured PostgreSQL service.

### 1. Launch with Docker Compose
```bash
docker compose up -d --build
```

This starts:
1. **db**: PostgreSQL 16 database on port `5432` with a persistent Docker volume (`postgres_data`).
2. **web**: NovaStream application running on port `3000`.

### 2. Access the application
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Stop containers
```bash
docker compose down
```
*(Add `-v` to remove database volumes if you want a complete reset: `docker compose down -v`)*

---

## 📦 Production Build

To build the production bundle:

```bash
npm run build
```

This compiles:
- The React client into the `dist/` directory via Vite.
- The Node.js server into a bundled CommonJS file at `dist/server.cjs` using `esbuild`.

To start the production server:
```bash
npm start
```

---

## 📁 Project Structure

```text
├── data/                  # Local persistent database fallback (novastream_db.json)
├── server/                # Backend API routes & database operations
│   ├── auth.ts            # Authentication handlers (signup, login, profile)
│   ├── db.ts              # PostgreSQL pool & local JSON database engine
│   └── user.ts            # User library routes (watchlist, favorites, history)
├── src/
│   ├── components/        # UI components (Navbar, HeroBanner, MediaCard, AuthModal, etc.)
│   ├── context/           # React Context (AuthContext, ThemeContext, LanguageContext)
│   ├── i18n/              # Translations & dictionary strings (EN / FA)
│   ├── services/          # Client API services (movieService, seriesService, tmdb)
│   ├── views/             # Main application views (Home, Movies, Series, Watch, Actor, etc.)
│   ├── App.tsx            # Route dispatcher and top-level view wrapper
│   ├── main.tsx           # React entry point
│   └── types.ts           # TypeScript interfaces and data models
├── .env.example           # Environment variables template
├── Dockerfile             # Multi-stage production container build
├── docker-compose.yml     # Container orchestration (Web + PostgreSQL)
├── package.json           # Scripts and dependencies
├── server.ts              # Express server entry point & TMDB API proxy
└── vite.config.ts         # Vite build configuration
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
