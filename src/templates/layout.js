/*
 * Shared page shell: <head>, site header, footer.
 * All pages are composed through layout().
 */

const { SITE } = require("../content/site.js");
const { SWIMS } = require("../content/swims.js");
const mark = require("./mark.js");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/*
 * Mark a piece of text as inline-editable. Emits a data attribute naming the
 * content path (e.g. "swim.fastnet.epithet", "site.idea.body.1"). Inert for
 * visitors — the editor only activates for a logged-in admin, when the server
 * injects the editing script into the page.
 */
function ed(path) {
  return ` data-ed="${esc(path)}"`;
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
        <a class="nav__link" href="/account">Account</a>
        <a class="nav__contact${active === "contact" ? " is-active" : ""}" href="contact.html">Contact</a>
      </div>
    </nav>`;
}

// Compact label for navigation, where the full route will not fit.
// Everywhere else the swim is referred to by its route (s.route).
function shortName(s) {
  return s.name || s.lighthouse.replace(/ Lighthouse.*$/, "").replace(/,.*$/, "");
}

// The mark — see src/templates/mark.js. One silhouette (the Fastnet tower
// and its four beams) serves the header, the footer, the hero seal and the
// swimmers' standing badges.
function logoMark() {
  return mark.logoMark();
}

function seal() {
  return mark.seal(SITE, esc);
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
          <p class="footer__tag"${ed("site.tagline")}>${esc(SITE.tagline)}</p>
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

module.exports = { layout, esc, ed, seal, logoMark, shortName };
