'use strict';

require('dotenv').config();

const express = require('express');
const axios   = require('axios');
const cheerio = require('cheerio');
const path    = require('path');

const app      = express();
const PORT     = process.env.PORT || 3000;
const ORIGIN   = 'https://flixbaba.mov';
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB     = 'https://api.themoviedb.org/3';
const IMG      = 'https://image.tmdb.org/t/p/w342';

// ── TMDB helper ──────────────────────────────────────────
async function tmdb(endpoint, params = {}) {
  const url = new URL(`${TMDB}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const { data } = await axios.get(url.toString(), { timeout: 10000 });
  return data;
}

// TMDB genre id → display name (covers both movie and TV genre lists)
const GENRES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action', 10765: 'Sci-Fi',
  10768: 'War', 10762: 'Kids', 10764: 'Reality', 10763: 'News', 10766: 'Soap',
  10767: 'Talk', 10770: 'TV Movie',
};

// Map a TMDB result to our standard title object
function mapItem(item) {
  const isTV  = item.media_type === 'tv' || (!item.title && item.name);
  const title = item.title || item.name || '';
  const year  = (item.release_date || item.first_air_date || '').slice(0, 4);

  // Genre: full-detail responses carry genres[]; list responses carry genre_ids[]
  let genre = isTV ? 'TV Show' : 'Movie';
  if (Array.isArray(item.genres) && item.genres.length) {
    genre = item.genres[0].name;
  } else if (Array.isArray(item.genre_ids) && item.genre_ids.length) {
    genre = GENRES[item.genre_ids[0]] || genre;
  }

  // Duration label: seasons for TV, runtime for movies (only present on detail calls)
  let dur = '';
  if (isTV && item.number_of_seasons) {
    dur = `${item.number_of_seasons} Season${item.number_of_seasons > 1 ? 's' : ''}`;
  } else if (!isTV && item.runtime) {
    dur = `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`;
  }

  return {
    id:        item.id,
    mediaType: isTV ? 'tv' : 'movie',
    title,
    year,
    rating: item.vote_average ? item.vote_average.toFixed(1) : '',
    poster:   item.poster_path   ? `${IMG}${item.poster_path}` : '',
    backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
    genre,
    dur,
    seasons: item.number_of_seasons || undefined,
    desc:   item.overview || '',
    link:   `${ORIGIN}/search?q=${encodeURIComponent(title)}`,
  };
}

// ── Known ad/tracker script domains ─────────────────────
const AD_PATTERNS = [
  'googlesyndication', 'doubleclick', 'adnxs', 'amazon-adsystem',
  'taboola', 'outbrain', 'popads', 'popcash', 'propellerads',
  'mgid', 'revcontent', 'trafficjunky', 'exoclick', 'juicyads',
  'adsterra', 'hilltopads', 'bidvertiser', 'adform', 'criteo',
  'pubmatic', 'rubiconproject', 'openx', 'appnexus', 'adsrvr',
  'valueclick', 'advertising.com', 'adblade', 'adroll', 'adtech',
  'smartadserver', '33across', 'sovrn', 'triplelift', 'sharethrough',
];

// ── Strip ads from a cheerio-loaded document ─────────────
function stripAds($) {
  // Remove <script> tags whose src matches an ad domain
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (AD_PATTERNS.some(p => src.includes(p))) $(el).remove();
  });

  // Remove inline scripts containing ad network references
  $('script:not([src])').each((_, el) => {
    const code = $(el).html() || '';
    if (AD_PATTERNS.some(p => code.includes(p))) $(el).remove();
  });

  // Remove ad iframes
  $('iframe[src]').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (AD_PATTERNS.some(p => src.includes(p))) $(el).remove();
  });

  // Remove common ad container elements by class/id naming patterns
  const adSelectors = [
    '[id^="ad-"],[id^="ads-"],[id$="-ad"],[id$="-ads"]',
    '[class*=" ad "],[class^="ad "],[class$=" ad"]',
    '[class*="advert"],[class*="sponsor"],[class*="promo-banner"]',
    '[class*="popup"],[class*="pop-up"],[class*="overlay-ad"]',
    '[class*="interstitial"],[class*="preroll"]',
    'ins.adsbygoogle',
  ].join(',');

  try { $(adSelectors).remove(); } catch (_) { /* ignore invalid selectors */ }
}

// ── Resolve relative URLs ────────────────────────────────
function abs(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return ORIGIN + url;
  return ORIGIN + '/' + url;
}

// ── Extract movie/show cards from parsed HTML ────────────
// Tries a cascade of common selector patterns used by streaming sites.
function extractTitles($) {
  const results = [];
  const seen    = new Set();

  // Ordered from most-specific to broadest — stops when a match yields > 3 items
  const cardSelectors = [
    '.movie-item', '.film-item', '.flw-item', '.video-item',
    '.item',       '.movie',     '.film',     '.entry',
    '[class*="movie-card"]', '[class*="film-card"]', '[class*="video-card"]',
    'article',     '.post',
  ];

  const titleSelectors  = '[class*="title"], [class*="name"], h3, h2, h4, h1';
  const ratingSelectors = '[class*="imdb"], [class*="rating"], [class*="score"], [class*="rate"]';
  const yearSelectors   = '[class*="year"], [class*="date"], time';
  const genreSelectors  = '[class*="genre"], [class*="category"], [class*="type"]';

  for (const sel of cardSelectors) {
    const cards = $(sel);
    if (cards.length < 4) continue;

    cards.each((_, el) => {
      const $el   = $(el);
      const title = $el.find(titleSelectors).first().text().trim()
                 || $el.attr('title')
                 || $el.find('a').attr('title') || '';
      if (!title || title.length < 2 || seen.has(title)) return;
      seen.add(title);

      const imgEl  = $el.find('img').first();
      const poster = abs(imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || imgEl.attr('src') || '');
      const link   = abs($el.find('a').first().attr('href') || '');
      const year   = ($el.find(yearSelectors).first().text().match(/\b(19|20)\d{2}\b/) || [])[0]
                  || ($el.text().match(/\b(19|20)\d{2}\b/) || [])[0] || '';
      const rawRating = $el.find(ratingSelectors).first().text().replace(/[^0-9.]/g, '');
      const rating = parseFloat(rawRating) ? rawRating : '';
      const genre  = $el.find(genreSelectors).first().text().trim() || '';
      const desc   = $el.find('[class*="desc"], [class*="story"], p').first().text().trim() || '';

      results.push({ title, poster, link, year, rating, genre, desc });
    });

    if (results.length > 3) break;
  }

  return results;
}

// ── Fetch helper with realistic browser headers ──────────
async function fetchPage(url) {
  const { data } = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer':         ORIGIN,
      'DNT':             '1',
    },
  });
  return data;
}

// ── Health check (used by Railway) ───────────────────────
app.get('/health', (_, res) => res.json({ ok: true }));

// ── Redirect old /flixbaba.html URL to root ──────────────
app.get('/flixbaba.html', (_, res) => res.redirect(301, '/'));

// ── Serve static frontend files ──────────────────────────
// HTML files: no-store so browsers always fetch the latest version
app.get('*.html', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(express.static(path.join(__dirname)));

// ── Serve Font Awesome from local node_modules ───────────
app.use('/fontawesome', express.static(
  path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free')
));

// ── API: TMDB-powered browse categories ──────────────────
app.get('/api/titles', async (req, res) => {
  if (!TMDB_KEY) return res.json({ ok: false, error: 'TMDB_API_KEY not configured', categories: {} });

  const TV_IDS = [1396, 66732, 2316, 1399, 70523, 60059, 87108, 60735, 94997];

  try {
    const [trending, newReleases, action, comedy, scifi, drama, ...tvShows] = await Promise.all([
      tmdb('/trending/all/week'),
      tmdb('/movie/now_playing'),
      tmdb('/discover/movie', { with_genres: 28,  sort_by: 'popularity.desc' }),
      tmdb('/discover/movie', { with_genres: 35,  sort_by: 'popularity.desc' }),
      tmdb('/discover/movie', { with_genres: 878, sort_by: 'popularity.desc' }),
      tmdb('/discover/movie', { with_genres: 18,  sort_by: 'popularity.desc' }),
      ...TV_IDS.map(id => tmdb(`/tv/${id}`)),
    ]);

    res.json({
      ok: true,
      categories: {
        tvShows:     tvShows.map(mapItem),
        trending:    (trending.results    || []).slice(0, 20).map(mapItem),
        newReleases: (newReleases.results || []).slice(0, 20).map(mapItem),
        action:      (action.results      || []).slice(0, 20).map(mapItem),
        comedy:      (comedy.results      || []).slice(0, 20).map(mapItem),
        scifi:       (scifi.results       || []).slice(0, 20).map(mapItem),
        drama:       (drama.results       || []).slice(0, 20).map(mapItem),
      },
    });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
});

// ── API: TMDB-powered search ──────────────────────────────
app.get('/api/search', async (req, res) => {
  if (!TMDB_KEY) return res.json({ ok: false, error: 'TMDB_API_KEY not configured', titles: [] });

  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing q param' });

  try {
    const data   = await tmdb('/search/multi', { query: q, include_adult: false, page: 1 });
    const titles = (data.results || [])
      .filter(r => r.media_type !== 'person' && (r.title || r.name))
      .map(mapItem);
    res.json({ ok: true, count: titles.length, titles });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message, titles: [] });
  }
});

// ── API: proxy images (flixbaba.mov + TMDB) ──────────────
app.get('/api/image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).json({ error: 'Invalid URL' }); }

  const allowed = parsed.hostname.endsWith('flixbaba.mov') ||
                  parsed.hostname.endsWith('image.tmdb.org');
  if (!allowed) return res.status(403).json({ error: 'Domain not allowed' });

  try {
    const upstream = await axios.get(url, { responseType: 'stream', timeout: 10000 });
    const ct = upstream.headers['content-type'] || 'image/jpeg';
    if (!ct.startsWith('image/')) return res.status(415).json({ error: 'Not an image' });
    res.set('Content-Type', ct);
    upstream.data.pipe(res);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// ── Proxy: fetch flixbaba.mov or vsembed.ru, strip ads, rewrite URLs ──
app.get('/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url param');

  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).send('Invalid URL'); }

  const isFlixbaba = parsed.hostname.endsWith('flixbaba.mov');
  const isVsembed  = parsed.hostname.endsWith('vsembed.ru');
  if (!isFlixbaba && !isVsembed) return res.status(403).send('Domain not allowed');

  const pageOrigin = `${parsed.protocol}//${parsed.hostname}`;
  const absFor = (href) => {
    if (!href) return '';
    if (href.startsWith('http')) return href;
    if (href.startsWith('//'))   return 'https:' + href;
    if (href.startsWith('/'))    return pageOrigin + href;
    return pageOrigin + '/' + href;
  };

  try {
    const html = await fetchPage(url);
    const $    = cheerio.load(html);

    stripAds($);

    if (isFlixbaba) {
      // Rewrite internal flixbaba links through proxy
      $('a[href]').each((_, el) => {
        const href   = $(el).attr('href') || '';
        const target = absFor(href);
        if (target.includes('flixbaba.mov')) {
          $(el).attr('href', `/proxy?url=${encodeURIComponent(target)}`);
        } else if (!href.startsWith('#') && !href.startsWith('javascript')) {
          $(el).attr('href', target);
        }
      });

      // Proxy poster/banner images
      $('img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || '';
        if (src && !src.startsWith('data:')) {
          const target = absFor(src);
          if (target.includes('flixbaba.mov')) {
            $(el).attr('src', `/api/image?url=${encodeURIComponent(target)}`);
            $(el).removeAttr('data-src');
          }
        }
      });

      // Remove scripts from other domains (leave flixbaba's own scripts)
      $('script[src]').each((_, el) => {
        const src = $(el).attr('src') || '';
        const isRelative = src.startsWith('/') || !src.startsWith('http');
        const isOwn      = src.includes('flixbaba.mov');
        if (!isRelative && !isOwn) $(el).remove();
      });
    }

    if (isVsembed) {
      // Rewrite relative script/link srcs to absolute vsembed.ru URLs
      $('script[src]').each((_, el) => {
        const src = $(el).attr('src') || '';
        if (!src.startsWith('http') && !src.startsWith('//')) {
          $(el).attr('src', absFor(src));
        }
      });
      $('link[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (!href.startsWith('http') && !href.startsWith('//') && !href.startsWith('data:')) {
          $(el).attr('href', absFor(href));
        }
      });

      // Auto-click Player #2 once the page initialises
      $('body').append(`<script>
        (function() {
          function clickPlayer2() {
            var sources = document.querySelectorAll('#sources #list .source');
            if (sources.length >= 2) { sources[1].click(); return true; }
            if (sources.length === 1) { sources[0].click(); return true; }
            return false;
          }
          // Try immediately, then retry while the page is still loading
          var attempts = 0;
          var interval = setInterval(function() {
            if (clickPlayer2() || ++attempts > 20) clearInterval(interval);
          }, 300);
        })();
      </script>`);
    }

    // Inject base so relative resources resolve to the correct origin
    if ($('base').length === 0) $('head').prepend(`<base href="${pageOrigin}/">`);

    $('head').append(`<style>
      /* Block ad containers by naming patterns */
      [id^="ad-"],[id^="ads-"],[id$="-ad"],[id$="-ads"],[id*="advert"],[id*="banner"],
      [class*="advert"],[class*="sponsor"],[class*="promo-banner"],[class*="overlay-ad"],
      [class*="popup"],[class*="pop-up"],[class*="interstitial"],[class*="preroll"],
      ins.adsbygoogle,div[data-ad],div[data-adunit] { display:none!important }
      body { margin:0 }
    </style>`);

    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.send($.html());
  } catch (err) {
    res.status(502).send(`<html><body style="background:#0f0f1a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px">
      <h2>Could not load page</h2><p style="color:#9090b0">${err.message}</p>
      <a href="${url}" target="_blank" style="color:#8b5cf6">Open directly</a>
    </body></html>`);
  }
});

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nChillFlix running at http://localhost:${PORT}`);
  console.log(`Open your browser:  http://localhost:${PORT}/flixbaba.html\n`);
});
