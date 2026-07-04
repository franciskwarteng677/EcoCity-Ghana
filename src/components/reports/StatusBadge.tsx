import { getReportStatusLabel, type ReportStatus } from "@/data/communityReports";

const statusStyles: Record<ReportStatus, string> = {
  needs_review: "bg-amber-100 text-amber-800",
  verified: "bg-sky-100 text-sky-800",
  assigned: "bg-civic-50 text-civic-700",
  in_progress: "bg-indigo-100 text-indigo-800",
  resolved: "bg-canopy-100 text-canopy-800",
  rejected: "bg-red-50 text-red-700",
  duplicate: "bg-slate-100 text-slate-700",
  needs_more_information: "bg-violet-100 text-violet-800"
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return <span className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-bold ${statusStyles[status]}`}>{getReportStatusLabel(status)}</span>;
}
