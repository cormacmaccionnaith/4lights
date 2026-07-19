#!/usr/bin/env node
/*
 * The Four Lights — static site generator (zero dependencies).
 *
 * Reads content from src/content/*.js, renders it through the templates
 * in src/templates/*.js, and writes plain static HTML to the project root.
 *
 * Usage:  node src/build.js
 *
 * The generated *.html files are committed so the site works without a
 * build step; re-run this whenever the content files change.
 */

const fs = require("fs");
const path = require("path");

const { layout } = require("./templates/layout.js");
const { home } = require("./templates/home.js");
const { swimPage } = require("./templates/swim.js");
const { contact } = require("./templates/contact.js");
const { rules } = require("./templates/rules.js");
const { SITE } = require("./content/site.js");
const { SWIMS } = require("./content/swims.js");

const ROOT = path.resolve(__dirname, "..");

function write(file, html) {
  fs.writeFileSync(path.join(ROOT, file), html);
  console.log("  ✓ " + file);
}

function build() {
  console.log("Building " + SITE.name + " …");

  write(
    "index.html",
    layout({
      title: "",
      description: SITE.hero.sub,
      active: "home",
      hero: true,
      body: home(),
    })
  );

  for (const s of SWIMS) {
    write(
      s.slug + ".html",
      layout({
        title: s.province + " · " + s.lighthouse.replace(/,.*$/, ""),
        description: s.epithet + " " + s.from + " to " + s.to + ", " + s.distance + ".",
        active: s.slug,
        body: swimPage(s),
      })
    );
  }

  write(
    "rules.html",
    layout({
      title: "Rules & Safety",
      description: SITE.rules.lead,
      active: "rules",
      body: rules(),
    })
  );

  write(
    "contact.html",
    layout({
      title: "Contact",
      description: SITE.contact.lead,
      active: "contact",
      body: contact(),
    })
  );

  write(
    "404.html",
    layout({
      title: "Off the chart",
      description: "That page could not be found.",
      active: "",
      body: `
  <section class="section endcta" aria-labelledby="nf-h">
    <div class="wrap endcta__inner">
      <p class="eyebrow">404 · Off the chart</p>
      <h1 class="endcta__h" id="nf-h">No light here. This page couldn't be found.</h1>
      <div class="hero__actions">
        <a class="btn btn--beam" href="index.html">Back to the series</a>
        <a class="btn btn--ghost" href="contact.html">Contact</a>
      </div>
    </div>
  </section>`,
    })
  );

  console.log("Done — " + (SWIMS.length + 4) + " pages.");
}

build();
