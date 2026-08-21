/* Rules & Safety page body. */

const { SITE } = require("../content/site.js");
const { esc, ed } = require("./layout.js");

function rules() {
  const r = SITE.rules;

  const ruleItems = r.rulesList
    .map(
      (item, i) => `
      <li class="rule reveal" style="--i:${i}">
        <span class="rule__no">${String(i + 1).padStart(2, "0")}</span>
        <div class="rule__body">
          <h3 class="rule__title"${ed(`site.rules.rulesList.${i}.title`)}>${esc(item.title)}</h3>
          <p${ed(`site.rules.rulesList.${i}.body`)}>${esc(item.body)}</p>
        </div>
      </li>`
    )
    .join("");

  return `
  <header class="swimhero" aria-labelledby="rules-h">
    <div class="swimhero__beam" aria-hidden="true"></div>
    <div class="wrap swimhero__inner">
      <p class="swimhero__no">The Four Lights</p>
      <h1 class="swimhero__h" id="rules-h"${ed("site.rules.title")}>${esc(r.title)}</h1>
      <p class="swimhero__sub"${ed("site.rules.lead")}>${esc(r.lead)}</p>
    </div>
  </header>

  <section class="section section--tight" aria-label="Overview">
    <div class="wrap">
      <div class="prose prose--lead" style="max-width:46rem">
        ${r.intro.map((p, i) => `<p${ed(`site.rules.intro.${i}`)}>${esc(p)}</p>`).join("")}
      </div>
    </div>
  </section>

  <div class="beamrule" aria-hidden="true"></div>

  <section class="section" aria-labelledby="cert-h">
    <div class="wrap wrap--split">
      <div class="section__head">
        <p class="eyebrow"${ed("site.rules.certification.title")}>${esc(r.certification.title)}</p>
        <h2 class="section__lead" id="cert-h">Certified by others. Claimed through us.</h2>
      </div>
      <div class="prose">
        ${r.certification.body.map((p, i) => `<p${ed(`site.rules.certification.body.${i}`)}>${esc(p)}</p>`).join("")}
      </div>
    </div>
  </section>

  <section class="section section--dark" aria-labelledby="rulelist-h">
    <div class="wrap">
      <div class="section__head section__head--center">
        <p class="eyebrow">The rules</p>
        <h2 class="section__lead" id="rulelist-h">What a crossing must satisfy to count.</h2>
      </div>
      <ol class="rules">
        ${ruleItems}
      </ol>
    </div>
  </section>

  <div class="beamrule" aria-hidden="true"></div>

  <section class="section" aria-labelledby="safety-h">
    <div class="wrap wrap--split">
      <div class="section__head">
        <p class="eyebrow"${ed("site.rules.safety.title")}>${esc(r.safety.title)}</p>
        <h2 class="section__lead" id="safety-h">Serious water. Attempt at your own risk.</h2>
      </div>
      <div class="prose prose--lead">
        ${r.safety.body.map((p, i) => `<p${ed(`site.rules.safety.body.${i}`)}>${esc(p)}</p>`).join("")}
      </div>
    </div>
  </section>

  <section class="section section--dark" aria-labelledby="pilots-h">
    <div class="wrap">
      <div class="pilots">
        <div class="pilots__text">
          <p class="eyebrow"${ed("site.rules.pilots.title")}>${esc(r.pilots.title)}</p>
          <h2 class="section__lead" id="pilots-h"${ed("site.rules.pilots.body")}>${esc(r.pilots.body)}</h2>
        </div>
        <div class="pilots__panel">
          <p class="pilots__holding"><span class="pilots__badge">Coming soon</span><span${ed(
            "site.rules.pilots.holding"
          )}>${esc(r.pilots.holding)}</span></p>
          <a class="btn btn--beam" href="contact.html"${ed("site.rules.pilots.cta")}>${esc(r.pilots.cta)}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="endcta section" aria-labelledby="rcta-h">
    <div class="wrap endcta__inner">
      <p class="eyebrow">Begin</p>
      <h2 class="endcta__h" id="rcta-h">Planning an attempt? Tell us which light.</h2>
      <div class="hero__actions">
        <a class="btn btn--beam" href="contact.html">Contact</a>
        <a class="btn btn--ghost" href="index.html">The four lights</a>
      </div>
    </div>
  </section>
`;
}

module.exports = { rules };
