import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Simple in-memory cache for API requests to enhance speed & avoid rate limits
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const FALLBACK_DEMO_KEY = "4e44d9029b1270a757cddc766a1bcb63";

// TMDB API Proxy route: /api/tmdb/*
app.use("/api/tmdb", async (req: Request, res: Response) => {
  try {
    const rawPath = req.url.split("?")[0].replace(/^\//, "");
    if (!rawPath) {
      return res.status(400).json({ error: "Missing TMDB endpoint path" });
    }

    const cacheKey = req.url;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    const apiKey = (process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.trim() !== "" && process.env.TMDB_API_KEY !== "your_api_key")
      ? process.env.TMDB_API_KEY.trim()
      : FALLBACK_DEMO_KEY;

    const url = new URL(`${TMDB_BASE_URL}/${rawPath}`);
    
    // Copy query parameters from incoming request
    const queryEntries = Object.entries(req.query);
    for (const [key, value] of queryEntries) {
      if (value !== undefined && value !== null && key !== "api_key") {
        url.searchParams.set(key, String(value));
      }
    }

    const headers: Record<string, string> = {
      "Accept": "application/json",
      "User-Agent": "NovaStream-Web/1.0",
    };

    // If apiKey is a v4 Read Access Token (long string) vs v3 api_key
    if (apiKey.length > 50) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else {
      url.searchParams.set("api_key", apiKey);
    }

    const tmdbResponse = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!tmdbResponse.ok) {
      const errorText = await tmdbResponse.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { status_message: errorText };
      }
      return res.status(tmdbResponse.status).json({
        error: true,
        status: tmdbResponse.status,
        message: errorJson.status_message || "TMDB API request failed",
      });
    }

    const data = await tmdbResponse.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });

    // Clean up old cache entries periodically
    if (cache.size > 500) {
      const now = Date.now();
      for (const [k, val] of cache.entries()) {
        if (now - val.timestamp > CACHE_TTL) {
          cache.delete(k);
        }
      }
    }

    return res.json(data);
  } catch (error: any) {
    console.error("API Proxy Error:", error);
    return res.status(500).json({
      error: true,
      message: error?.message || "Internal server error while fetching TMDB data",
    });
  }
});

// API status route
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasCustomApiKey: Boolean(
      process.env.TMDB_API_KEY &&
      process.env.TMDB_API_KEY !== "your_api_key" &&
      process.env.TMDB_API_KEY.trim() !== ""
    ),
  });
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NovaStream Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
