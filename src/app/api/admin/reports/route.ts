import { NextResponse } from "next/server";
import { isReportStatus, type ReportStatus } from "@/data/communityReports";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type AdminUpdateRequest = {
  adminCode?: string;
  reportId?: string;
  status?: string;
  responsibleServiceArea?: string;
  note?: string;
  isPublic?: boolean;
};

export async function POST(request: Request) {
  const configuredCode = process.env.ADMIN_REVIEW_CODE;

  if (!configuredCode) {
    return NextResponse.json({ error: "Admin review is not configured." }, { status: 500 });
  }

  const body = (await request.json()) as AdminUpdateRequest;

  if (!body.adminCode || body.adminCode !== configuredCode) {
    return NextResponse.json({ error: "Invalid admin review code." }, { status: 401 });
  }

  if (!body.reportId || !body.status || !isReportStatus(body.status)) {
    return NextResponse.json({ error: "Report id and a valid status are required." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin credentials are not configured." }, { status: 500 });
  }

  const status = body.status as ReportStatus;
  const responsibleServiceArea = body.responsibleServiceArea?.trim() || null;
  const note = body.note?.trim() || null;
  const reportUpdate: { status: ReportStatus; service_area?: string } = { status };

  if (responsibleServiceArea) {
    reportUpdate.service_area = responsibleServiceArea;
  }

  const { data: updatedReport, error: reportError } = await supabase
    .from("reports")
    .update(reportUpdate)
    .eq("id", body.reportId)
    .select("*")
    .single();

  if (reportError) {
    return NextResponse.json({ error: reportError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase.from("report_updates").insert({
    report_id: body.reportId,
    status,
    note,
    responsible_service_area: responsibleServiceArea ?? updatedReport.service_area,
    is_public: body.isPublic ?? true
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ report: updatedReport });
}
