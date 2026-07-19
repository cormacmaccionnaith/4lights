/* Contact page body. */

const { SITE } = require("../content/site.js");
const { SWIMS } = require("../content/swims.js");
const { esc, shortName } = require("./layout.js");

function contact() {
  const c = SITE.contact;
  const options = SWIMS.map(
    (s) => `<option value="${esc(shortName(s))} (${esc(s.province)})">${esc(shortName(s))} — ${esc(s.province)}</option>`
  ).join("");
  return `
  <section class="contact section" aria-labelledby="contact-h">
    <div class="wrap wrap--split">
      <div class="section__head">
        <p class="eyebrow">${esc(c.title)}</p>
        <h1 class="section__lead" id="contact-h">${esc(c.lead)}</h1>
        ${c.body.map((p) => `<p class="contact__intro">${esc(p)}</p>`).join("")}
        <p class="contact__email">${esc(c.emailNote)}<br>
          <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>
        </p>
      </div>

      <form class="cform" method="post" action="mailto:${esc(SITE.email)}" enctype="text/plain" novalidate>
        <div class="cform__row">
          <label for="cf-name">Name</label>
          <input id="cf-name" name="name" type="text" autocomplete="name" required>
          <span class="cform__err" data-err-for="cf-name"></span>
        </div>
        <div class="cform__row">
          <label for="cf-email">Email</label>
          <input id="cf-email" name="email" type="email" autocomplete="email" required>
          <span class="cform__err" data-err-for="cf-email"></span>
        </div>
        <div class="cform__row">
          <label for="cf-light">Which light? <span class="cform__opt">(optional)</span></label>
          <select id="cf-light" name="light">
            <option value="">Not sure yet — tell me more</option>
            <option value="All four — the Four Lights">All four — the Four Lights</option>
            ${options}
          </select>
        </div>
        <div class="cform__row">
          <label for="cf-message">Message</label>
          <textarea id="cf-message" name="message" rows="6" required></textarea>
          <span class="cform__err" data-err-for="cf-message"></span>
        </div>
        <button class="btn btn--beam" type="submit">Send</button>
        <p class="cform__status" role="status" aria-live="polite" data-form-status></p>
        <p class="cform__note">This form opens a message in your email app. If nothing happens, write to us directly at
          <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>.</p>
      </form>
    </div>
  </section>
`;
}

module.exports = { contact };
