/* Homepage body. */

const { SITE } = require("../content/site.js");
const { SWIMS } = require("../content/swims.js");
const { esc, ed, seal, shortName } = require("./layout.js");

function cards() {
  return SWIMS.map(
    (s) => `
      <a class="lightcard reveal" href="${s.slug}.html" style="--i:${s.order}">
        <span class="lightcard__prov">${esc(s.province)}</span>
        <span class="lightcard__name"${ed(`swim.${s.slug}.route`)}>${esc(s.route)}</span>
        <span class="lightcard__epithet"${ed(`swim.${s.slug}.epithet`)}>${esc(s.epithet)}</span>
        <span class="lightcard__cross">${esc(s.water)} <span class="lightcard__dist"${ed(`swim.${s.slug}.distance`)}>${esc(s.distance)}</span></span>
        <span class="lightcard__go">Read the swim <span aria-hidden="true">→</span></span>
      </a>`
  ).join("");
}

function steps() {
  return SITE.challenge.steps
    .map(
      (st, i) => `
      <li class="step reveal" style="--i:${i}">
        <span class="step__no">${i + 1}</span>
        <h3 class="step__title"${ed(`site.challenge.steps.${i}.title`)}>${esc(st.title)}</h3>
        <p class="step__body"${ed(`site.challenge.steps.${i}.body`)}>${esc(st.body)}</p>
      </li>`
    )
    .join("");
}

function film() {
  const v = SITE.video;
  if (!v || !v.youtubeId) return "";
  return `
  <section class="filmsection section section--dark" aria-labelledby="film-h">
    <div class="wrap">
      <div class="section__head section__head--center">
        <p class="eyebrow"${ed("site.video.kicker")}>${esc(v.kicker)}</p>
        <h2 class="section__lead" id="film-h"${ed("site.video.heading")}>${esc(v.heading)}</h2>
        ${v.sub ? `<p class="film__sub"${ed("site.video.sub")}>${esc(v.sub)}</p>` : ""}
      </div>
      <div class="filmframe reveal">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${esc(v.youtubeId)}?rel=0"
          title="${esc(v.title || v.heading)}"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen></iframe>
      </div>
    </div>
  </section>`;
}

function home() {
  const h = SITE.hero;
  return `
  <section class="hero" aria-labelledby="hero-h">
    <div class="hero__beam" aria-hidden="true"></div>
    <div class="hero__inner">
      <div class="hero__text">
        <p class="hero__kicker"${ed("site.hero.kicker")}>${esc(h.kicker)}</p>
        <h1 class="hero__h" id="hero-h"${ed("site.hero.heading")}>${esc(h.heading)}</h1>
        <p class="hero__sub"${ed("site.hero.sub")}>${esc(h.sub)}</p>
        <div class="hero__actions">
          <a class="btn btn--beam" href="#the-four-lights"${ed("site.hero.cta")}>${esc(h.cta)}</a>
          <a class="btn btn--ghost" href="contact.html">Contact</a>
        </div>
      </div>
      <div class="hero__seal reveal">${seal()}</div>
    </div>
    <div class="hero__scroll" aria-hidden="true"><span></span></div>
  </section>

  <div class="beamrule" aria-hidden="true"></div>

  ${film()}

  <div class="beamrule" aria-hidden="true"></div>

  <section class="idea section" aria-labelledby="idea-h">
    <div class="wrap wrap--split">
      <div class="section__head">
        <p class="eyebrow"${ed("site.idea.title")}>${esc(SITE.idea.title)}</p>
        <h2 class="section__lead" id="idea-h"${ed("site.idea.lead")}>${esc(SITE.idea.lead)}</h2>
      </div>
      <div class="prose">
        ${SITE.idea.body.map((p, i) => `<p${ed(`site.idea.body.${i}`)}>${esc(p)}</p>`).join("")}
      </div>
    </div>
  </section>

  <section class="four section section--dark" id="the-four-lights" aria-labelledby="four-h">
    <div class="wrap">
      <div class="section__head section__head--center">
        <p class="eyebrow">The four lights</p>
        <h2 class="section__lead" id="four-h">One light in each province. Four crossings to hold them all.</h2>
      </div>
      <div class="lightgrid">
        ${cards()}
      </div>
    </div>
  </section>

  <div class="beamrule" aria-hidden="true"></div>

  <section class="symmetry section" aria-labelledby="sym-h">
    <div class="wrap wrap--split">
      <div class="section__head">
        <p class="eyebrow"${ed("site.symmetry.title")}>${esc(SITE.symmetry.title)}</p>
        <h2 class="section__lead" id="sym-h"${ed("site.symmetry.lead")}>${esc(SITE.symmetry.lead)}</h2>
      </div>
      <div class="prose">
        ${SITE.symmetry.body.map((p, i) => `<p${ed(`site.symmetry.body.${i}`)}>${esc(p)}</p>`).join("")}
        <ul class="provlist">
          ${SWIMS.map((s) => `<li><span class="provlist__prov">${esc(s.province)}</span><span class="provlist__light">${esc(shortName(s))}</span></li>`).join("")}
        </ul>
      </div>
    </div>
  </section>

  <section class="challenge section section--dark" aria-labelledby="ch-h">
    <div class="wrap">
      <div class="section__head section__head--center">
        <p class="eyebrow"${ed("site.challenge.title")}>${esc(SITE.challenge.title)}</p>
        <h2 class="section__lead" id="ch-h"${ed("site.challenge.lead")}>${esc(SITE.challenge.lead)}</h2>
      </div>
      <ol class="steps">
        ${steps()}
      </ol>
      <div class="challenge__more">
        <a class="btn btn--ghost" href="rules.html">${esc(SITE.challenge.more)} <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>

  <section class="endcta section" aria-labelledby="cta-h">
    <div class="wrap endcta__inner">
      <p class="eyebrow"${ed("site.cta.title")}>${esc(SITE.cta.title)}</p>
      <h2 class="endcta__h" id="cta-h"${ed("site.cta.body")}>${esc(SITE.cta.body)}</h2>
      <div class="hero__actions">
        <a class="btn btn--beam" href="contact.html"${ed("site.cta.primary")}>${esc(SITE.cta.primary)}</a>
        <a class="btn btn--ghost" href="${SWIMS[0].slug}.html">Start with ${esc(shortName(SWIMS[0]))}</a>
      </div>
    </div>
  </section>
`;
}

module.exports = { home };
