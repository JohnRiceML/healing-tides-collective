// Curated, vetted-on-brand photo set.
// Brand spec: natural light, hands, plants, wood floors, real practice.
// Avoid spa-marketing clichés (lavender on sheets, laughing with salad, lotus on cliff).
// All photos verified via HEAD on 2026-04-26.

export type Photo = {
  src: string;
  alt: string;
  /** Tailwind object-position hint when the crop matters */
  position?: string;
};

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const photos = {
  treatmentTable: {
    src: u("1545205597-3d9d02c29597"),
    alt: "Quiet treatment room, soft window light",
  },
  acupuncture: {
    src: u("1559056199-641a0ac8b55e"),
    alt: "Acupuncture session, hands at work",
  },
  movement: {
    src: u("1506126613408-eca07ce68773"),
    alt: "Movement practice in warm afternoon light",
  },
  yogaStudio: {
    src: u("1544367567-0f2fcb009e0b"),
    alt: "Studio interior, mid-practice",
  },
  yogaLight: {
    src: u("1518609571773-39b7d303a87b"),
    alt: "A practitioner at the threshold of practice",
  },
  studioPlants: {
    src: u("1545389336-cf090694435e"),
    alt: "Studio interior with mature plants",
  },
  woodRoom: {
    src: u("1568667256549-094345857637"),
    alt: "Warm wood-floored room, natural light",
  },
  handsTea: {
    src: u("1593810451137-5dc55105dace"),
    alt: "Hands pouring tea, close",
  },
  handsBook: {
    src: u("1503676260728-1c00da094a0b"),
    alt: "Hands resting on an open book",
  },
  threshold: {
    src: u("1565008447742-97f6f38c985c"),
    alt: "Light through a quiet doorway",
  },
  courtyard: {
    src: u("1540575467063-178a50c2df87"),
    alt: "Outdoor courtyard at calm light",
  },
  fiddleLeaf: {
    src: u("1463320726281-696a485928c7"),
    alt: "Fiddle leaf, leaves up close",
  },
  treatmentQuiet: {
    src: u("1571902943202-507ec2618e8f"),
    alt: "Treatment room, between sessions",
  },
  practitionerHands: {
    src: u("1531214159280-079b95d26139"),
    alt: "Practitioner's hands, mid-cue",
  },
} as const;

export type PhotoKey = keyof typeof photos;
