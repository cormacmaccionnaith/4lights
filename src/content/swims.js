/*
 * The Four Lights — swim content.
 *
 * This file is the single source of truth for every swim's copy.
 * Editing the text here and re-running `node src/build.js` regenerates
 * the static HTML pages. Keep the historical / narrative text factual;
 * see the field notes in each entry.
 *
 * Field reference
 *   slug        URL + file name (e.g. "fastnet" -> fastnet.html)
 *   order       position in the series (1–4), used for numbering
 *   lighthouse  the light's proper name
 *   province    Irish province the light belongs to
 *   epithet     one short evocative line used on cards + headers
 *   water       body of water crossed
 *   from / to   the crossing, lighthouse -> mainland landing
 *   distance    indicative crossing distance (route is the swimmer's choice)
 *   built       one line on the tower's provenance
 *   story[]     paragraphs of researched historical / mythological narrative
 *   crossing[]  paragraphs of factual, practical description of the swim
 *   map         schematic route-map configuration (see src/templates/swim.js)
 */

const SWIMS = [
  {
    slug: "fastnet",
    order: 1,
    lighthouse: "Fastnet Rock Lighthouse",
    province: "Munster",
    epithet: "Ireland's Teardrop — the last of home for a century of emigrants.",
    water: "The Celtic Sea",
    from: "Fastnet Rock",
    to: "Baltimore, Co. Cork",
    distance: "≈ 13 km",
    built: "Current tower completed 1904 in Cornish granite.",
    story: [
      "The Irish knew the rock as Carraig Aonair — the lonely rock — long before the lighthouse. To the emigrants who sailed from Cobh and Baltimore through the nineteenth and twentieth centuries, it was something else again: the Fastnet was the last of Ireland they would ever see, dropping astern into the Atlantic as the ships turned for America. They called it Ireland's Teardrop.",
      "The first tower, cast iron and raised in 1854, was never a match for the open Atlantic. Storms drove spray clean over its lantern and cracked its fabric until it had to be abandoned. Its replacement — the tower that stands today — was built between 1896 and 1904 from dovetailed blocks of Cornish granite, each stone cut and trial-fitted on the mainland before being shipped out and set in place. It remains one of the great feats of rock-lighthouse engineering, and the tallest lighthouse in Ireland.",
      "To swim to the Fastnet is to reverse the emigrant's last look — to approach the teardrop from the sea and come home to the Cork coast behind it.",
    ],
    crossing: [
      "The crossing runs from the base of the rock north-east toward the sheltered harbour of Baltimore, threading the approaches to Roaringwater Bay and its scatter of islands. The line the swimmer takes is their own; the rock is the only fixed point.",
      "This is exposed Atlantic water. Swell arrives unbroken from the open ocean, and the tide sets hard around the rock itself, so the start is committed and the first kilometre honest. Once inside the islands the water quiets, but the Fastnet's weather can change the whole character of the swim within an hour. It rewards patience and a good pilot over speed.",
    ],
    map: {
      orientation: "landRight",
      lightLabel: "Fastnet Rock",
      landLabel: "Baltimore",
      landPath: "M300 20 L340 20 L340 380 L300 380 C296 320 320 300 312 250 C306 210 288 200 296 160 C304 120 284 90 300 60 Z",
      light: { x: 74, y: 232 },
      land: { x: 300, y: 150 },
    },
  },

  {
    slug: "black-head",
    order: 2,
    lighthouse: "Black Head Lighthouse",
    province: "Connacht",
    epithet: "A limestone light on the edge of the Burren, watching the liners in.",
    water: "Galway Bay",
    from: "Black Head, Co. Clare",
    to: "Salthill, Galway",
    distance: "≈ 11 km",
    built: "Established 1936 to guide transatlantic liners into Galway Bay.",
    story: [
      "Black Head stands where the Burren meets the sea — a headland of bare, terraced limestone karst on the northern shoulder of Co. Clare, grey stone running straight down into grey water. The lighthouse itself is modest: a squat white tower lit in 1936, far younger than the rock it stands on.",
      "Its purpose was transatlantic. In the age of the great liners, ships bound for and from America would call into Galway Bay and anchor offshore, and tenders would carry emigrants and mail out to them across open water. Black Head's light marked the northern edge of that approach, guiding the liners in past the Aran Islands to their anchorage. The stone is ancient; the light's work was thoroughly modern.",
      "The swim carries the swimmer across the same water those tenders rowed — from the old country's edge out toward the ships, and back.",
    ],
    crossing: [
      "The crossing leaves the limestone shelf below the lighthouse and heads south-east across the mouth of Galway Bay toward the promenade at Salthill, with the Aran Islands standing off to the west and the whole bay opening around the swimmer.",
      "Galway Bay is broad and Atlantic-fed, and its water can be moved briskly by both tide and the prevailing south-westerlies. Wind against tide raises a short, awkward chop across open fetch. It is a big-sky, big-water crossing — less about a single hazard than about holding a line across a wide, exposed bay.",
    ],
    map: {
      orientation: "landBottom",
      lightLabel: "Black Head",
      landLabel: "Salthill",
      landPath: "M20 300 L20 340 L380 340 L380 300 C320 296 300 320 250 314 C210 308 200 288 160 296 C120 304 90 284 60 300 Z",
      light: { x: 96, y: 78 },
      land: { x: 250, y: 300 },
    },
  },

  {
    slug: "kish-bank",
    order: 3,
    lighthouse: "Kish Bank Lighthouse",
    province: "Leinster",
    epithet: "No Victorian myth — a working light, floated out and stood upright over the sand.",
    water: "Dublin Bay",
    from: "Kish Bank",
    to: "Greystones, Co. Wicklow",
    distance: "≈ 12 km",
    built: "Telescopic concrete tower floated out and jacked upright, 1965.",
    story: [
      "The Kish is the modern light of the series, and wears it plainly. There is no Victorian keeper's tragedy here, no folklore worn smooth by retelling — only a notorious sandbank in the mouth of Dublin Bay that wrecked ships for centuries, and a twentieth-century answer to it.",
      "That answer was audacious in its own right. Rather than build on the shifting sand, engineers cast a telescopic concrete tower on the Dún Laoghaire shore in the early 1960s, floated the whole structure out to the bank, sank its base, and jacked the tower upward into position. It was lit in 1965 and has stood, unmanned since automation, ever since — a working navigation light for a working capital.",
      "It is fitting that Leinster's light should be the practical one: no myth, no granite epic, just a hard problem solved and a harbour kept open.",
    ],
    crossing: [
      "The crossing runs from the tower on the bank south-west toward the harbour at Greystones, quitting the shipping approaches of Dublin Bay for the Wicklow coast. The route is the swimmer's; the Kish is the mark.",
      "This is Irish Sea water, and the sea here works to a strong north–south tidal rhythm that must be read and timed rather than fought. Commercial traffic uses the same approaches, so the crossing is planned around it. The exposure is less brutal than the Atlantic swims, but the tides are unforgiving of a poorly chosen window.",
    ],
    map: {
      orientation: "landLeft",
      lightLabel: "Kish Bank",
      landLabel: "Greystones",
      landPath: "M100 20 L60 20 L60 380 L100 380 C104 320 80 300 88 250 C94 210 112 200 104 160 C96 120 116 90 100 60 Z",
      light: { x: 326, y: 210 },
      land: { x: 100, y: 250 },
    },
  },

  {
    slug: "altacarry-head",
    order: 4,
    lighthouse: "Altacarry Head Lighthouse, Rathlin",
    province: "Ulster",
    epithet: "The Sea of Moyle — Bruce's spider above, the Children of Lir below.",
    water: "The Sea of Moyle",
    from: "Altacarry Head, Rathlin Island",
    to: "Ballycastle, Co. Antrim",
    distance: "≈ 10 km",
    built: "East Light of Rathlin Island, first lit 1912.",
    story: [
      "Altacarry Head is the East Light of Rathlin, standing at the island's north-eastern tip above some of the most storied water in Ireland. In the cliffs directly below lies the cave where, by tradition, Robert the Bruce sheltered in the winter of 1306, a fugitive after defeat in Scotland. There, the story goes, he watched a spider try and fail and try again to bridge a gap with its thread — and, taking the lesson, returned to Scotland to win at Bannockburn. Bruce's presence on Rathlin in 1306 is a matter of record; the spider is the island's own.",
      "The channel itself is the Sea of Moyle, the narrow, tide-torn strait between Ireland and Scotland. In the oldest of the Irish myths it is here that the Children of Lir, changed to swans by their stepmother, endured three hundred years of storm — the cruellest stretch of their nine-hundred-year exile.",
      "No crossing in the series carries more weight of story, and none is harder-won.",
    ],
    crossing: [
      "The crossing runs from beneath the East Light south to the harbour at Ballycastle, straight across the Sea of Moyle. It is the shortest of the four on paper and, by common agreement, the hardest in the water.",
      "The Moyle is driven by the great tidal streams of the North Channel, which run fast and turn hard; the true swum distance is far longer than the straight line as the tide carries the swimmer up and down the coast. Cold, exposure and the sheer power of the water make the window narrow and the pilotage decisive. This is the tide-master's crossing — the one the whole series is measured against.",
    ],
    map: {
      orientation: "landBottom",
      lightLabel: "Altacarry Head",
      landLabel: "Ballycastle",
      landPath: "M20 300 L20 340 L380 340 L380 300 C330 296 305 316 260 308 C215 300 205 286 165 294 C122 302 92 282 60 298 Z",
      light: { x: 210, y: 74 },
      land: { x: 205, y: 300 },
    },
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SWIMS };
}
