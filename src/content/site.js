/*
 * The Four Lights — global + homepage content.
 *
 * Single source of truth for the series name, homepage sections and
 * contact details. Edit here and re-run `node src/build.js`.
 */

const SITE = {
  name: "The Four Lights",
  irishName: "Na Ceithre Soilse",
  tagline: "Four provinces. Four lighthouses. Four swims.",
  email: "hello@thefourlights.ie",

  hero: {
    kicker: "The Four Lights Swim Series",
    heading: "Four provinces. Four lighthouses. Four swims.",
    sub: "A certified open-water challenge around the four corners of Ireland — each crossing more than ten kilometres, each anchored to a single light. Collect all four to hold the Four Lights.",
    cta: "See the four lights",
  },

  idea: {
    title: "The idea",
    lead: "One lighthouse per province. One long swim to each.",
    body: [
      "Ireland has four provinces. The Four Lights sets a single certified open-water swim in each — from a lighthouse standing off the coast to the mainland behind it. Every crossing is more than ten kilometres.",
      "The lighthouse is the fixed point; the line the swimmer takes across the water is their own. There is no course to follow and no set day to follow it on. There is only the light, the mainland, and the crossing between them.",
    ],
  },

  symmetry: {
    title: "The symmetry",
    lead: "Four lights, four provinces — a map of Ireland drawn in navigation lamps.",
    body: [
      "The series was built around a coincidence of geography that felt too neat to ignore. Take one significant light from each province and they fall, roughly, to the four points of the compass: Fastnet in the deep south of Munster, Black Head on the western edge of Connacht, the Kish off the eastern capital in Leinster, and Rathlin's East Light in the north of Ulster.",
      "Trace them and you have drawn the outline of the whole island in four crossings — the country reduced to its four hardest edges, and the swimmer asked to touch each one. That symmetry is the heart of the series. It is what turns four good swims into a single thing worth finishing.",
    ],
  },

  challenge: {
    title: "The challenge",
    lead: "No calendar. No mass start. Just you, a pilot, and the crossing — ratified to a standard.",
    steps: [
      {
        title: "Plan your own attempt",
        body: "There is no fixed date and no mass start. You choose your window and your line, and you engage a recognised pilot to put you on the water safely.",
      },
      {
        title: "Swim it clean",
        body: "Standard open-water rules: no wetsuit assistance to count as a full crossing, no touching the boat, no aids beyond what the sport allows. Just the swimmer and the water.",
      },
      {
        title: "Have it ratified",
        body: "Each crossing is verified by GPS track, pilot's log and independent observation — modelled on the ratification standards of the Channel Swimming Association.",
      },
      {
        title: "Hold the Four Lights",
        body: "Collect one light to be on the board. Collect all four — in any order, over any span of time — to hold the Four Lights.",
      },
    ],
  },

  cta: {
    title: "Begin",
    body: "Read each swim's story, then get in touch to talk through an attempt.",
    primary: "Contact",
  },

  contact: {
    title: "Contact",
    lead: "Interested in a light? Tell us which one.",
    body: [
      "The Four Lights is a small undertaking run by people who swim. If you are thinking about one of the crossings — or all four — we would like to hear from you. Tell us where you are with your open-water swimming and which light you have your eye on, and we will point you toward pilots, standards and the practicalities of an attempt.",
    ],
    emailNote: "Prefer email? Write to us directly:",
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SITE };
}
