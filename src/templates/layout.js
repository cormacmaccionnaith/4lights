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
function seal() {
  const arcTop = "M 90,300 A 210,210 0 0 1 510,300";
  const arcBot = "M 510,300 A 210,210 0 0 1 90,300";
  return `
  <svg class="seal" viewBox="0 0 600 600" role="img" aria-label="${esc(SITE.irishName)} — ${esc(SITE.name)}">
    <defs>
      <path id="seal-arc-top" d="${arcTop}"/>
      <path id="seal-arc-bot" d="${arcBot}"/>
      <radialGradient id="seal-beam" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="var(--beam)" stop-opacity="0.55"/>
        <stop offset="1" stop-color="var(--beam)" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="300" cy="300" r="284" class="seal__ring seal__ring--outer"/>
    <circle cx="300" cy="300" r="252" class="seal__ring seal__ring--inner"/>
    <circle cx="300" cy="300" r="150" class="seal__glow" fill="url(#seal-beam)"/>
    <text class="seal__title"><textPath href="#seal-arc-top" startOffset="50%">${esc(SITE.irishName.toUpperCase())}</textPath></text>
    <text class="seal__sub"><textPath href="#seal-arc-bot" startOffset="50%">THE FOUR LIGHTS SWIM SERIES</textPath></text>
    <g class="seal__center" transform="translate(300 300)">
      <g class="seal__rays" aria-hidden="true">
        <path d="M0 -18 L120 -70 L120 -34 Z"/>
        <path d="M0 -18 L120 70 L120 34 Z" opacity="0.55"/>
        <path d="M0 -18 L-120 -70 L-120 -34 Z"/>
        <path d="M0 -18 L-120 70 L-120 34 Z" opacity="0.55"/>
      </g>
      <g fill="var(--paper)" transform="translate(0 -6)">
        <rect x="-11" y="-2" width="22" height="9" rx="1.5"/>
        <path d="M-9 7 h18 l4 58 h-26 Z"/>
        <rect x="-16" y="65" width="32" height="9" rx="2"/>
        <circle cx="0" cy="-14" r="6" fill="var(--beam)"/>
      </g>
    </g>
    <g class="seal__stars" fill="var(--beam)">
      <circle cx="300" cy="46" r="3.5"/>
      <circle cx="554" cy="300" r="3.5"/>
      <circle cx="300" cy="554" r="3.5"/>
      <circle cx="46" cy="300" r="3.5"/>
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
        <a href="contact.html">Contact page</a>
        <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>
      </div>
    </div>
    <p class="footer__legal">© <span data-year>2026</span> ${esc(SITE.name)}. Crossings ratified to open-water standards modelled on the Channel Swimming Association.</p>
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
