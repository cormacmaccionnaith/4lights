/*
 * The Four Lights — the mark.
 *
 * One silhouette, used everywhere: the nav logomark, the hero seal, the
 * favicon and a swimmer's standing badge are all the same drawing at
 * different weights.
 *
 * The tower is drawn from the Fastnet: a tall, slender wave-swept granite
 * tower with a concave taper flaring to a broad base, a double gallery
 * under the lantern, and lower courses built into the rock rather than
 * standing on a plinth. The lamp casts FOUR beams — one per light of the
 * series — and those beams are what light up as crossings are accredited.
 *
 * All geometry is authored in a 200x200 box; callers scale it.
 */

// --- palette (mirrors assets/css/style.css) --------------------------------
const C = {
  ink: "#08111c",
  ink2: "#0b1826",
  navy: "#0f2438",
  granite2: "#495a6b",
  mist: "#94a6ba",
  paper: "#f2efe7",
  beam: "#e2ac5b",
  beamSoft: "#f0c988",
};

// The lamp sits here; the four beams spring from it. Order: W, NW, NE, E.
const LAMP = { x: 100, y: 40 };
const BEAM_PATHS = [
  "M100 40 L6 27 L6 55 Z",
  "M100 40 L46 -10 L68 -16 Z",
  "M100 40 L154 -10 L132 -16 Z",
  "M100 40 L194 27 L194 55 Z",
];

// Wider wedges for the compact mark — the fine beams disappear below ~40px.
const BEAM_PATHS_BOLD = [
  "M100 40 L2 18 L2 64 Z",
  "M100 40 L36 -20 L72 -24 Z",
  "M100 40 L164 -20 L128 -24 Z",
  "M100 40 L198 18 L198 64 Z",
];

/*
 * The tower: the Fastnet's profile — a slender shaft with a concave taper
 * that flares hard in the last few courses, a double gallery under the
 * lantern, and a domed lantern room.
 *
 * `rock` sinks the base into the rock (large sizes); without it the tower
 * runs to a plain footing, which reads better once the detail is gone.
 */
function tower(fill, { rock = true, detail = true } = {}) {
  // Detailed: slender shaft sunk into the rock. Compact: the shaft flares
  // all the way to the foot of the badge, so the silhouette stays a taper
  // (narrow gallery over a broad base) rather than reading as an I-beam.
  const shaft = detail
    ? `<path d="M85 178 C85 158 90 138 92 110 C93 88 93 76 93.5 64 L106.5 64 C107 76 107 88 108 110 C110 138 115 158 115 178 Z"/>`
    : `<path d="M83 194 C83 174 90 158 92 118 C93 94 93 74 93 61 L107 61 C107 74 107 94 108 118 C110 158 117 174 117 194 Z"/>`;
  const galleries = detail
    ? `<rect x="81" y="57" width="38" height="6" rx="1.5"/>` + // main gallery, projecting
      `<rect x="88" y="47" width="24" height="4.5" rx="1.5"/>` // upper gallery
    : `<rect x="87" y="52" width="26" height="9" rx="2"/>`;
  const lantern = detail
    ? `<path d="M92.5 33 h15 v14 h-15 Z"/><path d="M92.5 33 Q100 23 107.5 33 Z"/>`
    : "";
  return `<g fill="${fill}">${shaft}${galleries}${lantern}</g>`;
}

// A low, jagged rock — the tower's lower courses are built into it.
function rockMass(fill) {
  return `<path d="M30 200 L52 179 L68 185 L84 171 L100 177 L118 169 L134 183 L150 177 L172 200 Z" fill="${fill}"/>`;
}

/*
 * The badge.
 *   lit     how many beams are alight (0–4); 4 adds the halo of the full series
 *   detail  draw the lantern and double gallery (drop it below ~40px)
 *   rock    sink the tower into the rock
 *   ring    "beam" | "muted" | "none"
 *   id      unique prefix — SVG ids must not collide on a page
 */
function badgeBody({ lit = 4, detail = true, rock = true, ring = "beam", id = "m", plate = C.ink2 } = {}) {
  const clip = `${id}-clip`;
  const halo = `${id}-halo`;
  const on = lit > 0;
  const ringStroke = ring === "muted" ? C.granite2 : C.beam;
  const towerFill = on ? C.paper : C.mist;

  const paths = detail ? BEAM_PATHS : BEAM_PATHS_BOLD;
  const beams = paths
    .map((d, i) => `<path d="${d}" fill-opacity="${i < lit ? (detail ? 0.55 : 0.62) : 0.09}"/>`)
    .join("");

  return `
    <defs>
      <clipPath id="${clip}"><circle cx="100" cy="100" r="93"/></clipPath>
      ${
        lit >= 4
          ? `<radialGradient id="${halo}" cx="0.5" cy="0.24" r="0.6">
               <stop offset="0" stop-color="${C.beam}" stop-opacity="0.4"/>
               <stop offset="1" stop-color="${C.beam}" stop-opacity="0"/>
             </radialGradient>`
          : ""
      }
    </defs>
    ${plate ? `<circle cx="100" cy="100" r="93" fill="${plate}"/>` : ""}
    <g clip-path="url(#${clip})">
      ${lit >= 4 ? `<circle class="mark__glow" cx="${LAMP.x}" cy="${LAMP.y}" r="88" fill="url(#${halo})"/>` : ""}
      <g class="mark__beams" fill="${C.beam}">${beams}</g>
      ${tower(towerFill, { rock, detail })}
      ${rock ? rockMass(on ? "rgba(148,166,186,0.22)" : "rgba(148,166,186,0.13)") : ""}
    </g>
    ${ring === "none" ? "" : `<circle cx="100" cy="100" r="93" fill="none" stroke="${ringStroke}" stroke-width="${
      ring === "muted" ? 2 : 2.5
    }"/>`}
    <circle cx="${LAMP.x}" cy="${LAMP.y}" r="${detail ? 4.6 : 7}" fill="${on ? C.beam : C.granite2}"/>
    ${on && detail ? `<circle cx="${LAMP.x}" cy="${LAMP.y}" r="1.9" fill="${C.beamSoft}"/>` : ""}`;
}

// Standalone badge SVG (used by the account app for a swimmer's standing).
function badge({ lit = 4, size = 96, detail = true, rock = true, ring = "beam", id = "m", label } = {}) {
  return `<svg class="mark mark--badge" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="${
    label || `${lit} of four lights`
  }">${badgeBody({ lit, detail, rock, ring, id })}</svg>`;
}

// Compact mark for the header and footer. No rock, no lantern detail.
function logoMark(id = "nav") {
  return `<svg class="logomark" viewBox="0 0 200 200" aria-hidden="true" focusable="false">${badgeBody({
    lit: 4,
    detail: false,
    rock: false,
    ring: "beam",
    id,
    plate: null,
  })}</svg>`;
}

/*
 * The hero seal: the same mark, given the full circular legend.
 * Drawn at 600x600 with the 200-unit mark scaled into the middle.
 */
function seal(SITE, esc) {
  const arcTop = "M 60,300 A 240,240 0 0 1 540,300";
  const arcBot = "M 60,300 A 240,240 0 0 0 540,300";
  return `
  <svg class="seal" viewBox="0 0 600 600" role="img" aria-label="${esc(SITE.irishName)} — ${esc(SITE.name)}">
    <defs>
      <path id="seal-arc-top" d="${arcTop}"/>
      <path id="seal-arc-bot" d="${arcBot}"/>
    </defs>

    <circle cx="300" cy="300" r="292" class="seal__ring seal__ring--outer"/>

    <text class="seal__title"><textPath href="#seal-arc-top" startOffset="50%">${esc(
      SITE.irishName.toUpperCase()
    )}</textPath></text>
    <text class="seal__sub"><textPath href="#seal-arc-bot" startOffset="50%">THE FOUR LIGHTS SWIM SERIES</textPath></text>

    <g class="seal__sep" fill="var(--beam)">
      <path d="M52 292 L60 300 L52 308 L44 300 Z"/>
      <path d="M548 292 L556 300 L548 308 L540 300 Z"/>
    </g>

    <g transform="translate(110 110) scale(1.9)">
      ${badgeBody({ lit: 4, detail: true, rock: true, ring: "beam", id: "seal", plate: "var(--ink-2)" })}
    </g>
  </svg>`;
}

module.exports = { badge, badgeBody, logoMark, seal, tower, BEAM_PATHS, C };
