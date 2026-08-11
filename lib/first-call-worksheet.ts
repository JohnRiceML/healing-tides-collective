export const MAX_WORKSHEET_FOCUSES = 4

export const WORKSHEET_FOCUSES = [
  {id: 'approach', label: 'How they work', description: 'Approach, early sessions, and feedback.'},
  {id: 'experience', label: 'Experience and fit', description: 'Background with concerns like yours.'},
  {id: 'respect', label: 'Pace, identity, and access', description: 'Consent, culture, accessibility, and room to pause.'},
  {id: 'logistics', label: 'Availability and format', description: 'Timing, frequency, telehealth, and in-person care.'},
  {id: 'cost', label: 'Cost and coverage', description: 'Fees, insurance, and cancellation policies.'},
  {id: 'somatic', label: 'Body-attuned care', description: 'What “somatic” means, including consent and touch.'},
] as const

export type WorksheetFocus = (typeof WORKSHEET_FOCUSES)[number]['id']
export type MeetingKind = 'consultation' | 'first-session' | 'unsure'
export type MeetingFormat = 'online' | 'in-person' | 'unsure'
export type PaymentKind = 'insurance' | 'self-pay' | 'unsure'

export type WorksheetContext = {
  meeting?: MeetingKind
  format?: MeetingFormat
  payment?: PaymentKind
}

export type WorksheetQuestion = {
  id: string
  phase: 'before' | 'during'
  text: string
  focuses?: WorksheetFocus[]
  meeting?: MeetingKind[]
  format?: MeetingFormat[]
  payment?: PaymentKind[]
}

const CORE_QUESTIONS: WorksheetQuestion[] = [
  {
    id: 'appointment-kind',
    phase: 'before',
    text: 'Is this an informational consultation or a clinical appointment, and is there a fee?',
  },
  {
    id: 'first-few-sessions',
    phase: 'during',
    text: 'What might the first few sessions look like?',
  },
  {
    id: 'feedback',
    phase: 'during',
    text: 'How do you invite feedback if something is not working for me?',
  },
  {
    id: 'next-step',
    phase: 'during',
    text: 'What would the next step be if we both decide to continue?',
  },
]

const OPTIONAL_QUESTIONS: WorksheetQuestion[] = [
  {
    id: 'approach',
    phase: 'during',
    focuses: ['approach'],
    text: 'How do you usually work with someone seeking support with something like this?',
  },
  {
    id: 'decide-focus',
    phase: 'during',
    focuses: ['approach'],
    text: 'How do you and the person you are working with decide what to focus on?',
  },
  {
    id: 'experience',
    phase: 'during',
    focuses: ['experience'],
    text: 'What experience and training do you have with concerns like mine?',
  },
  {
    id: 'referral',
    phase: 'during',
    focuses: ['experience'],
    text: 'When would you recommend a different practitioner or kind of care?',
  },
  {
    id: 'identity-access',
    phase: 'during',
    focuses: ['respect'],
    text: 'How do you adapt care for a person’s identity, culture, communication, or accessibility needs?',
  },
  {
    id: 'pause',
    phase: 'during',
    focuses: ['respect'],
    text: 'What happens if I need to slow down, pause, or decline an exercise?',
  },
  {
    id: 'availability',
    phase: 'before',
    focuses: ['logistics'],
    text: 'Are you accepting new clients, and how soon is the first available appointment?',
  },
  {
    id: 'frequency',
    phase: 'before',
    focuses: ['logistics'],
    text: 'How often do you usually meet when beginning?',
  },
  {
    id: 'format',
    phase: 'before',
    focuses: ['logistics'],
    text: 'Do you offer in-person care, telehealth, or both?',
  },
  {
    id: 'online-privacy',
    phase: 'before',
    format: ['online'],
    text: 'What should I know about privacy, technology, and a backup plan for an online session?',
  },
  {
    id: 'fee',
    phase: 'before',
    focuses: ['cost'],
    text: 'What are the fees for the first and ongoing appointments?',
  },
  {
    id: 'insurance',
    phase: 'before',
    focuses: ['cost'],
    payment: ['insurance'],
    text: 'Are you in network with my exact plan, and how should I verify that before booking?',
  },
  {
    id: 'self-pay',
    phase: 'before',
    focuses: ['cost'],
    payment: ['self-pay'],
    text: 'What written cost estimate can you provide before I book, and are reduced-fee openings available?',
  },
  {
    id: 'cancellation',
    phase: 'before',
    focuses: ['cost'],
    text: 'What is the cancellation or missed-appointment policy?',
  },
  {
    id: 'somatic-meaning',
    phase: 'during',
    focuses: ['somatic'],
    text: 'What do you mean by “somatic,” and what might that look like in a session?',
  },
  {
    id: 'somatic-consent',
    phase: 'during',
    focuses: ['somatic'],
    text: 'Is touch ever part of your work, and how do you ask for and revisit consent?',
  },
  {
    id: 'first-session',
    phase: 'before',
    meeting: ['first-session'],
    text: 'What paperwork or practical information should I expect before the first session?',
  },
]

function appliesToContext(question: WorksheetQuestion, context: WorksheetContext) {
  if (question.meeting && (!context.meeting || !question.meeting.includes(context.meeting))) return false
  if (question.format && (!context.format || !question.format.includes(context.format))) return false
  if (question.payment && (!context.payment || !question.payment.includes(context.payment))) return false
  return true
}

export function buildWorksheetQuestions(
  focuses: WorksheetFocus[],
  context: WorksheetContext,
): WorksheetQuestion[] {
  const selectedFocuses = [...new Set(focuses)].slice(0, MAX_WORKSHEET_FOCUSES)
  const selected = new Set(selectedFocuses)

  // The result must honor what the visitor explicitly chose before adding general prompts.
  // This prevents a later focus (for example, somatic care) from disappearing behind the cap.
  const onePerFocus = selectedFocuses.flatMap((focus) => {
    const question = OPTIONAL_QUESTIONS.find(
      (candidate) => candidate.focuses?.includes(focus) && appliesToContext(candidate, context),
    )
    return question ? [question] : []
  })
  const explicitContext = OPTIONAL_QUESTIONS.filter((question) => {
    const meetingMatch = Boolean(context.meeting && question.meeting?.includes(context.meeting))
    const formatMatch = Boolean(context.format && question.format?.includes(context.format))
    const paymentMatch = Boolean(context.payment && question.payment?.includes(context.payment))
    return appliesToContext(question, context) && (meetingMatch || formatMatch || paymentMatch)
  })
  const relevantOptional = OPTIONAL_QUESTIONS.filter((question) => {
    if (!appliesToContext(question, context)) return false
    if (!question.focuses) return true
    return question.focuses.some((focus) => selected.has(focus))
  })

  const combined = [
    CORE_QUESTIONS[0],
    ...onePerFocus,
    ...explicitContext,
    ...CORE_QUESTIONS.slice(1),
    ...relevantOptional,
  ]
  const unique = combined.filter(
    (question, index) => combined.findIndex((candidate) => candidate.id === question.id) === index,
  )

  // A useful default works even if someone skips every optional choice. Selected topics add
  // specificity, while the cap keeps the result calm enough to use during a real conversation.
  return unique.slice(0, selected.size === 0 && explicitContext.length === 0 ? 6 : 9)
}

export const AFTER_CALL_REFLECTIONS = [
  'I had room to ask questions.',
  'The answers were clear enough to understand.',
  'My limits and preferences were treated respectfully.',
  'The cost and schedule seem possible.',
  'I understand what the next step would be.',
  'I am curious about meeting again.',
] as const

export const ALL_WORKSHEET_QUESTIONS = [...CORE_QUESTIONS, ...OPTIONAL_QUESTIONS].filter(
  (question, index, all) => all.findIndex((candidate) => candidate.id === question.id) === index,
)
