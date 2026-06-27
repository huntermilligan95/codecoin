'use strict';

const express = require('express');
const axios   = require('axios');
const cheerio = require('cheerio');
const path    = require('path');

const app    = express();
const PORT   = process.env.PORT || 3000;
const ORIGIN = 'https://flixbaba.mov';

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

// ── Serve static frontend files ──────────────────────────
app.use(express.static(path.join(__dirname)));

// ── API: scrape & return titles ──────────────────────────
// GET /api/titles?path=/movies  (path defaults to homepage)
app.get('/api/titles', async (req, res) => {
  const subpath = (req.query.path || '').replace(/^\/+/, '');
  const url     = subpath ? `${ORIGIN}/${subpath}` : ORIGIN;

  try {
    const html = await fetchPage(url);
    const $    = cheerio.load(html);
    stripAds($);
    const titles = extractTitles($);
    res.json({ ok: true, source: url, count: titles.length, titles });
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json({ ok: false, error: err.message, hint: err.code === 'ENOTFOUND' ? 'Could not reach flixbaba.mov — check your connection.' : null });
  }
});

// ── API: proxy images from the source domain only ────────
// Prevents CORS issues when loading posters from flixbaba.mov
app.get('/api/image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  let parsed;
  try { parsed = new URL(url); } catch { return res.status(400).json({ error: 'Invalid URL' }); }

  // Restrict to the source domain only (SSRF guard)
  if (!parsed.hostname.endsWith('flixbaba.mov')) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

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

// ── API: search titles ───────────────────────────────────
// Proxies to the site's own search if it has one
app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing q param' });

  // Common search URL patterns for streaming sites — adjust if needed
  const searchUrls = [
    `${ORIGIN}/?s=${encodeURIComponent(q)}`,
    `${ORIGIN}/search/${encodeURIComponent(q)}`,
    `${ORIGIN}/search?q=${encodeURIComponent(q)}`,
  ];

  for (const url of searchUrls) {
    try {
      const html   = await fetchPage(url);
      const $      = cheerio.load(html);
      stripAds($);
      const titles = extractTitles($);
      if (titles.length > 0) return res.json({ ok: true, source: url, count: titles.length, titles });
    } catch (_) { continue; }
  }

  res.json({ ok: true, count: 0, titles: [], note: 'Search returned no results or site structure not recognized.' });
});

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nFlixBaba mirror running at http://localhost:${PORT}`);
  console.log(`Open your browser:  http://localhost:${PORT}/flixbaba.html\n`);
});
