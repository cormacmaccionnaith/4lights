/* Homepage body. */

const { SITE } = require("../content/site.js");
const { SWIMS } = require("../content/swims.js");
const { esc, seal, shortName } = require("./layout.js");

function cards() {
  return SWIMS.map(
    (s) => `
      <a class="lightcard reveal" href="${s.slug}.html" style="--i:${s.order}">
        <span class="lightcard__no">0${s.order}</span>
        <span class="lightcard__prov">${esc(s.province)}</span>
        <span class="lightcard__name">${esc(shortName(s))}</span>
        <span class="lightcard__epithet">${esc(s.epithet)}</span>
        <span class="lightcard__cross">${esc(s.fixed)} <span aria-hidden="true">⇄</span> ${esc(s.mainland)} <span class="lightcard__dist">${esc(s.distance)}</span></span>
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
        <h3 class="step__title">${esc(st.title)}</h3>
        <p class="step__body">${esc(st.body)}</p>
      </li>`
    )
    .join("");
}

function home() {
  const h = SITE.hero;
  return `
  <section class="hero" aria-labelledby="hero-h">
    <div class="hero__beam" aria-hidden="true"></div>
    <div class="hero__inner">
      <div class="hero__text">
        <p class="hero__kicker">${esc(h.kicker)}</p>
        <h1 class="hero__h" id="hero-h">${esc(h.heading)}</h1>
        <p class="hero__sub">${esc(h.sub)}</p>
        <div class="hero__actions">
          <a class="btn btn--beam" href="#the-four-lights">${esc(h.cta)}</a>
          <a class="btn btn--ghost" href="contact.html">Contact</a>
        </div>
      </div>
      <div class="hero__seal reveal">${seal()}</div>
    </div>
    <div class="hero__scroll" aria-hidden="true"><span></span></div>
  </section>

  <div class="beamrule" aria-hidden="true"></div>

  <section class="idea section" aria-labelledby="idea-h">
    <div class="wrap wrap--split">
      <div class="section__head">
        <p class="eyebrow">${esc(SITE.idea.title)}</p>
        <h2 class="section__lead" id="idea-h">${esc(SITE.idea.lead)}</h2>
      </div>
      <div class="prose">
        ${SITE.idea.body.map((p) => `<p>${esc(p)}</p>`).join("")}
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
        <p class="eyebrow">${esc(SITE.symmetry.title)}</p>
        <h2 class="section__lead" id="sym-h">${esc(SITE.symmetry.lead)}</h2>
      </div>
      <div class="prose">
        ${SITE.symmetry.body.map((p) => `<p>${esc(p)}</p>`).join("")}
        <ul class="provlist">
          ${SWIMS.map((s) => `<li><span class="provlist__prov">${esc(s.province)}</span><span class="provlist__light">${esc(shortName(s))}</span></li>`).join("")}
        </ul>
      </div>
    </div>
  </section>

  <section class="challenge section section--dark" aria-labelledby="ch-h">
    <div class="wrap">
      <div class="section__head section__head--center">
        <p class="eyebrow">${esc(SITE.challenge.title)}</p>
        <h2 class="section__lead" id="ch-h">${esc(SITE.challenge.lead)}</h2>
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
      <p class="eyebrow">${esc(SITE.cta.title)}</p>
      <h2 class="endcta__h" id="cta-h">${esc(SITE.cta.body)}</h2>
      <div class="hero__actions">
        <a class="btn btn--beam" href="contact.html">${esc(SITE.cta.primary)}</a>
        <a class="btn btn--ghost" href="${SWIMS[0].slug}.html">Start with ${esc(shortName(SWIMS[0]))}</a>
      </div>
    </div>
  </section>
`;
}

module.exports = { home };
