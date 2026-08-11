export type JournalPresentation = {
  title: string
  description?: string
  seriesPosition?: number
  editorialContext?: string
  authorityEligible?: boolean
  showCrisisLink?: boolean
  editorialUpdatedAt?: string
}

const PRESENTATION: Record<string, JournalPresentation> = {
  'finding-a-therapist-in-minneapolis-and-st-paul-why-is-it-so-difficult': {
    title: 'Finding a Therapist in Minneapolis and Saint Paul',
    description:
      'Nora Hollenkamp on why finding a therapist in the Twin Cities can feel difficult, plus current paths to browse care or ask Healing Tides for help.',
    editorialContext:
      'Updated August 2026: Healing Tides’ practitioner directory and Get Matched experience are now live, and the earlier prelaunch language has been removed. Healing Tides does not currently guarantee automated credential verification; verify a professional license with the relevant licensing board.',
    showCrisisLink: true,
    editorialUpdatedAt: '2026-08-08',
  },
  'finding-reflection-in-the-season-what-cancer-season-is-teaching-me-about-slowing-down': {
    title: 'Finding Reflection in the Season',
    authorityEligible: false,
  },
  'somatic-series-part-1': {
    title: "When Your Mind Feels Safe but Your Body Doesn't: A Somatic Perspective",
    description:
      "Nora Hollenkamp's first-person introduction to body awareness, nervous-system language, and the mind-body connection in somatic practice.",
    seriesPosition: 1,
    editorialContext:
      "This is Nora's first-person educational reflection. The head, heart, and gut language in the article is a practical metaphor—not three literal brains or a diagnostic model.",
  },
  'somatic-series-part-2': {
    title: 'Polyvagal Theory: Understanding Three Nervous System States',
    description:
      'A plain-language look at three nervous-system states through the lens of Polyvagal Theory, with context on where the framework is scientifically debated.',
    seriesPosition: 2,
    editorialContext:
      'This article presents Polyvagal Theory as an educational framework. It is not a diagnostic test, and important parts of the theory remain the subject of scientific debate. The state labels and physiological lists below summarize that model; they are not established effects, treatment guidance, or promises about an individual body.',
  },
  'somatic-series-part-3': {
    title: 'Neuroception and Somatic Resources',
    description:
      'Nora Hollenkamp presents neuroception and somatic resources as educational concepts—not as diagnoses or guaranteed outcomes.',
    seriesPosition: 3,
    editorialContext:
      'Neuroception is a concept from Polyvagal Theory, not a diagnosis. Important parts of that theory remain scientifically disputed. Statements below about the body recalibrating, danger and safety responses, or what logic can do describe the article’s model—not settled physiological facts, treatment guidance, or promises about an individual body.',
  },
}

export const SOMATIC_SERIES = [
  {slug: 'somatic-series-part-1', title: PRESENTATION['somatic-series-part-1'].title},
  {slug: 'somatic-series-part-2', title: PRESENTATION['somatic-series-part-2'].title},
  {slug: 'somatic-series-part-3', title: PRESENTATION['somatic-series-part-3'].title},
] as const

export function journalPresentation(slug: string, fallbackTitle?: string | null) {
  return {
    title: PRESENTATION[slug]?.title ?? fallbackTitle?.trim() ?? 'Healing Tides Collective',
    description: PRESENTATION[slug]?.description,
    seriesPosition: PRESENTATION[slug]?.seriesPosition,
    editorialContext: PRESENTATION[slug]?.editorialContext,
    authorityEligible: PRESENTATION[slug]?.authorityEligible,
    showCrisisLink: PRESENTATION[slug]?.showCrisisLink,
    editorialUpdatedAt: PRESENTATION[slug]?.editorialUpdatedAt,
  }
}

export function isNoraAuthor(author?: {slug?: string | null; name?: string | null} | null) {
  return author?.slug === 'nora-hollenkamp' || author?.name?.trim() === 'Nora Hollenkamp'
}

export function cleanPerson(value?: string | null) {
  return value?.trim() || undefined
}

const THERAPY_COST_RELEVANT_SLUGS = new Set([
  'somatic-series-part-1',
  'somatic-series-part-2',
  'somatic-series-part-3',
  'finding-a-therapist-in-minneapolis-and-st-paul-why-is-it-so-difficult',
])

export function isTherapyCostRelevant(slug: string) {
  return THERAPY_COST_RELEVANT_SLUGS.has(slug)
}

const FIRST_CALL_WORKSHEET_RELEVANT_SLUGS = new Set([
  'finding-a-therapist-in-minneapolis-and-st-paul-why-is-it-so-difficult',
])

export function isFirstCallWorksheetRelevant(slug: string) {
  return FIRST_CALL_WORKSHEET_RELEVANT_SLUGS.has(slug)
}

type PortableTextLikeBlock = {
  _type?: string
  style?: string
  children?: Array<{text?: string}>
}

function blockText(block: PortableTextLikeBlock) {
  return (block.children ?? []).map((child) => child.text ?? '').join('').trim()
}

/** Presentation-only cleanup for known legacy CMS blocks; URLs and source records stay intact. */
export function journalBodyForDisplay<T>(slug: string, body?: T[] | null): T[] {
  if (!body) return []

  if (SOMATIC_SERIES.some((entry) => entry.slug === slug)) {
    // Each legacy Somatic entry starts with its old series H1 and a second title. The page shell
    // now supplies one descriptive H1, so displaying both blocks would repeat the title twice.
    return body.slice(2)
  }

  if (slug === 'finding-a-therapist-in-minneapolis-and-st-paul-why-is-it-so-difficult') {
    const stalePhrases = [
      'I am excited to bring this project to life',
      'We are beginning in Minneapolis',
      'That is why we are building a collective',
      'Stay tuned—we\'ll be connecting people',
    ]
    return body.filter((block) => {
      const text = blockText(block as PortableTextLikeBlock)
      return !stalePhrases.some((phrase) => text.includes(phrase))
    })
  }

  return body
}
