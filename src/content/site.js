/*
 * The Four Lights — global + homepage + rules content.
 *
 * Single source of truth for the series name, homepage sections, the
 * rules & safety page, and contact details. Edit here and re-run
 * `node src/build.js`.
 */

const SITE = {
  name: "The Four Lights",
  irishName: "Na Ceithre Soilse",
  tagline: "Four provinces. Four lighthouses. Four swims.",
  email: "hello@thefourlights.ie",
  certBody: "ILDSA",
  certBodyFull: "Irish Long Distance Swimming Association",

  hero: {
    kicker: "The Four Lights Swim Series",
    heading: "Four provinces. Four lighthouses. Four swims.",
    sub: "An open-water challenge around the four corners of Ireland — each crossing more than ten kilometres, independently certified, each anchored to a single light. Collect all four to hold the Four Lights.",
    cta: "See the four lights",
  },

  idea: {
    title: "The idea",
    lead: "One lighthouse per province. One long swim to each.",
    body: [
      "Ireland has four provinces. The Four Lights sets one long open-water swim in each — a crossing between a lighthouse standing off the coast and the mainland behind it. Every crossing is accredited over more than ten kilometres.",
      "The lighthouse is the fixed point; everything else is the swimmer's. You may swim in either direction and come ashore anywhere on the mainland, so long as the swim begins or ends at the light and is certified over the full distance. There is no set course and no set day — only the light, the water, and the crossing you make of it.",
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
    lead: "No calendar. No mass start. You plan the swim, a third party certifies it, and you claim your light.",
    steps: [
      {
        title: "Plan your attempt",
        body: "There is no fixed date and no mass start. Choose your window, your direction and your line, and engage a recognised pilot to put you safely on the water.",
      },
      {
        title: "Swim it certified",
        body: "Every crossing must be independently observed and certified by a recognised third-party authority — in Ireland, typically the ILDSA. The Four Lights is not affiliated with them; we simply require their standard.",
      },
      {
        title: "Tell us first",
        body: "Notify us of an intended attempt before you go, so the swim can be recognised toward the series.",
      },
      {
        title: "Claim your light",
        body: "After a successful crossing, submit your certification to claim the light — within three months of the swim. Collect one to be on the board; collect all four to hold the Four Lights.",
      },
    ],
    more: "Read the full rules & safety",
  },

  cta: {
    title: "Begin",
    body: "Read each swim's story, then get in touch to talk through an attempt.",
    primary: "Contact",
  },

  rules: {
    title: "Rules & Safety",
    lead: "A challenge with a standard — certified by others, claimed through us.",
    intro: [
      "The Four Lights is a challenge, not a governing body. We set the four crossings and keep the record of who has held them; we do not run swims, provide safety cover, or ratify results ourselves. What follows is what a crossing must satisfy to count toward the series — and what you take on when you attempt one.",
    ],
    certification: {
      title: "Certification",
      body: [
        "Every crossing must be independently observed and certified by a recognised third-party open-water swimming authority. In Ireland this is typically the Irish Long Distance Swimming Association (ILDSA).",
        "The Four Lights is not affiliated with, endorsed by, or acting for the ILDSA or any other body. We recognise their ratification; we do not issue our own. Your swim counts toward the series once it has been certified to a recognised standard by one of these authorities.",
      ],
    },
    rulesList: [
      {
        title: "Certification",
        body: "Each crossing must be independently observed and certified by a recognised third-party authority (typically the ILDSA). We recognise the certifying body's ratification and do not ratify swims ourselves.",
      },
      {
        title: "The crossing",
        body: "The swim is between the lighthouse and the mainland. It may be made in either direction and may come ashore anywhere on the mainland, but it must begin or end at the lighthouse and be accredited over a distance of more than 10 km. The Black Head crossing must finish in Co. Galway.",
      },
      {
        title: "Aids",
        body: "Standard unassisted open-water rules apply, as defined by the certifying body: a textile swimsuit, one cap, goggles and grease. No wetsuit, flotation, fins or propulsion, and no supporting contact with the escort craft or any other person. Assisted or wetsuit swims may be logged, but do not count toward holding the Four Lights.",
      },
      {
        title: "Notification",
        body: "Tell us before you go. Notify The Four Lights of an intended attempt ahead of time — the light, your planned dates, your pilot and your certifying observer — so the swim can be recognised toward the series.",
      },
      {
        title: "Claiming your light",
        body: "After a successful crossing, submit your certification to us to claim the light. Claims must be made within three months of the swim. Each of the four lights is claimed separately; hold all four to hold the Four Lights.",
      },
    ],
    safety: {
      title: "Safety & logistics",
      body: [
        "These are serious open-water crossings in cold, tidal, exposed water. You attempt them entirely at your own risk. The Four Lights organises nothing on the water, provides no safety cover, and accepts no liability for any attempt, its outcome, or anything that happens in the course of it.",
        "Swim within your experience and follow best practice. A crossing should be made with a qualified pilot and a suitable escort craft, an independent observer, proper feeding and cold-water preparation, and the safety requirements of your certifying body. Make the local Coast Guard aware of your plans, carry appropriate communications, and be ready to call a swim at the pilot's word. The sea here does not negotiate.",
      ],
    },
    pilots: {
      title: "Pilots",
      body: "A ratified crossing needs a recognised pilot and a suitable escort craft. We are compiling a list of pilots for each of the four crossings.",
      holding: "Pilot details for each light are being compiled and will be listed here.",
      cta: "Pilot these waters? Get listed",
    },
  },

  contact: {
    title: "Contact",
    lead: "Interested in a light? Tell us which one.",
    body: [
      "The Four Lights is a small undertaking run by people who swim. If you are thinking about one of the crossings — or all four — we would like to hear from you. Tell us where you are with your open-water swimming and which light you have your eye on, and we will point you toward pilots, certification and the practicalities of an attempt.",
    ],
    emailNote: "Prefer email? Write to us directly:",
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SITE };
}
