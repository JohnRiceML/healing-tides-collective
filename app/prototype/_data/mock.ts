import type { Practitioner, Seeker } from "../_lib/types";

export const seekers: Seeker[] = [
  {
    id: "sk-001",
    firstName: "Maya",
    pronouns: "she/her",
    submittedAt: "2 hours ago",
    status: "New",
    modalities: ["Therapy", "Not sure yet"],
    story:
      "I lost my mother in February. I've been holding it together for everyone else and now my body is starting to give out — I can't sleep, my chest feels tight all the time. I had a therapist in college but haven't tried since. I'd like to find someone who has worked with grief but doesn't make me do a worksheet on it. I want to feel like a person, not a case.",
    location: "Brooklyn, NY",
    format: "Either",
    budget: "Out of pocket, ~$150/session. No insurance.",
    genderPreference: "A woman, if possible",
    availability: "Evenings after 6pm, or Fridays",
    urgency: "This month",
  },
  {
    id: "sk-002",
    firstName: "David",
    submittedAt: "Yesterday",
    status: "Reviewed",
    modalities: ["Acupuncture", "Movement"],
    story:
      "Chronic back pain from a fall 8 years ago. PT helped at the time but the pain crept back. I've been curious about acupuncture but every place I've called has felt like a chain. Looking for a real practitioner. Movement-wise I'm open to somatics or anything that isn't a CrossFit class.",
    location: "Jersey City, NJ",
    format: "In person",
    budget: "Some HSA funds. ~$200/session ok",
    availability: "Weekdays, flexible",
    urgency: "Open-ended",
  },
  {
    id: "sk-003",
    firstName: "Priya",
    pronouns: "she/her",
    submittedAt: "3 days ago",
    status: "Shortlist in progress",
    modalities: ["Trauma-informed support", "Therapy"],
    story:
      "I left a long relationship last year that I'm slowly realizing was more harmful than I'd let myself name. I've done CBT before and it felt like trying to argue my way out. I think I need someone trauma-informed, slower, who can sit with it. I am not in crisis. I just don't want to keep relearning the same thing.",
    location: "Remote (Hudson Valley)",
    format: "Virtual",
    budget: "Insurance: Aetna PPO. Open to out-of-network with reimbursement.",
    genderPreference: "No preference",
    availability: "Mornings before 10am",
    urgency: "Within a week",
    noraNotes:
      "Priya is articulate and self-aware. She's done the cognitive work — she needs a somatic / relational therapist now.",
  },
  {
    id: "sk-004",
    firstName: "Jordan",
    pronouns: "they/them",
    submittedAt: "5 days ago",
    status: "Introduced",
    modalities: ["Reiki", "Movement"],
    story:
      "I'm in a transition season — leaving a corporate job, possibly leaving the city. I'm not in crisis but I feel disconnected from my body. I'd like to try energy work and maybe gentle movement. Open to whatever feels right.",
    location: "Astoria, NY",
    format: "In person",
    budget: "Flexible",
    availability: "Weekends",
    urgency: "Open-ended",
  },
];

export const practitioners: Practitioner[] = [
  {
    id: "pr-001",
    name: "Dr. Elena Vasquez, LCSW",
    email: "elena@elenavasquez.co",
    website: "elenavasquez.co",
    location: "Brooklyn, NY · Virtual NY/NJ",
    modalities: ["Therapy"],
    specialties: ["Grief", "Maternal loss", "Existential therapy"],
    licenses: ["LCSW (NY, NJ)"],
    yearsExperience: 14,
    worksBestWith:
      "Adults navigating grief, late-life caregiving, and identity shifts after loss. Quiet, depth-oriented work.",
    notARightFitFor:
      "Acute crisis, active SI, or anyone seeking strictly CBT/manualized care.",
    traumaInformed:
      "Trained in IFS and somatic experiencing. Always lets the client set pace.",
    availability: "Tue/Thu evenings, Fri afternoons. 2 new clients/month.",
    status: "Approved",
    acceptingReferrals: true,
    bio: "Elena has practiced grief-focused therapy for 14 years. She came to the work after her own mother's death and writes about the messiness of mourning at her website.",
    referralHistory: [
      { id: "rh-1", seekerInitials: "M.K.", date: "Today", status: "Introduced" },
      { id: "rh-2", seekerInitials: "L.W.", date: "Apr 28", status: "Booked first session" },
    ],
  },
  {
    id: "pr-002",
    name: "Marcus Chen, L.Ac.",
    email: "marcus@stillpoint-acu.com",
    website: "stillpoint-acu.com",
    location: "Hoboken, NJ",
    modalities: ["Acupuncture"],
    specialties: ["Chronic pain", "Post-surgical recovery", "Sleep"],
    licenses: ["L.Ac. (NJ, NY)", "Dipl. O.M."],
    yearsExperience: 11,
    worksBestWith:
      "Adults with persistent musculoskeletal pain who've tried conventional care. Long sessions, careful intake.",
    notARightFitFor: "Anyone looking for a 20-minute community-style session.",
    traumaInformed:
      "Trained with NADA protocol. Particularly careful with body-touch consent and pacing.",
    availability: "Weekdays 9-5, occasional Saturday.",
    status: "Approved",
    acceptingReferrals: true,
    bio: "Marcus runs a small one-room practice in Hoboken. Eleven years of orthopedic-focused acupuncture, with a background in athletic training.",
    referralHistory: [
      { id: "rh-3", seekerInitials: "D.R.", date: "Yesterday", status: "Awaiting reply" },
    ],
  },
  {
    id: "pr-003",
    name: "Sara Lindgren, Reiki Master",
    email: "sara@quietharbor.studio",
    website: "quietharbor.studio",
    location: "Long Island City, NY",
    modalities: ["Reiki"],
    specialties: ["Energy work", "Burnout recovery", "Transition seasons"],
    licenses: ["Reiki Master (Usui lineage)", "Certified Sound Bath facilitator"],
    yearsExperience: 8,
    worksBestWith:
      "Clients in transition — leaving a career, ending a relationship, recovering from burnout. Calm, unhurried sessions.",
    notARightFitFor:
      "Anyone wanting mystical packaging or sweeping claims. Sara keeps the work grounded.",
    traumaInformed: "Yes — consent-first, opt-in touch only, lots of check-ins.",
    availability: "Wed/Fri/Sat. 4 new clients/month.",
    status: "Approved",
    acceptingReferrals: true,
    bio: "Sara left a marketing career in 2018 to train in Usui Reiki. She writes occasionally about energy work in plain language.",
    referralHistory: [
      { id: "rh-4", seekerInitials: "J.T.", date: "Last week", status: "Booked first session" },
    ],
  },
  {
    id: "pr-004",
    name: "Ana Ruiz",
    email: "ana@anaruizmovement.com",
    website: "anaruizmovement.com",
    location: "Brooklyn, NY · Virtual",
    modalities: ["Movement"],
    specialties: ["Somatic movement", "Restorative yoga", "Post-injury return"],
    licenses: ["E-RYT 500", "Certified Feldenkrais practitioner"],
    yearsExperience: 16,
    worksBestWith:
      "Adults rebuilding a relationship with their body — after injury, illness, or long sedentary stretches. Gentle, curious work.",
    notARightFitFor:
      "Athletic conditioning or weight-loss-oriented clients.",
    traumaInformed:
      "Extensive training in trauma-sensitive yoga (TCTSY). No physical adjustments.",
    availability: "Mornings and weekends.",
    status: "Approved",
    acceptingReferrals: true,
    bio: "Ana has taught movement for 16 years across yoga, Feldenkrais, and somatics. Her work is quiet and unfashionable in the best way.",
    referralHistory: [],
  },
  {
    id: "pr-005",
    name: "Dr. Naomi Park, PsyD",
    email: "naomi@parktherapy.co",
    website: "parktherapy.co",
    location: "Manhattan, NY · Virtual NY/CT/NJ",
    modalities: ["Therapy", "Trauma-informed support"],
    specialties: ["Complex trauma", "Relational trauma", "EMDR"],
    licenses: ["PsyD", "EMDR certified", "IFS Level 2"],
    yearsExperience: 17,
    worksBestWith:
      "Adults beginning to name relational or developmental trauma. Slow, somatic, relational. Welcomes clients who have tried CBT and bounced off.",
    notARightFitFor: "Short-term solution-focused work.",
    traumaInformed: "Primary clinical orientation.",
    availability: "Mornings before 10am, virtual. 1-2 new clients/month.",
    status: "Approved",
    acceptingReferrals: true,
    bio: "Naomi has spent the last decade focused exclusively on relational and complex trauma. She trained at NYU and now runs a small virtual practice.",
    referralHistory: [
      { id: "rh-5", seekerInitials: "P.S.", date: "2 days ago", status: "Reviewing match" },
    ],
  },
  {
    id: "pr-006",
    name: "Theo Adeyemi, LMFT",
    email: "theo@theoadeyemi.com",
    location: "Virtual (NY, NJ, MA)",
    modalities: ["Therapy"],
    specialties: ["Men's mental health", "Identity & belonging", "Existential work"],
    licenses: ["LMFT (NY, NJ, MA)"],
    yearsExperience: 9,
    worksBestWith:
      "Men in their 30s-50s navigating identity, fatherhood, ambition fatigue.",
    notARightFitFor: "Couples work (refers out).",
    traumaInformed: "Yes — relational and culturally-attuned framework.",
    availability: "Evenings, virtual only. 3 new clients/month.",
    status: "Pending",
    acceptingReferrals: false,
    bio: "Theo's application is under review. Application submitted 2 days ago.",
    referralHistory: [],
  },
  {
    id: "pr-007",
    name: "Camille Boudreaux, L.Ac.",
    email: "camille@riverstone-acu.com",
    location: "Brooklyn, NY",
    modalities: ["Acupuncture", "Trauma-informed support"],
    specialties: ["Anxiety", "Sleep disorders", "Postpartum"],
    licenses: ["L.Ac. (NY)", "M.S. Acupuncture"],
    yearsExperience: 6,
    worksBestWith:
      "Anxious sleepers, new parents, and clients integrating acupuncture into broader care.",
    notARightFitFor: "Sports performance, fertility-only work.",
    traumaInformed: "Yes — slow intake, careful needling consent, full clothes-on sessions.",
    availability: "Tue/Wed/Sat. Currently paused for August.",
    status: "Paused",
    acceptingReferrals: false,
    bio: "Camille's practice is paused through August for family leave.",
    referralHistory: [],
  },
];

export const newPractitionerApplications = practitioners.filter((p) => p.status === "Pending");
export const newSeekerRequests = seekers.filter((s) => s.status === "New");
export const inProgressSeekers = seekers.filter(
  (s) => s.status === "Reviewed" || s.status === "Shortlist in progress",
);
export const recentIntroductions = seekers.filter((s) => s.status === "Introduced");

export function getSeeker(id: string) {
  return seekers.find((s) => s.id === id);
}
export function getPractitioner(id: string) {
  return practitioners.find((p) => p.id === id);
}
