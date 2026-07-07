import { NextResponse } from "next/server";
import {
  communityReports,
  isReportStatus,
  isReportVisibility,
  normalizeReportStatus,
  type ReportStatus,
  type ReportVisibility
} from "@/data/communityReports";
import { hasValidAdminSession, isAdminReviewCodeConfigured, isValidAdminReviewCode } from "@/lib/adminAuth";
import { mapReportRowToCommunityReport } from "@/lib/reports";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import type { CommunityReportRow, ReportEvidenceRow, ReportUpdateRow } from "@/lib/supabase";

type AdminAction = "list_reports" | "list_updates" | "create_update" | "update_update" | "delete_update";

type AdminUpdateRequest = {
  action?: AdminAction;
  adminCode?: string;
  reportId?: string;
  updateId?: string;
  status?: string;
  publicVisibility?: string;
  responsibleServiceArea?: string;
  note?: string;
  isPublic?: boolean;
};

type SupabaseAdminClient = NonNullable<ReturnType<typeof getSupabaseAdminClient>>;
type AdminReportResponse = Pick<
  CommunityReportRow,
  "status" | "public_visibility" | "service_area" | "contact_preference" | "reporter_name" | "reporter_contact"
>;

const adminReportSelect = "status, public_visibility, service_area, contact_preference, reporter_name, reporter_contact";

function mapUpdate(row: ReportUpdateRow) {
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

async function fetchReportUpdates(supabase: SupabaseAdminClient, reportId: string) {
  const { data, error } = await supabase
    .from("report_updates")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapUpdate);
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

function toAdminReportListItem(row: CommunityReportRow, evidenceRows: ReportEvidenceRow[]) {
  const report = mapReportRowToCommunityReport(row, evidenceRows);
  const reportListItem = { ...report };

  delete reportListItem.contactPreference;
  delete reportListItem.reporterName;
  delete reportListItem.reporterContact;

  return reportListItem;
}

async function fetchAdminReports(supabase: SupabaseAdminClient) {
  const { data: reportRows, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const reports = reportRows ?? [];

  if (reports.length === 0) {
    return [];
  }

  const { data: evidenceRows, error: evidenceError } = await supabase
    .from("report_evidence")
    .select("*")
    .in(
      "report_id",
      reports.map((report) => report.id)
    )
    .order("created_at", { ascending: true });

  if (evidenceError && !isMissingReportEvidenceTable(evidenceError)) {
    throw new Error(evidenceError.message);
  }

  const evidenceRowsByReportId = groupEvidenceByReportId(evidenceRows ?? []);

  return reports.map((report) => toAdminReportListItem(report, evidenceRowsByReportId.get(report.id) ?? []));
}

async function fetchAdminReport(supabase: SupabaseAdminClient, reportId: string): Promise<AdminReportResponse> {
  const { data, error } = await supabase.from("reports").select(adminReportSelect).eq("id", reportId).single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function syncReportFromReviewHistory(
  supabase: SupabaseAdminClient,
  reportId: string,
  updates: ReturnType<typeof mapUpdate>[],
  publicVisibility?: ReportVisibility
) {
  const latestUpdate = updates[0];
  const reportUpdate: { status: ReportStatus; service_area?: string; public_visibility?: ReportVisibility } = {
    status: latestUpdate?.status ?? "needs_review"
  };

  if (latestUpdate?.responsibleServiceArea) {
    reportUpdate.service_area = latestUpdate.responsibleServiceArea;
  }

  if (publicVisibility) {
    reportUpdate.public_visibility = publicVisibility;
  }

  const { data, error } = await supabase
    .from("reports")
    .update(reportUpdate)
    .eq("id", reportId)
    .select(adminReportSelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function POST(request: Request) {
  if (!isAdminReviewCodeConfigured()) {
    return NextResponse.json({ error: "Admin review is not configured." }, { status: 500 });
  }

  const body = (await request.json()) as AdminUpdateRequest;
  const hasAdminAccess = (await hasValidAdminSession()) || isValidAdminReviewCode(body.adminCode);

  if (!hasAdminAccess) {
    return NextResponse.json({ error: "Admin access is required. Unlock the admin console again." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const action = body.action ?? "create_update";

  if (action === "list_reports" && !supabase) {
    return NextResponse.json({ reports: communityReports, source: "sample" });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin credentials are not configured." }, { status: 500 });
  }

  try {
    if (action === "list_reports") {
      const reports = await fetchAdminReports(supabase);

      return NextResponse.json({ reports, source: "supabase" });
    }

    if (!body.reportId) {
      return NextResponse.json({ error: "Report id is required." }, { status: 400 });
    }

    if (action === "list_updates") {
      const updates = await fetchReportUpdates(supabase, body.reportId);
      const report = await fetchAdminReport(supabase, body.reportId);

      return NextResponse.json({ report, updates });
    }

    if (action === "delete_update") {
      if (!body.updateId) {
        return NextResponse.json({ error: "Review update id is required." }, { status: 400 });
      }

      const { error: deleteError } = await supabase
        .from("report_updates")
        .delete()
        .eq("id", body.updateId)
        .eq("report_id", body.reportId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      const updates = await fetchReportUpdates(supabase, body.reportId);
      const report = await syncReportFromReviewHistory(supabase, body.reportId, updates);

      return NextResponse.json({ report, updates });
    }

    if (!body.status || !isReportStatus(body.status)) {
      return NextResponse.json({ error: "A valid status is required." }, { status: 400 });
    }

    if (body.publicVisibility && !isReportVisibility(body.publicVisibility)) {
      return NextResponse.json({ error: "A valid public visibility value is required." }, { status: 400 });
    }

    const status = body.status as ReportStatus;
    const publicVisibility = body.publicVisibility as ReportVisibility | undefined;
    const responsibleServiceArea = body.responsibleServiceArea?.trim() || null;
    const note = body.note?.trim() || null;
    const isPublic = body.isPublic ?? true;

    if (action === "update_update") {
      if (!body.updateId) {
        return NextResponse.json({ error: "Review update id is required." }, { status: 400 });
      }

      const { error: updateError } = await supabase
        .from("report_updates")
        .update({
          status,
          note,
          responsible_service_area: responsibleServiceArea,
          is_public: isPublic
        })
        .eq("id", body.updateId)
        .eq("report_id", body.reportId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      const updates = await fetchReportUpdates(supabase, body.reportId);
      const report = await syncReportFromReviewHistory(supabase, body.reportId, updates, publicVisibility);

      return NextResponse.json({ report, updates });
    }

    const reportUpdate: { status: ReportStatus; service_area?: string; public_visibility?: ReportVisibility } = { status };

    if (responsibleServiceArea) {
      reportUpdate.service_area = responsibleServiceArea;
    }

    if (publicVisibility) {
      reportUpdate.public_visibility = publicVisibility;
    } else if (status === "rejected") {
      reportUpdate.public_visibility = "rejected";
    }

    const { data: updatedReport, error: reportError } = await supabase
      .from("reports")
      .update(reportUpdate)
      .eq("id", body.reportId)
      .select(adminReportSelect)
      .single();

    if (reportError) {
      throw new Error(reportError.message);
    }

    const { error: insertError } = await supabase.from("report_updates").insert({
      report_id: body.reportId,
      status,
      note,
      responsible_service_area: responsibleServiceArea ?? updatedReport.service_area,
      is_public: isPublic
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    const updates = await fetchReportUpdates(supabase, body.reportId);

    return NextResponse.json({ report: updatedReport, updates });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to complete admin review action." }, { status: 500 });
  }
}
