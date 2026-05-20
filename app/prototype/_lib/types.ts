export type Modality =
  | "Therapy"
  | "Acupuncture"
  | "Reiki"
  | "Movement"
  | "Trauma-informed support";

export type SessionFormat = "In person" | "Virtual" | "Either";

export type PractitionerStatus = "Pending" | "Approved" | "Paused";

export type SeekerStatus =
  | "New"
  | "Reviewed"
  | "Shortlist in progress"
  | "Introduced"
  | "Archived";

export type Urgency = "Within a week" | "This month" | "Open-ended";

export type Seeker = {
  id: string;
  firstName: string;
  pronouns?: string;
  submittedAt: string;
  status: SeekerStatus;
  modalities: (Modality | "Not sure yet")[];
  story: string;
  location: string;
  format: SessionFormat;
  budget: string;
  genderPreference?: string;
  availability: string;
  urgency: Urgency;
  noraNotes?: string;
};

export type Practitioner = {
  id: string;
  name: string;
  email: string;
  website?: string;
  location: string;
  modalities: Modality[];
  specialties: string[];
  licenses: string[];
  yearsExperience: number;
  worksBestWith: string;
  notARightFitFor: string;
  traumaInformed: string;
  availability: string;
  status: PractitionerStatus;
  acceptingReferrals: boolean;
  bio: string;
  referralHistory: { id: string; seekerInitials: string; date: string; status: string }[];
};

export type ShortlistEntry = {
  practitionerId: string;
  reason: string;
};
