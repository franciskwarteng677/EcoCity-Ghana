import {
  communityReports,
  type CommunityReport,
  type ReportEvidence,
  type ReportUpdate,
  type ReportCategory,
  isPubliclyVisibleReport,
  normalizeReportStatus,
  normalizeReportVisibility
} from "@/data/communityReports";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  type CommunityReportInsert,
  type CommunityReportRow,
  type PublicReportDashboardSummaryRow,
  type PublicCommunityReportRow,
  type ReportEvidenceInsert,
  type ReportEvidenceRow,
  type ReportUpdateRow
} from "./supabase";
import {
  createEvidenceStoragePath,
  getEvidenceMimeType,
  REPORT_EVIDENCE_BUCKET,
  validateEvidenceFile,
  validateEvidenceFiles,
  type EvidenceMetadata
} from "./evidence";

export type ReportDataSource = "supabase" | "sample";

export type ReportsResult = {
  reports: CommunityReport[];
  source: ReportDataSource;
};

export type DashboardModerationCounts = {
  totalSubmittedReports: number;
  awaitingReviewReports: number;
  assignedReports: number;
  inProgressReports: number;
  resolvedReports: number;
  rejectedReports: number;
  hiddenReports: number;
};

export type NewCommunityReport = {
  id?: string;
  category: ReportCategory;
  title: string;
  community: string;
  locationDetail: string;
  description: string;
  urgency: CommunityReport["urgency"];
  dangerNoted: boolean;
  evidenceLabel?: string | null;
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
};

export class EvidenceUploadError extends Error {
  reportId?: string;

  constructor(message: string, reportId?: string) {
    super(message);
    this.name = "EvidenceUploadError";
    this.reportId = reportId;
  }
}

export type ReportWithUpdates = {
  report: CommunityReport;
  updates: ReportUpdate[];
  source: ReportDataSource;
};

type ReadableCommunityReportRow = CommunityReportRow | PublicCommunityReportRow;

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

export function getDashboardModerationCounts(reports: CommunityReport[]): DashboardModerationCounts {
  return {
    totalSubmittedReports: reports.length,
    awaitingReviewReports: reports.filter((report) => report.publicVisibility !== "hidden" && report.publicVisibility !== "rejected" && report.status === "needs_review").length,
    assignedReports: reports.filter((report) => report.publicVisibility !== "hidden" && report.publicVisibility !== "rejected" && report.status === "assigned").length,
    inProgressReports: reports.filter((report) => report.publicVisibility !== "hidden" && report.publicVisibility !== "rejected" && report.status === "in_progress").length,
    resolvedReports: reports.filter((report) => report.publicVisibility !== "hidden" && report.publicVisibility !== "rejected" && report.status === "resolved").length,
    rejectedReports: reports.filter((report) => report.publicVisibility === "rejected" || report.status === "rejected").length,
    hiddenReports: reports.filter((report) => report.publicVisibility === "hidden").length
  };
}

function mapDashboardSummaryRow(row: PublicReportDashboardSummaryRow): DashboardModerationCounts {
  return {
    totalSubmittedReports: row.total_submitted_reports,
    awaitingReviewReports: row.awaiting_review_reports,
    assignedReports: row.assigned_reports,
    inProgressReports: row.in_progress_reports,
    resolvedReports: row.resolved_reports,
    rejectedReports: row.rejected_reports,
    hiddenReports: row.hidden_reports
  };
}

function getEvidencePublicUrl(filePath: string | null, publicUrl: string | null) {
  if (publicUrl) {
    return publicUrl;
  }

  if (!filePath) {
    return null;
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  return supabase.storage.from(REPORT_EVIDENCE_BUCKET).getPublicUrl(filePath).data.publicUrl;
}

function mapEvidenceRowToReportEvidence(row: ReportEvidenceRow): ReportEvidence {
  return {
    id: row.id,
    reportId: row.report_id,
    fileName: row.file_name,
    filePath: row.file_path,
    publicUrl: getEvidencePublicUrl(row.file_path, row.public_url),
    fileSize: row.file_size,
    mimeType: row.mime_type,
    createdAt: row.created_at
  };
}

function getLegacyEvidence(row: ReadableCommunityReportRow): ReportEvidence | null {
  const publicUrl = getEvidencePublicUrl(row.evidence_file_path, row.evidence_public_url);

  if (!publicUrl && !row.evidence_file_path) {
    return null;
  }

  return {
    id: `${row.id}-legacy-evidence`,
    reportId: row.id,
    fileName: row.evidence_file_name ?? row.evidence_label ?? "Evidence image",
    filePath: row.evidence_file_path ?? "",
    publicUrl,
    fileSize: row.evidence_size_bytes,
    mimeType: row.evidence_mime_type,
    createdAt: row.created_at
  };
}

function groupEvidenceByReportId(rows: ReportEvidenceRow[]) {
  return rows.reduce<Map<string, ReportEvidenceRow[]>>((groups, row) => {
    const existingRows = groups.get(row.report_id) ?? [];
    groups.set(row.report_id, [...existingRows, row]);

    return groups;
  }, new Map<string, ReportEvidenceRow[]>());
}

function isMissingReportEvidenceTable(error: { code?: string; message: string }) {
  const message = error.message.toLowerCase();

  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (message.includes("report_evidence") && (message.includes("could not find") || message.includes("does not exist")))
  );
}

async function fetchReportEvidenceRows(reportIds: string[]) {
  if (reportIds.length === 0) {
    return [];
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("report_evidence")
    .select("*")
    .in("report_id", reportIds)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingReportEvidenceTable(error)) {
      return [];
    }

    throw new Error(error.message);
  }

  return data ?? [];
}

export function mapReportRowToCommunityReport(row: ReadableCommunityReportRow, evidenceRows: ReportEvidenceRow[] = []): CommunityReport {
  const evidence = evidenceRows.length > 0 ? evidenceRows.map(mapEvidenceRowToReportEvidence) : [];
  const legacyEvidence = evidence.length === 0 ? getLegacyEvidence(row) : null;
  const reporterDetails =
    "contact_preference" in row
      ? {
          contactPreference: row.contact_preference,
          reporterName: row.reporter_name,
          reporterContact: row.reporter_contact
        }
      : {};

  return {
    id: row.id,
    category: row.category,
    title: row.title,
    community: row.community,
    locationDetail: row.location_detail,
    description: row.description,
    urgency: row.urgency,
    status: normalizeReportStatus(row.status),
    publicVisibility: normalizeReportVisibility(row.public_visibility),
    dateReported: row.created_at,
    isDangerous: row.danger_noted,
    responsibleServiceArea: row.service_area,
    evidenceLabel: row.evidence_label ?? undefined,
    evidenceFileName: row.evidence_file_name,
    evidenceFilePath: row.evidence_file_path,
    evidencePublicUrl: getEvidencePublicUrl(row.evidence_file_path, row.evidence_public_url),
    evidenceMimeType: row.evidence_mime_type,
    evidenceSizeBytes: row.evidence_size_bytes,
    evidence: legacyEvidence ? [legacyEvidence] : evidence,
    ...reporterDetails,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at
  };
}

export function mapNewReportToInsert(report: NewCommunityReport): CommunityReportInsert {
  const insert: CommunityReportInsert = {
    id: report.id,
    category: report.category,
    title: report.title,
    community: report.community,
    location_detail: report.locationDetail,
    description: report.description,
    urgency: report.urgency,
    status: "needs_review",
    public_visibility: "under_review",
    service_area: getServiceAreaForCategory(report.category),
    danger_noted: report.dangerNoted,
    evidence_label: report.evidenceLabel || null,
    contact_preference: report.contactPreference || null,
    reporter_name: report.reporterName || null,
    reporter_contact: report.reporterContact || null,
    latitude: report.latitude ?? null,
    longitude: report.longitude ?? null
  };

  if (report.evidenceFileName || report.evidenceFilePath || report.evidencePublicUrl || report.evidenceMimeType || report.evidenceSizeBytes) {
    insert.evidence_file_name = report.evidenceFileName || null;
    insert.evidence_file_path = report.evidenceFilePath || null;
    insert.evidence_public_url = report.evidencePublicUrl || null;
    insert.evidence_mime_type = report.evidenceMimeType || null;
    insert.evidence_size_bytes = report.evidenceSizeBytes ?? null;
  }

  return insert;
}

function createInsertedReportRow(report: NewCommunityReport): CommunityReportRow {
  return {
    id: report.id ?? createUuid(),
    category: report.category,
    title: report.title,
    community: report.community,
    location_detail: report.locationDetail,
    description: report.description,
    urgency: report.urgency,
    status: "needs_review",
    public_visibility: "under_review",
    service_area: getServiceAreaForCategory(report.category),
    danger_noted: report.dangerNoted,
    evidence_label: report.evidenceLabel ?? null,
    evidence_file_name: report.evidenceFileName ?? null,
    evidence_file_path: report.evidenceFilePath ?? null,
    evidence_public_url: report.evidencePublicUrl ?? null,
    evidence_mime_type: report.evidenceMimeType ?? null,
    evidence_size_bytes: report.evidenceSizeBytes ?? null,
    contact_preference: report.contactPreference ?? null,
    reporter_name: report.reporterName ?? null,
    reporter_contact: report.reporterContact ?? null,
    latitude: report.latitude ?? null,
    longitude: report.longitude ?? null,
    created_at: new Date().toISOString()
  };
}

function createUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const randomValue = Math.floor(Math.random() * 16);
    const value = character === "x" ? randomValue : (randomValue & 0x3) | 0x8;

    return value.toString(16);
  });
}

async function uploadEvidenceFile(reportId: string, file: File): Promise<EvidenceMetadata> {
  const validationError = validateEvidenceFile(file);

  if (validationError) {
    throw new EvidenceUploadError(validationError);
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new EvidenceUploadError("Supabase environment variables are required before evidence can be uploaded.");
  }

  const filePath = createEvidenceStoragePath(reportId, file);
  const mimeType = getEvidenceMimeType(file);
  const { error } = await supabase.storage.from(REPORT_EVIDENCE_BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    contentType: mimeType,
    upsert: false
  });

  if (error) {
    throw new EvidenceUploadError(error.message);
  }

  const { data } = supabase.storage.from(REPORT_EVIDENCE_BUCKET).getPublicUrl(filePath);

  return {
    fileName: file.name,
    filePath,
    publicUrl: data.publicUrl,
    mimeType,
    sizeBytes: file.size
  };
}

async function saveReportEvidence(reportId: string, evidence: EvidenceMetadata[]) {
  if (evidence.length === 0) {
    return [];
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new EvidenceUploadError("Supabase environment variables are required before evidence can be saved.", reportId);
  }

  const rows: ReportEvidenceInsert[] = evidence.map((item) => ({
    report_id: reportId,
    file_name: item.fileName,
    file_path: item.filePath,
    public_url: item.publicUrl,
    file_size: item.sizeBytes,
    mime_type: item.mimeType
  }));

  const { data, error } = await supabase.from("report_evidence").insert(rows).select("*");

  if (error) {
    throw new EvidenceUploadError(error.message, reportId);
  }

  return data ?? [];
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
      reports: sortNewestFirst(communityReports.filter(isPubliclyVisibleReport)),
      source: "sample"
    };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      reports: sortNewestFirst(communityReports.filter(isPubliclyVisibleReport)),
      source: "sample"
    };
  }

  const { data, error } = await supabase.from("public_reports").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const reportRows = data ?? [];
  const evidenceRows = await fetchReportEvidenceRows(reportRows.map((report) => report.id));
  const evidenceRowsByReportId = groupEvidenceByReportId(evidenceRows);

  return {
    reports: reportRows.map((report) => mapReportRowToCommunityReport(report, evidenceRowsByReportId.get(report.id) ?? [])),
    source: "supabase"
  };
}

export async function fetchCommunityReportById(id: string): Promise<ReportWithUpdates | null> {
  if (!isSupabaseConfigured()) {
    const sampleReport = communityReports.filter(isPubliclyVisibleReport).find((report) => report.id === id);

    return sampleReport ? { report: sampleReport, updates: [], source: "sample" } : null;
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    const sampleReport = communityReports.filter(isPubliclyVisibleReport).find((report) => report.id === id);

    return sampleReport ? { report: sampleReport, updates: [], source: "sample" } : null;
  }

  const { data: reportData, error: reportError } = await supabase.from("public_reports").select("*").eq("id", id).single();

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

  const evidenceRows = await fetchReportEvidenceRows([id]);

  return {
    report: mapReportRowToCommunityReport(reportData, evidenceRows),
    updates: (updateData ?? []).map(mapReportUpdateRowToReportUpdate),
    source: "supabase"
  };
}

export async function fetchDashboardModerationCounts(): Promise<DashboardModerationCounts> {
  if (!isSupabaseConfigured()) {
    return getDashboardModerationCounts(communityReports);
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return getDashboardModerationCounts(communityReports);
  }

  const { data, error } = await supabase.from("public_report_dashboard_summary").select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDashboardSummaryRow(data);
}

export async function submitCommunityReport(report: NewCommunityReport, evidenceFiles?: File[] | null) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are required before reports can be saved.");
  }

  const selectedEvidenceFiles = evidenceFiles ?? [];
  const evidenceValidationError = validateEvidenceFiles(selectedEvidenceFiles);

  if (evidenceValidationError) {
    throw new EvidenceUploadError(evidenceValidationError);
  }

  const reportId = report.id ?? createUuid();
  const reportToSave: NewCommunityReport = {
    ...report,
    id: reportId,
    evidenceLabel: null,
    evidenceFileName: null,
    evidenceFilePath: null,
    evidencePublicUrl: null,
    evidenceMimeType: null,
    evidenceSizeBytes: null
  };

  const savedReportRow = createInsertedReportRow(reportToSave);
  const { error } = await supabase.from("reports").insert(mapNewReportToInsert(reportToSave));

  if (error) {
    throw new Error(error.message);
  }

  try {
    const evidenceMetadata: EvidenceMetadata[] = [];

    for (const file of selectedEvidenceFiles) {
      evidenceMetadata.push(await uploadEvidenceFile(reportId, file));
    }

    const evidenceRows = await saveReportEvidence(reportId, evidenceMetadata);

    return mapReportRowToCommunityReport(savedReportRow, evidenceRows);
  } catch (error) {
    if (error instanceof EvidenceUploadError) {
      throw new EvidenceUploadError(error.message, reportId);
    }

    throw new EvidenceUploadError(error instanceof Error ? error.message : "Evidence images could not be attached.", reportId);
  }
}
