'use strict';

require('dotenv').config();

const express    = require('express');
const axios      = require('axios');
const cheerio    = require('cheerio');
const path       = require('path');
const helmet     = require('helmet');
const compression = require('compression');
const rateLimit  = require('express-rate-limit');

const app      = express();
const PORT     = process.env.PORT || 3000;
const ORIGIN   = 'https://flixbaba.mov';
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB     = 'https://api.themoviedb.org/3';
const IMG      = 'https://image.tmdb.org/t/p/w342';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB cap for proxied images

// ── Security headers & gzip ──────────────────────────────
// CSP is disabled because the /proxy route serves rewritten
// third-party pages that would break under a strict policy.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// ── Rate limiting (100 req / 15 min per IP) ──────────────
const proxyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests, try again later' },
});
app.use('/proxy', proxyLimiter);
app.use('/api/image', proxyLimiter);

// ── Simple in-memory TTL cache ───────────────────────────
function makeCache(ttlMs) {
  const store = new Map();
  return {
    get(key) {
      const hit = store.get(key);
      if (!hit) return null;
      if (hit.expires < Date.now()) { store.delete(key); return null; }
      return hit.value;
    },
    set(key, value) {
      store.set(key, { value, expires: Date.now() + ttlMs });
    },
  };
}

const titlesCache = makeCache(10 * 60 * 1000); // 10 minutes
const imageCache  = makeCache(5  * 60 * 1000); // 5 minutes

// ── Host allowlist check (exact match or proper subdomain) ──
function hostAllowed(hostname, domain) {
  return hostname === domain || hostname.endsWith('.' + domain);
}

// ── HTML-escape for values interpolated into error pages ──
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// ── TMDB helper ──────────────────────────────────────────
async function tmdb(endpoint, params = {}) {
  const url = new URL(`${TMDB}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const { data } = await axios.get(url.toString(), { timeout: 10000 });
  return data;
}

// Map a TMDB result to our standard title object
function mapItem(item) {
  const isTV  = item.media_type === 'tv' || (!item.title && item.name);
  const title = item.title || item.name || '';
  const year  = (item.release_date || item.first_air_date || '').slice(0, 4);
  return {
    id:        item.id,
    mediaType: isTV ? 'tv' : 'movie',
    title,
    year,
    rating: item.vote_average ? item.vote_average.toFixed(1) : '',
    poster: item.poster_path  ? `${IMG}${item.poster_path}` : '',
    genre:  isTV ? 'TV Show' : 'Movie',
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

// ── Fetch helper with realistic browser headers ──────────
// Redirects are NOT followed: a 3xx response raises an error so
// an allowlisted URL can't bounce us to an arbitrary host.
async function fetchPage(url) {
  const resp = await axios.get(url, {
    timeout: 15000,
    maxRedirects: 0,
    validateStatus: s => s >= 200 && s < 400,
    headers: {
      'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer':         ORIGIN,
      'DNT':             '1',
    },
  });
  if (resp.status >= 300) throw new Error('Upstream redirect not followed');
  return resp.data;
}

// ── Health check (used by Render) ────────────────────────
app.get('/health', (_, res) => res.json({ ok: true }));

// ── Redirect old /flixbaba.html URL to root ──────────────
app.get('/flixbaba.html', (_, res) => res.redirect(301, '/'));

// ── Serve static frontend files from public/ only ────────
// HTML files: no-store so browsers always fetch the latest version
app.get('*.html', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// ── Serve Font Awesome from local node_modules ───────────
app.use('/fontawesome', express.static(
  path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free')
));

// ── API: TMDB-powered browse categories ──────────────────
app.get('/api/titles', async (req, res) => {
  if (!TMDB_KEY) return res.json({ ok: false, error: 'TMDB_API_KEY not configured', categories: {} });

  const cached = titlesCache.get('all');
  if (cached) return res.json(cached);

  try {
    const [trending, newReleases, action, comedy, scifi, drama] = await Promise.all([
      tmdb('/trending/all/week'),
      tmdb('/movie/now_playing'),
      tmdb('/discover/movie', { with_genres: 28,  sort_by: 'popularity.desc' }),
      tmdb('/discover/movie', { with_genres: 35,  sort_by: 'popularity.desc' }),
      tmdb('/discover/movie', { with_genres: 878, sort_by: 'popularity.desc' }),
      tmdb('/discover/movie', { with_genres: 18,  sort_by: 'popularity.desc' }),
    ]);

    const payload = {
      ok: true,
      categories: {
        trending:    (trending.results    || []).slice(0, 20).map(mapItem),
        newReleases: (newReleases.results || []).slice(0, 20).map(mapItem),
        action:      (action.results      || []).slice(0, 20).map(mapItem),
        comedy:      (comedy.results      || []).slice(0, 20).map(mapItem),
        scifi:       (scifi.results       || []).slice(0, 20).map(mapItem),
        drama:       (drama.results       || []).slice(0, 20).map(mapItem),
      },
    };
    titlesCache.set('all', payload);
    res.json(payload);
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
});

// ── API: TMDB-powered search ──────────────────────────────
app.get('/api/search', async (req, res) => {
  if (!TMDB_KEY) return res.json({ ok: false, error: 'TMDB_API_KEY not configured', titles: [] });

  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ ok: false, error: 'Missing q param' });

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
  if (!url) return res.status(400).json({ ok: false, error: 'Missing url param' });

  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).json({ ok: false, error: 'Invalid URL' }); }

  const allowed = hostAllowed(parsed.hostname, 'flixbaba.mov') ||
                  hostAllowed(parsed.hostname, 'image.tmdb.org');
  if (!allowed) return res.status(403).json({ ok: false, error: 'Domain not allowed' });

  const cached = imageCache.get(url);
  if (cached) {
    res.set('Content-Type', cached.contentType);
    res.set('Cache-Control', 'public, max-age=300');
    return res.send(cached.buffer);
  }

  try {
    const upstream = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      maxRedirects: 0,
      maxContentLength: MAX_IMAGE_BYTES,
      validateStatus: s => s >= 200 && s < 400,
    });
    if (upstream.status >= 300) {
      return res.status(502).json({ ok: false, error: 'Upstream redirect not followed' });
    }
    const ct = upstream.headers['content-type'] || 'image/jpeg';
    if (!ct.startsWith('image/')) return res.status(415).json({ ok: false, error: 'Not an image' });

    const buffer = Buffer.from(upstream.data);
    imageCache.set(url, { contentType: ct, buffer });

    res.set('Content-Type', ct);
    res.set('Cache-Control', 'public, max-age=300');
    res.send(buffer);
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
});

// ── Proxy: fetch flixbaba.mov or vsembed.ru, strip ads, rewrite URLs ──
app.get('/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url param');

  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).send('Invalid URL'); }

  const isFlixbaba = hostAllowed(parsed.hostname, 'flixbaba.mov');
  const isVsembed  = hostAllowed(parsed.hostname, 'vsembed.ru');
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
      <h2>Could not load page</h2><p style="color:#9090b0">${escapeHtml(err.message)}</p>
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color:#8b5cf6">Open directly</a>
    </body></html>`);
  }
});

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nFlixBaba mirror running at http://localhost:${PORT}`);
  console.log(`Open your browser:  http://localhost:${PORT}/\n`);
});
