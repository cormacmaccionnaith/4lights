# The Four Lights — Na Ceithre Soilse

Marketing / storytelling website for **The Four Lights**, a prestige
open-water swimming challenge built around the four provinces of Ireland.
One lighthouse per province; each lighthouse anchors one certified 10 km+
crossing between the light and the mainland.

- **Fastnet Rock** — Munster — Fastnet Rock → Baltimore, Co. Cork
- **Black Head** — Connacht — Black Head → Salthill, Galway
- **Kish Bank** — Leinster — Kish Bank → Greystones, Co. Wicklow
- **Altacarry Head (Rathlin)** — Ulster — Altacarry Head → Ballycastle, Co. Antrim

This is a static, content-led site — no backend, database, accounts, or
payments. It is responsive and mobile-first.

## How it's built

The site is generated from content files by a tiny **zero-dependency**
Node script. There is no framework and no `npm install` step. The generated
HTML is committed, so the site also works as plain static files with no build
at all.

```
src/
  content/
    swims.js      ← the four swims: story, crossing, vitals, map config
    site.js       ← series name, homepage sections, contact details
  templates/
    layout.js     ← shared <head>, header, footer, logo/seal
    home.js       ← homepage sections
    swim.js       ← the shared swim-page template + route-map SVG
    contact.js    ← contact page + form
  build.js        ← reads content → renders templates → writes *.html
assets/
  css/style.css   ← the whole visual system (one file)
  js/main.js       ← progressive enhancement only (nav, reveal, form)
  img/favicon.svg
index.html, fastnet.html, black-head.html, kish-bank.html,
altacarry-head.html, contact.html   ← generated output (committed)
```

## Editing the copy

All prose lives in `src/content/`. **This is the single source of truth** —
edit the text there, then rebuild:

```bash
node src/build.js        # or: npm run build
```

Each swim is one object in `src/content/swims.js` with clearly named fields
(`story`, `crossing`, `distance`, `built`, `map`, …). Editing history or
narrative text is just editing strings in that file; you never touch HTML.

## Previewing locally

Any static file server works, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Design notes

- **Palette** — deep ink navy, granite grey, off-white text, one warm amber
  accent reserved for the lighthouse "beam" motif (see the CSS custom
  properties at the top of `assets/css/style.css`).
- **Type** — Fraunces (display serif, with system-serif fallback) for
  headings; Inter / system sans for body.
- **Beam motif** — a slow rotating beam in the hero, a sweeping highlight on
  the section-divider rules, and an animated dashed line on each route map.
  All motion respects `prefers-reduced-motion`.
- **Maps** — each swim page has a stylised, non-interactive SVG route map
  (lighthouse → mainland) driven by the `map` field in the swim's content.

## Imagery

The build ships with the geometric seal/beam artwork only. Location
photography (moody, water-level / aerial shots of each light) is to be sourced
separately and dropped into `assets/img/`, then referenced from the templates.

## Contact form

The contact form is a plain `mailto:` submission with client-side validation —
appropriate for a static v1. To route submissions to a backend or form service
later, change the `action` in `src/templates/contact.js` and rebuild.
