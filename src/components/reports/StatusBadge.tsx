import type { ReportStatus } from "@/data/communityReports";

const statusStyles: Record<ReportStatus, string> = {
  Logged: "bg-slate-100 text-slate-700",
  "Needs review": "bg-amber-100 text-amber-800",
  "In review": "bg-sky-100 text-sky-800",
  Open: "bg-civic-50 text-civic-700",
  Resolved: "bg-canopy-100 text-canopy-800"
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return <span className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-bold ${statusStyles[status]}`}>{status}</span>;
}
