/*
 * Shared page shell: <head>, site header, footer.
 * All pages are composed through layout().
 */

const { SITE } = require("../content/site.js");
const { SWIMS } = require("../content/swims.js");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nav(active) {
  const links = SWIMS.map(
    (s) =>
      `<a class="nav__swim${active === s.slug ? " is-active" : ""}" href="${s.slug}.html"><span class="nav__prov">${esc(s.province)}</span>${esc(shortName(s))}</a>`
  ).join("");
  return `
    <nav class="nav" aria-label="Primary">
      <a class="nav__brand" href="index.html" aria-label="${esc(SITE.name)} — home">
        ${logoMark()}
        <span class="nav__brandtext">
          <span class="nav__brandirish">${esc(SITE.irishName)}</span>
          <span class="nav__brandname">${esc(SITE.name)}</span>
        </span>
      </a>
      <button class="nav__toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <div class="nav__menu" id="nav-menu">
        <div class="nav__swims">${links}</div>
        <a class="nav__link${active === "rules" ? " is-active" : ""}" href="rules.html">Rules</a>
        <a class="nav__contact${active === "contact" ? " is-active" : ""}" href="contact.html">Contact</a>
      </div>
    </nav>`;
}

function shortName(s) {
  // Trim the descriptive suffix for compact nav labels.
  return s.lighthouse.replace(/ Lighthouse.*$/, "").replace(/,.*$/, "");
}

// Compact inline lighthouse-and-beam mark used in the header/footer.
function logoMark() {
  return `
    <svg class="logomark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g class="logomark__beam">
        <path d="M24 17 L46 6 L46 28 Z" fill="url(#beamgrad)"/>
      </g>
      <defs>
        <linearGradient id="beamgrad" x1="24" y1="17" x2="46" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="var(--beam)" stop-opacity="0.85"/>
          <stop offset="1" stop-color="var(--beam)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <g fill="currentColor">
        <rect x="21" y="19" width="6" height="3" rx="0.6"/>
        <path d="M21.6 22 h4.8 l1.1 18 h-7 Z"/>
        <rect x="19.5" y="40" width="9" height="3" rx="0.8"/>
        <circle cx="24" cy="15.5" r="2.1" fill="var(--beam)"/>
      </g>
    </svg>`;
}

// Full circular seal, echoing the series emblem. Used on the homepage hero.
// Both text runs are traversed left→right (top arc sweeps over the top,
// bottom arc sweeps under the bottom) so both read upright.
function seal() {
  const arcTop = "M 45,300 A 255,255 0 0 1 555,300";
  const arcBot = "M 45,300 A 255,255 0 0 0 555,300";
  return `
  <svg class="seal" viewBox="0 0 600 600" role="img" aria-label="${esc(SITE.irishName)} — ${esc(SITE.name)}">
    <defs>
      <path id="seal-arc-top" d="${arcTop}"/>
      <path id="seal-arc-bot" d="${arcBot}"/>
      <radialGradient id="seal-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="var(--beam)" stop-opacity="0.5"/>
        <stop offset="1" stop-color="var(--beam)" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="seal-beamL" x1="300" y1="236" x2="150" y2="236" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="var(--beam)" stop-opacity="0.6"/>
        <stop offset="1" stop-color="var(--beam)" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="seal-beamR" x1="300" y1="236" x2="450" y2="236" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="var(--beam)" stop-opacity="0.6"/>
        <stop offset="1" stop-color="var(--beam)" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- rings -->
    <circle cx="300" cy="300" r="289" class="seal__ring seal__ring--outer"/>
    <circle cx="300" cy="300" r="281" class="seal__ring seal__ring--amber"/>
    <circle cx="300" cy="300" r="230" class="seal__ring seal__ring--inner"/>

    <!-- curved legends -->
    <text class="seal__title"><textPath href="#seal-arc-top" startOffset="50%">${esc(SITE.irishName.toUpperCase())}</textPath></text>
    <text class="seal__sub"><textPath href="#seal-arc-bot" startOffset="50%">THE FOUR LIGHTS SWIM SERIES</textPath></text>

    <!-- side separators between the legends -->
    <g class="seal__sep" fill="var(--beam)">
      <path d="M45 292 L52 300 L45 308 L38 300 Z"/>
      <path d="M555 292 L562 300 L555 308 L548 300 Z"/>
    </g>

    <!-- lamp glow -->
    <circle cx="300" cy="236" r="150" class="seal__glow" fill="url(#seal-glow)"/>

    <!-- rotating beam (the sweep) -->
    <g class="seal__beams" aria-hidden="true">
      <path d="M300 236 L468 214 L468 258 Z" fill="url(#seal-beamR)"/>
      <path d="M300 236 L132 214 L132 258 Z" fill="url(#seal-beamL)"/>
    </g>

    <!-- lighthouse -->
    <g class="seal__tower" aria-hidden="true">
      <!-- base rock -->
      <path d="M258 430 C274 420 326 420 342 430 C330 446 270 446 258 430 Z" class="seal__rock"/>
      <!-- tower -->
      <path d="M287 252 L313 252 L322 430 L278 430 Z" class="seal__fill"/>
      <!-- courses -->
      <g class="seal__band"><line x1="285" y1="300" x2="315" y2="300"/><line x1="283" y1="352" x2="317" y2="352"/><line x1="281" y1="404" x2="319" y2="404"/></g>
      <!-- door -->
      <path d="M293 430 L293 406 Q300 399 307 406 L307 430 Z" class="seal__dark"/>
      <!-- gallery -->
      <rect x="276" y="246" width="48" height="7" rx="1.5" class="seal__fill"/>
      <rect x="281" y="238" width="38" height="4" rx="1" class="seal__fill"/>
      <!-- lantern room -->
      <path d="M290 238 L310 238 L307 220 L293 220 Z" class="seal__fill"/>
      <!-- dome + finial -->
      <path d="M291 220 Q300 206 309 220 Z" class="seal__fill"/>
      <line x1="300" y1="206" x2="300" y2="199" class="seal__finial"/>
      <!-- lamp -->
      <circle cx="300" cy="230" r="6.5" fill="var(--beam)"/>
    </g>

    <!-- four province markers on the diagonals -->
    <g class="seal__marks" fill="var(--beam)">
      <circle cx="480" cy="120" r="3"/>
      <circle cx="480" cy="480" r="3"/>
      <circle cx="120" cy="480" r="3"/>
      <circle cx="120" cy="120" r="3"/>
    </g>
  </svg>`;
}

function footer() {
  const links = SWIMS.map(
    (s) => `<a href="${s.slug}.html">${esc(shortName(s))} <span>· ${esc(s.province)}</span></a>`
  ).join("");
  return `
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        ${logoMark()}
        <div>
          <p class="footer__irish">${esc(SITE.irishName)}</p>
          <p class="footer__name">${esc(SITE.name)}</p>
          <p class="footer__tag">${esc(SITE.tagline)}</p>
        </div>
      </div>
      <nav class="footer__nav" aria-label="Footer">
        <p class="footer__head">The four lights</p>
        ${links}
      </nav>
      <div class="footer__contact">
        <p class="footer__head">Get in touch</p>
        <a href="rules.html">Rules &amp; safety</a>
        <a href="contact.html">Contact page</a>
        <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>
      </div>
    </div>
    <p class="footer__legal">© <span data-year>2026</span> ${esc(SITE.name)}. Crossings are certified by recognised third-party open-water authorities (typically the ${esc(SITE.certBody)}), with which The Four Lights is not affiliated. Attempt at your own risk.</p>
  </footer>`;
}

function layout({ title, description, active, body, hero = false }) {
  const fullTitle = title ? `${title} — ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description || SITE.hero.sub)}">
  <meta name="theme-color" content="#0a1420">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description || SITE.hero.sub)}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
</head>
<body${hero ? ' class="has-hero"' : ""}>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">${nav(active)}</header>
  <main id="main">
${body}
  </main>
${footer()}
  <script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}

module.exports = { layout, esc, seal, logoMark, shortName };
