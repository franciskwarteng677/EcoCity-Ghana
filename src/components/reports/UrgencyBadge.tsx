import type { ReportUrgency } from "@/data/communityReports";

const urgencyStyles: Record<ReportUrgency, string> = {
  Low: "border-slate-200 bg-white text-slate-700",
  Medium: "border-civic-100 bg-civic-50 text-civic-700",
  High: "border-amber-200 bg-amber-50 text-amber-800",
  Emergency: "border-red-200 bg-red-50 text-red-700"
};

export function UrgencyBadge({ urgency }: { urgency: ReportUrgency }) {
  return <span className={`inline-flex w-fit rounded-md border px-2.5 py-1 text-xs font-bold ${urgencyStyles[urgency]}`}>{urgency}</span>;
}
