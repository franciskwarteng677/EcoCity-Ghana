import { NextResponse } from "next/server";
import { isReportStatus, normalizeReportStatus, type ReportStatus } from "@/data/communityReports";
import { hasValidAdminSession, isAdminReviewCodeConfigured, isValidAdminReviewCode } from "@/lib/adminAuth";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";
import type { CommunityReportRow, ReportUpdateRow } from "@/lib/supabase";

type AdminAction = "list_updates" | "create_update" | "update_update" | "delete_update";

type AdminUpdateRequest = {
  action?: AdminAction;
  adminCode?: string;
  reportId?: string;
  updateId?: string;
  status?: string;
  responsibleServiceArea?: string;
  note?: string;
  isPublic?: boolean;
};

type SupabaseAdminClient = NonNullable<ReturnType<typeof getSupabaseAdminClient>>;
type AdminReportResponse = Pick<
  CommunityReportRow,
  "status" | "service_area" | "contact_preference" | "reporter_name" | "reporter_contact"
>;

const adminReportSelect = "status, service_area, contact_preference, reporter_name, reporter_contact";

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

async function fetchAdminReport(supabase: SupabaseAdminClient, reportId: string): Promise<AdminReportResponse> {
  const { data, error } = await supabase.from("reports").select(adminReportSelect).eq("id", reportId).single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function syncReportFromReviewHistory(supabase: SupabaseAdminClient, reportId: string, updates: ReturnType<typeof mapUpdate>[]) {
  const latestUpdate = updates[0];
  const reportUpdate: { status: ReportStatus; service_area?: string } = {
    status: latestUpdate?.status ?? "needs_review"
  };

  if (latestUpdate?.responsibleServiceArea) {
    reportUpdate.service_area = latestUpdate.responsibleServiceArea;
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

  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin credentials are not configured." }, { status: 500 });
  }

  const action = body.action ?? "create_update";

  if (!body.reportId) {
    return NextResponse.json({ error: "Report id is required." }, { status: 400 });
  }

  try {
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

    const status = body.status as ReportStatus;
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
      const report = await syncReportFromReviewHistory(supabase, body.reportId, updates);

      return NextResponse.json({ report, updates });
    }

    const reportUpdate: { status: ReportStatus; service_area?: string } = { status };

    if (responsibleServiceArea) {
      reportUpdate.service_area = responsibleServiceArea;
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
