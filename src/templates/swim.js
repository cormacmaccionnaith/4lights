/* Individual swim page body (shared template for all four). */

const { SWIMS } = require("../content/swims.js");
const { esc, shortName } = require("./layout.js");

// Build a stylised, non-interactive route map: mainland landmass, an
// offshore lighthouse mark, and the dashed lighthouse-to-mainland line.
function routeMap(s) {
  const m = s.map;
  const L = m.light;
  const D = m.land;
  const note = s.constraint ? "10 km+ · must finish in Co. Galway" : "10 km+ · either direction, land anywhere";
  return `
  <svg class="routemap" viewBox="0 0 400 400" role="img" aria-label="Route map: ${esc(m.lightLabel)} and the ${esc(s.mainlandShort)} mainland, over 10 km">
    <rect x="0" y="0" width="400" height="400" class="routemap__sea"/>
    <g class="routemap__grid" aria-hidden="true">
      <path d="M0 100 H400 M0 200 H400 M0 300 H400 M100 0 V400 M200 0 V400 M300 0 V400"/>
    </g>
    <path d="${m.landPath}" class="routemap__land"/>
    <g class="routemap__route" aria-hidden="true">
      <line x1="${L.x}" y1="${L.y}" x2="${D.x}" y2="${D.y}"/>
    </g>
    <g class="routemap__land-pt" transform="translate(${D.x} ${D.y})">
      <circle r="5"/>
      <text class="routemap__label" x="0" y="-12">${esc(m.landLabel)}</text>
    </g>
    <g class="routemap__light-pt" transform="translate(${L.x} ${L.y})">
      <g class="routemap__beam"><path d="M0 0 L34 -14 L34 14 Z"/></g>
      <circle r="6"/>
      <circle r="2.4" class="routemap__lamp"/>
      <text class="routemap__label routemap__label--light" x="0" y="-14">${esc(m.lightLabel)}</text>
    </g>
    <g class="routemap__compass" transform="translate(360 356)" aria-hidden="true">
      <circle r="16" class="routemap__compass-ring"/>
      <path d="M0 -12 L4 0 L0 12 L-4 0 Z"/>
      <text x="0" y="-19">N</text>
    </g>
    <text class="routemap__dist" x="200" y="384">${esc(note)}</text>
  </svg>`;
}

// Real nautical-chart image for the crossing, framed and clickable to full size.
function chartFigure(s) {
  return `<a class="chartframe" href="${s.chartSrc}" target="_blank" rel="noopener" aria-label="Open the full chart: ${esc(s.fixed)} to ${esc(s.typical)}">
        <img src="${s.chartSrc}" alt="Nautical chart of the crossing between ${esc(s.fixed)} and ${esc(s.typical)}, ${esc(s.water)}, with the route marked in red." loading="lazy" decoding="async">
        <span class="chartframe__hint" aria-hidden="true">View full chart</span>
      </a>`;
}

function vitals(s) {
  const items = [
    ["Distance", "10 km+", "accredited minimum"],
    ["The light", s.fixed, "fixed point · start or finish"],
    ["Mainland", s.mainlandShort, s.constraint ? "must finish here" : "either direction, land anywhere"],
    ["Water", s.water, s.province],
  ];
  return `
    <dl class="vitals">
      ${items
        .map(
          ([k, v, note]) => `
        <div class="vitals__item">
          <dt>${esc(k)}</dt>
          <dd>${esc(v)}</dd>
          <span class="vitals__note">${esc(note)}</span>
        </div>`
        )
        .join("")}
    </dl>`;
}

function others(current) {
  return SWIMS.filter((s) => s.slug !== current.slug)
    .map(
      (s) => `
      <a class="otherswim" href="${s.slug}.html">
        <span class="otherswim__no">0${s.order}</span>
        <span class="otherswim__name">${esc(shortName(s))}</span>
        <span class="otherswim__prov">${esc(s.province)}</span>
      </a>`
    )
    .join("");
}

function swimPage(s) {
  return `
  <article class="swim">
    <header class="swimhero" aria-labelledby="swim-h">
      <div class="swimhero__beam" aria-hidden="true"></div>
      <div class="wrap swimhero__inner">
        <p class="swimhero__no">Light 0${s.order} of Four · ${esc(s.province)}</p>
        <h1 class="swimhero__h" id="swim-h">${esc(shortName(s))}</h1>
        <p class="swimhero__sub">${esc(s.epithet)}</p>
        <p class="swimhero__meta">${esc(s.fixed)} <span aria-hidden="true">⇄</span> ${esc(s.mainland)} · ${esc(s.water)}</p>
      </div>
    </header>

    <section class="section section--tight" aria-label="The vitals">
      <div class="wrap">
        ${vitals(s)}
      </div>
    </section>

    <div class="beamrule" aria-hidden="true"></div>

    <section class="section" aria-labelledby="story-h">
      <div class="wrap wrap--split">
        <div class="section__head">
          <p class="eyebrow">The story</p>
          <h2 class="section__lead" id="story-h">${esc(s.epithet)}</h2>
          <p class="swim__built">${esc(s.built)}</p>
        </div>
        <div class="prose prose--lead">
          ${s.story.map((p) => `<p>${esc(p)}</p>`).join("")}
        </div>
      </div>
    </section>

    <section class="section section--dark" aria-labelledby="cross-h">
      <div class="wrap crossing">
        <div class="crossing__text">
          <p class="eyebrow">The crossing</p>
          <h2 class="section__lead" id="cross-h">Between ${esc(s.fixed)} and ${esc(s.mainland)}.</h2>
          <div class="prose">
            ${s.crossing.map((p) => `<p>${esc(p)}</p>`).join("")}
          </div>
        </div>
        <figure class="crossing__map${s.chartSrc ? " crossing__map--chart" : ""} reveal">
          ${s.chartSrc ? chartFigure(s) : routeMap(s)}
          <figcaption>${
            s.chartSrc
              ? `Admiralty chart — the crossing marked between ${esc(s.fixed)} and ${esc(s.typical)}. The lighthouse is the fixed point; direction and landfall are the swimmer's own.`
              : "The lighthouse is the fixed point. Direction and landfall are the swimmer's own."
          }</figcaption>
        </figure>
      </div>
    </section>

    <nav class="swimnav section" aria-label="The other lights">
      <div class="wrap">
        <p class="eyebrow section__head--center">The other lights</p>
        <div class="swimnav__grid">
          ${others(s)}
        </div>
        <a class="swimnav__home" href="index.html"><span aria-hidden="true">←</span> Back to the series</a>
      </div>
    </nav>
  </article>
`;
}

module.exports = { swimPage };
