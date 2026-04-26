// Vetted photo manifest. Every photo below was downloaded and viewed by eye
// before being added — Unsplash IDs alone don't tell you what the photo shows.
//
// Brand spec: natural light, hands at work, plants as architecture, warm wood,
// real practice, real interiors. Avoid spa-marketing clichés (lavender on
// sheets, women laughing with salad, lotus pose at sunset, hands-as-heart).

export type Photo = {
  src: string;
  alt: string;
};

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const photos = {
  /** Wide yoga studio interior, wood ceiling, warm afternoon light, no people. The "spacious" hero shot. */
  studio: {
    src: u("1687783615494-b4a1f1af8b58"),
    alt: "Yoga studio interior, wood ceiling, late afternoon light",
  },
  /** Real practice mid-cue: low lunge against floor-to-ceiling windows. The prAna confidence reference. */
  practice: {
    src: u("1611094607507-8c8173e5cf33"),
    alt: "A practitioner mid-practice in a window-lit studio",
  },
  /** Golden sunset across an antique writing desk with potted plants. Warm tech, warm wood. */
  desk: {
    src: u("1759710465485-7cb5fe4c57cc"),
    alt: "Sunset light across a writing desk with plants",
  },
  /** Quiet workspace: desk, window to greenery, vintage stereo, jacket on hook. Attic-workspace ref. */
  attic: {
    src: u("1687779018338-46d350ff2e6a"),
    alt: "A considered workspace, window open to a garden",
  },
  /** Close hand pouring ceramic pot onto a small dish, dark wood tray. Intimate, considered. */
  teaPour: {
    src: u("1727953441951-9fe96f561486"),
    alt: "A hand pouring tea from a ceramic pot",
  },
  /** Hands sprinkling tea leaves into a small clay vessel. Hands-at-work variation. */
  teaLeaves: {
    src: u("1540574866480-49b659e8c63f"),
    alt: "Hands measuring tea leaves into a clay pot",
  },
  /** Practitioner placing acupuncture needle on a patient's arm. Real treatment in progress. */
  acupuncture: {
    src: u("1700142360833-7ceb10b3f734"),
    alt: "A practitioner placing an acupuncture needle",
  },
  /** Woman in cream sweater from behind, soft warm window light. The seeker, the threshold. */
  threshold: {
    src: u("1767251798649-d1eacc83b782"),
    alt: "A person at the threshold of practice, warm window light",
  },
  /** Warm wood staircase with potted plant at the landing. Atmospheric, single pop of warm color. */
  landing: {
    src: u("1774215914981-6f00999bebef"),
    alt: "A wood staircase landing with a potted plant",
  },
  /** Woman seated in a plant-filled room with a window view to pines. Intimate, considered. */
  windowView: {
    src: u("1764082497081-a023b72c9239"),
    alt: "A person seated by a window, surrounded by plants",
  },
} as const;

export type PhotoKey = keyof typeof photos;
