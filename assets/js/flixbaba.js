'use strict';

// ── Movie Data ───────────────────────────────────────────
const MOVIES = {
  trending: [
    { id: 101, title: 'Shadow Protocol',   year: 2024, rating: '8.2', genre: 'Thriller',  dur: '2h 14m', desc: 'A rogue AI system begins manipulating world leaders, and a disgraced cyber-agent is the only one who can stop it before it rewrites history.', hue: '260,80%' },
    { id: 102, title: 'Neon Assassin',     year: 2024, rating: '7.8', genre: 'Action',    dur: '1h 55m', desc: 'In a future Tokyo ruled by megacorporations, a retired hitman is pulled back in when her daughter is taken.',                             hue: '340,70%' },
    { id: 103, title: 'The Last Garden',   year: 2024, rating: '8.5', genre: 'Drama',     dur: '2h 02m', desc: 'An elderly botanist uncovers a journal that leads her to a secret garden — and the family she never knew she had.',                    hue: '150,55%' },
    { id: 104, title: 'Starfall',          year: 2024, rating: '7.6', genre: 'Sci-Fi',    dur: '2h 18m', desc: 'When a meteor shower rains alien artifacts across Earth, a geologist races to solve the puzzle before a shadow government does.',       hue: '220,70%' },
    { id: 105, title: 'Bitter Sweet',      year: 2024, rating: '7.2', genre: 'Comedy',    dur: '1h 48m', desc: 'Two rival pastry chefs are forced to share a kitchen for a national competition, with deliciously unexpected results.',                 hue: '30,80%'  },
    { id: 106, title: 'Crimson Horizon',   year: 2024, rating: '7.9', genre: 'Action',    dur: '1h 58m', desc: 'A marine biologist discovers an ancient civilization beneath the Pacific — and a deadly secret that nations will kill to protect.',     hue: '0,70%'   },
    { id: 107, title: 'Hollow Moon',       year: 2024, rating: '8.1', genre: 'Horror',    dur: '1h 42m', desc: 'A family moves into a lunar research station only to discover the previous crew did not leave — they were taken.',                     hue: '240,30%' },
    { id: 108, title: 'Velocity',          year: 2024, rating: '7.4', genre: 'Action',    dur: '1h 50m', desc: 'When quantum physics meets underground racing, one driver must outrun the laws of physics itself to save his crew.',                  hue: '190,75%' },
  ],
  newReleases: [
    { id: 201, title: 'The Cartographer', year: 2024, rating: '8.3', genre: 'Adventure', dur: '2h 08m', desc: 'A 19th-century mapmaker ventures into unmapped territory and discovers a civilization that should not exist.',                         hue: '40,65%'  },
    { id: 202, title: 'Echo Chamber',     year: 2024, rating: '7.7', genre: 'Thriller',  dur: '1h 52m', desc: 'A journalist investigating online radicalization discovers her own past is intertwined with the movement she is exposing.',            hue: '200,60%' },
    { id: 203, title: 'Parallel Lives',   year: 2024, rating: '8.0', genre: 'Sci-Fi',    dur: '2h 05m', desc: 'Two versions of the same person from parallel timelines must cooperate to prevent the collapse of both their worlds.',                hue: '280,65%' },
    { id: 204, title: 'Wild Bloom',       year: 2024, rating: '7.5', genre: 'Romance',   dur: '1h 44m', desc: 'A florist and a landscape architect butt heads over a historic estate renovation — until they find common ground.',                   hue: '320,65%' },
    { id: 205, title: 'The Translator',   year: 2024, rating: '8.4', genre: 'Drama',     dur: '2h 12m', desc: 'A UN interpreter becomes the only witness to a murder and must navigate political immunity to bring justice.',                         hue: '170,55%' },
    { id: 206, title: 'Dark Matter',      year: 2024, rating: '7.8', genre: 'Sci-Fi',    dur: '1h 57m', desc: 'A physicist wakes up in a lab with no memory and must piece together how she got there before the experiment continues.',             hue: '250,55%' },
    { id: 207, title: 'The Crossing',     year: 2024, rating: '7.6', genre: 'Drama',     dur: '1h 48m', desc: 'Refugees from five different nations find themselves stranded together in a border town during a historic blizzard.',                 hue: '210,50%' },
    { id: 208, title: 'Night Market',     year: 2024, rating: '7.9', genre: 'Thriller',  dur: '1h 55m', desc: 'An undercover agent infiltrates an underground auction of rare artifacts and uncovers a global conspiracy.',                           hue: '20,60%'  },
  ],
  action: [
    { id: 301, title: 'Iron Fist',        year: 2023, rating: '7.5', genre: 'Action',    dur: '2h 05m', desc: 'A retired boxer returns to the ring to save his gym from a crime syndicate taking over his neighborhood.',                            hue: '10,70%'  },
    { id: 302, title: 'Blackout Protocol',year: 2023, rating: '8.0', genre: 'Thriller',  dur: '1h 58m', desc: 'A CIA analyst has 24 hours to prevent a coordinated attack on global power grids.',                                                   hue: '215,55%' },
    { id: 303, title: 'Shockwave',        year: 2023, rating: '7.3', genre: 'Action',    dur: '1h 52m', desc: 'A bomb disposal expert must defuse a series of explosives planted across a major city in under four hours.',                          hue: '35,70%'  },
    { id: 304, title: 'Ghost Strike',     year: 2023, rating: '7.7', genre: 'Action',    dur: '1h 48m', desc: 'An elite special forces unit must stop an invisible assassin from eliminating world leaders at a G7 summit.',                        hue: '240,40%' },
    { id: 305, title: 'Rogue State',      year: 2023, rating: '7.9', genre: 'Thriller',  dur: '2h 02m', desc: 'A diplomat discovers her host nation is planning a bioweapon attack and must alert the world from inside enemy territory.',          hue: '350,60%' },
    { id: 306, title: 'Combat Zone',      year: 2023, rating: '7.4', genre: 'Action',    dur: '1h 45m', desc: 'A photojournalist embedded with marines finds himself in the middle of an ambush that was an inside job.',                           hue: '90,40%'  },
    { id: 307, title: 'Red Line',         year: 2023, rating: '8.1', genre: 'Action',    dur: '2h 08m', desc: 'A train carrying dangerous cargo is hijacked, and a transit marshal must reclaim control with civilians on board.',                  hue: '0,80%'   },
    { id: 308, title: 'Steel Rain',       year: 2023, rating: '7.6', genre: 'Thriller',  dur: '1h 55m', desc: 'A mercenary hired to protect a weapons convoy discovers the real target is on the convoy itself.',                                   hue: '200,45%' },
  ],
  comedy: [
    { id: 401, title: 'Roommate Roulette',          year: 2023, rating: '7.0', genre: 'Comedy', dur: '1h 38m', desc: 'Four strangers are forced to share a one-bedroom apartment after a rental app glitch — chaos and friendship ensue.', hue: '50,75%'  },
    { id: 402, title: 'Wedding Planner\'s Dilemma', year: 2023, rating: '7.3', genre: 'Comedy', dur: '1h 44m', desc: 'A perfectionist wedding planner must organize three ceremonies in one weekend, each more chaotic than the last.',   hue: '310,65%' },
    { id: 403, title: 'Office Hours',               year: 2023, rating: '7.5', genre: 'Comedy', dur: '1h 35m', desc: 'When a tech startup accidentally hires a retired stand-up comedian as CEO, the office will never be the same.',     hue: '180,55%' },
    { id: 404, title: 'Family Recipe',              year: 2023, rating: '7.8', genre: 'Comedy', dur: '1h 52m', desc: 'A dysfunctional family discovers their late grandmother\'s secret cookbook — and her secret life as a chef.',        hue: '25,75%'  },
    { id: 405, title: 'Travel Bugs',                year: 2023, rating: '7.2', genre: 'Comedy', dur: '1h 40m', desc: 'Two travel influencers with opposite styles are paired for a round-the-world trip by their shared agency.',          hue: '160,60%' },
    { id: 406, title: 'The Interview',              year: 2023, rating: '7.4', genre: 'Comedy', dur: '1h 32m', desc: 'A series of increasingly absurd job interviews leads one candidate into a rabbit hole of corporate madness.',         hue: '260,55%' },
  ],
  scifi: [
    { id: 501, title: 'The Void Expedition', year: 2023, rating: '8.3', genre: 'Sci-Fi', dur: '2h 25m', desc: 'A crew of astronauts on a deep-space mission encounters a signal that could not have been sent by humans.', hue: '230,70%' },
    { id: 502, title: 'Neural Link',         year: 2023, rating: '8.0', genre: 'Sci-Fi', dur: '1h 58m', desc: 'When a neural interface becomes mandatory in a smart city, a technophobe discovers what it really connects to.', hue: '185,65%' },
    { id: 503, title: 'Time Fracture',       year: 2023, rating: '7.7', genre: 'Sci-Fi', dur: '2h 02m', desc: 'A physicist creates a device that shifts time by 48 hours, only to discover each jump creates a darker timeline.', hue: '270,60%' },
    { id: 504, title: 'Synthetic',           year: 2023, rating: '8.5', genre: 'Sci-Fi', dur: '2h 18m', desc: 'An android petitions for legal rights and personhood in a near-future America deeply divided on the question.', hue: '200,55%' },
    { id: 505, title: 'Colony Zero',         year: 2023, rating: '7.9', genre: 'Sci-Fi', dur: '2h 05m', desc: 'Survivors of a colony ship crash on an unknown planet and must build civilization under a hostile sun.', hue: '40,60%'  },
    { id: 506, title: 'The Upload',          year: 2023, rating: '7.6', genre: 'Sci-Fi', dur: '1h 52m', desc: 'A billionaire uploads his consciousness before death and fights to preserve his digital existence.', hue: '290,60%' },
  ],
  drama: [
    { id: 601, title: 'Letters to Nobody', year: 2023, rating: '8.4', genre: 'Drama', dur: '1h 58m', desc: 'A war veteran writes letters to the son of a man he could not save, and a profound connection unfolds across years.', hue: '210,50%' },
    { id: 602, title: 'The Verdict',       year: 2023, rating: '8.1', genre: 'Drama', dur: '2h 12m', desc: 'A small-town jury must decide the fate of a man everyone knows — in a trial that tears the community apart.', hue: '340,45%' },
    { id: 603, title: 'Inheritance',       year: 2023, rating: '7.9', genre: 'Drama', dur: '1h 52m', desc: 'When siblings reunite after their father\'s death, long-buried secrets challenge everything they believed.', hue: '30,55%'  },
    { id: 604, title: 'The River Between', year: 2023, rating: '8.2', genre: 'Drama', dur: '2h 05m', desc: 'Two families on opposite sides of a river in rural Kenya must cooperate during a drought to save their children.', hue: '140,50%' },
    { id: 605, title: 'Long Shadow',       year: 2023, rating: '7.7', genre: 'Drama', dur: '1h 48m', desc: 'A beloved athlete faces the end of his career and must build a life outside the identity that defined him.', hue: '220,45%' },
    { id: 606, title: 'Unbroken Ground',   year: 2023, rating: '8.0', genre: 'Drama', dur: '1h 55m', desc: 'A refugee family rebuilds their lives in a new country while navigating cultural identity and belonging.', hue: '160,45%' },
  ],
};

// ── TV Show Data ─────────────────────────────────────────
// tmdbId is used directly by the embed servers (videasy, vidsrc, etc.)
// epCounts: number of episodes per season in order
const TV_SHOWS = [
  { id: 701, type: 'tv', tmdbId: 1396,   title: 'Breaking Bad',     year: 2008, rating: '9.5', genre: 'Crime',   seasons: 5, epCounts: [7,13,13,13,16], dur: '5 Seasons', desc: 'A chemistry teacher turned methamphetamine producer partners with a former student in a quest for financial security.', hue: '35,70%'  },
  { id: 702, type: 'tv', tmdbId: 66732,  title: 'Stranger Things',  year: 2016, rating: '8.7', genre: 'Sci-Fi',  seasons: 4, epCounts: [8,9,8,9],       dur: '4 Seasons', desc: 'Kids in a small Indiana town uncover government experiments, supernatural forces, and a terrifying parallel dimension.', hue: '260,70%' },
  { id: 703, type: 'tv', tmdbId: 2316,   title: 'The Office',       year: 2005, rating: '8.9', genre: 'Comedy',  seasons: 9, epCounts: [6,22,25,14,26,26,24,24,25], dur: '9 Seasons', desc: 'A mockumentary following the employees of the Scranton, Pennsylvania branch of the Dunder Mifflin Paper Company.', hue: '50,60%'  },
  { id: 704, type: 'tv', tmdbId: 1399,   title: 'Game of Thrones',  year: 2011, rating: '9.2', genre: 'Drama',   seasons: 8, epCounts: [10,10,10,10,10,10,7,6], dur: '8 Seasons', desc: 'Noble families vie for control of the mythical land of Westeros while an ancient enemy rises after millennia of dormancy.', hue: '180,40%' },
  { id: 705, type: 'tv', tmdbId: 70523,  title: 'Dark',             year: 2017, rating: '8.8', genre: 'Sci-Fi',  seasons: 3, epCounts: [10,8,8],        dur: '3 Seasons', desc: 'A family saga with a supernatural twist set in a German town where missing children expose four families\' dark secrets.', hue: '220,50%' },
  { id: 706, type: 'tv', tmdbId: 60059,  title: 'Better Call Saul', year: 2015, rating: '8.9', genre: 'Crime',   seasons: 6, epCounts: [10,10,10,10,10,13], dur: '6 Seasons', desc: 'The prequel to Breaking Bad follows the transformation of small-time attorney Jimmy McGill into criminal lawyer Saul Goodman.', hue: '40,60%'  },
  { id: 707, type: 'tv', tmdbId: 87108,  title: 'Chernobyl',        year: 2019, rating: '9.4', genre: 'Drama',   seasons: 1, epCounts: [5],             dur: '1 Season',  desc: 'A dramatisation of the catastrophic 1986 nuclear disaster at the Chernobyl power station in Soviet Ukraine.', hue: '90,45%'  },
  { id: 708, type: 'tv', tmdbId: 60735,  title: 'The Flash',           year: 2014, rating: '7.6', genre: 'Action',  seasons: 9, epCounts: [23,23,23,23,22,23,18,20,13], dur: '9 Seasons', desc: 'Barry Allen gains superhuman speed after a particle accelerator explosion and becomes the fastest man alive.', hue: '200,70%' },
  { id: 709, type: 'tv', tmdbId: 94997,  title: 'House of the Dragon', year: 2022, rating: '8.5', genre: 'Drama',   seasons: 3, epCounts: [10,8,8],                   dur: '3 Seasons', desc: 'The story of House Targaryen, set 200 years before the events of Game of Thrones, following the Dance of the Dragons — a civil war for succession to the Iron Throne.', hue: '350,65%' },
];

// ── State ────────────────────────────────────────────────
let myList = JSON.parse(localStorage.getItem('fbMyList') || '[]');

// ── Helpers ──────────────────────────────────────────────
function posterGradient(hue) {
  const [h, sl] = hue.split(',');
  return `linear-gradient(160deg, hsl(${h},${sl},22%) 0%, hsl(${h},${sl},12%) 100%)`;
}

function posterIcon(genre) {
  const icons = {
    Thriller: 'fa-eye', Action: 'fa-bolt', Drama: 'fa-masks-theater',
    Comedy: 'fa-face-laugh', 'Sci-Fi': 'fa-rocket', Horror: 'fa-ghost',
    Adventure: 'fa-map', Romance: 'fa-heart',
  };
  return icons[genre] || 'fa-film';
}

function allMovies() {
  return [...Object.values(MOVIES).flat(), ...TV_SHOWS];
}

function findById(id) {
  return allMovies().find(m => m.id === id);
}

function saveList() {
  localStorage.setItem('fbMyList', JSON.stringify(myList));
}

function showToast(msg) {
  const t = document.getElementById('fbToast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function toggleWatchlist(id, btn) {
  const idx = myList.indexOf(id);
  if (idx === -1) {
    myList.push(id);
    const m = findById(id);
    showToast(`"${m.title}" added to My List`);
    btn && btn.classList.add('added');
    btn && (btn.innerHTML = '<i class="fa-solid fa-check"></i>');
  } else {
    myList.splice(idx, 1);
    const m = findById(id);
    showToast(`"${m.title}" removed from My List`);
    btn && btn.classList.remove('added');
    btn && (btn.innerHTML = '<i class="fa-solid fa-plus"></i>');
  }
  saveList();
}

// ── Card Builder ─────────────────────────────────────────
function buildCard(movie) {
  const inList    = myList.includes(movie.id);
  const posterUrl = `https://picsum.photos/seed/fb${movie.id}/300/450`;
  const card = document.createElement('div');
  card.className = 'fb-card';
  card.dataset.id = movie.id;

  card.innerHTML = `
    <img class="fb-card__poster" src="${posterUrl}" alt="${movie.title}" loading="lazy"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div class="fb-card__poster-placeholder" style="background:${posterGradient(movie.hue)};display:none">
      <i class="fa-solid ${posterIcon(movie.genre)}" style="font-size:2rem;opacity:.6;color:#fff"></i>
      <span style="color:rgba(255,255,255,.75);font-size:.72rem;line-height:1.3">${movie.title}</span>
    </div>
    <span class="fb-card__genre-tag">${movie.genre}</span>
    <button class="fb-card__watchlist-btn${inList ? ' added' : ''}" title="${inList ? 'Remove from' : 'Add to'} My List" data-id="${movie.id}">
      <i class="fa-solid ${inList ? 'fa-check' : 'fa-plus'}"></i>
    </button>
    <div class="fb-card__overlay">
      <div class="fb-card__play"><i class="fa-solid fa-play" style="margin-left:2px"></i></div>
      <div class="fb-card__title">${movie.title}</div>
      <div class="fb-card__info">
        <span class="rating"><i class="fa-solid fa-star"></i> ${movie.rating}</span>
        <span>${movie.year}</span>
        <span>${movie.dur}</span>
      </div>
    </div>
  `;

  card.querySelector('.fb-card__watchlist-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleWatchlist(movie.id, e.currentTarget);
  });

  card.addEventListener('click', () => openModal(movie.id));
  return card;
}

// ── Render Rows ──────────────────────────────────────────
function renderRow(trackId, movies) {
  const track = document.getElementById(trackId);
  if (!track) return;
  movies.forEach(m => track.appendChild(buildCard(m)));
}

function initRows() {
  renderRow('rowTvShows', TV_SHOWS);
  renderRow('rowTrending', MOVIES.trending);
  renderRow('rowNew',      MOVIES.newReleases);
  renderRow('rowAction',   MOVIES.action);
  renderRow('rowComedy',   MOVIES.comedy);
  renderRow('rowScifi',    MOVIES.scifi);
  renderRow('rowDrama',    MOVIES.drama);
}

// ── Row Scrolling ────────────────────────────────────────
function initRowArrows() {
  document.querySelectorAll('.fb-row__track-wrap').forEach(wrap => {
    const track = wrap.querySelector('.fb-row__track');
    wrap.querySelector('.fb-row__arrow--left').addEventListener('click', () => {
      track.scrollBy({ left: -600, behavior: 'smooth' });
    });
    wrap.querySelector('.fb-row__arrow--right').addEventListener('click', () => {
      track.scrollBy({ left: 600, behavior: 'smooth' });
    });
  });
}

// ── Hero ─────────────────────────────────────────────────
function showHeroSlide(idx) {
  if (!_heroSlides.length) return;
  _heroIdx = ((idx % _heroSlides.length) + _heroSlides.length) % _heroSlides.length;
  const m = _heroSlides[_heroIdx];

  const content = document.querySelector('.fb-hero__content');
  content.classList.add('fb-fade');

  setTimeout(() => {
    const bg = document.getElementById('heroBg');
    if (m.backdrop || m.poster) bg.style.backgroundImage = `url(${m.backdrop || m.poster})`;
    document.getElementById('heroTitle').textContent = m.title;
    document.getElementById('heroDesc').textContent  = m.desc;
    document.getElementById('heroMeta').innerHTML = `
      ${m.rating ? `<span class="fb-hero__rating"><i class="fa-solid fa-star"></i> ${m.rating}</span>` : ''}
      ${m.year   ? `<span>${m.year}</span>` : ''}
      <span class="fb-hero__genre">${m.genre}</span>
    `;
    document.getElementById('heroWatch').onclick = () => {
      if (m.tmdbId) openPlayer(m.title, m.tmdbId, m.mediaType, m.seasons || 1, m.epCounts || null);
      else document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
    };
    document.getElementById('heroMoreInfo').onclick = () => openLiveModal(m);
    content.classList.remove('fb-fade');
  }, 300);

  document.querySelectorAll('.fb-hero__dot').forEach((dot, i) => {
    dot.classList.toggle('fb-hero__dot--active', i === _heroIdx);
  });
}

function startHeroTimer() {
  if (_heroTimer) clearInterval(_heroTimer);
  _heroTimer = setInterval(() => showHeroSlide(_heroIdx + 1), 7000);
}

function initHeroSlides(slides) {
  _heroSlides = slides;
  const dotsEl = document.getElementById('heroDots');
  dotsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'fb-hero__dot' + (i === 0 ? ' fb-hero__dot--active' : '');
    dot.addEventListener('click', () => { showHeroSlide(i); startHeroTimer(); });
    dotsEl.appendChild(dot);
  });
  showHeroSlide(0);
  startHeroTimer();
}

function initHero() {
  const featured = MOVIES.trending[0];
  const bg = document.getElementById('heroBg');
  bg.style.backgroundImage = `url(https://picsum.photos/seed/fb${featured.id}hero/1600/900)`;

  document.getElementById('heroWatch').addEventListener('click', () => {
    document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('heroMoreInfo').addEventListener('click', () => {
    openModal(featured.id);
  });

  document.getElementById('heroPrev').addEventListener('click', () => {
    showHeroSlide(_heroIdx - 1);
    startHeroTimer();
  });
  document.getElementById('heroNext').addEventListener('click', () => {
    showHeroSlide(_heroIdx + 1);
    startHeroTimer();
  });

  const hero = document.getElementById('hero');
  hero.addEventListener('mouseenter', () => { if (_heroTimer) clearInterval(_heroTimer); });
  hero.addEventListener('mouseleave', () => { if (_heroSlides.length) startHeroTimer(); });
}

// ── Hero carousel state ──────────────────────────────────
let _heroSlides = [];
let _heroIdx    = 0;
let _heroTimer  = null;

// ── Player / Server Picker ───────────────────────────────
let _playerCtx = null;  // { tmdbId, mediaType, season, episode, seasons, epCounts }
let _activeServer = 1;

function embedUrl(mediaType, tmdbId, server, season, episode) {
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const se   = type === 'tv' ? `/${season}/${episode}` : '';
  switch (server) {
    case 1: return `https://player.videasy.net/${type}/${tmdbId}${se}`;
    case 2: return `https://vidsrc.to/embed/${type}/${tmdbId}${se}`;
    case 3: return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1${type === 'tv' ? `&s=${season}&e=${episode}` : ''}`;
    case 4: return `https://vidsrc.cc/v2/embed/${type}?tmdb=${tmdbId}${type === 'tv' ? `&season=${season}&episode=${episode}` : ''}`;
    case 5: return `https://embed.su/embed/${type}/${tmdbId}${se}`;
    default: return `https://player.videasy.net/${type}/${tmdbId}${se}`;
  }
}

function loadServer(n) {
  if (!_playerCtx) return;
  _activeServer = n;
  const frame   = document.getElementById('playerFrame');
  const loading = document.getElementById('playerLoading');
  const hint    = document.getElementById('playerSlowHint');

  if (loadServer._timer) clearTimeout(loadServer._timer);
  if (hint) hint.style.display = 'none';

  document.querySelectorAll('.fb-player__srv').forEach(b => {
    b.classList.toggle('fb-player__srv--active', +b.dataset.srv === n);
  });
  loading.style.display = 'flex';
  frame.src = '';
  frame.onload = () => {
    clearTimeout(loadServer._timer);
    loading.style.display = 'none';
    loadServer._timer = setTimeout(() => {
      if (hint) hint.style.display = 'inline';
    }, 12000);
  };
  loadServer._timer = setTimeout(() => { loading.style.display = 'none'; }, 15000);
  frame.src = embedUrl(_playerCtx.mediaType, _playerCtx.tmdbId, n, _playerCtx.season, _playerCtx.episode);
}

// ── Episode Dropdown Panel ───────────────────────────────
function epCountForSeason(s) {
  if (!_playerCtx || !_playerCtx.epCounts) return 20;
  return _playerCtx.epCounts[s - 1] || 20;
}

function updateEpToggle() {
  const toggle = document.getElementById('epToggle');
  const label  = document.getElementById('epToggleLabel');
  if (!_playerCtx || _playerCtx.mediaType !== 'tv') {
    toggle.style.display = 'none';
    return;
  }
  toggle.style.display = 'flex';
  label.textContent = `S${_playerCtx.season}  ·  E${_playerCtx.episode}`;
}

function buildEpPanel() {
  if (!_playerCtx || _playerCtx.mediaType !== 'tv') return;

  // Seasons column
  const seasonsEl = document.getElementById('epPanelSeasons');
  seasonsEl.innerHTML = '';
  for (let s = 1; s <= _playerCtx.seasons; s++) {
    const btn = document.createElement('button');
    btn.className = 'fb-ep-panel__season-btn' + (s === _playerCtx.season ? ' active' : '');
    btn.textContent = `S${s}`;
    btn.dataset.s = s;
    btn.addEventListener('click', () => {
      _playerCtx.season  = +btn.dataset.s;
      _playerCtx.episode = 1;
      buildEpPanel();
      updateEpToggle();
      loadServer(_activeServer);
    });
    seasonsEl.appendChild(btn);
  }

  // Heading
  document.getElementById('epPanelHeading').textContent = `Season ${_playerCtx.season}`;

  // Episodes grid
  const epsEl = document.getElementById('epPanelEpisodes');
  epsEl.innerHTML = '';
  const count = epCountForSeason(_playerCtx.season);
  for (let e = 1; e <= count; e++) {
    const btn = document.createElement('button');
    btn.className = 'fb-ep-panel__ep-btn' + (e === _playerCtx.episode ? ' active' : '');
    btn.textContent = e;
    btn.dataset.e = e;
    btn.addEventListener('click', () => {
      _playerCtx.episode = +btn.dataset.e;
      closeEpPanel();
      updateEpToggle();
      loadServer(_activeServer);
    });
    epsEl.appendChild(btn);
  }
}

function openEpPanel() {
  buildEpPanel();
  document.getElementById('epPanel').classList.add('open');
  document.getElementById('epToggle').classList.add('open');
}

function closeEpPanel() {
  document.getElementById('epPanel').classList.remove('open');
  document.getElementById('epToggle').classList.remove('open');
}

function toggleEpPanel() {
  if (document.getElementById('epPanel').classList.contains('open')) {
    closeEpPanel();
  } else {
    openEpPanel();
  }
}

function openPlayer(title, tmdbId, mediaType, seasons, epCounts) {
  const player  = document.getElementById('fbPlayer');
  const extLink = document.getElementById('playerExternal');
  document.getElementById('playerTitle').textContent = title;
  extLink.href = `https://vidsrc.to/embed/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}`;
  _playerCtx = { tmdbId, mediaType, season: 1, episode: 1, seasons: seasons || 1, epCounts: epCounts || null };
  player.classList.add('open');
  document.body.style.overflow = 'hidden';
  closeEpPanel();
  updateEpToggle();
  loadServer(1);
}

function closePlayer() {
  const player = document.getElementById('fbPlayer');
  const frame  = document.getElementById('playerFrame');
  player.classList.remove('open');
  frame.src = '';
  document.body.style.overflow = '';
  _playerCtx = null;
  closeEpPanel();
}

function initPlayer() {
  document.getElementById('closePlayer').addEventListener('click', closePlayer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closePlayer(); closeEpPanel(); } });
  document.querySelectorAll('.fb-player__srv').forEach(btn => {
    btn.addEventListener('click', () => loadServer(+btn.dataset.srv));
  });

  document.getElementById('epToggle').addEventListener('click', e => {
    e.stopPropagation();
    toggleEpPanel();
  });

  // Close panel when clicking outside toggle + panel
  document.addEventListener('click', e => {
    const panel  = document.getElementById('epPanel');
    const toggle = document.getElementById('epToggle');
    if (panel.classList.contains('open') && !panel.contains(e.target) && !toggle.contains(e.target)) {
      closeEpPanel();
    }
  });
}

// ── Modal ────────────────────────────────────────────────
function openModal(id) {
  const m = findById(id);
  if (!m) return;

  document.getElementById('modalTitle').textContent = m.title;
  document.getElementById('modalDesc').textContent = m.desc;
  const modalHero = document.getElementById('modalHero');
  modalHero.style.backgroundImage = `url(https://picsum.photos/seed/fb${m.id}hero/800/450)`;
  modalHero.style.backgroundSize = 'cover';
  modalHero.style.backgroundPosition = 'center';

  const inList = myList.includes(m.id);
  const addBtn = document.getElementById('modalAddList');
  addBtn.innerHTML = `<i class="fa-solid ${inList ? 'fa-check' : 'fa-plus'}"></i>`;
  addBtn.title = inList ? 'Remove from My List' : 'Add to My List';
  addBtn.onclick = () => {
    toggleWatchlist(m.id, null);
    const nowIn = myList.includes(m.id);
    addBtn.innerHTML = `<i class="fa-solid ${nowIn ? 'fa-check' : 'fa-plus'}"></i>`;
    addBtn.title = nowIn ? 'Remove from My List' : 'Add to My List';
  };

  document.getElementById('modalMeta').innerHTML = `
    <span style="color:#f59e0b;font-weight:700"><i class="fa-solid fa-star"></i> ${m.rating}</span>
    <span>${m.year}</span>
    <span style="background:rgba(139,92,246,.25);border:1px solid rgba(139,92,246,.4);color:#c4b5fd;padding:2px 10px;border-radius:99px;font-size:.78rem">${m.genre}</span>
    <span>${m.dur}</span>
  `;

  document.getElementById('modalTags').innerHTML = [m.genre, m.year, m.dur]
    .map(t => `<span class="fb-modal__tag">${t}</span>`).join('');

  const watchBtn = document.getElementById('modalWatch');
  if (m.tmdbId) {
    watchBtn.onclick = (e) => {
      e.preventDefault();
      closeModal();
      openPlayer(m.title, m.tmdbId, m.type === 'tv' ? 'tv' : 'movie', m.seasons, m.epCounts);
    };
  } else {
    watchBtn.onclick = (e) => {
      e.preventDefault();
      closeModal();
      showToast('Select a title from the catalog to watch in-app');
    };
  }

  document.getElementById('fbModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('fbModal').classList.remove('open');
  document.body.style.overflow = '';
}

function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ── Search ───────────────────────────────────────────────
function initSearch() {
  const toggle    = document.getElementById('searchToggle');
  const input     = document.getElementById('searchInput');
  const overlay   = document.getElementById('searchOverlay');
  const grid      = document.getElementById('searchResults');
  const noResults = document.getElementById('noResults');
  const closeBtn  = document.getElementById('closeSearch');
  const header    = document.querySelector('.fb-search-overlay__header span');

  let debounceTimer = null;
  let lastQuery     = '';
  let activeCtrl    = null;  // AbortController for in-flight request

  toggle.addEventListener('click', () => {
    input.classList.toggle('open');
    if (input.classList.contains('open')) input.focus();
    else { closeSearchOverlay(); input.value = ''; }
  });

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (!q) { closeSearchOverlay(); lastQuery = ''; return; }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(q), 450);
  });

  async function performSearch(q) {
    if (q === lastQuery) return;
    lastQuery = q;

    // Cancel any previous in-flight request
    if (activeCtrl) activeCtrl.abort();
    activeCtrl = new AbortController();

    header.textContent = `Searching ChillFlix for "${q}"…`;
    overlay.classList.add('open');
    noResults.classList.remove('visible');
    grid.innerHTML = `
      <div class="fb-search-loading">
        <div class="fb-player__spinner"></div>
        <span>Searching ChillFlix catalog…</span>
      </div>`;

    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: activeCtrl.signal,
      });
      const data = await res.json();
      grid.innerHTML = '';

      if (data.ok && data.titles && data.titles.length > 0) {
        header.textContent = `${data.titles.length} result${data.titles.length !== 1 ? 's' : ''} for "${q}" on FlixBaba`;
        data.titles.forEach((t, i) => grid.appendChild(buildLiveCard(apiToMovie(t, i))));
      } else if (!data.ok && data.error && data.error.includes('TMDB_API_KEY')) {
        header.textContent = `Search unavailable — TMDB_API_KEY not set on server`;
        noResults.classList.add('visible');
      } else {
        localSearch(q);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      // Network/server error — fall back to local catalog
      grid.innerHTML = '';
      localSearch(q);
    }
  }

  function localSearch(q) {
    const hits = allMovies().filter(m =>
      m.title.toLowerCase().includes(q.toLowerCase()) ||
      m.genre.toLowerCase().includes(q.toLowerCase()) ||
      String(m.year).includes(q)
    );
    header.textContent = hits.length
      ? `${hits.length} local result${hits.length !== 1 ? 's' : ''} for "${q}"`
      : `No results for "${q}"`;
    noResults.classList.toggle('visible', hits.length === 0);
    hits.forEach(m => grid.appendChild(buildCard(m)));
  }

  closeBtn.addEventListener('click', () => {
    closeSearchOverlay();
    input.classList.remove('open');
    input.value = '';
    lastQuery = '';
  });

  function closeSearchOverlay() {
    overlay.classList.remove('open');
  }
}

// ── Navbar scroll effect ─────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('fbNav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── My List nav link ─────────────────────────────────────
function initMyListLink() {
  document.getElementById('myListLink').addEventListener('click', e => {
    e.preventDefault();
    if (myList.length === 0) { showToast('Your list is empty — add some movies!'); return; }
    const grid = document.getElementById('searchResults');
    const overlay = document.getElementById('searchOverlay');
    const noResults = document.getElementById('noResults');
    grid.innerHTML = '';
    overlay.classList.add('open');
    noResults.classList.remove('visible');
    myList.map(findById).filter(Boolean).forEach(m => grid.appendChild(buildCard(m)));
    document.querySelector('.fb-search-overlay__header span').textContent = 'My List';
  });
}

// ── Live data from proxy server ──────────────────────────
// Titles fetched from the Node.js backend (which scrapes flixbaba.mov).
// Falls back gracefully to the hardcoded MOVIES data if the server is offline.

let LIVE_TITLES = [];  // populated after fetch

function liveHue(i) {
  const hues = ['260,70%','340,65%','150,55%','220,65%','30,75%','190,60%','270,60%','10,65%'];
  return hues[i % hues.length];
}

function apiToMovie(t, i) {
  const movie = {
    id:        `live-${i}`,
    tmdbId:    t.id,
    mediaType: t.mediaType || 'movie',
    title:     t.title,
    year:      t.year  || '',
    rating:    t.rating || '',
    genre:     t.genre || 'Movie',
    dur:       t.dur || '',
    desc:      t.desc  || `Watch "${t.title}" on ChillFlix.`,
    hue:       liveHue(i),
    poster:    t.poster   ? `/api/image?url=${encodeURIComponent(t.poster)}`   : '',
    backdrop:  t.backdrop ? `/api/image?url=${encodeURIComponent(t.backdrop)}` : '',
    link:      t.link  || 'https://flixbaba.mov',
  };
  if (t.seasons) movie.seasons = t.seasons;
  // Enrich with accurate per-season episode counts if the show is in our local list
  const known = TV_SHOWS.find(s => s.tmdbId === t.id);
  if (known) {
    movie.seasons  = known.seasons;
    movie.epCounts = known.epCounts;
    if (!movie.dur) movie.dur = known.dur;
  }
  return movie;
}

function buildLiveCard(movie) {
  const card = document.createElement('div');
  card.className = 'fb-card';
  card.dataset.id = movie.id;

  const posterHtml = movie.poster
    ? `<img class="fb-card__poster" src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';

  card.innerHTML = `
    ${posterHtml}
    <div class="fb-card__poster-placeholder" style="background:${posterGradient(movie.hue)};${movie.poster ? 'display:none' : ''}">
      <i class="fa-solid ${posterIcon(movie.genre)}" style="font-size:2rem;opacity:.6;color:#fff"></i>
      <span style="color:rgba(255,255,255,.75);font-size:.72rem;line-height:1.3">${movie.title}</span>
    </div>
    <span class="fb-card__genre-tag">${movie.genre}</span>
    <div class="fb-card__overlay">
      <div class="fb-card__play"><i class="fa-solid fa-play" style="margin-left:2px"></i></div>
      <div class="fb-card__title">${movie.title}</div>
      <div class="fb-card__info">
        ${movie.rating ? `<span class="rating"><i class="fa-solid fa-star"></i> ${movie.rating}</span>` : ''}
        ${movie.year   ? `<span>${movie.year}</span>` : ''}
        ${movie.dur    ? `<span>${movie.dur}</span>` : ''}
      </div>
    </div>
  `;

  card.addEventListener('click', () => openLiveModal(movie));
  return card;
}

function openLiveModal(movie) {
  document.getElementById('modalTitle').textContent = movie.title;
  document.getElementById('modalDesc').textContent  = movie.desc;

  const hero = document.getElementById('modalHero');
  const heroImg = movie.backdrop || movie.poster;
  if (heroImg) {
    hero.style.backgroundImage = `url(${heroImg})`;
    hero.style.backgroundSize  = 'cover';
    hero.style.backgroundPosition = 'center';
  } else {
    hero.style.background = posterGradient(movie.hue);
  }

  document.getElementById('modalMeta').innerHTML = `
    ${movie.rating ? `<span style="color:#f59e0b;font-weight:700"><i class="fa-solid fa-star"></i> ${movie.rating}</span>` : ''}
    ${movie.year   ? `<span>${movie.year}</span>` : ''}
    <span style="background:rgba(139,92,246,.25);border:1px solid rgba(139,92,246,.4);color:#c4b5fd;padding:2px 10px;border-radius:99px;font-size:.78rem">${movie.genre}</span>
  `;

  const watchBtn = document.getElementById('modalWatch');
  watchBtn.onclick = (e) => {
    e.preventDefault();
    closeModal();
    if (movie.tmdbId) {
      openPlayer(movie.title, movie.tmdbId, movie.mediaType, movie.seasons || 1, movie.epCounts);
    } else {
      showToast('Streaming not available for this title');
    }
  };

  document.getElementById('modalAddList').onclick = () => showToast(`"${movie.title}" saved!`);

  document.getElementById('modalTags').innerHTML = [movie.genre, movie.year]
    .filter(Boolean).map(t => `<span class="fb-modal__tag">${t}</span>`).join('');

  document.getElementById('fbModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function insertLiveRow(titles) {
  if (!titles.length) return;

  const main = document.getElementById('movies');
  const section = document.createElement('section');
  section.className = 'fb-row';
  section.id = 'rowLive';
  section.innerHTML = `
    <div class="fb-row__header">
      <h2 class="fb-row__title">
        <i class="fa-solid fa-satellite-dish" style="color:#22d3ee"></i>
        Live from ChillFlix
        <span style="font-size:.65rem;font-weight:400;color:#9090b0;margin-left:8px">${titles.length} titles</span>
      </h2>
      <a href="https://flixbaba.mov" target="_blank" rel="noopener" class="fb-row__see-all">
        Browse all <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
    <div class="fb-row__track-wrap">
      <button class="fb-row__arrow fb-row__arrow--left" aria-label="Scroll left"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="fb-row__track" id="rowLiveTrack"></div>
      <button class="fb-row__arrow fb-row__arrow--right" aria-label="Scroll right"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
  `;

  // Insert before the first existing row so it appears at the top
  main.insertBefore(section, main.firstElementChild);

  const track = section.querySelector('#rowLiveTrack');
  titles.forEach((t, i) => {
    const movie = apiToMovie(t, i);
    LIVE_TITLES.push(movie);
    track.appendChild(buildLiveCard(movie));
  });

  // Wire up the arrow buttons for this new row
  const wrap = section.querySelector('.fb-row__track-wrap');
  wrap.querySelector('.fb-row__arrow--left').addEventListener('click',  () => track.scrollBy({ left: -600, behavior: 'smooth' }));
  wrap.querySelector('.fb-row__arrow--right').addEventListener('click', () => track.scrollBy({ left:  600, behavior: 'smooth' }));

  showToast(`${titles.length} titles loaded live from ChillFlix`);
}


async function fetchLiveTitles() {
  try {
    const res  = await fetch('/api/titles', { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    if (!data.ok) {
      if (data.error && data.error.includes('TMDB_API_KEY')) {
        showToast('Add TMDB_API_KEY to Railway to load live titles');
      }
      return;
    }
    if (!data.categories) return;

    const rowMap = {
      tvShows:     'rowTvShows',
      trending:    'rowTrending',
      newReleases: 'rowNew',
      action:      'rowAction',
      comedy:      'rowComedy',
      scifi:       'rowScifi',
      drama:       'rowDrama',
    };

    let total = 0;
    for (const [key, trackId] of Object.entries(rowMap)) {
      const titles = data.categories[key] || [];
      if (!titles.length) continue;
      const track = document.getElementById(trackId);
      if (!track) continue;
      track.innerHTML = '';
      titles.forEach((t, i) => track.appendChild(buildLiveCard(apiToMovie(t, i))));
      total += titles.length;
    }

    // Populate hero carousel with top 7 trending titles
    const heroSlides = (data.categories.trending || [])
      .filter(t => t.backdrop || t.poster)
      .slice(0, 7)
      .map((t, i) => apiToMovie(t, i));
    if (heroSlides.length) initHeroSlides(heroSlides);

    if (total > 0) showToast(`${total} titles loaded from TMDB`);
  } catch (err) {
    showToast('Could not reach catalog server — showing sample data');
    console.error('fetchLiveTitles:', err);
  }
}

// ── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initRows();
  initRowArrows();
  initModal();
  initSearch();
  initNavScroll();
  initMyListLink();
  initPlayer();
  fetchLiveTitles();  // attempt live data; fails silently if server is offline
});
