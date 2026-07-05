export type ReportStatus =
  | "needs_review"
  | "verified"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "duplicate"
  | "needs_more_information";
export type ReportUrgency = "Low" | "Medium" | "High" | "Emergency";
export type ReportCategory =
  | "Flooding"
  | "Blocked Drain"
  | "Poor Drainage"
  | "Illegal Dumping"
  | "Sanitation Concern"
  | "Polluted Water"
  | "Unsafe Road"
  | "Broken Streetlight"
  | "Public Infrastructure"
  | "Community Safety";

export type CommunityReport = {
  id: string;
  category: ReportCategory;
  title: string;
  community: string;
  locationDetail: string;
  description: string;
  urgency: ReportUrgency;
  status: ReportStatus;
  dateReported: string;
  isDangerous: boolean;
  responsibleServiceArea: string;
  evidenceLabel?: string;
  evidenceFileName?: string | null;
  evidenceFilePath?: string | null;
  evidencePublicUrl?: string | null;
  evidenceMimeType?: string | null;
  evidenceSizeBytes?: number | null;
  contactPreference?: string | null;
  reporterName?: string | null;
  reporterContact?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
};

export type ReportUpdate = {
  id: string;
  reportId: string;
  status: ReportStatus;
  note: string | null;
  responsibleServiceArea: string | null;
  isPublic: boolean;
  createdAt: string;
};

export const reportCategories: ReportCategory[] = [
  "Flooding",
  "Blocked Drain",
  "Poor Drainage",
  "Illegal Dumping",
  "Sanitation Concern",
  "Polluted Water",
  "Unsafe Road",
  "Broken Streetlight",
  "Public Infrastructure",
  "Community Safety"
];

export const reportStatuses: ReportStatus[] = [
  "needs_review",
  "verified",
  "assigned",
  "in_progress",
  "resolved",
  "rejected",
  "duplicate",
  "needs_more_information"
];
export const reportUrgencies: ReportUrgency[] = ["Low", "Medium", "High", "Emergency"];

export const reportStatusLabels: Record<ReportStatus, string> = {
  needs_review: "Needs review",
  verified: "Verified",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  rejected: "Rejected",
  duplicate: "Duplicate",
  needs_more_information: "Needs more information"
};

const legacyStatusMap: Record<string, ReportStatus> = {
  Logged: "needs_review",
  "Needs review": "needs_review",
  "In review": "verified",
  Open: "assigned",
  Resolved: "resolved"
};

export function getReportStatusLabel(status: ReportStatus) {
  return reportStatusLabels[status];
}

export function isReportStatus(value: string): value is ReportStatus {
  return reportStatuses.includes(value as ReportStatus);
}

export function normalizeReportStatus(value: string): ReportStatus {
  if (isReportStatus(value)) {
    return value;
  }

  return legacyStatusMap[value] ?? "needs_review";
}

export function isReportCategory(value: string): value is ReportCategory {
  return reportCategories.includes(value as ReportCategory);
}

export function isReportUrgency(value: string): value is ReportUrgency {
  return reportUrgencies.includes(value as ReportUrgency);
}

export const communityReports: CommunityReport[] = [
  {
    id: "ECG-1042",
    title: "Blocked drain causing roadside flooding",
    category: "Blocked Drain",
    community: "Odorkor",
    locationDetail: "Near the market junction storm drain",
    description: "Water collects along the roadside after rainfall because the drain is filled with silt and waste. Pedestrians are stepping into traffic to avoid the flooded edge.",
    urgency: "High",
    status: "needs_review",
    dateReported: "2026-06-28",
    isDangerous: true,
    responsibleServiceArea: "Drainage and Roads",
    evidenceLabel: "2 photos noted",
    latitude: 5.5662,
    longitude: -0.2606
  },
  {
    id: "ECG-1041",
    title: "Overflowing public waste container",
    category: "Illegal Dumping",
    community: "Kaneshie",
    locationDetail: "Behind the public transport stop",
    description: "Waste has overflowed around the container and is spreading toward nearby stalls. Residents report strong odor and blocked pedestrian access.",
    urgency: "Medium",
    status: "assigned",
    dateReported: "2026-06-27",
    isDangerous: false,
    responsibleServiceArea: "Waste Management",
    evidenceLabel: "Photo noted",
    latitude: 5.5657,
    longitude: -0.2354
  },
  {
    id: "ECG-1040",
    title: "Streetlight outage near bus stop",
    category: "Broken Streetlight",
    community: "Teshie",
    locationDetail: "Main road bus stop near the pharmacy",
    description: "Two streetlights have been out for several nights, leaving the bus stop and crossing area dark for commuters.",
    urgency: "Medium",
    status: "needs_review",
    dateReported: "2026-06-25",
    isDangerous: false,
    responsibleServiceArea: "Public Lighting",
    latitude: 5.5831,
    longitude: -0.1073
  },
  {
    id: "ECG-1039",
    title: "Floodwater collecting near footbridge",
    category: "Flooding",
    community: "Nima",
    locationDetail: "Busy footbridge beside the main gutter",
    description: "Standing water collects at the footbridge entrance after rainfall, making access difficult for school children, traders, and elderly residents.",
    urgency: "High",
    status: "verified",
    dateReported: "2026-06-24",
    isDangerous: true,
    responsibleServiceArea: "Drainage and Public Works",
    evidenceLabel: "Photo noted",
    latitude: 5.5881,
    longitude: -0.2034
  },
  {
    id: "ECG-1038",
    title: "Deep potholes creating unsafe road conditions",
    category: "Unsafe Road",
    community: "Madina",
    locationDetail: "Taxi rank access road",
    description: "Several deep potholes are forcing vehicles into the opposite lane. Motorbike riders slow suddenly, creating risk during peak traffic.",
    urgency: "High",
    status: "needs_review",
    dateReported: "2026-06-22",
    isDangerous: true,
    responsibleServiceArea: "Roads and Transport",
    latitude: 5.6818,
    longitude: -0.1668
  },
  {
    id: "ECG-1037",
    title: "Open gutter with stagnant water",
    category: "Poor Drainage",
    community: "Ashaiman",
    locationDetail: "Residential lane behind the clinic",
    description: "An open gutter has stagnant water and visible waste buildup. Residents are concerned about odor, mosquitoes, and drainage during rainfall.",
    urgency: "Medium",
    status: "assigned",
    dateReported: "2026-06-20",
    isDangerous: false,
    responsibleServiceArea: "Sanitation and Drainage",
    evidenceLabel: "3 photos noted",
    latitude: 5.692,
    longitude: -0.0332
  },
  {
    id: "ECG-1036",
    title: "Polluted water flowing into roadside gutter",
    category: "Polluted Water",
    community: "Tema Community 5",
    locationDetail: "Lane beside the public school wall",
    description: "Dirty water is flowing into the roadside gutter throughout the day. The source is unclear, and the smell is affecting nearby classrooms.",
    urgency: "Medium",
    status: "verified",
    dateReported: "2026-06-18",
    isDangerous: false,
    responsibleServiceArea: "Environmental Health",
    latitude: 5.6532,
    longitude: -0.0079
  },
  {
    id: "ECG-1035",
    title: "Damaged public walkway rail",
    category: "Public Infrastructure",
    community: "Osu",
    locationDetail: "Pedestrian walkway near the clinic entrance",
    description: "A section of the walkway rail is broken and leaning into the pedestrian path. People using the clinic entrance have to walk around it.",
    urgency: "Low",
    status: "resolved",
    dateReported: "2026-06-16",
    isDangerous: false,
    responsibleServiceArea: "Public Works",
    latitude: 5.5557,
    longitude: -0.1827
  },
  {
    id: "ECG-1034",
    title: "Sanitation concern beside food stalls",
    category: "Sanitation Concern",
    community: "Lapaz",
    locationDetail: "Food vending area near the junction",
    description: "Wastewater and refuse are collecting beside food stalls. Vendors say the area needs cleaning and better drainage before the next rainfall.",
    urgency: "Medium",
    status: "assigned",
    dateReported: "2026-06-14",
    isDangerous: false,
    responsibleServiceArea: "Environmental Health",
    latitude: 5.6061,
    longitude: -0.2538
  },
  {
    id: "ECG-1033",
    title: "Unsafe crossing near school entrance",
    category: "Community Safety",
    community: "Adenta",
    locationDetail: "Primary school entrance on the main road",
    description: "Drivers are speeding near the school entrance during morning drop-off. Residents are asking for better signage and safer crossing support.",
    urgency: "Emergency",
    status: "needs_review",
    dateReported: "2026-06-12",
    isDangerous: true,
    responsibleServiceArea: "Community Safety and Roads",
    evidenceLabel: "Video noted",
    latitude: 5.7043,
    longitude: -0.1671
  }
];
