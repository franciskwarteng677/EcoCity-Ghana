import {
  communityReports,
  type CommunityReport,
  type ReportUpdate,
  type ReportCategory,
  normalizeReportStatus
} from "@/data/communityReports";
import { getSupabaseClient, isSupabaseConfigured, type CommunityReportInsert, type CommunityReportRow, type ReportUpdateRow } from "./supabase";

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

export type ReportWithUpdates = {
  report: CommunityReport;
  updates: ReportUpdate[];
  source: ReportDataSource;
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
    status: normalizeReportStatus(row.status),
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
    status: "needs_review",
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

export function mapReportUpdateRowToReportUpdate(row: ReportUpdateRow): ReportUpdate {
  return {
    id: row.id,
    reportId: row.report_id,
    status: normalizeReportStatus(row.status),
    note: row.note,
    responsibleServiceArea: row.responsible_service_area,
    isPublic: row.is_public,
    createdAt: row.created_at
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

export async function fetchCommunityReportById(id: string): Promise<ReportWithUpdates | null> {
  if (!isSupabaseConfigured()) {
    const sampleReport = communityReports.find((report) => report.id === id);

    return sampleReport ? { report: sampleReport, updates: [], source: "sample" } : null;
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    const sampleReport = communityReports.find((report) => report.id === id);

    return sampleReport ? { report: sampleReport, updates: [], source: "sample" } : null;
  }

  const { data: reportData, error: reportError } = await supabase.from("reports").select("*").eq("id", id).single();

  if (reportError) {
    if (reportError.code === "PGRST116") {
      return null;
    }

    throw new Error(reportError.message);
  }

  const { data: updateData, error: updateError } = await supabase
    .from("report_updates")
    .select("*")
    .eq("report_id", id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    report: mapReportRowToCommunityReport(reportData),
    updates: (updateData ?? []).map(mapReportUpdateRowToReportUpdate),
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
