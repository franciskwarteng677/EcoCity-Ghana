import {
  communityReports,
  type CommunityReport,
  type ReportCategory,
  type ReportStatus
} from "@/data/communityReports";
import { getSupabaseClient, isSupabaseConfigured, type CommunityReportInsert, type CommunityReportRow } from "./supabase";

export type ReportDataSource = "supabase" | "sample";

export type ReportsResult = {
  reports: CommunityReport[];
  source: ReportDataSource;
};

export type NewCommunityReport = {
  category: ReportCategory;
  title: string;
  community: string;
  locationDetail: string;
  description: string;
  urgency: CommunityReport["urgency"];
  dangerNoted: boolean;
  evidenceLabel?: string | null;
  contactPreference?: string | null;
  reporterName?: string | null;
  reporterContact?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

const categoryServiceAreas: Record<ReportCategory, string> = {
  Flooding: "Drainage and Public Works",
  "Blocked Drain": "Drainage and Roads",
  "Poor Drainage": "Sanitation and Drainage",
  "Illegal Dumping": "Waste Management",
  "Sanitation Concern": "Environmental Health",
  "Polluted Water": "Environmental Health",
  "Unsafe Road": "Roads and Transport",
  "Broken Streetlight": "Public Lighting",
  "Public Infrastructure": "Public Works",
  "Community Safety": "Community Safety and Roads"
};

export function getServiceAreaForCategory(category: ReportCategory) {
  return categoryServiceAreas[category];
}

function sortNewestFirst(reports: CommunityReport[]) {
  return [...reports].sort((a, b) => {
    const firstDate = a.createdAt ?? a.dateReported;
    const secondDate = b.createdAt ?? b.dateReported;

    return secondDate.localeCompare(firstDate);
  });
}

export function mapReportRowToCommunityReport(row: CommunityReportRow): CommunityReport {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    community: row.community,
    locationDetail: row.location_detail,
    description: row.description,
    urgency: row.urgency,
    status: row.status,
    dateReported: row.created_at,
    isDangerous: row.danger_noted,
    responsibleServiceArea: row.service_area,
    evidenceLabel: row.evidence_label ?? undefined,
    contactPreference: row.contact_preference,
    reporterName: row.reporter_name,
    reporterContact: row.reporter_contact,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at
  };
}

export function mapNewReportToInsert(report: NewCommunityReport): CommunityReportInsert {
  return {
    category: report.category,
    title: report.title,
    community: report.community,
    location_detail: report.locationDetail,
    description: report.description,
    urgency: report.urgency,
    status: "Needs review" satisfies ReportStatus,
    service_area: getServiceAreaForCategory(report.category),
    danger_noted: report.dangerNoted,
    evidence_label: report.evidenceLabel || null,
    contact_preference: report.contactPreference || null,
    reporter_name: report.reporterName || null,
    reporter_contact: report.reporterContact || null,
    latitude: report.latitude ?? null,
    longitude: report.longitude ?? null
  };
}

export async function fetchCommunityReports(): Promise<ReportsResult> {
  if (!isSupabaseConfigured()) {
    return {
      reports: sortNewestFirst(communityReports),
      source: "sample"
    };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      reports: sortNewestFirst(communityReports),
      source: "sample"
    };
  }

  const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return {
    reports: (data ?? []).map(mapReportRowToCommunityReport),
    source: "supabase"
  };
}

export async function submitCommunityReport(report: NewCommunityReport) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are required before reports can be saved.");
  }

  const { data, error } = await supabase
    .from("reports")
    .insert(mapNewReportToInsert(report))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapReportRowToCommunityReport(data);
}

