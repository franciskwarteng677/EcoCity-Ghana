export type ReportStatus = "Logged" | "Needs review" | "In review" | "Open" | "Resolved";
export type ReportUrgency = "Low" | "Medium" | "High" | "Emergency";

export type CommunityReport = {
  id: string;
  title: string;
  category:
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
  community: string;
  locationDetail: string;
  description: string;
  urgency: ReportUrgency;
  status: ReportStatus;
  dateReported: string;
  isDangerous: boolean;
  responsibleServiceArea: string;
  evidenceLabel?: string;
};

export const reportStatuses: ReportStatus[] = ["Logged", "Needs review", "In review", "Open", "Resolved"];
export const reportUrgencies: ReportUrgency[] = ["Low", "Medium", "High", "Emergency"];

export const communityReports: CommunityReport[] = [
  {
    id: "ECG-1042",
    title: "Blocked drain causing roadside flooding",
    category: "Blocked Drain",
    community: "Odorkor",
    locationDetail: "Near the market junction storm drain",
    description: "Water collects along the roadside after rainfall because the drain is filled with silt and waste. Pedestrians are stepping into traffic to avoid the flooded edge.",
    urgency: "High",
    status: "Needs review",
    dateReported: "2026-06-28",
    isDangerous: true,
    responsibleServiceArea: "Drainage and Roads",
    evidenceLabel: "2 photos noted"
  },
  {
    id: "ECG-1041",
    title: "Overflowing public waste container",
    category: "Illegal Dumping",
    community: "Kaneshie",
    locationDetail: "Behind the public transport stop",
    description: "Waste has overflowed around the container and is spreading toward nearby stalls. Residents report strong odor and blocked pedestrian access.",
    urgency: "Medium",
    status: "Open",
    dateReported: "2026-06-27",
    isDangerous: false,
    responsibleServiceArea: "Waste Management",
    evidenceLabel: "Photo noted"
  },
  {
    id: "ECG-1040",
    title: "Streetlight outage near bus stop",
    category: "Broken Streetlight",
    community: "Teshie",
    locationDetail: "Main road bus stop near the pharmacy",
    description: "Two streetlights have been out for several nights, leaving the bus stop and crossing area dark for commuters.",
    urgency: "Medium",
    status: "Logged",
    dateReported: "2026-06-25",
    isDangerous: false,
    responsibleServiceArea: "Public Lighting"
  },
  {
    id: "ECG-1039",
    title: "Floodwater collecting near footbridge",
    category: "Flooding",
    community: "Nima",
    locationDetail: "Busy footbridge beside the main gutter",
    description: "Standing water collects at the footbridge entrance after rainfall, making access difficult for school children, traders, and elderly residents.",
    urgency: "High",
    status: "In review",
    dateReported: "2026-06-24",
    isDangerous: true,
    responsibleServiceArea: "Drainage and Public Works",
    evidenceLabel: "Photo noted"
  },
  {
    id: "ECG-1038",
    title: "Deep potholes creating unsafe road conditions",
    category: "Unsafe Road",
    community: "Madina",
    locationDetail: "Taxi rank access road",
    description: "Several deep potholes are forcing vehicles into the opposite lane. Motorbike riders slow suddenly, creating risk during peak traffic.",
    urgency: "High",
    status: "Needs review",
    dateReported: "2026-06-22",
    isDangerous: true,
    responsibleServiceArea: "Roads and Transport"
  },
  {
    id: "ECG-1037",
    title: "Open gutter with stagnant water",
    category: "Poor Drainage",
    community: "Ashaiman",
    locationDetail: "Residential lane behind the clinic",
    description: "An open gutter has stagnant water and visible waste buildup. Residents are concerned about odor, mosquitoes, and drainage during rainfall.",
    urgency: "Medium",
    status: "Open",
    dateReported: "2026-06-20",
    isDangerous: false,
    responsibleServiceArea: "Sanitation and Drainage",
    evidenceLabel: "3 photos noted"
  },
  {
    id: "ECG-1036",
    title: "Polluted water flowing into roadside gutter",
    category: "Polluted Water",
    community: "Tema Community 5",
    locationDetail: "Lane beside the public school wall",
    description: "Dirty water is flowing into the roadside gutter throughout the day. The source is unclear, and the smell is affecting nearby classrooms.",
    urgency: "Medium",
    status: "In review",
    dateReported: "2026-06-18",
    isDangerous: false,
    responsibleServiceArea: "Environmental Health"
  },
  {
    id: "ECG-1035",
    title: "Damaged public walkway rail",
    category: "Public Infrastructure",
    community: "Osu",
    locationDetail: "Pedestrian walkway near the clinic entrance",
    description: "A section of the walkway rail is broken and leaning into the pedestrian path. People using the clinic entrance have to walk around it.",
    urgency: "Low",
    status: "Resolved",
    dateReported: "2026-06-16",
    isDangerous: false,
    responsibleServiceArea: "Public Works"
  },
  {
    id: "ECG-1034",
    title: "Sanitation concern beside food stalls",
    category: "Sanitation Concern",
    community: "Lapaz",
    locationDetail: "Food vending area near the junction",
    description: "Wastewater and refuse are collecting beside food stalls. Vendors say the area needs cleaning and better drainage before the next rainfall.",
    urgency: "Medium",
    status: "Open",
    dateReported: "2026-06-14",
    isDangerous: false,
    responsibleServiceArea: "Environmental Health"
  },
  {
    id: "ECG-1033",
    title: "Unsafe crossing near school entrance",
    category: "Community Safety",
    community: "Adenta",
    locationDetail: "Primary school entrance on the main road",
    description: "Drivers are speeding near the school entrance during morning drop-off. Residents are asking for better signage and safer crossing support.",
    urgency: "Emergency",
    status: "Logged",
    dateReported: "2026-06-12",
    isDangerous: true,
    responsibleServiceArea: "Community Safety and Roads",
    evidenceLabel: "Video noted"
  }
];
